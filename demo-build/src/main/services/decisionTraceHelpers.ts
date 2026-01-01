/**
 * Decision Trace Helper Utilities
 *
 * Convenience functions for creating decision traces with proper structure.
 * Simplifies trace emission from consolidation logic.
 *
 * Based on Decision Traces architecture in CLAUDE.local.md
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  DecisionTrace,
  DecisionKind,
  DecisionActor,
  DecisionEvidence,
  DecisionInput,
  SourceRecordRef,
} from '../../renderer/types/models/canonical';
import { decisionTraceService } from './decisionTraceService';

/**
 * Base options for creating a decision trace
 */
export interface CreateTraceOptions {
  profileId: string;
  kind: DecisionKind;
  actor: DecisionActor;
  action: string;
  summary: string;
  confidence: number;
  entityId?: string;
  relationId?: string;
  entityType?: 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE';
  before?: any;
  after?: any;
  evidence?: DecisionEvidence[];
  inputs?: DecisionInput[];
  policyId?: string;
  policyVersion?: string;
  policyRule?: string;
  precedentTraceIds?: string[];
  precedentNote?: string;
  exception?: {
    requestedBy?: string;
    approvedBy?: string;
    reason: string;
  };
}

/**
 * Create and persist a decision trace
 */
export async function createDecisionTrace(options: CreateTraceOptions): Promise<DecisionTrace> {
  const trace: DecisionTrace = {
    id: uuidv4(),
    profileId: options.profileId,
    occurredAt: new Date().toISOString(),
    actor: options.actor,
    kind: options.kind,
    subject: {
      entityId: options.entityId,
      relationId: options.relationId,
      entityType: options.entityType,
    },
    inputs: options.inputs || [],
    policy: options.policyId
      ? {
          policyId: options.policyId,
          policyVersion: options.policyVersion || '1.0',
          rule: options.policyRule,
        }
      : undefined,
    precedent:
      options.precedentTraceIds && options.precedentTraceIds.length > 0
        ? {
            traceIds: options.precedentTraceIds,
            note: options.precedentNote,
          }
        : undefined,
    decision: {
      action: options.action,
      before: options.before,
      after: options.after,
    },
    rationale: {
      summary: options.summary,
      evidence: options.evidence || [],
      confidence: options.confidence,
      exception: options.exception,
    },
    outcomes: {
      entityVersionBumps: options.entityId ? [options.entityId] : [],
      relationVersionBumps: options.relationId ? [options.relationId] : [],
    },
  };

  await decisionTraceService.appendTrace(trace);
  return trace;
}

/**
 * Create a CONSOLIDATION_RUN trace
 */
export async function traceConsolidationRun(
  profileId: string,
  inputFiles: Array<{ file: string; hash: string; recordCount: number }>,
  summary: {
    entitiesCreated: number;
    entitiesMerged: number;
    relationshipsInferred: number;
    conflictsDetected: number;
    processingTimeMs: number;
  }
): Promise<DecisionTrace> {
  return createDecisionTrace({
    profileId,
    kind: 'CONSOLIDATION_RUN',
    actor: { type: 'SYSTEM', id: 'consolidation-engine', displayName: 'Consolidation Engine' },
    action: 'CONSOLIDATE',
    summary: `Consolidated ${inputFiles.length} input files: ${summary.entitiesCreated} entities created, ${summary.entitiesMerged} merged, ${summary.relationshipsInferred} relationships inferred`,
    confidence: 1.0,
    inputs: inputFiles.map((f) => ({
      system: 'LOCAL',
      ref: { file: f.file },
      snapshotHash: f.hash,
    })),
    before: { inputFiles: inputFiles.length, entities: 0, relations: 0 },
    after: {
      entities: summary.entitiesCreated,
      merged: summary.entitiesMerged,
      relations: summary.relationshipsInferred,
      conflicts: summary.conflictsDetected,
      processingTimeMs: summary.processingTimeMs,
    },
  });
}

/**
 * Create an IDENTITY_MATCH trace
 */
export async function traceIdentityMatch(
  profileId: string,
  entityId: string,
  entityType: 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE',
  matchedSources: Array<{ system: string; externalId: string; recordRef: SourceRecordRef }>,
  evidence: DecisionEvidence[],
  confidence: number
): Promise<DecisionTrace> {
  return createDecisionTrace({
    profileId,
    kind: 'IDENTITY_MATCH',
    actor: { type: 'SYSTEM', id: 'identity-resolver', displayName: 'Identity Resolution Engine' },
    action: 'MATCH',
    summary: `Matched ${matchedSources.length} identity sources with confidence ${(confidence * 100).toFixed(0)}%`,
    confidence,
    entityId,
    entityType,
    evidence,
    inputs: matchedSources.map((s) => ({
      system: s.system,
      ref: {
        file: s.recordRef.file,
        rowId: s.recordRef.rowId,
        externalId: s.externalId,
      },
      snapshotHash: s.recordRef.hash,
    })),
    before: { identitySources: matchedSources.map((s) => s.system) },
    after: { canonicalEntityId: entityId, confidence },
  });
}

/**
 * Create an ENTITY_MERGE trace
 */
export async function traceEntityMerge(
  profileId: string,
  primaryEntityId: string,
  mergedEntityIds: string[],
  entityType: 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE',
  actor: DecisionActor,
  rationale: string,
  confidence: number
): Promise<DecisionTrace> {
  return createDecisionTrace({
    profileId,
    kind: 'ENTITY_MERGE',
    actor,
    action: 'MERGE',
    summary: rationale,
    confidence,
    entityId: primaryEntityId,
    entityType,
    before: { separateEntities: mergedEntityIds },
    after: { mergedIntoEntity: primaryEntityId },
    evidence: [
      {
        type: 'FIELD_MATCH',
        detail: `Merged ${mergedEntityIds.length} duplicate entities into canonical entity ${primaryEntityId}`,
        weight: 1.0,
      },
    ],
  });
}

/**
 * Create a RELATIONSHIP_INFERRED trace
 */
export async function traceRelationshipInferred(
  profileId: string,
  relationId: string,
  fromEntityId: string,
  toEntityId: string,
  relationType: string,
  evidence: DecisionEvidence[],
  confidence: number,
  sources: SourceRecordRef[]
): Promise<DecisionTrace> {
  return createDecisionTrace({
    profileId,
    kind: 'RELATIONSHIP_INFERRED',
    actor: { type: 'SYSTEM', id: 'relationship-engine', displayName: 'Relationship Inference Engine' },
    action: 'INFER_RELATIONSHIP',
    summary: `Inferred ${relationType} relationship between entities with confidence ${(confidence * 100).toFixed(0)}%`,
    confidence,
    relationId,
    evidence,
    inputs: sources.map((s) => ({
      system: 'LOCAL',
      ref: {
        file: s.file,
        rowId: s.rowId,
      },
      snapshotHash: s.hash,
    })),
    before: { fromEntity: fromEntityId, toEntity: toEntityId, relationship: null },
    after: { relationId, type: relationType, inferred: true },
  });
}

/**
 * Create a RELATIONSHIP_OVERRIDDEN trace
 */
export async function traceRelationshipOverridden(
  profileId: string,
  originalRelationId: string,
  newRelationId: string,
  actor: DecisionActor,
  reason: string
): Promise<DecisionTrace> {
  return createDecisionTrace({
    profileId,
    kind: 'RELATIONSHIP_OVERRIDDEN',
    actor,
    action: 'OVERRIDE_RELATIONSHIP',
    summary: `Human override: ${reason}`,
    confidence: 1.0,
    relationId: newRelationId,
    before: { relationId: originalRelationId, inferred: true },
    after: { relationId: newRelationId, inferred: false, supersedes: originalRelationId },
    evidence: [
      {
        type: 'HEURISTIC',
        detail: reason,
        weight: 1.0,
      },
    ],
  });
}

/**
 * Create a MIGRATION_WAVE_ASSIGNED trace
 */
export async function traceMigrationWaveAssigned(
  profileId: string,
  entityId: string,
  entityType: 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE',
  wave: number,
  actor: DecisionActor,
  rationale: string,
  dependencies?: string[],
  policyId?: string,
  exception?: { requestedBy?: string; approvedBy?: string; reason: string }
): Promise<DecisionTrace> {
  const evidence: DecisionEvidence[] = [
    {
      type: 'HEURISTIC',
      detail: rationale,
      weight: 1.0,
    },
  ];

  if (dependencies && dependencies.length > 0) {
    evidence.push({
      type: 'ACCESS',
      detail: `Dependencies detected: ${dependencies.join(', ')}`,
      weight: 0.8,
    });
  }

  return createDecisionTrace({
    profileId,
    kind: 'MIGRATION_WAVE_ASSIGNED',
    actor,
    action: 'ASSIGN_WAVE',
    summary: `Assigned to Wave ${wave}: ${rationale}`,
    confidence: exception ? 0.7 : 1.0,
    entityId,
    entityType,
    evidence,
    policyId,
    policyVersion: '1.0',
    before: { wave: null },
    after: { wave, dependencies },
    exception,
  });
}

/**
 * Create a DISPOSITION_SET trace
 */
export async function traceDispositionSet(
  profileId: string,
  entityId: string,
  entityType: 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE',
  disposition: 'RETAIN' | 'RETIRE' | 'REHOST' | 'REPLATFORM' | 'REFACTOR' | 'REPLACE',
  actor: DecisionActor,
  rationale: string,
  confidence: number
): Promise<DecisionTrace> {
  return createDecisionTrace({
    profileId,
    kind: 'DISPOSITION_SET',
    actor,
    action: 'SET_DISPOSITION',
    summary: `Set disposition to ${disposition}: ${rationale}`,
    confidence,
    entityId,
    entityType,
    evidence: [
      {
        type: 'HEURISTIC',
        detail: rationale,
        weight: 1.0,
      },
    ],
    before: { disposition: null },
    after: { disposition },
  });
}

/**
 * Create a CLASSIFICATION_CHANGED trace
 */
export async function traceClassificationChanged(
  profileId: string,
  entityId: string,
  entityType: 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE',
  oldClassification: string,
  newClassification: string,
  actor: DecisionActor,
  reason: string
): Promise<DecisionTrace> {
  return createDecisionTrace({
    profileId,
    kind: 'CLASSIFICATION_CHANGED',
    actor,
    action: 'RECLASSIFY',
    summary: `Changed classification from ${oldClassification} to ${newClassification}: ${reason}`,
    confidence: 1.0,
    entityId,
    entityType,
    evidence: [
      {
        type: 'HEURISTIC',
        detail: reason,
        weight: 1.0,
      },
    ],
    before: { classification: oldClassification },
    after: { classification: newClassification },
  });
}

/**
 * Create an EXCEPTION_GRANTED trace
 */
export async function traceExceptionGranted(
  profileId: string,
  entityId: string,
  entityType: 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE',
  policyId: string,
  requestedBy: string,
  approvedBy: string,
  reason: string
): Promise<DecisionTrace> {
  return createDecisionTrace({
    profileId,
    kind: 'EXCEPTION_GRANTED',
    actor: { type: 'HUMAN', id: approvedBy, displayName: approvedBy },
    action: 'GRANT_EXCEPTION',
    summary: `Exception granted to policy ${policyId}: ${reason}`,
    confidence: 1.0,
    entityId,
    entityType,
    policyId,
    policyVersion: '1.0',
    exception: {
      requestedBy,
      approvedBy,
      reason,
    },
    evidence: [
      {
        type: 'HEURISTIC',
        detail: reason,
        weight: 1.0,
      },
    ],
  });
}

/**
 * Helper to create evidence from field matches
 */
export function createFieldMatchEvidence(
  field: string,
  value1: any,
  value2: any,
  source1: string,
  source2: string,
  weight: number = 0.8
): DecisionEvidence {
  return {
    type: 'FIELD_MATCH',
    detail: `Field '${field}' matches: ${source1}='${value1}' ≈ ${source2}='${value2}'`,
    weight,
  };
}

/**
 * Helper to create evidence from membership
 */
export function createMembershipEvidence(groupName: string, members: string[], weight: number = 0.7): DecisionEvidence {
  return {
    type: 'MEMBERSHIP',
    detail: `Group '${groupName}' has ${members.length} members: ${members.slice(0, 3).join(', ')}${members.length > 3 ? '...' : ''}`,
    weight,
  };
}

/**
 * Helper to create evidence from ownership
 */
export function createOwnershipEvidence(ownerField: string, ownerValue: string, weight: number = 0.9): DecisionEvidence {
  return {
    type: 'OWNER',
    detail: `${ownerField} indicates ownership: '${ownerValue}'`,
    weight,
  };
}

/**
 * Helper to create evidence from access patterns
 */
export function createAccessEvidence(accessType: string, detail: string, weight: number = 0.6): DecisionEvidence {
  return {
    type: 'ACCESS',
    detail: `${accessType}: ${detail}`,
    weight,
  };
}


