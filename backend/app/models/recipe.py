from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Recipe(Base):
    __tablename__ = "recipes"

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

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    original_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    preparation_time: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    servings: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    ingredients: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
    )

    steps: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
    )

    tips: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    image_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    puntaje: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )