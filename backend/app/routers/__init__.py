"""API routers package."""

from app.routers.chat import router as chat_router
from app.routers.projects import router as projects_router
from app.routers.knowledge import router as knowledge_router
from app.routers.auth import router as auth_router

__all__ = [
    "chat_router",
    "projects_router",
    "knowledge_router",
    "auth_router",
]
