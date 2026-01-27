"""Knowledge base router for RAG operations."""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.project import Project
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.schemas.knowledge import KnowledgeChunk, KnowledgeStats, KnowledgeUpload
from app.services.rag_service import rag_service
from app.utils.auth import get_current_user, get_project_by_api_key

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_knowledge(
    project_id: uuid.UUID,
    knowledge_in: KnowledgeUpload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Upload text content to the knowledge base."""
    # Verify project ownership
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Ingest document
    chunks_created = await rag_service.ingest_document(
        db=db,
        project_id=project_id,
        filename=knowledge_in.filename,
        content=knowledge_in.content,
    )

    return {
        "message": f"Successfully ingested {knowledge_in.filename}",
        "chunks_created": chunks_created,
    }


@router.post("/upload-file", status_code=status.HTTP_201_CREATED)
async def upload_file(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Upload a file to the knowledge base."""
    # Verify project ownership
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Read file content
    content = await file.read()
    try:
        text_content = content.decode("utf-8")
    except UnicodeDecodeError:
        # Handle PDF or other binary formats here
        # For now, raise an error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only text files are supported. For PDF support, use a dedicated PDF parser.",
        )

    # Ingest document
    chunks_created = await rag_service.ingest_document(
        db=db,
        project_id=project_id,
        filename=file.filename or "uploaded_file.txt",
        content=text_content,
    )

    return {
        "message": f"Successfully ingested {file.filename}",
        "chunks_created": chunks_created,
    }


@router.get("/stats/{project_id}", response_model=KnowledgeStats)
async def get_knowledge_stats(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get knowledge base statistics for a project."""
    # Verify project ownership
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    stats = await rag_service.get_knowledge_stats(db, project_id)
    return stats


@router.get("/chunks/{project_id}", response_model=List[KnowledgeChunk])
async def list_chunks(
    project_id: uuid.UUID,
    filename: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[KnowledgeBase]:
    """List knowledge base chunks for a project."""
    # Verify project ownership
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    query = select(KnowledgeBase).where(KnowledgeBase.project_id == project_id)

    if filename:
        query = query.where(KnowledgeBase.filename == filename)

    query = query.order_by(
        KnowledgeBase.filename,
        KnowledgeBase.chunk_index,
    ).offset(offset).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/file/{project_id}/{filename}", status_code=status.HTTP_200_OK)
async def delete_file(
    project_id: uuid.UUID,
    filename: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Delete all chunks for a specific file."""
    # Verify project ownership
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    deleted_count = await rag_service.delete_file(db, project_id, filename)

    return {
        "message": f"Deleted {deleted_count} chunks for {filename}",
        "deleted_count": deleted_count,
    }
