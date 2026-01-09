import { useSessionStore } from '@/store/sessionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SessionDisplay() {
  const { currentSession, clearSession, isStreaming } = useSessionStore();

  if (!currentSession) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Session Created</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearSession}>
            New Session
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Prompt</h3>
            <p className="text-gray-900">{currentSession.prompt}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Chair</p>
              <p className="font-medium capitalize">{currentSession.chair_provider}</p>
            </div>
            <div>
              <p className="text-gray-500">Iterations</p>
              <p className="font-medium">{currentSession.total_iterations}</p>
            </div>
            <div>
              <p className="text-gray-500">Template</p>
              <p className="font-medium capitalize">{currentSession.merge_template}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium capitalize">{currentSession.status}</p>
            </div>
          </div>

          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <span className="animate-spin">⚙️</span>
              <span>Processing...</span>
            </div>
          )}

          {!isStreaming && currentSession.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                ℹ️ Session created successfully! Streaming responses will be implemented in Phase 4.
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>Session ID: {currentSession.id}</p>
            <p>Created: {new Date(currentSession.created_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
