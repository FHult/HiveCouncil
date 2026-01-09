# HiveCouncil Requirements Document

## Project Overview

**HiveCouncil** is a local web application that creates a "council" of AI services to respond to user prompts, with iterative consensus-building through a designated "chair" AI that merges responses into a best-of-breed version.

## Core Concept

1. User submits a prompt
2. Multiple AI services respond simultaneously (the "council")
3. A user-selected "chair" AI merges all responses into a consensus
4. Council members provide feedback on the merged consensus
5. Process iterates for a user-defined number of cycles
6. Results displayed in a delightful, dynamic web interface

---

## 1. Technical Stack

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Focus**: Smooth animations, real-time streaming display

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (local persistence)
- **API Communication**: Async HTTP clients for AI service APIs

### Deployment
- **Environment**: Local macOS development
- **Launch Method**: Simple npm scripts (single command starts both frontend and backend)
- **Browser**: Automatic browser launch on startup

---

## 2. AI Service Integration

### Supported Providers (Initial Release)
1. **OpenAI** (GPT-4, GPT-4o, GPT-4 Turbo, etc.)
2. **Anthropic** (Claude Opus, Sonnet, Haiku)
3. **Google** (Gemini Pro, Flash)
4. **Grok** (xAI)

### API Key Management
- **Method**: Environment variables via `.env` file
- **Format**: Simple key-value pairs
  ```
  OPENAI_API_KEY=sk-...
  ANTHROPIC_API_KEY=sk-ant-...
  GOOGLE_API_KEY=...
  GROK_API_KEY=...
  ```

### Model Selection
- **Default Behavior**: All configured AI services participate with their default models
- **Future Enhancement**: Allow granular model selection per provider

---

## 3. Core Functionality

### 3.1 Council Session Flow

#### Initial Prompt Submission
1. User enters prompt in main input field
2. User selects which AI service acts as "chair" for this session
3. User sets number of iterations (1-10)
4. Optional: User selects merge template style (analytical, creative, technical, balanced)
5. System sends prompt to all configured AI services simultaneously

#### Council Response Phase
- All non-chair AI services receive the original prompt
- Responses stream in real-time to the UI
- Each response displayed in a card showing:
  - AI service name and model version
  - Streaming response text
- Display continues until all council members complete

#### Chair Merge Phase
- **Trigger**: After all council responses complete
- **Chair Receives**:
  - Original user prompt
  - All council member responses (full text)
  - Iteration history (if not first iteration)
  - Selected merge template/style
- **Chair Output**: Merged consensus response
- **Display**: Prominent top card with distinct styling

#### Iteration Feedback Phase (if iterations > 1)
- **Council Members Receive**: Only the merged consensus from chair
- **Council Members Task**: Critique/refine the merged consensus
- **User Control Options**:
  - Manual approval to proceed to next iteration (default)
  - Pause/resume iterations
  - Edit/guide iterations (add notes between cycles)
  - Selective participation (exclude specific AI responses)
  - Autopilot mode (automatic iteration without user interaction)

#### Iteration Cycle Continues
- Process repeats for user-defined number of iterations
- Each iteration builds on previous merged consensus
- Full iteration history maintained for context

### 3.2 Chair Merge Templates

Pre-defined prompt templates guide the chair's merging approach:

1. **Analytical**: Focus on logical synthesis, evidence-based consolidation
2. **Creative**: Emphasize innovative combinations, expansive thinking
3. **Technical**: Prioritize accuracy, precision, technical correctness
4. **Balanced**: General-purpose merge balancing multiple perspectives

Templates are applied to the system prompt sent to the chair AI.

### 3.3 Response Streaming

- **Method**: Real-time streaming from AI APIs
- **Display**: Word-by-word rendering as tokens arrive (ChatGPT-style)
- **User Experience**: Immediate feedback, perceived performance

### 3.4 AI Parameters

- **User Control**: Simple presets only (Creative/Balanced/Precise modes)
- **Implementation**: Presets map to specific temperature/token settings internally
- **Rationale**: Keep interface beginner-friendly, hide complexity

---

## 4. User Interface Design

### 4.1 Layout Structure

**Dashboard with Cards** approach:

#### Main View Components
1. **Prompt Input Area** (top)
   - Large text input/textarea
   - Controls: Chair selection dropdown, iteration count selector, merge template picker
   - Submit button

2. **Consensus Card** (prominent, top of results)
   - Larger card with distinct styling/color
   - Shows chair's merged consensus
   - Displays iteration number
   - Action buttons: Copy, Export

3. **Council Response Cards** (grid layout below consensus)
   - Card per AI service
   - Header: AI service name + model version
   - Streaming response text
   - Action buttons: Copy, Expand/Collapse, Exclude from next iteration

#### Sidebar/Secondary Panel
- Session history (saved conversations)
- Settings access
- Cost estimation display

### 4.2 Visual Design Priorities

1. **Smooth Animations**
   - Card entrance/exit transitions
   - Streaming text animations
   - Hover effects and micro-interactions
   - Loading states and progress indicators

2. **Theme Support**
   - Dark/light theme toggle
   - Consistent with shadcn/ui theming

3. **Responsive Design**
   - Optimized for desktop browsers (primary use case)
   - Flexible grid layouts for different screen sizes

### 4.3 Interactive Features

#### During Iterations
- **Manual Control**: "Next Iteration" button between cycles
- **Pause/Resume**: Ability to halt and restart iteration process
- **Guidance**: Text input to add notes/directions between iterations
- **Selective Exclusion**: Checkbox/toggle to exclude specific AI responses
- **Autopilot Toggle**: Switch to enable/disable automatic iterations

#### Response Cards
- **Copy Button**: One-click copy response to clipboard
- **Expand/Collapse**: Toggle full response view
- **Exclude Toggle**: Remove from next iteration's influence

---

## 5. Data Management

### 5.1 Persistence

**Database**: SQLite (local file)

**Stored Data**:
- Conversation sessions (prompt, responses, consensus, iterations)
- Session metadata (timestamp, chair selection, iteration count)
- User preferences (theme, default settings)

**Schema Considerations**:
- Sessions table (id, timestamp, prompt, chair_id, iterations, status)
- Responses table (id, session_id, provider, model, response_text, iteration, role)
- Settings table (key-value pairs for user preferences)

### 5.2 Export Capabilities

1. **Markdown Export**
   - Format: Structured markdown with headers per AI/iteration
   - Content: Full conversation flow including all iterations
   - Trigger: Export button on completed sessions

2. **Copy Individual Responses**
   - Quick copy button on each card
   - Copies plain text response to clipboard

### 5.3 Conversation History

- **Access**: Sidebar list of past sessions
- **Display**: Show timestamp and first 50 chars of prompt
- **Action**: Click to load full session (read-only or continue)

---

## 6. Error Handling & Resilience

### 6.1 API Failures

**Strategy**: Fail gracefully

- If one AI service fails/times out:
  - Continue with available responses
  - Display error message in that AI's card
  - Proceed to merge with remaining responses

- If chair fails:
  - Critical error, halt iteration
  - Notify user, preserve existing responses
  - Allow retry with different chair selection

### 6.2 Rate Limiting

- Detect rate limit responses from APIs
- Display warning in affected AI's card
- Do not retry automatically (to avoid charges)
- User can manually retry after delay

### 6.3 Concurrency Management

**New Prompt During Active Session**:
- **Default**: Queue the new prompt
- Wait for current iterations to complete
- Then process queued prompt
- **Visual**: Show "Processing..." indicator, "Queued" badge on new prompt

---

## 7. Cost Management

### 7.1 Cost Tracking

**Level**: Estimated costs only

**Implementation**:
- Maintain pricing table for each provider/model (per 1K tokens)
- Calculate estimated cost based on:
  - Input tokens (prompt + context)
  - Output tokens (response length)
- Display cost per response and total session cost

**Display Location**:
- Small cost indicator on each response card
- Total session cost in consensus card or footer
- Cumulative cost in session history

**Pricing Updates**:
- Store pricing in configuration file
- Manual updates when providers change pricing
- Note: Estimates may not match actual bills

---

## 8. Additional Features (MVP)

### 8.1 Prompt Templates Library

- **Access**: Dropdown or library icon in prompt input area
- **Templates**:
  - Brainstorming sessions
  - Technical analysis
  - Creative writing feedback
  - Code review consensus
  - Research synthesis
  - Decision making
- **Functionality**: Click to populate prompt input, user can edit

### 8.2 Response Comparison Tools

- **Diff View**: Highlight differences between AI responses
- **Similarity Scoring**: Visual indicator of response similarity
- **Side-by-Side**: Optional view mode comparing 2 responses directly

### 8.3 Keyboard Shortcuts

Power-user shortcuts:
- `Ctrl/Cmd + Enter`: Submit prompt
- `Ctrl/Cmd + K`: Focus prompt input
- `Ctrl/Cmd + C`: Copy consensus (when focused)
- `Ctrl/Cmd + N`: New session
- `Esc`: Cancel current streaming/iterations
- `Space`: Proceed to next iteration (when in manual mode)

### 8.4 Global System Prompt

**Configuration**: Settings panel with textarea
**Application**: System prompt prepended to all council member requests (not chair merge)
**Use Cases**:
- Enforce response format
- Add context/constraints to all AIs
- Persona/style guidance

---

## 9. Configuration & Settings

### 9.1 Settings Panel

Access via settings icon/menu:

**Sections**:

1. **API Configuration** (read-only display)
   - Show which API keys are configured
   - Link to documentation for adding keys to .env

2. **Default Preferences**
   - Default chair selection (or "Always ask")
   - Default iteration count
   - Default merge template
   - Default preset (Creative/Balanced/Precise)

3. **Interface**
   - Theme toggle (dark/light)
   - Enable/disable animations
   - Response streaming speed (if configurable)

4. **Global System Prompt**
   - Large textarea for custom system prompt
   - Applied to all council members

5. **Cost Settings**
   - Display pricing table (editable)
   - Cost warning threshold (optional)

---

## 10. Development Priorities (MVP)

### Phase 1: Core Loop
1. Basic frontend layout (prompt input, response cards)
2. FastAPI backend with single AI provider (e.g., OpenAI)
3. Prompt submission → response display
4. Chair merge functionality
5. Single iteration cycle working

### Phase 2: Multi-Provider
6. Add Anthropic, Google, Grok integrations
7. Parallel API calls with async handling
8. Error handling for individual provider failures

### Phase 3: Iteration System
9. Implement iteration loop (feedback → merge → feedback)
10. Iteration controls (manual proceed, autopilot, pause/resume)
11. Guidance and selective exclusion features

### Phase 4: Persistence & History
12. SQLite integration
13. Save/load sessions
14. Conversation history sidebar

### Phase 5: Polish & Features
15. Streaming response animations
16. Markdown export
17. Cost estimation
18. Prompt templates library
19. Response comparison tools
20. Keyboard shortcuts
21. Theme toggle
22. Settings panel

---

## 11. Technical Considerations

### 11.1 API Communication

**Backend Architecture**:
- FastAPI endpoints for each operation
- Async HTTP clients (httpx or aiohttp)
- SSE (Server-Sent Events) for streaming responses to frontend
- WebSocket alternative if SSE insufficient

**Frontend**:
- Fetch API or axios for HTTP requests
- EventSource for SSE streaming
- State management (React Context or Zustand)

### 11.2 Error Handling Flow

```
User submits prompt
  → Backend validates request
    → Send to all AI providers (parallel async)
      → Provider A: Success → Stream to frontend
      → Provider B: Fails → Send error event → Display error card
      → Provider C: Success → Stream to frontend
    → All complete/failed
  → Backend sends chair merge request
    → Chair merges available responses
    → Stream consensus to frontend
  → If iterations > 1:
    → Wait for user to proceed (or auto in autopilot)
    → Send consensus to council for feedback
    → Repeat
```

### 11.3 Performance Optimization

- **Lazy Loading**: Load session history on demand
- **Debouncing**: Prompt input validation
- **Caching**: Cache AI provider capabilities/models list
- **Compression**: Gzip responses from backend

### 11.4 Security Considerations

- **API Keys**: Never expose in frontend, backend-only access
- **Input Validation**: Sanitize prompts before sending to APIs
- **Rate Limiting**: Implement simple rate limiting on backend
- **CORS**: Configure for local development (localhost origins)

---

## 12. Future Enhancements (Post-MVP)

### 12.1 Advanced Features
- **Model-specific selection**: Choose GPT-4 vs GPT-4o, Claude Opus vs Sonnet
- **Saved configurations**: Named presets for council composition
- **Adaptive iterations**: Auto-detect convergence, stop when plateau reached
- **Voting system**: AIs vote on best response, influence merge weighting
- **Custom merge algorithms**: User-defined weighting, averaging methods

### 12.2 Extended Integrations
- **More providers**: Mistral, Cohere, Perplexity
- **Local models**: Ollama, LM Studio integration
- **Multimodal support**: Image inputs, vision model participation

### 12.3 Collaboration Features
- **Share via link**: Generate read-only shareable links
- **Export formats**: JSON, PDF exports
- **Team mode**: Multiple users collaborating on same council session

### 12.4 Analytics
- **Response quality metrics**: Track which AIs produce best results
- **Consensus tracking**: Measure convergence speed, agreement levels
- **Usage analytics**: Most-used providers, models, templates

---

## 13. Success Criteria

### MVP Completion Checklist

**Core Functionality**:
- [ ] Submit prompt to 4+ AI providers simultaneously
- [ ] Real-time streaming responses displayed in cards
- [ ] Chair merges responses into consensus
- [ ] Iterate for user-defined count (1-10)
- [ ] Manual and autopilot iteration modes

**UI/UX**:
- [ ] Delightful dashboard with card layout
- [ ] Smooth animations and transitions
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts functional

**Data**:
- [ ] SQLite persistence working
- [ ] Session history accessible
- [ ] Markdown export functional
- [ ] Copy to clipboard working

**Configuration**:
- [ ] .env API key configuration
- [ ] Settings panel with preferences
- [ ] Global system prompt editable
- [ ] Merge templates selectable

**Error Handling**:
- [ ] Graceful failure of individual providers
- [ ] Queue management for concurrent prompts
- [ ] User-friendly error messages

**Polish**:
- [ ] Cost estimation displayed
- [ ] Prompt templates library
- [ ] Response comparison tools
- [ ] One-command npm start

---

## 14. Open Questions & Decisions Needed

### Resolved in Interview
- All major architectural and UX decisions captured above

### To Be Determined During Development
1. **Exact pricing tables**: Need to finalize current pricing per provider/model
2. **Token counting**: Use tiktoken for OpenAI, estimate for others?
3. **SSE vs WebSocket**: Test performance, choose best for streaming
4. **State management**: React Context sufficient or need Zustand/Redux?
5. **Animation library**: Framer Motion vs CSS transitions vs GSAP?
6. **Database schema details**: Exact table structures, indexes, relationships
7. **Prompt template content**: Write actual template texts
8. **Merge template prompts**: Craft specific system prompts for each style

---

## 15. Non-Goals (Out of Scope for MVP)

- Cloud deployment or hosting
- User authentication or multi-user support
- Payment processing or billing
- Mobile app or responsive mobile optimization
- Browser extension
- API for third-party integrations
- Real-time collaboration features
- Advanced analytics dashboard
- A/B testing frameworks
- Internationalization (i18n)
- Accessibility compliance (WCAG) - though good practices encouraged

---

## Appendix: Technology Reference

### Frontend Dependencies (Anticipated)
```json
{
  "react": "^18.x",
  "vite": "^5.x",
  "tailwindcss": "^3.x",
  "shadcn/ui": "latest",
  "framer-motion": "^11.x",
  "zustand": "^4.x" (or react context),
  "axios": "^1.x",
  "react-markdown": "^9.x"
}
```

### Backend Dependencies (Anticipated)
```python
fastapi==0.110.x
uvicorn==0.29.x
httpx==0.27.x
python-dotenv==1.0.x
sqlalchemy==2.0.x
aiosqlite==0.20.x
anthropic==0.x
openai==1.x
google-generativeai==0.x
```

### Environment Variables Template
```bash
# HiveCouncil API Configuration

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google
GOOGLE_API_KEY=...

# Grok (xAI)
GROK_API_KEY=...

# Optional: Model Defaults
DEFAULT_CHAIR=anthropic

# Database
DATABASE_URL=sqlite:///./hivecouncil.db
```

---

**Document Version**: 1.0
**Date**: 2026-01-09
**Status**: Ready for Architecture & Planning Phase
