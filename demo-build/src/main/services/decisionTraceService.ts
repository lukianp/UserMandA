/**
 * Decision Trace Service
 *
 * SQLite-based append-only store for decision traces.
 * Implements the "decision plane" separate from the "data plane".
 *
 * Key Responsibilities:
 * - Persist decision traces (append-only, never delete)
 * - Query traces by entity, actor, time range, decision kind
 * - Support replayability (snapshot hashes, versioning)
 * - Enable precedent search (find similar past decisions)
 *
 * Based on Decision Traces architecture in CLAUDE.local.md
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import type {
  DecisionTrace,
  DecisionKind,
  CanonicalEntity,
  CanonicalRelation,
} from '../../renderer/types/models/canonical';

/**
 * Query options for trace retrieval
 */
export interface TraceQueryOptions {
  profileId?: string;           // Filter by profile/tenant
  entityId?: string;            // Filter by affected entity
  relationId?: string;          // Filter by affected relation
  kind?: DecisionKind | DecisionKind[];
  actorType?: 'HUMAN' | 'AGENT' | 'SYSTEM';
  actorId?: string;
  startDate?: string;           // ISO 8601
  endDate?: string;             // ISO 8601
  limit?: number;
  offset?: number;
}

/**
 * Trace statistics
 */
export interface TraceStatistics {
  totalTraces: number;
  byKind: Record<string, number>;
  byActor: Record<string, number>;
  dateRange: {
    earliest: string;
    latest: string;
  };
}

/**
 * Decision Trace Service
 *
 * Manages SQLite database for decision trace persistence.
 * Thread-safe, append-only, supports concurrent reads.
 */
export class DecisionTraceService {
  private static instance: DecisionTraceService;
  private db: Database.Database | null = null;
  private dbPath: string;

  private constructor() {
    // Store traces in user data directory under profile-specific subfolder
    const userDataPath = app.getPath('userData');
    const tracesDir = path.join(userDataPath, 'DecisionTraces');

    // Ensure directory exists
    if (!fs.existsSync(tracesDir)) {
      fs.mkdirSync(tracesDir, { recursive: true });
    }

    this.dbPath = path.join(tracesDir, 'decision-traces.db');
    console.log('[DecisionTraceService] Database path:', this.dbPath);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DecisionTraceService {
    if (!DecisionTraceService.instance) {
      DecisionTraceService.instance = new DecisionTraceService();
    }
    return DecisionTraceService.instance;
  }

  /**
   * Initialize the database and create schema
   */
  public initialize(): void {
    if (this.db) {
      console.log('[DecisionTraceService] Already initialized');
      return;
    }

    console.log('[DecisionTraceService] Initializing database...');
    this.db = new Database(this.dbPath);

    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');

    // Create schema
    this.createSchema();

    console.log('[DecisionTraceService] Initialized successfully');
  }

  /**
   * Create database schema
   */
  private createSchema(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Main decision traces table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS decision_traces (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        occurred_at TEXT NOT NULL,

        -- Actor
        actor_type TEXT NOT NULL CHECK(actor_type IN ('HUMAN', 'AGENT', 'SYSTEM')),
        actor_id TEXT,
        actor_display_name TEXT,

        -- Decision
        kind TEXT NOT NULL,
        subject_entity_id TEXT,
        subject_relation_id TEXT,
        subject_entity_type TEXT,

        -- Core decision data
        decision_action TEXT NOT NULL,
        decision_before TEXT,  -- JSON
        decision_after TEXT,   -- JSON

        -- Rationale
        rationale_summary TEXT NOT NULL,
        rationale_confidence REAL NOT NULL CHECK(rationale_confidence >= 0 AND rationale_confidence <= 1),

        -- Full trace as JSON (for complex queries)
        trace_json TEXT NOT NULL,

        -- Metadata
        created_at TEXT NOT NULL DEFAULT (datetime('now')),

        -- Indexes for common queries
        CHECK (json_valid(trace_json))
      );

      CREATE INDEX IF NOT EXISTS idx_traces_profile ON decision_traces(profile_id);
      CREATE INDEX IF NOT EXISTS idx_traces_occurred ON decision_traces(occurred_at);
      CREATE INDEX IF NOT EXISTS idx_traces_kind ON decision_traces(kind);
      CREATE INDEX IF NOT EXISTS idx_traces_entity ON decision_traces(subject_entity_id);
      CREATE INDEX IF NOT EXISTS idx_traces_relation ON decision_traces(subject_relation_id);
      CREATE INDEX IF NOT EXISTS idx_traces_actor ON decision_traces(actor_type, actor_id);
      CREATE INDEX IF NOT EXISTS idx_traces_composite ON decision_traces(profile_id, subject_entity_id, kind);
    `);

    // Evidence table (normalized for efficient querying)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS decision_evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trace_id TEXT NOT NULL,
        evidence_type TEXT NOT NULL,
        detail TEXT NOT NULL,
        weight REAL,

        FOREIGN KEY (trace_id) REFERENCES decision_traces(id)
      );

      CREATE INDEX IF NOT EXISTS idx_evidence_trace ON decision_evidence(trace_id);
      CREATE INDEX IF NOT EXISTS idx_evidence_type ON decision_evidence(evidence_type);
    `);

    // Inputs table (for replayability queries)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS decision_inputs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trace_id TEXT NOT NULL,
        system TEXT NOT NULL,
        ref_file TEXT,
        ref_row_id TEXT,
        ref_external_id TEXT,
        snapshot_hash TEXT,

        FOREIGN KEY (trace_id) REFERENCES decision_traces(id)
      );

      CREATE INDEX IF NOT EXISTS idx_inputs_trace ON decision_inputs(trace_id);
      CREATE INDEX IF NOT EXISTS idx_inputs_hash ON decision_inputs(snapshot_hash);
    `);

    // Policy references table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS decision_policies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trace_id TEXT NOT NULL,
        policy_id TEXT NOT NULL,
        policy_version TEXT NOT NULL,
        rule TEXT,

        FOREIGN KEY (trace_id) REFERENCES decision_traces(id)
      );

      CREATE INDEX IF NOT EXISTS idx_policies_trace ON decision_policies(trace_id);
      CREATE INDEX IF NOT EXISTS idx_policies_policy ON decision_policies(policy_id);
    `);

    console.log('[DecisionTraceService] Schema created/verified');
  }

  /**
   * Append a decision trace (core operation)
   */
  public async appendTrace(trace: DecisionTrace): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO decision_traces (
        id, profile_id, occurred_at,
        actor_type, actor_id, actor_display_name,
        kind, subject_entity_id, subject_relation_id, subject_entity_type,
        decision_action, decision_before, decision_after,
        rationale_summary, rationale_confidence,
        trace_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      this.db.transaction(() => {
        // Insert main trace
        stmt.run(
          trace.id,
          trace.profileId,
          trace.occurredAt,
          trace.actor.type,
          trace.actor.id || null,
          trace.actor.displayName || null,
          trace.kind,
          trace.subject.entityId || null,
          trace.subject.relationId || null,
          trace.subject.entityType || null,
          trace.decision.action,
          trace.decision.before ? JSON.stringify(trace.decision.before) : null,
          trace.decision.after ? JSON.stringify(trace.decision.after) : null,
          trace.rationale.summary,
          trace.rationale.confidence,
          JSON.stringify(trace)
        );

        // Insert evidence
        if (trace.rationale.evidence && trace.rationale.evidence.length > 0) {
          const evidenceStmt = this.db!.prepare(`
            INSERT INTO decision_evidence (trace_id, evidence_type, detail, weight)
            VALUES (?, ?, ?, ?)
          `);
          for (const evidence of trace.rationale.evidence) {
            evidenceStmt.run(trace.id, evidence.type, evidence.detail, evidence.weight || null);
          }
        }

        // Insert inputs
        if (trace.inputs && trace.inputs.length > 0) {
          const inputStmt = this.db!.prepare(`
            INSERT INTO decision_inputs (trace_id, system, ref_file, ref_row_id, ref_external_id, snapshot_hash)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          for (const input of trace.inputs) {
            inputStmt.run(
              trace.id,
              input.system,
              input.ref.file || null,
              input.ref.rowId || null,
              input.ref.externalId || null,
              input.snapshotHash || null
            );
          }
        }

        // Insert policy reference
        if (trace.policy) {
          const policyStmt = this.db!.prepare(`
            INSERT INTO decision_policies (trace_id, policy_id, policy_version, rule)
            VALUES (?, ?, ?, ?)
          `);
          policyStmt.run(trace.id, trace.policy.policyId, trace.policy.policyVersion, trace.policy.rule || null);
        }
      })();

      console.log('[DecisionTraceService] Trace appended:', {
        id: trace.id,
        kind: trace.kind,
        profileId: trace.profileId,
      });
    } catch (error) {
      console.error('[DecisionTraceService] Failed to append trace:', error);
      throw error;
    }
  }

  /**
   * Query traces with filters
   */
  public async queryTraces(options: TraceQueryOptions = {}): Promise<DecisionTrace[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = 'SELECT trace_json FROM decision_traces WHERE 1=1';
    const params: any[] = [];

    if (options.profileId) {
      sql += ' AND profile_id = ?';
      params.push(options.profileId);
    }

    if (options.entityId) {
      sql += ' AND subject_entity_id = ?';
      params.push(options.entityId);
    }

    if (options.relationId) {
      sql += ' AND subject_relation_id = ?';
      params.push(options.relationId);
    }

    if (options.kind) {
      if (Array.isArray(options.kind)) {
        sql += ` AND kind IN (${options.kind.map(() => '?').join(',')})`;
        params.push(...options.kind);
      } else {
        sql += ' AND kind = ?';
        params.push(options.kind);
      }
    }

    if (options.actorType) {
      sql += ' AND actor_type = ?';
      params.push(options.actorType);
    }

    if (options.actorId) {
      sql += ' AND actor_id = ?';
      params.push(options.actorId);
    }

    if (options.startDate) {
      sql += ' AND occurred_at >= ?';
      params.push(options.startDate);
    }

    if (options.endDate) {
      sql += ' AND occurred_at <= ?';
      params.push(options.endDate);
    }

    sql += ' ORDER BY occurred_at DESC';

    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Array<{ trace_json: string }>;

    return rows.map((row) => JSON.parse(row.trace_json) as DecisionTrace);
  }

  /**
   * Get trace statistics
   */
  public async getStatistics(profileId?: string): Promise<TraceStatistics> {
    if (!this.db) throw new Error('Database not initialized');

    let whereClause = '';
    const params: any[] = [];
    if (profileId) {
      whereClause = 'WHERE profile_id = ?';
      params.push(profileId);
    }

    // Total count
    const totalRow = this.db.prepare(`SELECT COUNT(*) as count FROM decision_traces ${whereClause}`).get(...params) as {
      count: number;
    };

    // By kind
    const kindRows = this.db
      .prepare(`SELECT kind, COUNT(*) as count FROM decision_traces ${whereClause} GROUP BY kind`)
      .all(...params) as Array<{ kind: string; count: number }>;

    // By actor
    const actorRows = this.db
      .prepare(`SELECT actor_type, COUNT(*) as count FROM decision_traces ${whereClause} GROUP BY actor_type`)
      .all(...params) as Array<{ actor_type: string; count: number }>;

    // Date range
    const dateRow = this.db
      .prepare(`SELECT MIN(occurred_at) as earliest, MAX(occurred_at) as latest FROM decision_traces ${whereClause}`)
      .get(...params) as { earliest: string; latest: string };

    return {
      totalTraces: totalRow.count,
      byKind: kindRows.reduce((acc, row) => ({ ...acc, [row.kind]: row.count }), {}),
      byActor: actorRows.reduce((acc, row) => ({ ...acc, [row.actor_type]: row.count }), {}),
      dateRange: {
        earliest: dateRow.earliest || new Date().toISOString(),
        latest: dateRow.latest || new Date().toISOString(),
      },
    };
  }

  /**
   * Close database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[DecisionTraceService] Database closed');
    }
  }
}

// Export singleton instance
export const decisionTraceService = DecisionTraceService.getInstance();


