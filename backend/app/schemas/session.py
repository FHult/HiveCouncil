"""Session schemas."""
from datetime import datetime
from pydantic import BaseModel, Field


class ModelConfig(BaseModel):
    """Model configuration for each provider."""

    provider: str = Field(..., description="Provider name")
    model: str = Field(..., description="Model name for this provider")


class SessionCreate(BaseModel):
    """Schema for creating a new session."""

    prompt: str = Field(..., min_length=1, description="The user's prompt")
    chair: str = Field(..., description="Provider to act as chair (e.g., 'anthropic')")
    iterations: int = Field(default=1, ge=1, le=10, description="Number of iterations")
    template: str = Field(default="balanced", description="Merge template style")
    preset: str = Field(default="balanced", description="Response preset (creative/balanced/precise)")
    system_prompt: str | None = Field(default=None, description="Global system prompt")
    autopilot: bool = Field(default=False, description="Enable autopilot mode")
    model_configs: list[ModelConfig] | None = Field(
        default=None,
        description="Optional model configuration per provider. If not provided, uses defaults."
    )


class SessionResponse(BaseModel):
    """Schema for session creation response."""

    session_id: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionSummary(BaseModel):
    """Schema for session summary in list view."""

    id: str
    created_at: datetime
    prompt: str
    status: str
    total_iterations: int
    current_iteration: int
    chair_provider: str

    model_config = {"from_attributes": True}


class SessionList(BaseModel):
    """Schema for paginated session list."""

    sessions: list[SessionSummary]
    total: int


class SessionDetail(BaseModel):
    """Schema for detailed session view."""

    id: str
    created_at: datetime
    updated_at: datetime
    prompt: str
    current_prompt: str | None
    chair_provider: str
    total_iterations: int
    current_iteration: int
    merge_template: str
    preset: str
    status: str
    autopilot: bool
    system_prompt: str | None
    user_guidance: str | None

    model_config = {"from_attributes": True}


class IterationRequest(BaseModel):
    """Schema for triggering next iteration."""

    guidance: str | None = Field(default=None, description="User guidance for iteration")
    excluded_providers: list[str] | None = Field(default=None, description="Providers to exclude")
