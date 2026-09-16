from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    get_current_user_optional,
    get_db,
)
from app.models.user import User
from app.schemas.recipe import (
    PuntajeCreate,
    PuntajeResponse,
    RecipeAIResponse,
    RecipeCreate,
    RecipeListResponse,
    RecipeProcessRequest,
    RecipeResponse,
    RecipeUpdate,
)
from app.services.recipe import RecipeService
from app.processors.recipe import RecipeProcessor
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/recipes",
    tags=["recipes"],
)


@router.post("/", response_model=RecipeResponse)
def create_recipe(
    recipe_data: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return RecipeService.create_recipe(
        db,
        recipe_data,
        current_user.id,
    )


@router.get("/", response_model=RecipeListResponse)
def get_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(9, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = RecipeService.get_recipes(
        db,
        current_user.id,
        skip=skip,
        limit=limit,
    )

    return RecipeListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post("/process", response_model=RecipeAIResponse)
def process_recipe(
    request: RecipeProcessRequest,
    current_user: User = Depends(get_current_user),
):
    return RecipeProcessor.process(
        request.text
    )


@router.get("/public", response_model=RecipeListResponse)
def get_public_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(9, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = RecipeService.get_public_recipes(
        db,
        skip=skip,
        limit=limit,
    )

    return RecipeListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(
    recipe_id: UUID,
    db: Session = Depends(get_db),
):
    recipe = RecipeService.get_recipe(
        db,
        recipe_id,
    )

    if not recipe:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada",
        )

    return recipe


@router.post("/{recipe_id}/photo", response_model=RecipeResponse)
def upload_recipe_photo(
    recipe_id: UUID,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = RecipeService.get_recipe(
        db,
        recipe_id,
    )

    if not recipe:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada",
        )

    if str(recipe.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No podés modificar una receta de otro usuario",
        )

    if not (photo.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen",
        )

    try:
        return RecipeService.update_recipe_photo(
            db,
            recipe,
            photo,
        )
    except Exception as error:
     logger.exception("Error al subir imagen")
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="No se pudo subir la imagen",
    )


@router.get("/{recipe_id}/puntaje", response_model=PuntajeResponse)
def get_recipe_puntaje(
    recipe_id: UUID,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(
        get_current_user_optional
    ),
):
    recipe = RecipeService.get_recipe(
        db,
        recipe_id,
    )

    if not recipe:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada",
        )

    mi_puntaje = None

    if current_user is not None:
        rating = RecipeService.get_user_puntaje(
            db,
            recipe_id,
            current_user.id,
        )

        if rating is not None:
            mi_puntaje = rating.puntaje

    return PuntajeResponse(
        puntaje=recipe.puntaje,
        mi_puntaje=mi_puntaje,
    )


@router.post("/{recipe_id}/puntaje", response_model=RecipeResponse)
def rate_recipe(
    recipe_id: UUID,
    puntaje_data: PuntajeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = RecipeService.get_recipe(
        db,
        recipe_id,
    )

    if not recipe:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada",
        )

    return RecipeService.set_puntaje(
        db,
        recipe_id,
        current_user.id,
        puntaje_data.puntaje,
    )


@router.patch("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: UUID,
    recipe_data: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = RecipeService.get_recipe(
        db,
        recipe_id,
    )

    if not recipe:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada",
        )

    if str(recipe.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No podés modificar una receta de otro usuario",
        )

    return RecipeService.update_recipe(
        db,
        recipe,
        recipe_data,
    )


@router.delete("/{recipe_id}")
def delete_recipe(
    recipe_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = RecipeService.get_recipe(
        db,
        recipe_id,
    )

    if not recipe:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada",
        )

    if str(recipe.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No podés eliminar una receta de otro usuario",
        )

    RecipeService.delete_recipe(db, recipe)

    return {
        "message": "Receta eliminada correctamente"
    }
