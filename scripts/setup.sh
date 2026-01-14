#!/bin/bash
set -e  # Exit on error

echo "🚀 Setting up LLMings (HiveCouncil)..."
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
if (( $(echo "$PYTHON_VERSION < 3.10" | bc -l) )); then
    echo "❌ Python 3.10+ is required. You have Python $PYTHON_VERSION"
    exit 1
fi
echo "✓ Python $PYTHON_VERSION found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if (( NODE_VERSION < 18 )); then
    echo "❌ Node.js 18+ is required. You have Node.js $NODE_VERSION"
    exit 1
fi
echo "✓ Node.js $NODE_VERSION found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi
echo "✓ npm $(npm --version) found"

echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "ℹ️  .env file created. You can add API keys later in Provider Settings."
else
    echo "ℹ️  .env file already exists"
fi

# Setup backend
echo ""
echo "🐍 Setting up Python backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✓ Backend setup complete!"

# Setup frontend
cd ../frontend
echo ""
echo "⚛️  Setting up React frontend..."
echo "Installing Node dependencies..."
npm install

echo "✓ Frontend setup complete!"

cd ..
echo ""
echo "✅ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 LLMings is ready to use!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo ""
echo "  1. Start the application:"
echo "     npm start"
echo ""
echo "  2. Open your browser to http://localhost:5173"
echo ""
echo "  3. Configure providers in the Provider Settings tab:"
echo "     • Add API keys for cloud providers (OpenAI, Anthropic, etc.)"
echo "     • Or install Ollama for free local models"
echo ""
echo "  4. Create your first council and ask a question!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tips:"
echo "  • Use Ollama for completely free local inference (no API keys)"
echo "  • Try different personality archetypes for diverse perspectives"
echo "  • Save council configurations as templates for reuse"
echo ""
echo "📚 Need help? Check the README.md for detailed documentation"
echo ""
