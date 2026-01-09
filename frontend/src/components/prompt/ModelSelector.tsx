import { useEffect } from 'react';
import { useProvidersStore } from '@/store/providersStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ModelSelector() {
  const { providers, selectedModels, isLoading, loadProviders, setModelForProvider, resetToDefaults } = useProvidersStore();

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading providers...</p>
      </div>
    );
  }

  const configuredProviders = Object.entries(providers).filter(
    ([_, provider]) => provider.configured
  );

  if (configuredProviders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-600">
            No AI providers configured. Please add API keys to your .env file.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Model Selection</CardTitle>
        <Button variant="ghost" size="sm" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {configuredProviders.map(([name, provider]) => (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium capitalize flex items-center gap-2">
              <span className="text-gray-700">{name}</span>
              <span className="text-xs text-gray-500">
                ({provider.available_models.length} models)
              </span>
            </label>
            <select
              value={selectedModels[name] || provider.default_model}
              onChange={(e) => setModelForProvider(name, e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {provider.available_models.map((model) => (
                <option key={model} value={model}>
                  {model}
                  {model === provider.default_model && ' (default)'}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="pt-2 text-xs text-gray-500">
          <p>💡 Tip: Use cheaper models like gpt-4o-mini or gemini-1.5-flash to save costs</p>
        </div>
      </CardContent>
    </Card>
  );
}
