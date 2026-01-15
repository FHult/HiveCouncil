/**
 * Card component for displaying a council member with collapsible details
 */
import type { CouncilMember, PersonalityArchetype, Provider } from '@/types';
import { MemberForm } from './MemberForm';
import {
  getProviderDisplayName,
  getModelRAM,
  type ModelRAMInfo,
} from './utils/council-helpers';

interface MemberCardProps {
  member: CouncilMember;
  isExpanded: boolean;
  isLastMember: boolean;
  providers: Provider[];
  archetypes: PersonalityArchetype[];
  modelRAMInfo: ModelRAMInfo;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<CouncilMember>) => void;
  onSetChair: (isChair: boolean) => void;
  onArchetypeChange: (archetype: string) => void;
}

export function MemberCard({
  member,
  isExpanded,
  isLastMember,
  providers,
  archetypes,
  modelRAMInfo,
  onToggleExpand,
  onRemove,
  onUpdate,
  onSetChair,
  onArchetypeChange,
}: MemberCardProps) {
  const archetypeInfo = archetypes.find((a) => a.id === member.archetype);
  const ramInfo = getModelRAM(member.provider, member.model, modelRAMInfo);

  return (
    <div
      className={`member-card ${member.is_chair ? 'chair' : ''} ${isExpanded ? 'expanded' : ''}`}
    >
      <div className="member-header" onClick={onToggleExpand}>
        <div className="expand-indicator">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path d="M6 4l4 4-4 4V4z" />
          </svg>
        </div>
        <div className="member-summary">
          <div className="member-icon">{archetypeInfo?.emoji || '👤'}</div>
          <div className="member-info">
            <div className="member-title">
              <strong>{member.role}</strong>
              {member.is_chair && <span className="chair-badge">★ Chair</span>}
            </div>
            <div className="member-subtitle">
              {archetypeInfo?.name || 'Balanced'} • {getProviderDisplayName(member.provider)} •{' '}
              {member.model}
              {ramInfo && (
                <span className={`ram-badge ${ramInfo.can_run ? 'ram-ok' : 'ram-warning'}`}>
                  🧠 {ramInfo.ram_required}GB
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="member-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onRemove}
            className="btn-icon btn-remove"
            title="Remove member"
            disabled={isLastMember}
          >
            ×
          </button>
        </div>
      </div>

      {isExpanded && (
        <MemberForm
          member={member}
          providers={providers}
          archetypes={archetypes}
          modelRAMInfo={modelRAMInfo}
          onUpdate={onUpdate}
          onSetChair={onSetChair}
          onArchetypeChange={onArchetypeChange}
        />
      )}
    </div>
  );
}
