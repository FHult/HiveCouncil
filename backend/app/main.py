"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import session


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("Initializing database...")
    await init_db()
    print("Database initialized successfully!")
    print(f"Configured providers: {settings.configured_providers}")
    yield
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="HiveCouncil API",
    description="Multi-AI council with consensus building",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(session.router, prefix="/api", tags=["sessions"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "HiveCouncil API",
        "version": "0.1.0",
        "status": "running",
        "configured_providers": settings.configured_providers,
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
