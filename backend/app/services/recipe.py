from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.recipe import Recipe
from app.models.user_puntaje import UserPuntaje
from app.processors.image import ImageProcessor
from app.schemas.recipe import RecipeCreate, RecipeUpdate


class RecipeService:

    @staticmethod
    def create_recipe(
        db: Session,
        recipe_data: RecipeCreate,
        user_id: UUID,
    ) -> Recipe:
        recipe = Recipe(
            user_id=user_id,
            title=recipe_data.title,
            description=recipe_data.description,
            original_text=recipe_data.original_text,
            preparation_time=recipe_data.preparation_time,
            servings=recipe_data.servings,
            ingredients=recipe_data.ingredients,
            steps=recipe_data.steps,
            tips=recipe_data.tips,
        )

        db.add(recipe)
        db.commit()
        db.refresh(recipe)

        return recipe

    @staticmethod
    def get_recipes(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 9,
    ) -> tuple[list[Recipe], int]:
        query = db.query(Recipe).filter(
            Recipe.user_id == user_id
        )

        total = query.count()

        items = (
            query.order_by(Recipe.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return items, total

    @staticmethod
    def get_public_recipes(
        db: Session,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Recipe], int]:
        query = db.query(Recipe)

        total = query.count()

        items = (
            query.order_by(Recipe.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return items, total

    @staticmethod
    def get_recipe(
        db: Session,
        recipe_id: UUID,
    ) -> Recipe | None:
        return (
            db.query(Recipe)
            .filter(Recipe.id == recipe_id)
            .first()
        )

    @staticmethod
    def update_recipe(
        db: Session,
        recipe: Recipe,
        recipe_data: RecipeUpdate,
    ) -> Recipe:
        update_data = recipe_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(recipe, field, value)

        db.commit()
        db.refresh(recipe)

        return recipe

    @staticmethod
    def update_recipe_photo(
        db: Session,
        recipe: Recipe,
        photo: UploadFile,
    ) -> Recipe:
        recipe.image_url = ImageProcessor.upload(photo)

        db.commit()
        db.refresh(recipe)

        return recipe

    @staticmethod
    def get_user_puntaje(
        db: Session,
        recipe_id: UUID,
        user_id: UUID,
    ) -> UserPuntaje | None:
        return (
            db.query(UserPuntaje)
            .filter(
                UserPuntaje.recipe_id == recipe_id,
                UserPuntaje.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def set_puntaje(
        db: Session,
        recipe_id: UUID,
        user_id: UUID,
        puntaje: float,
    ) -> Recipe:
        round_puntaje = round(puntaje, 1)

        rating = RecipeService.get_user_puntaje(
            db,
            recipe_id,
            user_id,
        )

        if rating is None:
            rating = UserPuntaje(
                recipe_id=recipe_id,
                user_id=user_id,
                puntaje=round_puntaje,
            )
            db.add(rating)
        else:
            rating.puntaje = round_puntaje

        db.commit()

        recipe = RecipeService.get_recipe(db, recipe_id)

        if recipe is not None:
            average = (
                db.query(func.avg(UserPuntaje.puntaje))
                .filter(UserPuntaje.recipe_id == recipe_id)
                .scalar()
            )

            recipe.puntaje = (
                round(float(average), 1)
                if average is not None
                else None
            )

            db.commit()
            db.refresh(recipe)

        return recipe

    @staticmethod
    def delete_recipe(
        db: Session,
        recipe: Recipe,
    ) -> None:
        db.delete(recipe)
        db.commit()