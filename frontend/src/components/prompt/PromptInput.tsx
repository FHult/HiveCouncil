import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useProvidersStore } from '@/store/providersStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from './FileUpload';
import CouncilMemberEditor from '@/components/CouncilMemberEditor';
import type { SessionConfig, Preset, FileAttachment, CouncilMember } from '@/types';

export function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [iterations, setIterations] = useState(3);
  const [preset, setPreset] = useState<Preset>('balanced');
  const [files, setFiles] = useState<FileAttachment[]>([]);

  const { startSession, status, error } = useSessionStore();
  const isStreaming = status === 'running';
  const { providers } = useProvidersStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    if (councilMembers.length === 0) {
      alert('Please add at least one council member');
      return;
    }

    const config: SessionConfig = {
      prompt: prompt.trim(),
      council_members: councilMembers,
      iterations,
      template: 'balanced', // Default template, chair personality drives synthesis
      preset,
      autopilot: true, // Always run all iterations automatically
      files: files.length > 0 ? files : undefined,
    };

    await startSession(config);

    // Clear files after submission
    if (files.length > 0) {
      setFiles([]);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Council Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask your question or describe what you'd like the AI council to discuss..."
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isStreaming}
              />
            </div>

            {/* File Upload */}
            <FileUpload files={files} onFilesChange={setFiles} disabled={isStreaming} />

            {/* Council Member Configuration */}
            <CouncilMemberEditor
              members={councilMembers}
              onMembersChange={setCouncilMembers}
              providers={Object.values(providers)}
            />

            {/* Main Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Iterations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Iterations
                </label>
                <select
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={isStreaming}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'iteration' : 'iterations'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preset */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preset
                </label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as Preset)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={isStreaming}
                >
                  <option value="creative">Creative (0.9 temp)</option>
                  <option value="balanced">Balanced (0.7 temp)</option>
                  <option value="precise">Precise (0.3 temp)</option>
                </select>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {councilMembers.length} council member{councilMembers.length !== 1 ? 's' : ''} configured
              </p>
              <Button type="submit" disabled={isStreaming || !prompt.trim()}>
                {isStreaming ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    Creating Session...
                  </>
                ) : (
                  'Start Council Session'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
