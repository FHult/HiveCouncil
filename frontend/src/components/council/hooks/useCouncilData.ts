/**
 * Hook for fetching council-related data (archetypes, RAM info, templates)
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_URLS } from '@/lib/config';
import type { PersonalityArchetype } from '@/types';
import type { ModelRAMInfo } from '../utils/council-helpers';

interface ModelData {
  name: string;
  ram_required: number;
  can_run: boolean;
}

export interface CouncilTemplate {
  id: string;
  name: string;
  description?: string;
  members: import('@/types').CouncilMember[];
  created_at?: string;
  updated_at?: string;
}

interface UseCouncilDataReturn {
  archetypes: PersonalityArchetype[];
  modelRAMInfo: ModelRAMInfo;
  templates: CouncilTemplate[];
  fetchTemplates: () => Promise<void>;
  saveTemplate: (name: string, description: string, members: import('@/types').CouncilMember[]) => Promise<boolean>;
  deleteTemplate: (templateId: string, templateName: string) => Promise<boolean>;
}

export function useCouncilData(): UseCouncilDataReturn {
  const [archetypes, setArchetypes] = useState<PersonalityArchetype[]>([]);
  const [modelRAMInfo, setModelRAMInfo] = useState<ModelRAMInfo>({});
  const [templates, setTemplates] = useState<CouncilTemplate[]>([]);

  const fetchArchetypes = async () => {
    try {
      const response = await fetch(API_URLS.archetypes);
      const data = await response.json();
      setArchetypes(data.archetypes || []);
    } catch {
      toast.error('Failed to load personality archetypes');
    }
  };

  const fetchRAMInfo = async () => {
    try {
      const response = await fetch(API_URLS.systemRamStatus);
      if (response.ok) {
        const data = await response.json();
        // Build a map of model name -> RAM info using all_models (not just recommended)
        const ramMap: ModelRAMInfo = {};
        data.all_models?.forEach((model: ModelData) => {
          ramMap[model.name] = {
            ram_required: model.ram_required,
            can_run: model.can_run,
          };
        });
        setModelRAMInfo(ramMap);
      }
    } catch {
      // Silently fail - RAM info is optional
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(API_URLS.templates);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch {
      // Silently fail - templates are optional
    }
  };

  const saveTemplate = async (
    name: string,
    description: string,
    members: import('@/types').CouncilMember[]
  ): Promise<boolean> => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return false;
    }

    if (members.length === 0) {
      toast.error('Cannot save empty council');
      return false;
    }

    try {
      const response = await fetch(API_URLS.templates, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          members: members,
        }),
      });

      if (response.ok) {
        await fetchTemplates();
        toast.success('Template saved successfully!');
        return true;
      }
      return false;
    } catch {
      toast.error('Failed to save template');
      return false;
    }
  };

  const deleteTemplate = async (templateId: string, templateName: string): Promise<boolean> => {
    if (!confirm(`Delete template "${templateName}"?`)) {
      return false;
    }

    try {
      const response = await fetch(`${API_URLS.templates}/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTemplates();
        toast.success('Template deleted');
        return true;
      }
      return false;
    } catch {
      toast.error('Failed to delete template');
      return false;
    }
  };

  useEffect(() => {
    fetchArchetypes();
    fetchRAMInfo();
    fetchTemplates();
  }, []);

  return {
    archetypes,
    modelRAMInfo,
    templates,
    fetchTemplates,
    saveTemplate,
    deleteTemplate,
  };
}
