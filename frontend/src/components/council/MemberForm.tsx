/**
 * Form fields for editing a council member's details
 */
import type { CouncilMember, PersonalityArchetype, Provider } from '@/types';
import {
  getProviderDisplayName,
  getModelRAM,
  CHAIR_RECOMMENDED_ARCHETYPES,
  type ModelRAMInfo,
} from './utils/council-helpers';

interface MemberFormProps {
  member: CouncilMember;
  providers: Provider[];
  archetypes: PersonalityArchetype[];
  modelRAMInfo: ModelRAMInfo;
  onUpdate: (updates: Partial<CouncilMember>) => void;
  onSetChair: (isChair: boolean) => void;
  onArchetypeChange: (archetype: string) => void;
}

export function MemberForm({
  member,
  providers,
  archetypes,
  modelRAMInfo,
  onUpdate,
  onSetChair,
  onArchetypeChange,
}: MemberFormProps) {
  const archetypeInfo = archetypes.find((a) => a.id === member.archetype);
  const providerInfo = providers.find((p) => p.name === member.provider);

  const getRecommendedModelsForArchetype = (archetypeId: string): string[] => {
    const archetype = archetypes.find((a) => a.id === archetypeId);
    return archetype?.recommended_models || [];
  };

  return (
    <div className="member-details">
      {/* Role / Display Name */}
      <div className="form-group">
        <div className="role-header">
          <label htmlFor={`role-${member.id}`}>Role / Display Name</label>
          <label className={`chair-checkbox-label ${member.is_chair ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={member.is_chair}
              onChange={(e) => onSetChair(e.target.checked)}
            />
            <span className="chair-checkbox-text">
              <span className="chair-icon">★</span>
              Team Chair
            </span>
          </label>
        </div>
        <input
          id={`role-${member.id}`}
          type="text"
          value={member.role}
          onChange={(e) => onUpdate({ role: e.target.value })}
          placeholder="e.g., Technical Expert, Devil's Advocate"
          className="form-input"
        />
        {member.is_chair && (
          <div className="chair-recommendations">
            💡 Recommended personalities for Team Chair:{' '}
            {CHAIR_RECOMMENDED_ARCHETYPES.map((recId, idx, arr) => {
              const recArchetype = archetypes.find((a) => a.id === recId);
              return recArchetype ? (
                <span key={recId}>
                  <strong>
                    {recArchetype.emoji} {recArchetype.name}
                  </strong>
                  {idx < arr.length - 1 ? ', ' : ''}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Personality Archetype */}
      <div className="form-group">
        <label htmlFor={`archetype-${member.id}`}>
          Personality Archetype
          <span className="label-hint">Defines the member's perspective and role</span>
        </label>
        <select
          id={`archetype-${member.id}`}
          value={member.archetype}
          onChange={(e) => onArchetypeChange(e.target.value)}
          className="form-select"
        >
          {archetypes.map((archetype) => (
            <option key={archetype.id} value={archetype.id}>
              {archetype.emoji} {archetype.name}
            </option>
          ))}
        </select>
        {archetypeInfo && <div className="archetype-description">{archetypeInfo.description}</div>}
        {member.archetype && getRecommendedModelsForArchetype(member.archetype).length > 0 && (
          <div className="model-recommendations">
            💡 Recommended models for {archetypeInfo?.name || 'this personality'}:{' '}
            {getRecommendedModelsForArchetype(member.archetype).map((rec, idx, arr) => (
              <span key={rec}>
                <strong>{rec}</strong>
                {idx < arr.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Provider */}
      <div className="form-group">
        <label htmlFor={`provider-${member.id}`}>Provider</label>
        <select
          id={`provider-${member.id}`}
          value={member.provider}
          onChange={(e) => {
            const newProvider = providers.find((p) => p.name === e.target.value);
            onUpdate({
              provider: e.target.value,
              model: newProvider?.default_model || '',
            });
          }}
          className="form-select"
        >
          {providers
            .filter((p) => p.configured)
            .map((provider) => (
              <option key={provider.name} value={provider.name}>
                {getProviderDisplayName(provider.name)}
              </option>
            ))}
        </select>
      </div>

      {/* Model */}
      <div className="form-group">
        <label htmlFor={`model-${member.id}`}>Model</label>
        <select
          id={`model-${member.id}`}
          value={member.model}
          onChange={(e) => onUpdate({ model: e.target.value })}
          className="form-select"
        >
          {providerInfo?.available_models?.map((model: string) => {
            const modelRam = getModelRAM(member.provider, model, modelRAMInfo);
            return (
              <option key={model} value={model}>
                {model}
                {modelRam
                  ? ` (${modelRam.ram_required}GB RAM${!modelRam.can_run ? ' - May not fit' : ''})`
                  : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* Custom Personality */}
      <div className="form-group">
        <label htmlFor={`personality-${member.id}`}>
          Custom Personality
          <span className="label-hint">Optional: Add specific instructions or personality traits</span>
        </label>
        <textarea
          id={`personality-${member.id}`}
          value={member.custom_personality || ''}
          onChange={(e) => onUpdate({ custom_personality: e.target.value })}
          placeholder="e.g., Focus on cost-effectiveness, Be skeptical of new technologies, Prioritize user experience..."
          className="form-textarea"
          rows={3}
        />
      </div>
    </div>
  );
}
