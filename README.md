# HiveCouncil

A local web application that creates a "council" of AI services to respond to user prompts, with iterative consensus-building through a designated "chair" AI that merges responses into a best-of-breed version.

## Features

- **Multi-AI Council**: Get responses from OpenAI, Anthropic, Google Gemini, and Grok simultaneously
- **Consensus Building**: A user-selected "chair" AI merges all responses into a unified answer
- **Iterative Refinement**: Run multiple iteration cycles where the council critiques and improves the consensus
- **Real-time Streaming**: Watch AI responses appear in real-time with smooth animations
- **Local-First**: All data stored locally with SQLite, your prompts and responses stay private
- **Cost Tracking**: Estimate API costs per session
- **Rich Export**: Export sessions to Markdown format

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **AI Providers**: OpenAI, Anthropic, Google Gemini, Grok (xAI)

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- API keys for AI services you want to use:
  - OpenAI API key
  - Anthropic API key
  - Google AI API key
  - Grok API key

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/HiveCouncil.git
   cd HiveCouncil
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Install dependencies and start**
   ```bash
   npm install
   npm start
   ```

   This will automatically:
   - Install both frontend and backend dependencies
   - Initialize the database
   - Start the FastAPI backend on port 8000
   - Start the Vite frontend on port 5173
   - Open your browser to http://localhost:5173

## Development

### Backend Development
```bash
cd backend
source venv/bin/activate  # On macOS/Linux
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## Project Structure

```
HiveCouncil/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilities
│   │   ├── store/       # Zustand state management
│   │   └── types/       # TypeScript types
│   └── package.json
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/        # API routes
│   │   ├── models/     # Database models
│   │   ├── services/   # Business logic
│   │   └── main.py     # FastAPI app
│   └── requirements.txt
├── docs/              # Documentation
├── REQUIREMENTS.md    # Requirements document
└── ARCHITECTURE.md    # Architecture plan
```

## Documentation

- [Requirements Document](REQUIREMENTS.md) - Detailed requirements and features
- [Architecture Plan](ARCHITECTURE.md) - Technical architecture and design decisions

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
