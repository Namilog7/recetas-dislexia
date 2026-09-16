from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class UserPuntaje(Base):
    __tablename__ = "user_puntajes"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "recipe_id",
            name="uq_user_puntajes_user_recipe",
        ),
    )

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id"),
        nullable=False,
    )

    recipe_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("recipes.id"),
        nullable=False,
    )

    puntaje: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )