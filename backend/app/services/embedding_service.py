"""Embedding service for vector operations (mock implementation)."""

import hashlib
import random
from typing import List, Optional

from app.config import get_settings

settings = get_settings()


class EmbeddingService:
    """
    Service for generating text embeddings.
    
    This is a mock implementation that generates deterministic pseudo-random
    embeddings based on text hash. Replace with real embedding API (OpenAI, Cohere, etc.)
    for production use.
    """

    def __init__(self, dimension: int = 1536):
        """Initialize embedding service with vector dimension."""
        self.dimension = dimension

    async def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Mock implementation: generates deterministic pseudo-random vector
        based on text hash for consistent results.
        """
        # Create deterministic seed from text
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        seed = int(text_hash[:8], 16)
        random.seed(seed)

        # Generate normalized random vector
        embedding = [random.gauss(0, 1) for _ in range(self.dimension)]
        magnitude = sum(x ** 2 for x in embedding) ** 0.5
        normalized = [x / magnitude for x in embedding]

        return normalized

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        return [await self.embed_text(text) for text in texts]

    async def similarity(
        self,
        embedding1: List[float],
        embedding2: List[float],
    ) -> float:
        """Calculate cosine similarity between two embeddings."""
        dot_product = sum(a * b for a, b in zip(embedding1, embedding2))
        return dot_product  # Already normalized, so dot product = cosine similarity


# Global service instance
embedding_service = EmbeddingService()
