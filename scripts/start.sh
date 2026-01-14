#!/bin/bash

echo "🚀 Starting LLMings..."
echo ""

# Check if setup has been run
if [ ! -d "backend/venv" ]; then
    echo "❌ Backend not set up. Please run setup first:"
    echo "   ./scripts/setup.sh"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend not set up. Please run setup first:"
    echo "   ./scripts/setup.sh"
    exit 1
fi

# Check if Ollama is running (optional but helpful)
if command -v ollama &> /dev/null; then
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "ℹ️  Ollama is installed but not running."
        echo "   Start it with: ollama serve"
        echo ""
    else
        echo "✓ Ollama is running"
        echo ""
    fi
fi

echo "Starting backend and frontend..."
echo ""
echo "Backend will start on: http://localhost:8000"
echo "Frontend will start on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start using the npm script (uses concurrently)
npm start
