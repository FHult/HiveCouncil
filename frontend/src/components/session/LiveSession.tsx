/**
 * LiveSession component - displays real-time streaming council session
 */
import React, { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { ResponseCard } from './ResponseCard';
import { Card } from '@/components/ui/card';

export const LiveSession: React.FC = () => {
  const {
    status,
    currentIteration,
    totalIterations,
    responses,
    mergedResponses,
    statusMessage,
    totalCost,
    totalTokens,
    error,
    isPaused,
    pauseSession,
    resumeSession,
    clearSession,
  } = useSessionStore();

  const [selectedIteration, setSelectedIteration] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-follow the current iteration as it progresses
  useEffect(() => {
    if (status === 'running') {
      setSelectedIteration(currentIteration);
    } else if (status === 'completed' && mergedResponses.length > 0) {
      // Auto-select final output tab when session completes
      const finalIteration = mergedResponses[mergedResponses.length - 1]?.iteration;
      if (finalIteration) {
        setSelectedIteration(finalIteration);
      }
    }
  }, [currentIteration, status, mergedResponses]);

  if (status === 'idle') {
    return null;
  }

  // Group responses by iteration
  const responsesByIteration = responses.reduce((acc, response) => {
    if (!acc[response.iteration]) {
      acc[response.iteration] = [];
    }
    acc[response.iteration].push(response);
    return acc;
  }, {} as Record<number, typeof responses>);

  // Available iterations (completed or in progress)
  const availableIterations = Array.from({ length: currentIteration }, (_, i) => i + 1);

  // Add "Final Output" tab if session is completed
  const showFinalOutputTab = status === 'completed' && mergedResponses.length > 0;
  const finalOutputIteration = mergedResponses[mergedResponses.length - 1]?.iteration;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Status Bar */}
      <Card className="p-4 bg-secondary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'running' && !isPaused && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Live Session</span>
              </div>
            )}
            {isPaused && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="font-medium text-orange-600">Session Paused</span>
              </div>
            )}
            {status === 'completed' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="font-medium">Session Complete</span>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="font-medium text-destructive">Session Error</span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              Iteration {currentIteration} of {totalIterations}
            </span>
            <div className="flex items-center gap-2">
              {status === 'running' && !isPaused && (
                <button
                  onClick={pauseSession}
                  className="px-3 py-1 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded transition-colors"
                  title="Pause session - can be resumed later"
                >
                  Pause
                </button>
              )}
              {isPaused && (
                <button
                  onClick={resumeSession}
                  className="px-3 py-1 text-sm bg-green-500 text-white hover:bg-green-600 rounded transition-colors"
                  title="Resume session from where it was paused"
                >
                  Resume
                </button>
              )}
              {(status === 'running' || status === 'completed' || status === 'error' || isPaused) && (
                <button
                  onClick={clearSession}
                  className="px-3 py-1 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded transition-colors border"
                >
                  Close Session
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <div className="text-muted-foreground">Tokens</div>
              <div className="font-mono font-semibold">
                {(totalTokens.input + totalTokens.output).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">Total Cost</div>
              <div className="font-mono font-semibold text-primary">
                ${totalCost.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            {status === 'running' && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
            {statusMessage}
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
            Error: {error}
          </div>
        )}
      </Card>

      {/* Iteration Tabs */}
      {availableIterations.length > 0 && (
        <Card className="p-0">
          {/* Tab Headers */}
          <div className="flex border-b bg-muted/50 overflow-x-auto">
            {availableIterations.map((iteration) => (
              <button
                key={iteration}
                onClick={() => setSelectedIteration(iteration)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  selectedIteration === iteration
                    ? 'border-primary text-primary bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Iteration {iteration}
                {iteration === currentIteration && status === 'running' && (
                  <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}

            {/* Final Output Tab */}
            {showFinalOutputTab && (
              <button
                key="final"
                onClick={() => setSelectedIteration(finalOutputIteration || currentIteration)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  selectedIteration === finalOutputIteration
                    ? 'border-green-500 text-green-600 bg-background font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                ✓ Final Output
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-6">
            {/* Show Final Output view if on final tab */}
            {showFinalOutputTab && selectedIteration === finalOutputIteration ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Final Consensus Output</h3>
                    <p className="text-sm text-muted-foreground">
                      Refined through {totalIterations} iteration{totalIterations > 1 ? 's' : ''} of council review
                    </p>
                  </div>
                </div>
                <ResponseCard
                  response={mergedResponses[mergedResponses.length - 1]}
                  isMerged
                />
              </div>
            ) : (
              <>
                {/* Initial responses or feedback for selected iteration */}
                {responsesByIteration[selectedIteration] && responsesByIteration[selectedIteration].length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {selectedIteration === 1 ? 'Council Responses' : 'Council Feedback'}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {responsesByIteration[selectedIteration].map((response) => (
                        <ResponseCard key={response.id} response={response} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Merged response for selected iteration */}
                {mergedResponses.find((r) => r.iteration === selectedIteration) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {selectedIteration === 1 ? 'Consensus Output' : `Revised Output (Iteration ${selectedIteration})`}
                    </h3>
                    <ResponseCard
                      response={mergedResponses.find((r) => r.iteration === selectedIteration)!}
                      isMerged
                    />
                  </div>
                )}

                {/* Show message if iteration has no content yet */}
                {!responsesByIteration[selectedIteration] && !mergedResponses.find((r) => r.iteration === selectedIteration) && (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p>Waiting for iteration {selectedIteration} responses...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};
