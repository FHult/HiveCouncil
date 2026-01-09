# HiveCouncil Architecture Plan

**Version**: 1.0
**Date**: 2026-01-09
**Status**: Planning Phase

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Project Structure](#2-project-structure)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Schema](#5-database-schema)
6. [API Specifications](#6-api-specifications)
7. [Data Flow](#7-data-flow)
8. [Component Design](#8-component-design)
9. [State Management](#9-state-management)
10. [Integration Patterns](#10-integration-patterns)
11. [Development Workflow](#11-development-workflow)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Components (shadcn/ui + Tailwind)                  │   │
│  │  - PromptInput  - CouncilCards  - ConsensusCard    │   │
│  │  - SessionHistory  - Settings  - Export             │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │ HTTP/SSE                                │
└───────────────────┼─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                  FastAPI Backend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                          │  │
│  │  /api/session/create  /api/session/{id}/iterate     │  │
│  │  /api/stream/{session_id}  /api/sessions/history    │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Services Layer                                      │  │
│  │  - AIProviderService  - SessionService               │  │
│  │  - MergeService  - CostEstimator                     │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  SQLite Database (SQLAlchemy)                        │  │
│  │  - sessions  - responses  - settings                 │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────────┐
│              External AI Services (APIs)                      │
│  OpenAI  │  Anthropic  │  Google Gemini  │  Grok (xAI)      │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Principles

- **Separation of Concerns**: Frontend handles UI/UX, backend manages AI integrations and business logic
- **Async-First**: All AI API calls are asynchronous for parallel execution
- **Event-Driven Streaming**: Server-Sent Events (SSE) for real-time response streaming
- **Fail-Safe**: Graceful degradation when individual AI services fail
- **Modular Providers**: Each AI service is a separate, pluggable module
- **Local-First**: All data stored locally, no external dependencies beyond AI APIs

---

## 2. Project Structure

```
HiveCouncil/
├── frontend/                    # React + Vite frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/          # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── prompt/          # Prompt input section
│   │   │   │   ├── PromptInput.tsx
│   │   │   │   ├── PromptControls.tsx
│   │   │   │   └── PromptTemplates.tsx
│   │   │   ├── responses/       # Response display
│   │   │   │   ├── ConsensusCard.tsx
│   │   │   │   ├── CouncilCard.tsx
│   │   │   │   ├── CouncilGrid.tsx
│   │   │   │   ├── StreamingText.tsx
│   │   │   │   └── ResponseActions.tsx
│   │   │   ├── session/         # Session management
│   │   │   │   ├── SessionHistory.tsx
│   │   │   │   ├── SessionItem.tsx
│   │   │   │   └── IterationControls.tsx
│   │   │   ├── settings/        # Settings panel
│   │   │   │   ├── SettingsDialog.tsx
│   │   │   │   ├── APIStatus.tsx
│   │   │   │   ├── PreferencesForm.tsx
│   │   │   │   └── SystemPromptEditor.tsx
│   │   │   └── comparison/      # Comparison tools
│   │   │       ├── DiffViewer.tsx
│   │   │       └── SimilarityScore.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useSession.ts
│   │   │   ├── useStreaming.ts
│   │   │   ├── useSettings.ts
│   │   │   └── useKeyboard.ts
│   │   ├── lib/                 # Utilities
│   │   │   ├── api.ts           # API client
│   │   │   ├── sse.ts           # SSE handling
│   │   │   ├── markdown.ts      # Markdown export
│   │   │   ├── storage.ts       # LocalStorage helpers
│   │   │   └── utils.ts         # General utilities
│   │   ├── store/               # State management
│   │   │   ├── sessionStore.ts  # Zustand store for sessions
│   │   │   ├── settingsStore.ts # Zustand store for settings
│   │   │   └── uiStore.ts       # UI state (theme, modals)
│   │   ├── types/               # TypeScript types
│   │   │   ├── session.ts
│   │   │   ├── response.ts
│   │   │   ├── settings.ts
│   │   │   └── api.ts
│   │   ├── styles/              # Global styles
│   │   │   └── globals.css
│   │   ├── App.tsx              # Root component
│   │   ├── main.tsx             # Entry point
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── components.json          # shadcn/ui config
│   └── .env.example
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── session.py   # Session CRUD endpoints
│   │   │   │   ├── stream.py    # SSE streaming endpoints
│   │   │   │   ├── settings.py  # Settings endpoints
│   │   │   │   └── export.py    # Export endpoints
│   │   │   └── deps.py          # Dependencies (DB session, etc.)
│   │   ├── core/                # Core configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # Settings from .env
│   │   │   ├── database.py      # Database setup
│   │   │   └── constants.py     # Constants (pricing, models)
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── session.py
│   │   │   ├── response.py
│   │   │   └── settings.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── session.py
│   │   │   ├── response.py
│   │   │   ├── settings.py
│   │   │   └── stream.py
│   │   ├── services/            # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── ai_providers/    # AI service integrations
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py      # Abstract base provider
│   │   │   │   ├── openai_provider.py
│   │   │   │   ├── anthropic_provider.py
│   │   │   │   ├── google_provider.py
│   │   │   │   ├── grok_provider.py
│   │   │   │   └── provider_factory.py
│   │   │   ├── session_service.py    # Session orchestration
│   │   │   ├── merge_service.py      # Chair merge logic
│   │   │   ├── iteration_service.py  # Iteration management
│   │   │   ├── cost_estimator.py     # Cost calculation
│   │   │   └── export_service.py     # Export to markdown
│   │   ├── utils/               # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── token_counter.py # Token counting
│   │   │   ├── templates.py     # Merge templates
│   │   │   └── validators.py    # Input validation
│   │   ├── __init__.py
│   │   └── main.py              # FastAPI app entry
│   ├── tests/                   # Backend tests
│   │   ├── __init__.py
│   │   ├── test_api/
│   │   ├── test_services/
│   │   └── test_providers/
│   ├── alembic/                 # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env.example
│
├── scripts/                     # Development scripts
│   ├── start-dev.sh             # Start both frontend & backend
│   └── init-db.sh               # Initialize database
│
├── docs/                        # Documentation
│   └── api.md                   # API documentation
│
├── .env.example                 # Environment variables template
├── .gitignore
├── README.md
├── REQUIREMENTS.md              # Requirements document
├── ARCHITECTURE.md              # This file
└── package.json                 # Root package.json for npm scripts
```

---

## 3. Frontend Architecture

### 3.1 Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **Styling**: Tailwind CSS 3+
- **Component Library**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Animation**: Framer Motion
- **HTTP Client**: Axios
- **Markdown**: react-markdown

### 3.2 Key Frontend Patterns

#### Component Hierarchy

```
App
├── MainLayout
│   ├── Header (title, theme toggle, settings button)
│   ├── Sidebar (session history)
│   └── MainContent
│       ├── PromptSection
│       │   ├── PromptInput
│       │   ├── PromptControls (chair, iterations, template)
│       │   └── PromptTemplates (dropdown)
│       ├── ResponsesSection
│       │   ├── ConsensusCard (if available)
│       │   └── CouncilGrid
│       │       └── CouncilCard[] (one per AI)
│       └── IterationControls (next, pause, autopilot)
└── SettingsDialog (modal)
```

#### State Management Strategy (Zustand)

**sessionStore.ts**:
```typescript
interface SessionState {
  currentSession: Session | null;
  sessions: Session[];
  isStreaming: boolean;
  isIterating: boolean;
  responses: Map<string, Response[]>; // provider -> responses
  consensus: Response | null;
  createSession: (prompt: string, config: SessionConfig) => Promise<void>;
  streamResponses: (sessionId: string) => void;
  proceedIteration: () => Promise<void>;
  pauseIteration: () => void;
  loadSession: (sessionId: string) => Promise<void>;
}
```

**settingsStore.ts**:
```typescript
interface SettingsState {
  theme: 'light' | 'dark';
  defaultChair: string;
  defaultIterations: number;
  defaultTemplate: string;
  defaultPreset: 'creative' | 'balanced' | 'precise';
  globalSystemPrompt: string;
  apiStatus: Map<string, boolean>; // provider -> configured
  updateSetting: (key: string, value: any) => void;
  loadSettings: () => Promise<void>;
}
```

**uiStore.ts**:
```typescript
interface UIState {
  settingsOpen: boolean;
  selectedResponse: string | null;
  compareMode: boolean;
  comparisonPair: [string, string] | null;
  toggleSettings: () => void;
  setCompareMode: (enabled: boolean, pair?: [string, string]) => void;
}
```

### 3.3 Custom Hooks

**useSession.ts**:
```typescript
export const useSession = () => {
  const store = useSessionStore();

  const submitPrompt = async (prompt: string, config: SessionConfig) => {
    await store.createSession(prompt, config);
    store.streamResponses(store.currentSession.id);
  };

  return {
    currentSession: store.currentSession,
    responses: store.responses,
    consensus: store.consensus,
    isStreaming: store.isStreaming,
    submitPrompt,
    proceedIteration: store.proceedIteration,
    pauseIteration: store.pauseIteration,
  };
};
```

**useStreaming.ts**:
```typescript
export const useStreaming = (sessionId: string) => {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/stream/${sessionId}`);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update store with streaming data
    };

    setEventSource(es);

    return () => es.close();
  }, [sessionId]);

  return { eventSource };
};
```

**useKeyboard.ts**:
```typescript
export const useKeyboard = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        // Submit prompt
      }
      // ... other shortcuts
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
};
```

---

## 4. Backend Architecture

### 4.1 Technology Stack

- **Framework**: FastAPI 0.110+
- **ASGI Server**: Uvicorn
- **Database ORM**: SQLAlchemy 2.0+
- **Async DB Driver**: aiosqlite
- **HTTP Client**: httpx (async)
- **Environment**: python-dotenv
- **AI SDKs**: openai, anthropic, google-generativeai

### 4.2 API Route Structure

#### Session Management
```python
# POST /api/session/create
# Create new session, return session_id
# Body: { prompt, chair, iterations, template, preset }

# GET /api/sessions/history
# List all past sessions with metadata

# GET /api/session/{session_id}
# Get full session details including all responses

# DELETE /api/session/{session_id}
# Delete a session
```

#### Streaming
```python
# GET /api/stream/{session_id}
# SSE endpoint for streaming responses
# Events: response_start, response_chunk, response_end, consensus_start, etc.

# POST /api/session/{session_id}/iterate
# Trigger next iteration manually
# Body: { guidance?, excluded_providers? }

# POST /api/session/{session_id}/pause
# Pause ongoing iteration

# POST /api/session/{session_id}/resume
# Resume paused iteration
```

#### Settings
```python
# GET /api/settings
# Get all user settings

# PUT /api/settings
# Update settings
# Body: { key, value }

# GET /api/providers/status
# Check which providers have valid API keys
```

#### Export
```python
# GET /api/session/{session_id}/export/markdown
# Export session to markdown, return file content

# POST /api/session/{session_id}/copy
# Return formatted text for clipboard
```

### 4.3 Service Layer Architecture

#### AIProviderService (Abstract Base)

```python
# app/services/ai_providers/base.py

from abc import ABC, abstractmethod
from typing import AsyncGenerator

class AIProvider(ABC):
    def __init__(self, api_key: str):
        self.api_key = api_key

    @abstractmethod
    async def stream_completion(
        self,
        prompt: str,
        system_prompt: str | None,
        preset: str
    ) -> AsyncGenerator[str, None]:
        """Stream completion tokens"""
        pass

    @abstractmethod
    def count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Return current model name"""
        pass

    @abstractmethod
    def get_pricing(self) -> tuple[float, float]:
        """Return (input_price_per_1k, output_price_per_1k)"""
        pass
```

#### Concrete Providers

```python
# app/services/ai_providers/openai_provider.py

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        super().__init__(api_key)
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    async def stream_completion(self, prompt, system_prompt, preset):
        temperature = self._preset_to_temp(preset)

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            stream=True
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
```

#### SessionService

```python
# app/services/session_service.py

class SessionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.provider_factory = ProviderFactory()

    async def create_session(
        self,
        prompt: str,
        chair: str,
        iterations: int,
        template: str,
        preset: str,
        system_prompt: str | None
    ) -> Session:
        """Create new session in database"""
        session = Session(
            prompt=prompt,
            chair_provider=chair,
            total_iterations=iterations,
            merge_template=template,
            preset=preset,
            status='pending'
        )
        self.db.add(session)
        await self.db.commit()
        return session

    async def execute_council(
        self,
        session_id: str
    ) -> AsyncGenerator[StreamEvent, None]:
        """
        Execute council: get responses from all providers.
        Yields SSE events for streaming.
        """
        session = await self._get_session(session_id)
        providers = self.provider_factory.get_all_providers()

        # Exclude chair from council (chair only merges)
        council = [p for p in providers if p.name != session.chair_provider]

        # Run all providers in parallel
        tasks = [
            self._stream_provider_response(session, provider)
            for provider in council
        ]

        async for event in self._merge_streams(tasks):
            yield event

    async def _stream_provider_response(
        self,
        session: Session,
        provider: AIProvider
    ):
        """Stream response from single provider"""
        try:
            yield StreamEvent(
                type='response_start',
                provider=provider.name,
                model=provider.get_model_name()
            )

            full_response = ""
            async for chunk in provider.stream_completion(
                prompt=session.prompt,
                system_prompt=session.system_prompt,
                preset=session.preset
            ):
                full_response += chunk
                yield StreamEvent(
                    type='response_chunk',
                    provider=provider.name,
                    content=chunk
                )

            # Save to database
            response = Response(
                session_id=session.id,
                provider=provider.name,
                model=provider.get_model_name(),
                content=full_response,
                iteration=session.current_iteration,
                role='council'
            )
            self.db.add(response)
            await self.db.commit()

            yield StreamEvent(
                type='response_end',
                provider=provider.name
            )

        except Exception as e:
            yield StreamEvent(
                type='response_error',
                provider=provider.name,
                error=str(e)
            )
```

#### MergeService

```python
# app/services/merge_service.py

class MergeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.provider_factory = ProviderFactory()

    async def merge_responses(
        self,
        session_id: str,
        responses: list[Response]
    ) -> AsyncGenerator[StreamEvent, None]:
        """
        Use chair AI to merge council responses.
        """
        session = await self._get_session(session_id)
        chair = self.provider_factory.get_provider(session.chair_provider)

        # Build merge prompt
        merge_prompt = self._build_merge_prompt(
            session=session,
            responses=responses,
            template=session.merge_template
        )

        yield StreamEvent(type='consensus_start', provider=chair.name)

        full_consensus = ""
        async for chunk in chair.stream_completion(
            prompt=merge_prompt,
            system_prompt=self._get_merge_system_prompt(session.merge_template),
            preset=session.preset
        ):
            full_consensus += chunk
            yield StreamEvent(
                type='consensus_chunk',
                content=chunk
            )

        # Save consensus
        consensus = Response(
            session_id=session.id,
            provider=chair.name,
            model=chair.get_model_name(),
            content=full_consensus,
            iteration=session.current_iteration,
            role='chair'
        )
        self.db.add(consensus)
        await self.db.commit()

        yield StreamEvent(type='consensus_end')

    def _build_merge_prompt(
        self,
        session: Session,
        responses: list[Response],
        template: str
    ) -> str:
        """Construct prompt for chair to merge responses"""
        prompt = f"Original User Prompt:\n{session.prompt}\n\n"
        prompt += "Council Responses:\n\n"

        for resp in responses:
            prompt += f"### {resp.provider} ({resp.model}):\n"
            prompt += f"{resp.content}\n\n"

        if session.current_iteration > 1:
            # Include previous consensus for iteration context
            prev_consensus = self._get_previous_consensus(session)
            prompt += f"Previous Consensus (Iteration {session.current_iteration - 1}):\n"
            prompt += f"{prev_consensus.content}\n\n"

        prompt += "Your task: Synthesize the above responses into a best-of-breed answer."

        return prompt

    def _get_merge_system_prompt(self, template: str) -> str:
        """Get system prompt based on merge template"""
        templates = {
            'analytical': "You are an analytical synthesizer...",
            'creative': "You are a creative synthesizer...",
            'technical': "You are a technical synthesizer...",
            'balanced': "You are a balanced synthesizer..."
        }
        return templates.get(template, templates['balanced'])
```

#### IterationService

```python
# app/services/iteration_service.py

class IterationService:
    def __init__(
        self,
        db: AsyncSession,
        session_service: SessionService,
        merge_service: MergeService
    ):
        self.db = db
        self.session_service = session_service
        self.merge_service = merge_service

    async def run_iteration_cycle(
        self,
        session_id: str,
        autopilot: bool = False,
        guidance: str | None = None,
        excluded_providers: list[str] | None = None
    ) -> AsyncGenerator[StreamEvent, None]:
        """
        Run complete iteration cycle:
        1. Get council responses (to previous consensus)
        2. Merge into new consensus
        3. Repeat if more iterations needed
        """
        session = await self._get_session(session_id)

        while session.current_iteration < session.total_iterations:
            session.current_iteration += 1
            await self.db.commit()

            # Iteration 1: council responds to original prompt
            # Iteration 2+: council critiques previous consensus

            if session.current_iteration == 1:
                prompt = session.prompt
            else:
                # Get previous consensus
                prev_consensus = await self._get_latest_consensus(session_id)
                prompt = self._build_feedback_prompt(
                    original_prompt=session.prompt,
                    consensus=prev_consensus.content,
                    iteration=session.current_iteration,
                    guidance=guidance
                )

            # Update session prompt for this iteration
            session.current_prompt = prompt
            await self.db.commit()

            yield StreamEvent(
                type='iteration_start',
                iteration=session.current_iteration
            )

            # Get council responses
            async for event in self.session_service.execute_council(session_id):
                yield event

            # Get all responses from this iteration
            responses = await self._get_iteration_responses(
                session_id,
                session.current_iteration,
                excluded_providers
            )

            # Merge responses
            async for event in self.merge_service.merge_responses(session_id, responses):
                yield event

            yield StreamEvent(
                type='iteration_end',
                iteration=session.current_iteration
            )

            # Check if should continue
            if not autopilot:
                # Wait for manual trigger
                session.status = 'paused'
                await self.db.commit()
                break

        if session.current_iteration >= session.total_iterations:
            session.status = 'completed'
            await self.db.commit()
            yield StreamEvent(type='session_complete')

    def _build_feedback_prompt(
        self,
        original_prompt: str,
        consensus: str,
        iteration: int,
        guidance: str | None
    ) -> str:
        """Build prompt for council to critique consensus"""
        prompt = f"Original Request:\n{original_prompt}\n\n"
        prompt += f"Merged Consensus (Iteration {iteration - 1}):\n{consensus}\n\n"

        if guidance:
            prompt += f"User Guidance:\n{guidance}\n\n"

        prompt += "Your task: Review the consensus and provide constructive feedback, "
        prompt += "suggestions for improvement, or alternative perspectives."

        return prompt
```

#### CostEstimator

```python
# app/services/cost_estimator.py

class CostEstimator:
    def __init__(self):
        self.pricing = self._load_pricing()

    def estimate_cost(
        self,
        provider: str,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """Calculate estimated cost in USD"""
        key = f"{provider}:{model}"

        if key not in self.pricing:
            return 0.0

        input_price, output_price = self.pricing[key]

        cost = (input_tokens / 1000 * input_price) + \
               (output_tokens / 1000 * output_price)

        return round(cost, 6)

    def _load_pricing(self) -> dict[str, tuple[float, float]]:
        """Load pricing data (input per 1k, output per 1k)"""
        return {
            'openai:gpt-4o': (5.00, 15.00),
            'openai:gpt-4-turbo': (10.00, 30.00),
            'anthropic:claude-opus-4': (15.00, 75.00),
            'anthropic:claude-sonnet-3.5': (3.00, 15.00),
            'google:gemini-pro': (0.50, 1.50),
            'grok:grok-beta': (5.00, 10.00),
            # Add more as needed
        }
```

---

## 5. Database Schema

### 5.1 SQLAlchemy Models

#### Session Model

```python
# app/models/session.py

from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Original prompt
    prompt = Column(Text, nullable=False)

    # Current iteration prompt (changes each iteration)
    current_prompt = Column(Text, nullable=True)

    # Configuration
    chair_provider = Column(String, nullable=False)  # e.g., 'anthropic'
    total_iterations = Column(Integer, default=1)
    current_iteration = Column(Integer, default=0)
    merge_template = Column(String, default='balanced')  # analytical, creative, technical, balanced
    preset = Column(String, default='balanced')  # creative, balanced, precise

    # User inputs
    system_prompt = Column(Text, nullable=True)
    user_guidance = Column(Text, nullable=True)  # User guidance between iterations

    # Status: 'pending', 'running', 'paused', 'completed', 'failed'
    status = Column(String, default='pending')

    # Excluded providers (JSON array of provider names)
    excluded_providers = Column(Text, nullable=True)  # JSON serialized list

    # Autopilot mode
    autopilot = Column(Boolean, default=False)

    # Relationships
    responses = relationship("Response", back_populates="session", cascade="all, delete-orphan")
```

#### Response Model

```python
# app/models/response.py

from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign key
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)

    # Provider info
    provider = Column(String, nullable=False)  # 'openai', 'anthropic', etc.
    model = Column(String, nullable=False)  # 'gpt-4o', 'claude-sonnet-3.5', etc.

    # Content
    content = Column(Text, nullable=False)

    # Iteration context
    iteration = Column(Integer, default=1)
    role = Column(String, nullable=False)  # 'council' or 'chair'

    # Metadata
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    estimated_cost = Column(Float, default=0.0)
    response_time_ms = Column(Integer, default=0)

    # Error tracking
    error = Column(Text, nullable=True)

    # Relationship
    session = relationship("Session", back_populates="responses")
```

#### Settings Model

```python
# app/models/settings.py

from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime

class Settings(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True)
    value = Column(Text, nullable=False)  # JSON serialized
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 5.2 Database Schema Diagram

```
┌────────────────────────────────────────┐
│             sessions                    │
├────────────────────────────────────────┤
│ id (PK)                    VARCHAR      │
│ created_at                 DATETIME     │
│ updated_at                 DATETIME     │
│ prompt                     TEXT         │
│ current_prompt             TEXT         │
│ chair_provider             VARCHAR      │
│ total_iterations           INTEGER      │
│ current_iteration          INTEGER      │
│ merge_template             VARCHAR      │
│ preset                     VARCHAR      │
│ system_prompt              TEXT         │
│ user_guidance              TEXT         │
│ status                     VARCHAR      │
│ excluded_providers         TEXT (JSON)  │
│ autopilot                  BOOLEAN      │
└────────────────────────────────────────┘
                 │
                 │ 1:N
                 │
                 ▼
┌────────────────────────────────────────┐
│            responses                    │
├────────────────────────────────────────┤
│ id (PK)                    VARCHAR      │
│ created_at                 DATETIME     │
│ session_id (FK)            VARCHAR      │
│ provider                   VARCHAR      │
│ model                      VARCHAR      │
│ content                    TEXT         │
│ iteration                  INTEGER      │
│ role                       VARCHAR      │
│ input_tokens               INTEGER      │
│ output_tokens              INTEGER      │
│ estimated_cost             FLOAT        │
│ response_time_ms           INTEGER      │
│ error                      TEXT         │
└────────────────────────────────────────┘


┌────────────────────────────────────────┐
│            settings                     │
├────────────────────────────────────────┤
│ key (PK)                   VARCHAR      │
│ value                      TEXT (JSON)  │
│ updated_at                 DATETIME     │
└────────────────────────────────────────┘
```

---

## 6. API Specifications

### 6.1 Request/Response Schemas

#### Create Session

**Request**: `POST /api/session/create`
```json
{
  "prompt": "What are the implications of quantum computing?",
  "chair": "anthropic",
  "iterations": 3,
  "template": "analytical",
  "preset": "balanced",
  "system_prompt": "You are an expert analyst...",
  "autopilot": false
}
```

**Response**:
```json
{
  "session_id": "uuid-string",
  "status": "pending",
  "created_at": "2026-01-09T10:30:00Z"
}
```

#### Stream Events

**Request**: `GET /api/stream/{session_id}`

**Response**: Server-Sent Events (SSE)

Event types:

```typescript
// Iteration start
{
  type: 'iteration_start',
  iteration: 1
}

// Provider response start
{
  type: 'response_start',
  provider: 'openai',
  model: 'gpt-4o'
}

// Streaming chunk
{
  type: 'response_chunk',
  provider: 'openai',
  content: 'token text'
}

// Provider response complete
{
  type: 'response_end',
  provider: 'openai',
  input_tokens: 1500,
  output_tokens: 800,
  estimated_cost: 0.0195
}

// Provider error
{
  type: 'response_error',
  provider: 'google',
  error: 'Rate limit exceeded'
}

// Consensus start
{
  type: 'consensus_start',
  provider: 'anthropic'
}

// Consensus streaming
{
  type: 'consensus_chunk',
  content: 'merged text'
}

// Consensus complete
{
  type: 'consensus_end',
  input_tokens: 3000,
  output_tokens: 1000,
  estimated_cost: 0.120
}

// Iteration complete
{
  type: 'iteration_end',
  iteration: 1
}

// Session complete
{
  type: 'session_complete'
}
```

#### Trigger Next Iteration

**Request**: `POST /api/session/{session_id}/iterate`
```json
{
  "guidance": "Focus more on practical applications",
  "excluded_providers": ["google"]
}
```

**Response**:
```json
{
  "status": "running",
  "current_iteration": 2
}
```

#### Get Session History

**Request**: `GET /api/sessions/history?limit=20&offset=0`

**Response**:
```json
{
  "sessions": [
    {
      "id": "uuid",
      "created_at": "2026-01-09T10:30:00Z",
      "prompt": "What are the implications...",
      "status": "completed",
      "total_iterations": 3,
      "current_iteration": 3,
      "total_cost": 0.45
    }
  ],
  "total": 45
}
```

#### Get Full Session

**Request**: `GET /api/session/{session_id}`

**Response**:
```json
{
  "session": {
    "id": "uuid",
    "prompt": "...",
    "chair_provider": "anthropic",
    "total_iterations": 3,
    "current_iteration": 3,
    "status": "completed"
  },
  "responses": [
    {
      "id": "uuid",
      "provider": "openai",
      "model": "gpt-4o",
      "content": "...",
      "iteration": 1,
      "role": "council",
      "estimated_cost": 0.025
    },
    {
      "provider": "anthropic",
      "role": "chair",
      "iteration": 1,
      "content": "merged consensus..."
    }
    // ... more responses
  ]
}
```

#### Export to Markdown

**Request**: `GET /api/session/{session_id}/export/markdown`

**Response**:
```markdown
# HiveCouncil Session

**Date**: 2026-01-09 10:30:00
**Prompt**: What are the implications of quantum computing?
**Chair**: Anthropic (Claude)
**Iterations**: 3

## Iteration 1

### Council Responses

#### OpenAI (GPT-4o)
Quantum computing represents...

#### Anthropic (Claude Sonnet 3.5)
The implications of quantum computing...

### Consensus (Chair: Anthropic)
Synthesizing the council's input...

## Iteration 2
...
```

---

## 7. Data Flow

### 7.1 Session Creation & Execution Flow

```
User submits prompt
       │
       ▼
Frontend: POST /api/session/create
       │
       ▼
Backend: SessionService.create_session()
       ├─> Create Session record in DB
       ├─> Return session_id
       │
       ▼
Frontend: Open SSE connection to /api/stream/{session_id}
       │
       ▼
Backend: IterationService.run_iteration_cycle()
       │
       ├─> Loop: for each iteration
       │   │
       │   ├─> SessionService.execute_council()
       │   │   │
       │   │   ├─> Get all providers (except chair)
       │   │   │
       │   │   ├─> Parallel async calls to each provider
       │   │   │   │
       │   │   │   ├─> OpenAIProvider.stream_completion()
       │   │   │   │   └─> Yield: response_start → response_chunk* → response_end
       │   │   │   │
       │   │   │   ├─> AnthropicProvider.stream_completion()
       │   │   │   │   └─> Yield: response_start → response_chunk* → response_end
       │   │   │   │
       │   │   │   └─> GoogleProvider.stream_completion()
       │   │   │       └─> Yield: response_start → response_chunk* → response_end
       │   │   │
       │   │   └─> Save Response records to DB
       │   │
       │   ├─> MergeService.merge_responses()
       │   │   │
       │   │   ├─> Build merge prompt with all council responses
       │   │   │
       │   │   ├─> ChairProvider.stream_completion()
       │   │   │   └─> Yield: consensus_start → consensus_chunk* → consensus_end
       │   │   │
       │   │   └─> Save consensus Response record to DB
       │   │
       │   ├─> Yield: iteration_end
       │   │
       │   └─> If not autopilot: pause and wait for user
       │
       └─> Yield: session_complete
```

### 7.2 Streaming Event Flow

```
Frontend                          Backend                        AI APIs
   │                                 │                              │
   │ Open EventSource                │                              │
   ├────────────────────────────────>│                              │
   │                                 │                              │
   │        iteration_start          │                              │
   │<────────────────────────────────┤                              │
   │                                 │                              │
   │        response_start (OpenAI)  │  Async call to OpenAI       │
   │<────────────────────────────────┤─────────────────────────────>│
   │                                 │                              │
   │        response_chunk           │        Stream tokens         │
   │<────────────────────────────────┤<─────────────────────────────┤
   │        response_chunk           │        Stream tokens         │
   │<────────────────────────────────┤<─────────────────────────────┤
   │        response_end             │        Complete              │
   │<────────────────────────────────┤<─────────────────────────────┤
   │                                 │                              │
   │   (Similar flow for Anthropic, Google, etc. in parallel)      │
   │                                 │                              │
   │        consensus_start          │  Call Chair (Anthropic)      │
   │<────────────────────────────────┤─────────────────────────────>│
   │        consensus_chunk          │        Stream tokens         │
   │<────────────────────────────────┤<─────────────────────────────┤
   │        consensus_end            │        Complete              │
   │<────────────────────────────────┤                              │
   │                                 │                              │
   │        iteration_end            │                              │
   │<────────────────────────────────┤                              │
```

---

## 8. Component Design

### 8.1 Key Frontend Components

#### PromptInput Component

**Purpose**: Main prompt input with controls

```typescript
interface PromptInputProps {
  onSubmit: (config: SessionConfig) => void;
  disabled: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, disabled }) => {
  const [prompt, setPrompt] = useState('');
  const [chair, setChair] = useState('anthropic');
  const [iterations, setIterations] = useState(3);
  const [template, setTemplate] = useState('balanced');
  const [preset, setPreset] = useState('balanced');
  const [autopilot, setAutopilot] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      prompt,
      chair,
      iterations,
      template,
      preset,
      autopilot
    });
  };

  return (
    <Card>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
      />

      <div className="controls">
        <Select value={chair} onValueChange={setChair}>
          <SelectItem value="openai">OpenAI (Chair)</SelectItem>
          <SelectItem value="anthropic">Anthropic (Chair)</SelectItem>
          <SelectItem value="google">Google (Chair)</SelectItem>
          <SelectItem value="grok">Grok (Chair)</SelectItem>
        </Select>

        <Select value={iterations.toString()} onValueChange={(v) => setIterations(Number(v))}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <SelectItem key={n} value={n.toString()}>{n} Iteration{n > 1 ? 's' : ''}</SelectItem>
          ))}
        </Select>

        <Select value={template} onValueChange={setTemplate}>
          <SelectItem value="analytical">Analytical</SelectItem>
          <SelectItem value="creative">Creative</SelectItem>
          <SelectItem value="technical">Technical</SelectItem>
          <SelectItem value="balanced">Balanced</SelectItem>
        </Select>

        <Toggle checked={autopilot} onCheckedChange={setAutopilot}>
          Autopilot
        </Toggle>

        <Button onClick={handleSubmit} disabled={disabled || !prompt}>
          Submit
        </Button>
      </div>
    </Card>
  );
};
```

#### CouncilCard Component

**Purpose**: Display individual AI response

```typescript
interface CouncilCardProps {
  provider: string;
  model: string;
  content: string;
  isStreaming: boolean;
  cost?: number;
  onCopy: () => void;
  onExclude: () => void;
  excluded: boolean;
}

const CouncilCard: React.FC<CouncilCardProps> = ({
  provider,
  model,
  content,
  isStreaming,
  cost,
  onCopy,
  onExclude,
  excluded
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: excluded ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={excluded ? 'opacity-50' : ''}>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{provider}</h3>
              <p className="text-sm text-muted">{model}</p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={onCopy}>
                <CopyIcon />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onExclude}
                className={excluded ? 'bg-red-100' : ''}
              >
                <ExcludeIcon />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <StreamingText content={content} isStreaming={isStreaming} />
        </CardContent>

        {cost && (
          <CardFooter>
            <p className="text-xs text-muted">
              Cost: ${cost.toFixed(4)}
            </p>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};
```

#### ConsensusCard Component

**Purpose**: Highlight merged consensus

```typescript
interface ConsensusCardProps {
  content: string;
  iteration: number;
  isStreaming: boolean;
  chair: string;
  cost?: number;
  onCopy: () => void;
  onExport: () => void;
}

const ConsensusCard: React.FC<ConsensusCardProps> = ({
  content,
  iteration,
  isStreaming,
  chair,
  cost,
  onCopy,
  onExport
}) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-primary shadow-lg">
        <CardHeader className="bg-primary/10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                Consensus (Iteration {iteration})
              </h2>
              <p className="text-sm text-muted">Chair: {chair}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onCopy}>
                <CopyIcon /> Copy
              </Button>
              <Button onClick={onExport}>
                <DownloadIcon /> Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <StreamingText content={content} isStreaming={isStreaming} />
        </CardContent>

        {cost && (
          <CardFooter>
            <p className="text-sm text-muted">
              Estimated cost: ${cost.toFixed(4)}
            </p>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};
```

#### StreamingText Component

**Purpose**: Animate text as it streams in

```typescript
interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
}

const StreamingText: React.FC<StreamingTextProps> = ({ content, isStreaming }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    setDisplayedContent(content);
  }, [content]);

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-primary ml-1"
        />
      )}
    </div>
  );
};
```

#### IterationControls Component

**Purpose**: Controls for managing iterations

```typescript
interface IterationControlsProps {
  currentIteration: number;
  totalIterations: number;
  status: 'running' | 'paused' | 'completed';
  autopilot: boolean;
  onProceed: (guidance?: string) => void;
  onPause: () => void;
  onResume: () => void;
}

const IterationControls: React.FC<IterationControlsProps> = ({
  currentIteration,
  totalIterations,
  status,
  autopilot,
  onProceed,
  onPause,
  onResume
}) => {
  const [guidance, setGuidance] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);

  const handleProceed = () => {
    onProceed(guidance || undefined);
    setGuidance('');
    setShowGuidance(false);
  };

  if (autopilot && status === 'running') {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Loader className="animate-spin" />
            <span>Autopilot: Iteration {currentIteration} of {totalIterations}</span>
          </div>
          <Button onClick={onPause} variant="destructive">
            Pause
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'paused' && currentIteration < totalIterations) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">
              Iteration {currentIteration} complete. Continue to {currentIteration + 1}?
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGuidance(!showGuidance)}
              >
                Add Guidance
              </Button>
              <Button onClick={handleProceed}>
                Next Iteration
              </Button>
            </div>
          </div>

          {showGuidance && (
            <Textarea
              placeholder="Optional: Add guidance for the next iteration..."
              value={guidance}
              onChange={(e) => setGuidance(e.target.value)}
              className="mt-2"
            />
          )}
        </CardContent>
      </Card>
    );
  }

  if (status === 'completed') {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-lg font-semibold text-green-600">
            ✓ Session Complete - {totalIterations} iteration{totalIterations > 1 ? 's' : ''} finished
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};
```

---

## 9. State Management

### 9.1 Zustand Store Structure

**sessionStore.ts**:

```typescript
import { create } from 'zustand';
import { Session, Response, SessionConfig, StreamEvent } from '@/types';
import { api } from '@/lib/api';

interface SessionState {
  // Current session
  currentSession: Session | null;
  responses: Map<string, Response[]>; // provider -> responses for current iteration
  consensus: Response | null;

  // History
  sessions: Session[];

  // UI state
  isStreaming: boolean;
  isIterating: boolean;
  currentIteration: number;

  // Excluded providers for next iteration
  excludedProviders: Set<string>;

  // Actions
  createSession: (prompt: string, config: SessionConfig) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;

  // Streaming
  startStreaming: (sessionId: string) => void;
  stopStreaming: () => void;
  handleStreamEvent: (event: StreamEvent) => void;

  // Iteration control
  proceedIteration: (guidance?: string) => Promise<void>;
  pauseIteration: () => Promise<void>;
  resumeIteration: () => Promise<void>;
  toggleProviderExclusion: (provider: string) => void;

  // Reset
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  responses: new Map(),
  consensus: null,
  sessions: [],
  isStreaming: false,
  isIterating: false,
  currentIteration: 0,
  excludedProviders: new Set(),

  createSession: async (prompt, config) => {
    const session = await api.createSession(prompt, config);
    set({
      currentSession: session,
      responses: new Map(),
      consensus: null,
      currentIteration: 0,
      excludedProviders: new Set()
    });

    // Start streaming
    get().startStreaming(session.id);
  },

  startStreaming: (sessionId) => {
    set({ isStreaming: true, isIterating: true });

    const eventSource = new EventSource(`/api/stream/${sessionId}`);

    eventSource.onmessage = (event) => {
      const streamEvent: StreamEvent = JSON.parse(event.data);
      get().handleStreamEvent(streamEvent);
    };

    eventSource.onerror = () => {
      eventSource.close();
      set({ isStreaming: false });
    };
  },

  handleStreamEvent: (event) => {
    const { currentSession, responses } = get();

    switch (event.type) {
      case 'iteration_start':
        set({ currentIteration: event.iteration, responses: new Map() });
        break;

      case 'response_start':
        // Initialize response for provider
        const providerResponses = responses.get(event.provider) || [];
        responses.set(event.provider, providerResponses);
        set({ responses: new Map(responses) });
        break;

      case 'response_chunk':
        // Append chunk to provider's response
        const existing = responses.get(event.provider) || [];
        const lastResponse = existing[existing.length - 1];

        if (lastResponse) {
          lastResponse.content += event.content;
        } else {
          existing.push({
            provider: event.provider,
            content: event.content,
            isStreaming: true
          });
        }

        responses.set(event.provider, existing);
        set({ responses: new Map(responses) });
        break;

      case 'response_end':
        // Mark response complete
        const completed = responses.get(event.provider);
        if (completed && completed.length > 0) {
          completed[completed.length - 1].isStreaming = false;
          completed[completed.length - 1].cost = event.estimated_cost;
        }
        set({ responses: new Map(responses) });
        break;

      case 'consensus_start':
        set({ consensus: { provider: event.provider, content: '', isStreaming: true } });
        break;

      case 'consensus_chunk':
        const { consensus } = get();
        if (consensus) {
          consensus.content += event.content;
          set({ consensus: { ...consensus } });
        }
        break;

      case 'consensus_end':
        const finalConsensus = get().consensus;
        if (finalConsensus) {
          finalConsensus.isStreaming = false;
          finalConsensus.cost = event.estimated_cost;
          set({ consensus: finalConsensus });
        }
        break;

      case 'iteration_end':
        // Check if should pause (manual mode)
        if (!currentSession?.autopilot) {
          set({ isIterating: false });
        }
        break;

      case 'session_complete':
        set({ isStreaming: false, isIterating: false });
        break;
    }
  },

  proceedIteration: async (guidance) => {
    const { currentSession, excludedProviders } = get();
    if (!currentSession) return;

    set({ isIterating: true });

    await api.triggerIteration(currentSession.id, {
      guidance,
      excluded_providers: Array.from(excludedProviders)
    });
  },

  toggleProviderExclusion: (provider) => {
    const { excludedProviders } = get();
    const newSet = new Set(excludedProviders);

    if (newSet.has(provider)) {
      newSet.delete(provider);
    } else {
      newSet.add(provider);
    }

    set({ excludedProviders: newSet });
  },

  loadSessions: async () => {
    const sessions = await api.getSessions();
    set({ sessions });
  },

  loadSession: async (sessionId) => {
    const sessionData = await api.getSession(sessionId);
    set({
      currentSession: sessionData.session,
      responses: new Map(), // Parse from responses
      consensus: null // Find latest consensus
    });
  },

  reset: () => {
    set({
      currentSession: null,
      responses: new Map(),
      consensus: null,
      isStreaming: false,
      isIterating: false,
      currentIteration: 0,
      excludedProviders: new Set()
    });
  }
}));
```

---

## 10. Integration Patterns

### 10.1 AI Provider Integration

Each AI provider follows a common interface but with provider-specific implementations:

```python
# Provider-specific configurations
PROVIDER_CONFIGS = {
    'openai': {
        'default_model': 'gpt-4o',
        'env_key': 'OPENAI_API_KEY',
        'sdk': 'openai',
        'supports_streaming': True
    },
    'anthropic': {
        'default_model': 'claude-sonnet-3.5-20250219',
        'env_key': 'ANTHROPIC_API_KEY',
        'sdk': 'anthropic',
        'supports_streaming': True
    },
    'google': {
        'default_model': 'gemini-pro',
        'env_key': 'GOOGLE_API_KEY',
        'sdk': 'google.generativeai',
        'supports_streaming': True
    },
    'grok': {
        'default_model': 'grok-beta',
        'env_key': 'GROK_API_KEY',
        'sdk': 'openai',  # Grok uses OpenAI-compatible API
        'supports_streaming': True,
        'base_url': 'https://api.x.ai/v1'
    }
}
```

### 10.2 Error Handling Patterns

```python
async def safe_provider_call(provider: AIProvider, prompt: str):
    """Wrapper for provider calls with error handling"""
    try:
        async for chunk in provider.stream_completion(prompt):
            yield StreamEvent(type='response_chunk', content=chunk)

    except RateLimitError as e:
        yield StreamEvent(
            type='response_error',
            provider=provider.name,
            error='Rate limit exceeded. Please try again later.',
            error_code='rate_limit'
        )

    except AuthenticationError as e:
        yield StreamEvent(
            type='response_error',
            provider=provider.name,
            error='Authentication failed. Check API key.',
            error_code='auth_error'
        )

    except TimeoutError as e:
        yield StreamEvent(
            type='response_error',
            provider=provider.name,
            error='Request timed out.',
            error_code='timeout'
        )

    except Exception as e:
        yield StreamEvent(
            type='response_error',
            provider=provider.name,
            error=f'Unexpected error: {str(e)}',
            error_code='unknown'
        )
```

### 10.3 Parallel API Execution

```python
async def execute_providers_parallel(providers: list[AIProvider], prompt: str):
    """Execute multiple providers in parallel, yielding events as they arrive"""

    async def provider_stream(provider: AIProvider):
        async for event in safe_provider_call(provider, prompt):
            yield event

    # Create async generators for each provider
    streams = [provider_stream(p) for p in providers]

    # Merge streams and yield events as they arrive
    async for event in merge_async_generators(streams):
        yield event

async def merge_async_generators(generators):
    """Merge multiple async generators into one stream"""
    queue = asyncio.Queue()

    async def consume(gen):
        async for item in gen:
            await queue.put(item)

    # Start all consumers
    tasks = [asyncio.create_task(consume(gen)) for gen in generators]

    # Add sentinel when all done
    async def add_sentinel():
        await asyncio.gather(*tasks)
        await queue.put(None)

    asyncio.create_task(add_sentinel())

    # Yield items as they arrive
    while True:
        item = await queue.get()
        if item is None:
            break
        yield item
```

---

## 11. Development Workflow

### 11.1 Initial Setup

```bash
# Clone/navigate to project
cd HiveCouncil

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt

# Initialize database
python -m alembic upgrade head

# Setup environment variables
cp .env.example .env
# Edit .env with API keys

# Setup frontend
cd ../frontend
npm install

# Install shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog select textarea
```

### 11.2 Development Scripts

**Root package.json**:

```json
{
  "name": "hivecouncil",
  "version": "0.1.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**Single command to start**:
```bash
npm start
```

### 11.3 MVP Development Phases

#### Phase 1: Foundation (Core Loop)
- [ ] Setup project structure
- [ ] Initialize SQLite database with schemas
- [ ] Create basic FastAPI app with one route
- [ ] Implement OpenAI provider integration
- [ ] Create simple React frontend with prompt input
- [ ] Test: Submit prompt → Get OpenAI response → Display

#### Phase 2: Multi-Provider
- [ ] Implement Anthropic provider
- [ ] Implement Google provider
- [ ] Implement Grok provider
- [ ] Add provider factory pattern
- [ ] Implement parallel execution
- [ ] Test: Submit prompt → All providers respond simultaneously

#### Phase 3: Chair & Merge
- [ ] Implement merge service
- [ ] Create merge prompt templates
- [ ] Add chair selection to frontend
- [ ] Test: Council responds → Chair merges → Display consensus

#### Phase 4: Streaming
- [ ] Implement SSE endpoint
- [ ] Add streaming to all providers
- [ ] Create streaming UI components
- [ ] Test: Real-time token streaming to frontend

#### Phase 5: Iterations
- [ ] Implement iteration service
- [ ] Add iteration controls to frontend
- [ ] Implement feedback prompt building
- [ ] Add autopilot mode
- [ ] Test: Multiple iteration cycles

#### Phase 6: Persistence
- [ ] Implement session save/load
- [ ] Create session history UI
- [ ] Add session detail view
- [ ] Test: Resume previous sessions

#### Phase 7: Polish
- [ ] Add animations (Framer Motion)
- [ ] Implement cost estimation
- [ ] Add markdown export
- [ ] Create prompt templates library
- [ ] Add comparison tools
- [ ] Implement keyboard shortcuts
- [ ] Add theme toggle
- [ ] Create settings panel

### 11.4 Testing Strategy

**Backend Testing**:
```bash
# Unit tests for services
pytest backend/tests/test_services/

# Integration tests for API routes
pytest backend/tests/test_api/

# Provider tests (may require API keys or mocks)
pytest backend/tests/test_providers/
```

**Frontend Testing**:
```bash
# Component tests
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

---

## 12. Next Steps

### Immediate Actions

1. **Create Project Structure**
   ```bash
   mkdir -p frontend/src/{components,hooks,lib,store,types,styles}
   mkdir -p backend/app/{api,core,models,schemas,services,utils}
   ```

2. **Initialize Git Repository**
   ```bash
   git init
   # Create .gitignore for Python, Node, .env files
   ```

3. **Setup Backend Foundation**
   - Install FastAPI and dependencies
   - Create database models
   - Setup SQLAlchemy and alembic

4. **Setup Frontend Foundation**
   - Initialize Vite + React + TypeScript
   - Install Tailwind CSS
   - Install and configure shadcn/ui

5. **Implement First Provider (OpenAI)**
   - Create base provider interface
   - Implement OpenAI provider
   - Test basic completion

6. **Create Basic UI**
   - Prompt input component
   - Simple response display
   - Test end-to-end flow

### Success Criteria for Architecture Phase

- [ ] Complete project structure created
- [ ] All directories and files scaffolded
- [ ] Database schema implemented and migrations ready
- [ ] API endpoints defined (stubs OK)
- [ ] Frontend component structure established
- [ ] State management configured
- [ ] First provider integration working
- [ ] Basic UI rendering prompt input

---

**Document Status**: ✅ Ready for Implementation
**Next Document**: Development Plan (step-by-step implementation guide)
