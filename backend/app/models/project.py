"""Project model for multi-tenant support."""

import secrets
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.conversation import Conversation
    from app.models.knowledge_base import KnowledgeBase


def generate_api_key() -> str:
    """Generate a secure API key."""
    return f"nxa_{secrets.token_urlsafe(32)}"


class Project(Base):
    """Project model representing a tenant's chatbot configuration."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    api_key: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        default=generate_api_key,
    )
    system_prompt: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        default="You are a helpful customer support assistant. Be friendly, concise, and helpful.",
    )
    settings: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        default=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="projects",
    )
    conversations: Mapped[List["Conversation"]] = relationship(
        "Conversation",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    knowledge_bases: Mapped[List["KnowledgeBase"]] = relationship(
        "KnowledgeBase",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    def regenerate_api_key(self) -> str:
        """Generate a new API key for this project."""
        self.api_key = generate_api_key()
        return self.api_key

    def __repr__(self) -> str:
        return f"<Project {self.name}>"
