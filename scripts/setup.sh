#!/bin/bash

echo "🚀 Setting up HiveCouncil..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys!"
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
echo "To start the application:"
echo "  npm start"
echo ""
echo "Or start frontend and backend separately:"
echo "  Terminal 1: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Terminal 2: cd frontend && npm run dev"
