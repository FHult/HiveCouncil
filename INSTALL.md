# Installation Guide for LLMings

This guide will help you install and set up LLMings on your local machine.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Installation](#quick-installation)
- [Detailed Installation](#detailed-installation)
- [Provider Setup](#provider-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Operating System**: macOS, Linux, or Windows (with WSL recommended)
- **RAM**: 8GB minimum (16GB+ recommended for local Ollama models)
- **Disk Space**: 2GB for application + additional space for Ollama models (2-10GB per model)

### Required Software

1. **Python 3.10 or higher**
   ```bash
   python3 --version  # Should show 3.10 or higher
   ```

   Installation:
   - macOS: `brew install python3`
   - Ubuntu/Debian: `sudo apt install python3 python3-pip python3-venv`
   - Windows: Download from [python.org](https://www.python.org/downloads/)

2. **Node.js 18 or higher**
   ```bash
   node --version  # Should show 18 or higher
   ```

   Installation:
   - macOS: `brew install node`
   - Ubuntu/Debian: Use [NodeSource](https://github.com/nodesource/distributions)
   - Windows: Download from [nodejs.org](https://nodejs.org/)

3. **npm** (usually comes with Node.js)
   ```bash
   npm --version
   ```

### Optional Software

**Ollama** (for free local models - no API keys needed)
- Download and install from [ollama.ai](https://ollama.ai/)
- macOS/Linux quick install:
  ```bash
  curl -fsSL https://ollama.ai/install.sh | sh
  ```

## Quick Installation

For users who want to get started quickly:

1. **Clone the repository**
   ```bash
   git clone https://github.com/FHult/HiveCouncil.git
   cd HiveCouncil
   ```

2. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh scripts/start.sh
   ./scripts/setup.sh
   ```

3. **Start the application**
   ```bash
   npm start
   ```
   Or use the helper script:
   ```bash
   ./scripts/start.sh
   ```

4. **Open your browser**
   - Navigate to [http://localhost:5173](http://localhost:5173)
   - Configure providers in the Provider Settings tab
   - Create your first council!

## Detailed Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/FHult/HiveCouncil.git
cd HiveCouncil
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r requirements.txt

# Return to project root
cd ..
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Return to project root
cd ..
```

### Step 4: Install Root Dependencies

```bash
# Install concurrently for running both services
npm install
```

### Step 5: Environment Configuration (Optional)

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your API keys
nano .env  # or use your preferred editor
```

The `.env` file contains configuration for:
- OpenAI API key
- Anthropic API key
- Google AI API key
- Grok API key
- Database URL (SQLite by default)

**Note**: You don't need to configure API keys immediately. You can add them later through the Provider Settings UI, or use Ollama exclusively for free local inference.

### Step 6: Start the Application

```bash
# Start both backend and frontend
npm start
```

This will:
- Start the FastAPI backend on port 8000
- Start the Vite frontend on port 5173
- Open your browser automatically

## Provider Setup

### Option 1: Cloud Providers (Requires API Keys)

1. Go to the **Provider Settings** tab in the UI
2. Click **Configure** on each provider you want to use
3. Enter your API key
4. Click **Save**

Where to get API keys:
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
- **Google AI**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **Grok**: [console.x.ai](https://console.x.ai/)

### Option 2: Ollama (Free Local Models)

1. **Install Ollama** if you haven't already:
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh

   # Or download from https://ollama.ai
   ```

2. **Start Ollama service**:
   ```bash
   ollama serve
   ```
   Keep this running in a separate terminal.

3. **Install models through the UI**:
   - Go to **Provider Settings** tab
   - Find the Ollama section
   - Click **Manage Local Models**
   - Install recommended models (e.g., llama3.1, mistral, gemma2)

4. **Or install models via command line**:
   ```bash
   ollama pull llama3.1
   ollama pull mistral
   ollama pull gemma2
   ```

Popular Ollama models:
- **llama3.1** (8B params, 8GB RAM) - Best general-purpose model
- **mistral** (7B params, 8GB RAM) - Strong reasoning and coding
- **gemma2** (9B params, 12GB RAM) - Creative and versatile
- **phi3** (3.8B params, 4GB RAM) - Efficient, good for low-memory systems
- **qwen2** (7B params, 8GB RAM) - Strong multilingual and coding

## Verifying Installation

### Check Backend
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### Check Frontend
- Open [http://localhost:5173](http://localhost:5173) in your browser
- You should see the LLMings interface

### Check Ollama (if installed)
```bash
ollama list
# Should show installed models

curl http://localhost:11434/api/tags
# Should return JSON with model list
```

## Troubleshooting

### Backend Issues

**Problem**: `uvicorn: command not found`
```bash
cd backend
source venv/bin/activate  # Make sure venv is activated
pip install uvicorn
```

**Problem**: `ModuleNotFoundError: No module named 'app'`
```bash
# Make sure you're in the backend directory and venv is activated
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Problem**: Database errors
```bash
# Delete and recreate database
rm hivecouncil.db
# Restart the app - database will be created automatically
```

### Frontend Issues

**Problem**: `npm: command not found`
- Install Node.js from [nodejs.org](https://nodejs.org/)

**Problem**: Port 5173 already in use
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9
# Or use a different port
cd frontend
npm run dev -- --port 3000
```

**Problem**: Module not found errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Ollama Issues

**Problem**: Ollama not responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

**Problem**: Model not showing in UI after installation
- Switch between tabs in the UI (this triggers a provider refresh)
- Or close and reopen the Ollama Manager modal

**Problem**: "Insufficient RAM" warnings
- Use smaller models (phi3, qwen2:7b)
- Close other applications
- Consider quantized models (append `:q4_0` to model name)

### Permission Issues

**Problem**: `Permission denied` when running scripts
```bash
chmod +x scripts/setup.sh scripts/start.sh
```

**Problem**: Cannot install Python packages
```bash
# Upgrade pip
pip install --upgrade pip

# Install with user flag if needed
pip install --user -r requirements.txt
```

## Next Steps

After successful installation:

1. **Configure Providers**: Add API keys or install Ollama models
2. **Create Your First Council**:
   - Add council members
   - Assign personalities
   - Designate a Team Chair
3. **Ask Questions**: Start your first council session
4. **Save Templates**: Save council configurations for reuse

## Getting Help

- Check the [README.md](README.md) for usage documentation
- Look at [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Open an issue on [GitHub](https://github.com/FHult/HiveCouncil/issues)

## Uninstalling

To remove LLMings:

```bash
# Stop any running processes (Ctrl+C)

# Remove the directory
cd ..
rm -rf HiveCouncil

# Optional: Uninstall Ollama
# macOS/Linux: Remove /usr/local/bin/ollama and ~/.ollama
# Windows: Use Windows uninstaller
```
