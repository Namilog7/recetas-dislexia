from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ) -> User | None:
        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    @staticmethod
    def get_user(
        db: Session,
        user_id: UUID | str,
    ) -> User | None:
        return (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    @staticmethod
    def get_users(db: Session) -> list[User]:
        return db.query(User).all()

    @staticmethod
    def create_user(
        db: Session,
        user_data: UserCreate,
    ) -> User:
        if UserService.get_user_by_email(
            db,
            user_data.email,
        ):
            raise ValueError("El email ya está registrado")

        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=hash_password(user_data.password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def authenticate(
        db: Session,
        email: str,
        password: str,
    ) -> User | None:
        user = UserService.get_user_by_email(db, email)

        if user is None or user.password_hash is None:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    @staticmethod
    def update_user(
        db: Session,
        user: User,
        user_data: UserUpdate,
    ) -> User:
        update_data = user_data.model_dump(
            exclude_unset=True
        )

        password = update_data.pop("password", None)

        if password is not None:
            user.password_hash = hash_password(password)

        for field, value in update_data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def delete_user(
        db: Session,
        user: User,
    ) -> None:
        db.delete(user)
        db.commit()
