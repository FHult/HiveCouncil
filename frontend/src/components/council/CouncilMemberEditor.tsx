/**
 * Council Member Editor - Main component for managing council members
 *
 * This component orchestrates the council member editing experience,
 * delegating to sub-components for individual cards, forms, and dialogs.
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { CouncilMember, Provider } from '@/types';
import { MemberCard } from './MemberCard';
import { SaveTemplateDialog, LoadTemplateDialog } from './TemplateDialog';
import { useCouncilData, type CouncilTemplate } from './hooks/useCouncilData';
import { generateMemberId } from './utils/council-helpers';
import './styles/council-editor.css';

interface CouncilMemberEditorProps {
  members: CouncilMember[];
  onMembersChange: (members: CouncilMember[]) => void;
  providers: Provider[];
}

export default function CouncilMemberEditor({
  members,
  onMembersChange,
  providers,
}: CouncilMemberEditorProps) {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const { archetypes, modelRAMInfo, templates, saveTemplate, deleteTemplate } = useCouncilData();

  // Add a default chair member when initialized with empty members
  const addDefaultChair = useCallback(() => {
    const configuredProvider = providers.find((p) => p.configured);
    if (!configuredProvider) return;

    const chairMember: CouncilMember = {
      id: generateMemberId(),
      provider: configuredProvider.name,
      model: configuredProvider.default_model,
      role: 'Chair',
      archetype: 'balanced',
      is_chair: true,
    };

    onMembersChange([chairMember]);
    setExpandedMember(chairMember.id);
  }, [providers, onMembersChange]);

  useEffect(() => {
    // Initialize with one default chair member if empty and providers are loaded
    if (members.length === 0 && providers.length > 0 && providers.some((p) => p.configured)) {
      addDefaultChair();
    }
  }, [providers, members.length, addDefaultChair]);

  const addMember = () => {
    const configuredProvider = providers.find((p) => p.configured);
    if (!configuredProvider) return;

    const memberNumber = members.length + 1;
    const defaultRole = `Member ${memberNumber}`;

    const newMember: CouncilMember = {
      id: generateMemberId(),
      provider: configuredProvider.name,
      model: configuredProvider.default_model,
      role: defaultRole,
      archetype: 'balanced',
      is_chair: false,
    };

    onMembersChange([...members, newMember]);
    setExpandedMember(newMember.id);
  };

  const removeMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (member?.is_chair && members.length > 1) {
      // If removing chair, assign to first remaining member
      const updatedMembers = members.filter((m) => m.id !== id);
      updatedMembers[0].is_chair = true;
      onMembersChange(updatedMembers);
    } else {
      onMembersChange(members.filter((m) => m.id !== id));
    }
  };

  const updateMember = (id: string, updates: Partial<CouncilMember>) => {
    onMembersChange(members.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const updateMemberArchetype = (id: string, newArchetype: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    // Get recommended models for this archetype
    const archetype = archetypes.find((a) => a.id === newArchetype);
    const recommendedModels = archetype?.recommended_models || [];

    // Auto-select first recommended model if using Ollama and a recommended model is available
    let modelUpdate = {};
    if (member.provider === 'ollama' && recommendedModels.length > 0) {
      const providerInfo = providers.find((p) => p.name === member.provider);
      const availableModels = providerInfo?.available_models || [];

      // Find first recommended model that's actually available
      const preferredModel = recommendedModels.find((rec: string) =>
        availableModels.some((avail) => avail.includes(rec) || rec.includes(avail))
      );

      if (preferredModel) {
        const exactMatch = availableModels.find((avail) => avail.includes(preferredModel));
        if (exactMatch) {
          modelUpdate = { model: exactMatch };
        }
      }
    }

    updateMember(id, { archetype: newArchetype, ...modelUpdate });
  };

  const setChair = (id: string, isChair: boolean) => {
    onMembersChange(
      members.map((m) => {
        if (m.id === id) {
          const newRole = isChair
            ? 'Chair'
            : `Council Member ${members.filter((x) => !x.is_chair).length}`;
          return { ...m, is_chair: isChair, role: newRole };
        }
        // Unset chair for other members if setting this one as chair
        return { ...m, is_chair: isChair ? false : m.is_chair };
      })
    );
  };

  const handleSaveTemplate = async (name: string, description: string): Promise<boolean> => {
    return await saveTemplate(name, description, members);
  };

  const handleLoadTemplate = (template: CouncilTemplate) => {
    onMembersChange(template.members);
    setShowLoadDialog(false);
    toast.success(`Loaded template: ${template.name}`);
  };

  return (
    <div className="council-member-editor">
      <div className="editor-header">
        <h3>Council Members</h3>
        <div className="template-buttons">
          <button
            type="button"
            onClick={() => setShowLoadDialog(true)}
            className="btn-template"
            disabled={templates.length === 0}
          >
            📁 Load Team
          </button>
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            className="btn-template"
            disabled={members.length === 0}
          >
            💾 Save Team
          </button>
        </div>
      </div>

      <div className="members-list">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isExpanded={expandedMember === member.id}
            isLastMember={members.length === 1}
            providers={providers}
            archetypes={archetypes}
            modelRAMInfo={modelRAMInfo}
            onToggleExpand={() =>
              setExpandedMember(expandedMember === member.id ? null : member.id)
            }
            onRemove={() => removeMember(member.id)}
            onUpdate={(updates) => updateMember(member.id, updates)}
            onSetChair={(isChair) => setChair(member.id, isChair)}
            onArchetypeChange={(archetype) => updateMemberArchetype(member.id, archetype)}
          />
        ))}
      </div>

      {members.length === 0 && (
        <div className="empty-state">
          <p>No council members yet. Add your first member to get started!</p>
        </div>
      )}

      <button
        type="button"
        onClick={addMember}
        className="btn-add-member"
        disabled={!providers.some((p) => p.configured)}
      >
        + Add Member
      </button>

      <SaveTemplateDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveTemplate}
      />

      <LoadTemplateDialog
        isOpen={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        templates={templates}
        onLoad={handleLoadTemplate}
        onDelete={deleteTemplate}
      />
    </div>
  );
}
