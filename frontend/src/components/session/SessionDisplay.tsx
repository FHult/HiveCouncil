import { useSessionStore } from '@/store/sessionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SessionDisplay() {
  const {
    sessionId,
    status,
    currentIteration,
    totalIterations,
    statusMessage,
    totalCost,
    totalTokens,
    clearSession,
  } = useSessionStore();

  const isStreaming = status === 'running';

  if (!sessionId && status === 'idle') {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Session Info</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearSession}>
            New Session
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium capitalize">{status}</p>
            </div>
            <div>
              <p className="text-gray-500">Iteration</p>
              <p className="font-medium">{currentIteration} / {totalIterations}</p>
            </div>
            <div>
              <p className="text-gray-500">Tokens</p>
              <p className="font-medium">{(totalTokens.input + totalTokens.output).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Cost</p>
              <p className="font-medium">${totalCost.toFixed(4)}</p>
            </div>
          </div>

          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <span className="animate-spin">⚙️</span>
              <span>{statusMessage || 'Processing...'}</span>
            </div>
          )}

          {sessionId && (
            <div className="text-xs text-gray-500">
              <p>Session ID: {sessionId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
