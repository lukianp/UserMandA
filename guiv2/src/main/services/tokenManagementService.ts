/**
 * Token Management Service
 * Manages JWT tokens for authentication and authorization
 *
 * Features:
 * - JWT token generation (access + refresh)
 * - Token validation and verification
 * - Token refresh flow
 * - Token revocation (logout, security breach)
 * - Secure token storage (encrypted)
 * - Token blacklist for revoked tokens
 * - Multi-session support
 * - Token rotation on refresh
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes, createHmac } from 'crypto';

import { app } from 'electron';

import CredentialService from './credentialService';

// ============================================================================
// Types
// ============================================================================

/**
 * Token payload
 */
export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Token pair (access + refresh)
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Active session
 */
export interface Session {
  sessionId: string;
  userId: string;
  username: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  refreshToken: string;
}

/**
 * Blacklisted token
 */
export interface BlacklistedToken {
  token: string;
  reason: string;
  blacklistedAt: Date;
  expiresAt: Date;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

// ============================================================================
// Token Management Service
// ============================================================================

export class TokenManagementService extends EventEmitter {
  private sessions: Map<string, Session> = new Map();
  private blacklist: Map<string, BlacklistedToken> = new Map();
  private sessionsPath: string;
  private blacklistPath: string;
  private credentialService: CredentialService;
  private initialized = false;

  // Token configuration
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly SECRET_KEY_LENGTH = 64;

  // Secret keys (loaded from secure storage)
  private accessTokenSecret = '';
  private refreshTokenSecret = '';

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    this.sessionsPath = path.join(userDataPath, 'security', 'sessions.json');
    this.blacklistPath = path.join(userDataPath, 'security', 'token-blacklist.json');
    this.credentialService = new CredentialService();
  }

  /**
   * Initialize the token management service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.credentialService.initialize();

    // Load or generate secret keys
    await this.loadSecretKeys();

    // Load sessions
    try {
      const sessionsData = await fs.readFile(this.sessionsPath, 'utf-8');
      const sessions: Session[] = JSON.parse(sessionsData);
      sessions.forEach(session => {
        this.sessions.set(session.sessionId, {
          ...session,
          createdAt: new Date(session.createdAt),
          lastActivity: new Date(session.lastActivity),
          expiresAt: new Date(session.expiresAt)
        });
      });

      // Clean up expired sessions
      await this.cleanupExpiredSessions();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading sessions:', error);
      }
    }

    // Load blacklist
    try {
      const blacklistData = await fs.readFile(this.blacklistPath, 'utf-8');
      const blacklisted: BlacklistedToken[] = JSON.parse(blacklistData);
      blacklisted.forEach(entry => {
        this.blacklist.set(entry.token, {
          ...entry,
          blacklistedAt: new Date(entry.blacklistedAt),
          expiresAt: new Date(entry.expiresAt)
        });
      });

      // Clean up expired blacklist entries
      await this.cleanupBlacklist();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading token blacklist:', error);
      }
    }

    this.initialized = true;
    this.emit('initialized');

    // Start periodic cleanup
    this.startCleanupTimer();
  }

  /**
   * Generate token pair for a user
   */
  async generateTokens(
    userId: string,
    username: string,
    email: string,
    roles: string[],
    userAgent?: string,
    ipAddress?: string
  ): Promise<TokenPair> {
    await this.ensureInitialized();

    const sessionId = this.generateSessionId();
    const now = Date.now();

    // Create access token payload
    const accessPayload: TokenPayload = {
      userId,
      username,
      email,
      roles,
      sessionId,
      issuedAt: now,
      expiresAt: now + this.ACCESS_TOKEN_EXPIRY
    };

    // Create refresh token payload
    const refreshPayload: TokenPayload = {
      userId,
      username,
      email,
      roles,
      sessionId,
      issuedAt: now,
      expiresAt: now + this.REFRESH_TOKEN_EXPIRY
    };

    // Generate tokens
    const accessToken = this.createToken(accessPayload, this.accessTokenSecret);
    const refreshToken = this.createToken(refreshPayload, this.refreshTokenSecret);

    // Create session
    const session: Session = {
      sessionId,
      userId,
      username,
      createdAt: new Date(now),
      lastActivity: new Date(now),
      expiresAt: new Date(now + this.REFRESH_TOKEN_EXPIRY),
      userAgent,
      ipAddress,
      refreshToken
    };

    this.sessions.set(sessionId, session);
    await this.saveSessions();

    this.emit('tokens-generated', { userId, sessionId });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY / 1000,
      tokenType: 'Bearer'
    };
  }

  /**
   * Validate an access token
   */
  async validateAccessToken(token: string): Promise<TokenValidationResult> {
    await this.ensureInitialized();

    // Check blacklist first
    if (this.blacklist.has(token)) {
      return {
        valid: false,
        error: 'Token has been revoked'
      };
    }

    try {
      const payload = this.verifyToken(token, this.accessTokenSecret);

      // Check expiration
      if (Date.now() > payload.expiresAt) {
        return {
          valid: false,
          error: 'Token has expired'
        };
      }

      // Check session exists
      const session = this.sessions.get(payload.sessionId);
      if (!session) {
        return {
          valid: false,
          error: 'Session not found'
        };
      }

      // Check session expiration
      if (session.expiresAt < new Date()) {
        return {
          valid: false,
          error: 'Session has expired'
        };
      }

      // Update last activity
      session.lastActivity = new Date();
      await this.saveSessions();

      return {
        valid: true,
        payload
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token'
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    await this.ensureInitialized();

    // Check blacklist
    if (this.blacklist.has(refreshToken)) {
      throw new Error('Refresh token has been revoked');
    }

    // Verify refresh token
    let payload: TokenPayload;
    try {
      payload = this.verifyToken(refreshToken, this.refreshTokenSecret);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      throw new Error('Refresh token has expired');
    }

    // Find session
    const session = this.sessions.get(payload.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify refresh token matches session
    if (session.refreshToken !== refreshToken) {
      // Possible token theft - revoke all tokens for this session
      await this.revokeSession(session.sessionId, 'Refresh token mismatch');
      throw new Error('Invalid refresh token for session');
    }

    // Generate new token pair (token rotation)
    const newTokens = await this.generateTokens(
      payload.userId,
      payload.username,
      payload.email,
      payload.roles,
      session.userAgent,
      session.ipAddress
    );

    // Blacklist old refresh token
    await this.blacklistToken(refreshToken, 'Rotated on refresh');

    // Remove old session
    this.sessions.delete(payload.sessionId);

    this.emit('token-refreshed', { userId: payload.userId, oldSessionId: payload.sessionId });

    return newTokens;
  }

  /**
   * Revoke a token (add to blacklist)
   */
  async revokeToken(token: string, reason: string): Promise<void> {
    await this.ensureInitialized();

    // Try to verify to get expiration
    let expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY);
    try {
      const payload = this.verifyToken(token, this.accessTokenSecret);
      expiresAt = new Date(payload.expiresAt);
    } catch {
      // Token invalid, use default expiration
    }

    await this.blacklistToken(token, reason, expiresAt);
  }

  /**
   * Revoke all tokens for a session
   */
  async revokeSession(sessionId: string, reason: string): Promise<void> {
    await this.ensureInitialized();

    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Blacklist refresh token
    await this.blacklistToken(session.refreshToken, reason);

    // Remove session
    this.sessions.delete(sessionId);
    await this.saveSessions();

    this.emit('session-revoked', { sessionId, userId: session.userId, reason });
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeUserSessions(userId: string, reason: string): Promise<void> {
    await this.ensureInitialized();

    const userSessions = Array.from(this.sessions.values()).filter(
      s => s.userId === userId
    );

    for (const session of userSessions) {
      await this.revokeSession(session.sessionId, reason);
    }

    this.emit('user-sessions-revoked', { userId, count: userSessions.length, reason });
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Create a JWT token
   */
  private createToken(payload: TokenPayload, secret: string): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

    const signature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify and decode a JWT token
   */
  private verifyToken(token: string, secret: string): TokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    // Decode payload
    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    return JSON.parse(payloadJson);
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(data: string): string {
    return Buffer.from(data, 'utf-8').toString('base64url');
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Blacklist a token
   */
  private async blacklistToken(
    token: string,
    reason: string,
    expiresAt?: Date
  ): Promise<void> {
    const entry: BlacklistedToken = {
      token,
      reason,
      blacklistedAt: new Date(),
      expiresAt: expiresAt || new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY)
    };

    this.blacklist.set(token, entry);
    await this.saveBlacklist();

    this.emit('token-blacklisted', { token: token.substring(0, 20) + '...', reason });
  }

  /**
   * Load or generate secret keys
   */
  private async loadSecretKeys(): Promise<void> {
    try {
      // Try to load from credential service
      const accessCred = await this.credentialService.getCredential('jwt-access-secret');
      const refreshCred = await this.credentialService.getCredential('jwt-refresh-secret');

      if (accessCred && refreshCred) {
        this.accessTokenSecret = accessCred.password;
        this.refreshTokenSecret = refreshCred.password;
      } else {
        // Generate new secrets
        this.accessTokenSecret = randomBytes(this.SECRET_KEY_LENGTH).toString('hex');
        this.refreshTokenSecret = randomBytes(this.SECRET_KEY_LENGTH).toString('hex');

        // Store in credential service
        await this.credentialService.storeCredential(
          'jwt-access-secret',
          'system',
          this.accessTokenSecret,
          'ActiveDirectory'
        );

        await this.credentialService.storeCredential(
          'jwt-refresh-secret',
          'system',
          this.refreshTokenSecret,
          'ActiveDirectory'
        );
      }
    } catch (error) {
      console.error('Error loading secret keys:', error);
      // Fallback to in-memory secrets (not persisted)
      this.accessTokenSecret = randomBytes(this.SECRET_KEY_LENGTH).toString('hex');
      this.refreshTokenSecret = randomBytes(this.SECRET_KEY_LENGTH).toString('hex');
    }
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessions.delete(sessionId);
    }

    if (expiredSessions.length > 0) {
      await this.saveSessions();
      this.emit('sessions-cleaned', { count: expiredSessions.length });
    }
  }

  /**
   * Clean up expired blacklist entries
   */
  private async cleanupBlacklist(): Promise<void> {
    const now = new Date();
    const expiredTokens: string[] = [];

    for (const [token, entry] of this.blacklist.entries()) {
      if (entry.expiresAt < now) {
        expiredTokens.push(token);
      }
    }

    for (const token of expiredTokens) {
      this.blacklist.delete(token);
    }

    if (expiredTokens.length > 0) {
      await this.saveBlacklist();
      this.emit('blacklist-cleaned', { count: expiredTokens.length });
    }
  }

  /**
   * Start periodic cleanup timer
   */
  private startCleanupTimer(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupExpiredSessions().catch(err =>
        console.error('Session cleanup failed:', err)
      );
      this.cleanupBlacklist().catch(err =>
        console.error('Blacklist cleanup failed:', err)
      );
    }, 60 * 60 * 1000);
  }

  /**
   * Save sessions to disk
   */
  private async saveSessions(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.sessionsPath), { recursive: true });
      const sessions = Array.from(this.sessions.values());
      await fs.writeFile(this.sessionsPath, JSON.stringify(sessions, null, 2));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  /**
   * Save blacklist to disk
   */
  private async saveBlacklist(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.blacklistPath), { recursive: true });
      const blacklist = Array.from(this.blacklist.values());
      await fs.writeFile(this.blacklistPath, JSON.stringify(blacklist, null, 2));
    } catch (error) {
      console.error('Error saving token blacklist:', error);
    }
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

export default new TokenManagementService();
