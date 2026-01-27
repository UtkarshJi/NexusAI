"""Chat-related Pydantic schemas."""

import uuid
from datetime import datetime
from typing import Optional, List, Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Individual chat message schema."""

    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""

    message: str = Field(..., min_length=1, max_length=10000)
    session_id: Optional[str] = Field(None, max_length=100)
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list)
    metadata: Optional[dict] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    """Response schema for chat endpoint (non-streaming)."""

    message: str
    session_id: str
    conversation_id: uuid.UUID
    tokens_used: Optional[int] = None


class StreamChunk(BaseModel):
    """Schema for individual SSE stream chunks."""

    type: Literal["token", "done", "error"]
    content: str
    session_id: Optional[str] = None
    conversation_id: Optional[uuid.UUID] = None


class ConversationRead(BaseModel):
    """Schema for reading conversation data."""

    id: uuid.UUID
    project_id: uuid.UUID
    session_id: str
    visitor_name: Optional[str] = None
    visitor_email: Optional[str] = None
    is_resolved: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageRead(BaseModel):
    """Schema for reading message data."""

    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    tokens_used: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
