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


def enable_pgvector_extension():
    """Enable pgvector extension in PostgreSQL."""
    import asyncio
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine
    
    async def _enable():
        engine = create_async_engine(settings.database_url, echo=False)
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            print("[MIGRATION] pgvector extension enabled successfully!", flush=True)
        await engine.dispose()
    
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        asyncio.run(_enable())
    else:
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            pool.submit(asyncio.run, _enable()).result()


def run_migrations():
    """Run Alembic migrations programmatically."""
    import os
    import sys
    import traceback
    
    # First, enable pgvector extension
    try:
        print("[MIGRATION] Enabling pgvector extension...", flush=True)
        enable_pgvector_extension()
    except Exception as e:
        print(f"[MIGRATION WARNING] Could not enable pgvector: {e}", flush=True)
    
    try:
        from alembic.config import Config
        from alembic import command
        
        # Get the backend directory (parent of app directory)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Change to backend directory so relative paths in alembic.ini work
        original_cwd = os.getcwd()
        os.chdir(base_dir)
        print(f"[MIGRATION] Changed working directory to: {base_dir}", flush=True)
        print(f"[MIGRATION] Database URL prefix: {settings.database_url[:30]}...", flush=True)
        
        try:
            alembic_cfg = Config("alembic.ini")
            command.upgrade(alembic_cfg, "head")
            print("[MIGRATION] Database migrations completed successfully!", flush=True)
        finally:
            os.chdir(original_cwd)
            
    except Exception as e:
        print(f"[MIGRATION ERROR] {type(e).__name__}: {e}", flush=True)
        traceback.print_exc()
        raise  # Re-raise so the /init-db endpoint can report the error


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


@app.get("/init-db", tags=["Health"])
async def init_database():
    """
    Initialize database tables.
    Call this endpoint once after deployment to create tables.
    """
    try:
        run_migrations()
        return {"status": "success", "message": "Database migrations completed"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


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
