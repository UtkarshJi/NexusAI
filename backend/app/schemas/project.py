"""Project-related Pydantic schemas."""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base project schema with shared fields."""

    name: str = Field(..., min_length=1, max_length=100)
    system_prompt: Optional[str] = Field(
        default="You are a helpful customer support assistant. Be friendly, concise, and helpful.",
        max_length=10000,
    )
    settings: Dict[str, Any] = Field(default_factory=dict)


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""

    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    system_prompt: Optional[str] = Field(None, max_length=10000)
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ProjectRead(ProjectBase):
    """Schema for reading project data."""

    id: uuid.UUID
    user_id: uuid.UUID
    api_key: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectReadPublic(BaseModel):
    """Public project schema (without sensitive data)."""

    id: uuid.UUID
    name: str
    is_active: bool

    model_config = {"from_attributes": True}
