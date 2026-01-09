import { useState } from 'react'

function App() {
  const [status, setStatus] = useState<string>('Checking...')

  // Test backend connection
  const testBackend = async () => {
    try {
      const response = await fetch('/api/sessions/test')
      const data = await response.json()
      setStatus(`✓ Connected: ${data.message}`)
    } catch (error) {
      setStatus(`✗ Backend not running. Please start the backend server.`)
    }
  }

  // Test on mount
  useState(() => {
    testBackend()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            HiveCouncil
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Multi-AI Council with Consensus Building
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Backend Status
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {status}
            </p>
            <button
              onClick={testBackend}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Test Connection
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Setup Instructions
            </h2>
            <div className="text-left space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  1. Setup Environment Variables
                </h3>
                <p>Copy .env.example to .env and add your API keys</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  2. Install Backend Dependencies
                </h3>
                <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded mt-2">
                  cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
                </code>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  3. Start Backend Server
                </h3>
                <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded mt-2">
                  cd backend && source venv/bin/activate && uvicorn app.main:app --reload
                </code>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  4. Frontend is Running
                </h3>
                <p>This frontend is already running on port 5173</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>Phase 1: Foundation - Core Loop Implementation</p>
            <p className="mt-2">
              Full UI and features coming in subsequent phases
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
