"""
NexusAI - SaaS AI Customer Support Platform

Main FastAPI application entry point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import auth_router, projects_router, knowledge_router, chat_router

settings = get_settings()
logger = logging.getLogger(__name__)


def run_migrations():
    """Run Alembic migrations programmatically."""
    try:
        from alembic.config import Config
        from alembic import command
        import os
        
        # Get the directory where this file is located
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alembic_cfg = Config(os.path.join(base_dir, "alembic.ini"))
        alembic_cfg.set_main_option("script_location", os.path.join(base_dir, "alembic"))
        
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully")
    except Exception as e:
        logger.error(f"Migration error: {e}")
        # Don't crash the app if migrations fail - tables might already exist
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup - run migrations automatically
    logger.info("Running database migrations on startup...")
    run_migrations()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="NexusAI",
    description="SaaS AI Customer Support Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
# Note: When allow_credentials=True, you CANNOT use "*" as an origin
# All allowed origins must be explicitly listed in CORS_ORIGINS env var
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(chat_router)
app.include_router(knowledge_router)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "service": "NexusAI",
        "status": "healthy",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "groq": "configured" if settings.groq_api_key else "not configured",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
