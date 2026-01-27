"""Groq API service for LLM interactions."""

import json
from typing import AsyncGenerator, List, Optional

import httpx

from app.config import get_settings
from app.schemas.chat import ChatMessage

settings = get_settings()


class GroqService:
    """Service for interacting with Groq API."""

    def __init__(self):
        self.api_key = settings.groq_api_key
        self.api_base = settings.groq_api_base
        self.model = settings.groq_model

    async def create_chat_completion(
        self,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        context: Optional[str] = None,
    ) -> str:
        """Create a non-streaming chat completion."""
        formatted_messages = self._format_messages(messages, system_prompt, context)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_base}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": formatted_messages,
                    "temperature": 0.7,
                    "max_tokens": 2048,
                },
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def stream_chat_completion(
        self,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        context: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream chat completion tokens."""
        formatted_messages = self._format_messages(messages, system_prompt, context)

        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.api_base}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": formatted_messages,
                    "temperature": 0.7,
                    "max_tokens": 2048,
                    "stream": True,
                },
                timeout=60.0,
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data["choices"][0].get("delta", {})
                            if "content" in delta:
                                yield delta["content"]
                        except json.JSONDecodeError:
                            continue

    def _format_messages(
        self,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        context: Optional[str] = None,
    ) -> List[dict]:
        """Format messages for the API with system prompt and context."""
        formatted = []

        # Add system message
        system_content = system_prompt or "You are a helpful customer support assistant."
        if context:
            system_content += f"\n\n## Relevant Context:\n{context}"

        formatted.append({"role": "system", "content": system_content})

        # Add conversation messages
        for msg in messages:
            formatted.append({"role": msg.role, "content": msg.content})

        return formatted


# Global service instance
groq_service = GroqService()
