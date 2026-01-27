"""Chat router with SSE streaming."""

import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.project import Project
from app.models.conversation import Conversation
from app.models.message import Message, MessageRole
from app.schemas.chat import ChatRequest, ChatMessage, ChatResponse, ConversationRead, MessageRead
from app.services.groq_service import groq_service
from app.services.rag_service import rag_service
from app.utils.auth import get_project_by_api_key

router = APIRouter(prefix="/chat", tags=["Chat"])


async def get_or_create_conversation(
    db: AsyncSession,
    project_id: uuid.UUID,
    session_id: Optional[str] = None,
) -> Conversation:
    """Get existing conversation or create new one."""
    if session_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.project_id == project_id,
                Conversation.session_id == session_id,
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation:
            return conversation

    # Create new conversation
    new_session_id = session_id or str(uuid.uuid4())
    conversation = Conversation(
        project_id=project_id,
        session_id=new_session_id,
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    project: Project = Depends(get_project_by_api_key),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """
    Stream chat response using Server-Sent Events (SSE).
    
    Requires X-API-Key header with valid project API key.
    """
    # Get or create conversation
    conversation = await get_or_create_conversation(
        db=db,
        project_id=project.id,
        session_id=request.session_id,
    )

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.USER.value,
        content=request.message,
    )
    db.add(user_message)
    await db.commit()

    # Retrieve context from knowledge base
    context = await rag_service.retrieve_context(
        db=db,
        project_id=project.id,
        query=request.message,
    )

    # Build conversation history
    messages = []
    if request.conversation_history:
        messages = request.conversation_history
    messages.append(ChatMessage(role="user", content=request.message))

    async def generate():
        """Generate SSE stream."""
        full_response = []

        # Send session info first
        yield f"data: {json.dumps({'type': 'session', 'session_id': conversation.session_id, 'conversation_id': str(conversation.id)})}\n\n"

        try:
            async for token in groq_service.stream_chat_completion(
                messages=messages,
                system_prompt=project.system_prompt,
                context=context if context else None,
            ):
                full_response.append(token)
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            # Save assistant message
            assistant_content = "".join(full_response)
            assistant_message = Message(
                conversation_id=conversation.id,
                role=MessageRole.ASSISTANT.value,
                content=assistant_content,
            )
            db.add(assistant_message)
            await db.commit()

            # Send done event
            yield f"data: {json.dumps({'type': 'done', 'content': assistant_content})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/send", response_model=ChatResponse)
async def chat_send(
    request: ChatRequest,
    project: Project = Depends(get_project_by_api_key),
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """
    Non-streaming chat endpoint.
    
    Requires X-API-Key header with valid project API key.
    """
    # Get or create conversation
    conversation = await get_or_create_conversation(
        db=db,
        project_id=project.id,
        session_id=request.session_id,
    )

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.USER.value,
        content=request.message,
    )
    db.add(user_message)
    await db.commit()

    # Retrieve context
    context = await rag_service.retrieve_context(
        db=db,
        project_id=project.id,
        query=request.message,
    )

    # Build messages
    messages = []
    if request.conversation_history:
        messages = request.conversation_history
    messages.append(ChatMessage(role="user", content=request.message))

    # Get response
    response_content = await groq_service.create_chat_completion(
        messages=messages,
        system_prompt=project.system_prompt,
        context=context if context else None,
    )

    # Save assistant message
    assistant_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.ASSISTANT.value,
        content=response_content,
    )
    db.add(assistant_message)
    await db.commit()

    return ChatResponse(
        message=response_content,
        session_id=conversation.session_id,
        conversation_id=conversation.id,
    )


@router.get("/history/{conversation_id}", response_model=list[MessageRead])
async def get_conversation_history(
    conversation_id: uuid.UUID,
    project: Project = Depends(get_project_by_api_key),
    db: AsyncSession = Depends(get_db),
) -> list[Message]:
    """Get message history for a conversation."""
    result = await db.execute(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.project_id == project.id,
        )
        .options(selectinload(Conversation.messages))
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return conversation.messages


@router.get("/conversations", response_model=list[ConversationRead])
async def list_conversations(
    project: Project = Depends(get_project_by_api_key),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
) -> list[Conversation]:
    """List all conversations for a project."""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.project_id == project.id)
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()
