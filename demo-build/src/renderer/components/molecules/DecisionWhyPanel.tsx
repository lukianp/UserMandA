/**
 * Decision "Why?" Panel Component
 *
 * Displays decision trace timeline for an entity, showing:
 * - Who made decisions (human/agent/system)
 * - What changed (before/after)
 * - Why (rationale, evidence, confidence)
 * - When (timestamp)
 * - What sources (provenance, record refs)
 *
 * Based on Decision Traces architecture in CLAUDE.local.md
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  LinearProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  SmartToy as RobotIcon,
  Computer as SystemIcon,
  Merge as MergeIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import type {
  DecisionTrace,
  DecisionKind,
  DecisionEvidence,
} from '../../types/models/canonical';

/**
 * Props for DecisionWhyPanel
 */
export interface DecisionWhyPanelProps {
  /**
   * Entity ID to show decision traces for
   */
  entityId: string;

  /**
   * Profile/tenant context
   */
  profileId: string;

  /**
   * Optional: Pre-loaded traces (if not provided, will fetch via IPC)
   */
  traces?: DecisionTrace[];

  /**
   * Optional: Show loading state
   */
  loading?: boolean;

  /**
   * Optional: Error message
   */
  error?: string;
}

/**
 * Decision "Why?" Panel Component
 */
export const DecisionWhyPanel: React.FC<DecisionWhyPanelProps> = ({
  entityId,
  profileId,
  traces: providedTraces,
  loading: providedLoading,
  error: providedError,
}) => {
  const [traces, setTraces] = useState<DecisionTrace[]>(providedTraces || []);
  const [loading, setLoading] = useState(providedLoading || false);
  const [error, setError] = useState<string | null>(providedError || null);
  const [filterKind, setFilterKind] = useState<'all' | 'inferred' | 'manual'>('all');

  /**
   * Fetch traces via IPC if not provided
   */
  useEffect(() => {
    if (providedTraces) {
      setTraces(providedTraces);
      return;
    }

    const fetchTraces = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await window.electronAPI.invoke('decision-trace:query', {
          profileId,
          entityId,
        });

        if (result.success) {
          setTraces(result.data || []);
        } else {
          setError(result.error || 'Failed to load decision traces');
        }
      } catch (err) {
        console.error('[DecisionWhyPanel] Error fetching traces:', err);
        setError(err instanceof Error ? err.message : 'Failed to load decision traces');
      } finally {
        setLoading(false);
      }
    };

    fetchTraces();
  }, [entityId, profileId, providedTraces]);

  /**
   * Filter traces by kind
   */
  const filteredTraces = useMemo(() => {
    if (filterKind === 'all') return traces;

    if (filterKind === 'inferred') {
      return traces.filter(
        (t) =>
          t.kind === 'IDENTITY_MATCH' ||
          t.kind === 'RELATIONSHIP_INFERRED' ||
          t.kind === 'CONSOLIDATION_RUN'
      );
    }

    if (filterKind === 'manual') {
      return traces.filter(
        (t) =>
          t.kind === 'ENTITY_MERGE' ||
          t.kind === 'RELATIONSHIP_OVERRIDDEN' ||
          t.kind === 'CLASSIFICATION_CHANGED' ||
          t.kind === 'MIGRATION_WAVE_ASSIGNED' ||
          t.kind === 'DISPOSITION_SET' ||
          t.kind === 'EXCEPTION_GRANTED'
      );
    }

    return traces;
  }, [traces, filterKind]);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Decision Timeline
        </Typography>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading decision traces...
        </Typography>
      </Box>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Decision Timeline
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  /**
   * Render empty state
   */
  if (traces.length === 0) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Decision Timeline
        </Typography>
        <Alert severity="info">No decision traces found for this entity.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Decision Timeline</Typography>

        <ToggleButtonGroup
          value={filterKind}
          exclusive
          onChange={(_, value) => value && setFilterKind(value)}
          size="small"
        >
          <ToggleButton value="all">All ({traces.length})</ToggleButton>
          <ToggleButton value="inferred">
            Inferred ({traces.filter((t) => t.actor.type === 'SYSTEM' || t.actor.type === 'AGENT').length})
          </ToggleButton>
          <ToggleButton value="manual">
            Manual ({traces.filter((t) => t.actor.type === 'HUMAN').length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Timeline position="right">
        {filteredTraces.map((trace, index) => (
          <DecisionTraceItem
            key={trace.id}
            trace={trace}
            isLast={index === filteredTraces.length - 1}
          />
        ))}
      </Timeline>

      {filteredTraces.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No traces match the selected filter.
        </Alert>
      )}
    </Box>
  );
};

/**
 * Individual Decision Trace Item
 */
interface DecisionTraceItemProps {
  trace: DecisionTrace;
  isLast: boolean;
}

const DecisionTraceItem: React.FC<DecisionTraceItemProps> = ({ trace, isLast }) => {
  const actorIcon = getActorIcon(trace.actor.type);
  const kindIcon = getKindIcon(trace.kind);
  const confidenceColor = getConfidenceColor(trace.rationale.confidence);

  return (
    <TimelineItem>
      <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
        <Typography variant="caption" display="block">
          {new Date(trace.occurredAt).toLocaleString()}
        </Typography>
        <Tooltip title={`Confidence: ${(trace.rationale.confidence * 100).toFixed(0)}%`}>
          <Chip
            label={`${(trace.rationale.confidence * 100).toFixed(0)}%`}
            size="small"
            color={confidenceColor}
            sx={{ mt: 0.5 }}
          />
        </Tooltip>
      </TimelineOppositeContent>

      <TimelineSeparator>
        <TimelineDot color="primary" variant="outlined">
          {actorIcon}
        </TimelineDot>
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            {kindIcon}
            <Typography variant="subtitle2">{formatDecisionKind(trace.kind)}</Typography>
            <Chip
              label={trace.actor.type}
              size="small"
              variant="outlined"
              icon={actorIcon}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {trace.rationale.summary}
          </Typography>

          <Accordion elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="caption">Show Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {/* Evidence */}
                {trace.rationale.evidence.length > 0 && (
                  <Box>
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      Evidence ({trace.rationale.evidence.length})
                    </Typography>
                    <Stack spacing={0.5}>
                      {trace.rationale.evidence.map((evidence, idx) => (
                        <EvidenceChip key={idx} evidence={evidence} />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Inputs */}
                {trace.inputs.length > 0 && (
                  <Box>
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      Source Inputs ({trace.inputs.length})
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          {trace.inputs.map((input, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Chip label={input.system} size="small" />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                  {input.ref.file || input.ref.externalId || 'N/A'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Before/After */}
                {(trace.decision.before || trace.decision.after) && (
                  <Box>
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      State Change
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {trace.decision.before && (
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Before:
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                            {JSON.stringify(trace.decision.before, null, 2)}
                          </Typography>
                        </Box>
                      )}
                      {trace.decision.after && (
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            After:
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                            {JSON.stringify(trace.decision.after, null, 2)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Exception */}
                {trace.rationale.exception && (
                  <Alert severity="warning" icon={<WarningIcon />}>
                    <Typography variant="caption" fontWeight="bold">
                      Exception Granted
                    </Typography>
                    <Typography variant="caption" display="block">
                      Requested by: {trace.rationale.exception.requestedBy || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Approved by: {trace.rationale.exception.approvedBy || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Reason: {trace.rationale.exception.reason}
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
};

/**
 * Evidence Chip Component
 */
const EvidenceChip: React.FC<{ evidence: DecisionEvidence }> = ({ evidence }) => {
  const color = evidence.weight && evidence.weight > 0.8 ? 'success' : evidence.weight && evidence.weight > 0.5 ? 'primary' : 'default';

  return (
    <Chip
      label={
        <span>
          <strong>{evidence.type}:</strong> {evidence.detail}
          {evidence.weight && ` (weight: ${(evidence.weight * 100).toFixed(0)}%)`}
        </span>
      }
      size="small"
      variant="outlined"
      color={color}
    />
  );
};

/**
 * Helper functions
 */

function getActorIcon(actorType: 'HUMAN' | 'AGENT' | 'SYSTEM'): React.ReactElement {
  switch (actorType) {
    case 'HUMAN':
      return <PersonIcon fontSize="small" />;
    case 'AGENT':
      return <RobotIcon fontSize="small" />;
    case 'SYSTEM':
      return <SystemIcon fontSize="small" />;
  }
}

function getKindIcon(kind: DecisionKind): React.ReactElement {
  switch (kind) {
    case 'ENTITY_MERGE':
    case 'IDENTITY_MATCH':
      return <MergeIcon fontSize="small" />;
    case 'RELATIONSHIP_INFERRED':
    case 'RELATIONSHIP_OVERRIDDEN':
      return <LinkIcon fontSize="small" />;
    case 'CLASSIFICATION_CHANGED':
      return <EditIcon fontSize="small" />;
    case 'MIGRATION_WAVE_ASSIGNED':
    case 'DISPOSITION_SET':
      return <AssignmentIcon fontSize="small" />;
    case 'EXCEPTION_GRANTED':
      return <WarningIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
}

function getConfidenceColor(
  confidence: number
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.7) return 'primary';
  if (confidence >= 0.5) return 'warning';
  return 'error';
}

function formatDecisionKind(kind: DecisionKind): string {
  return kind
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export default DecisionWhyPanel;


