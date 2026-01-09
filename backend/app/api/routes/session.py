"""Session API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.session import SessionCreate, SessionResponse
from app.models.session import Session as SessionModel

router = APIRouter()


@router.post("/session/create", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new council session.

    Args:
        session_data: Session configuration
        db: Database session

    Returns:
        SessionResponse: Created session information
    """
    # Create session model
    session = SessionModel(
        prompt=session_data.prompt,
        chair_provider=session_data.chair,
        total_iterations=session_data.iterations,
        merge_template=session_data.template,
        preset=session_data.preset,
        system_prompt=session_data.system_prompt,
        autopilot=session_data.autopilot,
        status="pending",
    )

    db.add(session)
    await db.commit()
    await db.refresh(session)

    return SessionResponse(
        session_id=session.id,
        status=session.status,
        created_at=session.created_at,
    )


@router.get("/sessions/test")
async def test_endpoint():
    """Test endpoint to verify API is working."""
    return {"message": "Session API is working!"}
