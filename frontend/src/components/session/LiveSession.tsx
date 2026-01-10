/**
 * LiveSession component - displays real-time streaming council session
 */
import React, { useEffect, useRef } from 'react';
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
  } = useSessionStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new responses arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses.length, mergedResponses.length]);

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Status Bar */}
      <Card className="p-4 bg-secondary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'running' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Live Session</span>
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

      {/* Responses organized by iteration */}
      {Array.from({ length: currentIteration }, (_, i) => i + 1).map((iteration) => (
        <div key={iteration} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-lg font-semibold">Iteration {iteration}</h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Initial responses or feedback for this iteration */}
          {responsesByIteration[iteration] && responsesByIteration[iteration].length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {iteration === 1 ? 'Council Responses' : 'Council Feedback'}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {responsesByIteration[iteration].map((response) => (
                  <ResponseCard key={response.id} response={response} />
                ))}
              </div>
            </div>
          )}

          {/* Merged response for this iteration */}
          {mergedResponses.find((r) => r.iteration === iteration) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Chair's Merged Consensus
              </h3>
              <ResponseCard
                response={mergedResponses.find((r) => r.iteration === iteration)!}
                isMerged
              />
            </div>
          )}
        </div>
      ))}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};
