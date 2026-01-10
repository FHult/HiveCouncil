/**
 * ResponseCard component for displaying individual AI responses
 */
import React from 'react';
import { Card } from '@/components/ui/card';
import type { CouncilResponse } from '@/types';
import ReactMarkdown from 'react-markdown';

interface ResponseCardProps {
  response: CouncilResponse;
  isMerged?: boolean;
}

const providerColors: Record<string, string> = {
  openai: 'bg-green-100 text-green-800 border-green-300',
  anthropic: 'bg-purple-100 text-purple-800 border-purple-300',
  google: 'bg-blue-100 text-blue-800 border-blue-300',
  grok: 'bg-orange-100 text-orange-800 border-orange-300',
};

const providerNames: Record<string, string> = {
  openai: 'ChatGPT',
  anthropic: 'Claude',
  google: 'Gemini',
  grok: 'Grok',
};

export const ResponseCard: React.FC<ResponseCardProps> = ({ response, isMerged = false }) => {
  const colorClass = providerColors[response.provider] || 'bg-gray-100 text-gray-800 border-gray-300';
  const displayName = providerNames[response.provider] || response.provider;

  return (
    <Card className={`p-4 ${isMerged ? 'border-2 border-primary bg-primary/5' : 'border'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
            {displayName}
          </span>
          {isMerged && (
            <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold">
              MERGED CONSENSUS
            </span>
          )}
          {response.type === 'feedback' && (
            <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
              Feedback
            </span>
          )}
        </div>
        <div className="flex flex-col items-end text-xs text-muted-foreground">
          <div>
            {response.tokens.input.toLocaleString()} in / {response.tokens.output.toLocaleString()} out
          </div>
          <div className="font-semibold">${response.cost.toFixed(4)}</div>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{response.content}</ReactMarkdown>
      </div>
    </Card>
  );
};
