"""Knowledge base Pydantic schemas."""

import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class KnowledgeUpload(BaseModel):
    """Schema for knowledge base upload request."""

    filename: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)


class KnowledgeChunk(BaseModel):
    """Schema for individual knowledge chunk."""

    id: uuid.UUID
    filename: str
    chunk_index: int
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class KnowledgeStats(BaseModel):
    """Schema for knowledge base statistics."""

    total_files: int
    total_chunks: int
    filenames: List[str]


class KnowledgeFileDelete(BaseModel):
    """Schema for deleting knowledge by filename."""

    filename: str
