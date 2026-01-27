"""RAG service for document processing and retrieval."""

import uuid
from typing import List, Optional

from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.knowledge_base import KnowledgeBase
from app.services.embedding_service import embedding_service

settings = get_settings()


class RAGService:
    """Service for RAG (Retrieval-Augmented Generation) operations."""

    def __init__(self):
        self.chunk_size = settings.chunk_size
        self.chunk_overlap = settings.chunk_overlap
        self.max_context_chunks = settings.max_context_chunks

    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks.
        
        Uses simple character-based chunking with overlap.
        For production, consider sentence-aware chunking.
        """
        chunks = []
        start = 0
        text = text.strip()

        while start < len(text):
            end = start + self.chunk_size

            # Try to break at sentence or word boundary
            if end < len(text):
                # Look for sentence end
                for sep in [". ", "! ", "? ", "\n\n", "\n"]:
                    pos = text.rfind(sep, start, end)
                    if pos > start + self.chunk_size // 2:
                        end = pos + len(sep)
                        break
                else:
                    # Fall back to word boundary
                    space_pos = text.rfind(" ", start, end)
                    if space_pos > start + self.chunk_size // 2:
                        end = space_pos + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            # Move start with overlap
            start = end - self.chunk_overlap
            if start <= chunks[-1] if chunks else start >= len(text):
                start = end

        return chunks

    async def ingest_document(
        self,
        db: AsyncSession,
        project_id: uuid.UUID,
        filename: str,
        content: str,
    ) -> int:
        """
        Process and store document chunks with embeddings.
        
        Returns the number of chunks created.
        """
        # Delete existing chunks for this file
        await db.execute(
            delete(KnowledgeBase).where(
                KnowledgeBase.project_id == project_id,
                KnowledgeBase.filename == filename,
            )
        )

        # Chunk the content
        chunks = self.chunk_text(content)

        # Generate embeddings and store chunks
        for idx, chunk_text in enumerate(chunks):
            embedding = await embedding_service.embed_text(chunk_text)

            kb_entry = KnowledgeBase(
                project_id=project_id,
                filename=filename,
                chunk_index=idx,
                content=chunk_text,
                embedding=embedding,
                metadata_={"char_count": len(chunk_text)},
            )
            db.add(kb_entry)

        await db.commit()
        return len(chunks)

    async def retrieve_context(
        self,
        db: AsyncSession,
        project_id: uuid.UUID,
        query: str,
        limit: Optional[int] = None,
    ) -> str:
        """
        Retrieve relevant context for a query using vector similarity.
        
        Returns concatenated context from top matching chunks.
        """
        limit = limit or self.max_context_chunks

        # Generate query embedding
        query_embedding = await embedding_service.embed_text(query)

        # Query for similar chunks using pgvector's L2 distance
        # Note: For cosine similarity, use <=> operator; for L2, use <->
        result = await db.execute(
            select(KnowledgeBase)
            .where(KnowledgeBase.project_id == project_id)
            .order_by(KnowledgeBase.embedding.l2_distance(query_embedding))
            .limit(limit)
        )
        chunks = result.scalars().all()

        if not chunks:
            return ""

        # Concatenate chunk contents
        context_parts = []
        for chunk in chunks:
            context_parts.append(f"[{chunk.filename}]\n{chunk.content}")

        return "\n\n---\n\n".join(context_parts)

    async def get_knowledge_stats(
        self,
        db: AsyncSession,
        project_id: uuid.UUID,
    ) -> dict:
        """Get statistics about the knowledge base for a project."""
        # Get unique filenames
        files_result = await db.execute(
            select(KnowledgeBase.filename)
            .where(KnowledgeBase.project_id == project_id)
            .distinct()
        )
        filenames = [row[0] for row in files_result.all()]

        # Get total chunk count
        count_result = await db.execute(
            select(func.count(KnowledgeBase.id))
            .where(KnowledgeBase.project_id == project_id)
        )
        total_chunks = count_result.scalar() or 0

        return {
            "total_files": len(filenames),
            "total_chunks": total_chunks,
            "filenames": filenames,
        }

    async def delete_file(
        self,
        db: AsyncSession,
        project_id: uuid.UUID,
        filename: str,
    ) -> int:
        """Delete all chunks for a specific file. Returns count deleted."""
        result = await db.execute(
            delete(KnowledgeBase)
            .where(
                KnowledgeBase.project_id == project_id,
                KnowledgeBase.filename == filename,
            )
            .returning(KnowledgeBase.id)
        )
        deleted = len(result.all())
        await db.commit()
        return deleted


# Global service instance
rag_service = RAGService()
