/**
 * Encryption Service
 * Provides encryption/decryption functionality for data at rest and in transit
 *
 * Features:
 * - AES-256-GCM encryption/decryption
 * - Key derivation from passwords (PBKDF2)
 * - Secure key storage (OS keychain)
 * - File encryption/decryption with streams
 * - String encryption for sensitive data
 * - IV generation and management
 * - Key rotation support
 */

import { EventEmitter } from 'events';
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  pbkdf2,
  createHash
} from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { app, safeStorage } from 'electron';
import { Transform } from 'stream';

// ============================================================================
// Types
// ============================================================================

/**
 * Encryption algorithm configuration
 */
export interface EncryptionConfig {
  algorithm: 'aes-256-gcm';
  keyLength: 32; // 256 bits
  ivLength: 16; // 128 bits
  saltLength: 32;
  authTagLength: 16;
  pbkdf2Iterations: 100000;
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  iv: string; // Base64
  authTag: string; // Base64
  data: string; // Base64
  algorithm: string;
}

/**
 * Encrypted file metadata
 */
export interface EncryptedFileMetadata {
  version: number;
  algorithm: string;
  iv: string; // Hex
  authTag: string; // Hex
  salt: string; // Hex
  originalSize: number;
  encryptedSize: number;
  checksum: string;
}

/**
 * Key derivation options
 */
export interface KeyDerivationOptions {
  password: string;
  salt?: Buffer;
  iterations?: number;
}

// ============================================================================
// Encryption Service
// ============================================================================

export class EncryptionService extends EventEmitter {
  private config: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 32,
    authTagLength: 16,
    pbkdf2Iterations: 100000
  };

  private masterKey: Buffer | null = null;
  private keyStorePath: string;
  private initialized = false;

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    this.keyStorePath = path.join(userDataPath, 'security', 'master.key');
  }

  /**
   * Initialize the encryption service
   */
  async initialize(password?: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (password) {
      // Derive master key from password
      this.masterKey = await this.deriveKey({ password });
    } else {
      // Load or generate master key
      await this.loadOrGenerateMasterKey();
    }

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Encrypt a string
   */
  async encryptString(plaintext: string, key?: Buffer): Promise<EncryptedData> {
    await this.ensureInitialized();

    const encryptionKey = key || this.masterKey!;
    const iv = randomBytes(this.config.ivLength);
    const cipher = createCipheriv(this.config.algorithm, encryptionKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf-8'),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      data: encrypted.toString('base64'),
      algorithm: this.config.algorithm
    };
  }

  /**
   * Decrypt a string
   */
  async decryptString(encrypted: EncryptedData, key?: Buffer): Promise<string> {
    await this.ensureInitialized();

    const decryptionKey = key || this.masterKey!;
    const iv = Buffer.from(encrypted.iv, 'base64');
    const authTag = Buffer.from(encrypted.authTag, 'base64');
    const data = Buffer.from(encrypted.data, 'base64');

    const decipher = createDecipheriv(this.config.algorithm, decryptionKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final()
    ]);

    return decrypted.toString('utf-8');
  }

  /**
   * Encrypt an object to JSON
   */
  async encryptObject<T>(obj: T, key?: Buffer): Promise<EncryptedData> {
    const json = JSON.stringify(obj);
    return this.encryptString(json, key);
  }

  /**
   * Decrypt an object from JSON
   */
  async decryptObject<T>(encrypted: EncryptedData, key?: Buffer): Promise<T> {
    const json = await this.decryptString(encrypted, key);
    return JSON.parse(json);
  }

  /**
   * Encrypt a buffer
   */
  async encryptBuffer(buffer: Buffer, key?: Buffer): Promise<{
    encrypted: Buffer;
    iv: Buffer;
    authTag: Buffer;
  }> {
    await this.ensureInitialized();

    const encryptionKey = key || this.masterKey!;
    const iv = randomBytes(this.config.ivLength);
    const cipher = createCipheriv(this.config.algorithm, encryptionKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return { encrypted, iv, authTag };
  }

  /**
   * Decrypt a buffer
   */
  async decryptBuffer(
    encrypted: Buffer,
    iv: Buffer,
    authTag: Buffer,
    key?: Buffer
  ): Promise<Buffer> {
    await this.ensureInitialized();

    const decryptionKey = key || this.masterKey!;
    const decipher = createDecipheriv(this.config.algorithm, decryptionKey, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  }

  /**
   * Encrypt a file
   */
  async encryptFile(
    inputPath: string,
    outputPath: string,
    password?: string
  ): Promise<EncryptedFileMetadata> {
    await this.ensureInitialized();

    // Derive key from password or use master key
    let key: Buffer;
    let salt: Buffer;

    if (password) {
      salt = randomBytes(this.config.saltLength);
      key = await this.deriveKey({ password, salt });
    } else {
      key = this.masterKey!;
      salt = Buffer.alloc(0);
    }

    const iv = randomBytes(this.config.ivLength);
    const cipher = createCipheriv(this.config.algorithm, key, iv);

    // Get file stats
    const stats = await fs.stat(inputPath);
    const originalSize = stats.size;

    // Calculate checksum
    const checksum = await this.calculateFileChecksum(inputPath);

    // Encrypt file using streams
    const input = createReadStream(inputPath);
    const output = createWriteStream(outputPath);

    await pipeline(input, cipher, output);

    const authTag = cipher.getAuthTag();
    const encryptedStats = await fs.stat(outputPath);

    const metadata: EncryptedFileMetadata = {
      version: 1,
      algorithm: this.config.algorithm,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      salt: salt.toString('hex'),
      originalSize,
      encryptedSize: encryptedStats.size,
      checksum
    };

    // Write metadata file
    const metadataPath = `${outputPath}.meta`;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    this.emit('file-encrypted', { inputPath, outputPath, metadata });

    return metadata;
  }

  /**
   * Decrypt a file
   */
  async decryptFile(
    inputPath: string,
    outputPath: string,
    password?: string
  ): Promise<void> {
    await this.ensureInitialized();

    // Read metadata
    const metadataPath = `${inputPath}.meta`;
    const metadataJson = await fs.readFile(metadataPath, 'utf-8');
    const metadata: EncryptedFileMetadata = JSON.parse(metadataJson);

    // Derive key
    let key: Buffer;

    if (password) {
      const salt = Buffer.from(metadata.salt, 'hex');
      key = await this.deriveKey({ password, salt });
    } else {
      key = this.masterKey!;
    }

    const iv = Buffer.from(metadata.iv, 'hex');
    const authTag = Buffer.from(metadata.authTag, 'hex');

    const decipher = createDecipheriv(this.config.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt file using streams
    const input = createReadStream(inputPath);
    const output = createWriteStream(outputPath);

    await pipeline(input, decipher, output);

    // Verify checksum
    const checksum = await this.calculateFileChecksum(outputPath);
    if (checksum !== metadata.checksum) {
      // Delete corrupted output
      await fs.unlink(outputPath);
      throw new Error('Decryption failed: checksum mismatch');
    }

    this.emit('file-decrypted', { inputPath, outputPath, metadata });
  }

  /**
   * Encrypt a file in place (overwrites original)
   */
  async encryptFileInPlace(filePath: string, password?: string): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    await this.encryptFile(filePath, tempPath, password);
    await fs.rename(tempPath, filePath);
  }

  /**
   * Decrypt a file in place (overwrites original)
   */
  async decryptFileInPlace(filePath: string, password?: string): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    await this.decryptFile(filePath, tempPath, password);
    await fs.rename(tempPath, filePath);

    // Remove metadata file
    const metadataPath = `${filePath}.meta`;
    await fs.unlink(metadataPath);
  }

  /**
   * Create an encryption stream
   */
  createEncryptionStream(key?: Buffer): Transform {
    const encryptionKey = key || this.masterKey!;
    const iv = randomBytes(this.config.ivLength);
    const cipher = createCipheriv(this.config.algorithm, encryptionKey, iv);

    // Store IV and auth tag for later use
    const metadata = { iv, authTag: null as Buffer | null };

    const transform = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, cipher.update(chunk));
      },
      flush(callback) {
        try {
          const final = cipher.final();
          metadata.authTag = cipher.getAuthTag();
          callback(null, final);
        } catch (error) {
          callback(error as Error);
        }
      }
    });

    // Attach metadata to stream
    (transform as any).metadata = metadata;

    return transform;
  }

  /**
   * Create a decryption stream
   */
  createDecryptionStream(iv: Buffer, authTag: Buffer, key?: Buffer): Transform {
    const decryptionKey = key || this.masterKey!;
    const decipher = createDecipheriv(this.config.algorithm, decryptionKey, iv);
    decipher.setAuthTag(authTag);

    return new Transform({
      transform(chunk, encoding, callback) {
        callback(null, decipher.update(chunk));
      },
      flush(callback) {
        try {
          callback(null, decipher.final());
        } catch (error) {
          callback(error as Error);
        }
      }
    });
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  async deriveKey(options: KeyDerivationOptions): Promise<Buffer> {
    const salt = options.salt || randomBytes(this.config.saltLength);
    const iterations = options.iterations || this.config.pbkdf2Iterations;

    return new Promise((resolve, reject) => {
      pbkdf2(
        options.password,
        salt,
        iterations,
        this.config.keyLength,
        'sha512',
        (err, derivedKey) => {
          if (err) {
            reject(err);
          } else {
            resolve(derivedKey);
          }
        }
      );
    });
  }

  /**
   * Generate a random encryption key
   */
  generateKey(): Buffer {
    return randomBytes(this.config.keyLength);
  }

  /**
   * Hash a string (one-way)
   */
  hash(data: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
    return createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Verify a hash
   */
  verifyHash(data: string, hash: string, algorithm: 'sha256' | 'sha512' = 'sha256'): boolean {
    const computed = this.hash(data, algorithm);
    return computed === hash;
  }

  /**
   * Rotate master key
   */
  async rotateMasterKey(newPassword?: string): Promise<void> {
    await this.ensureInitialized();

    const oldKey = this.masterKey!;
    let newKey: Buffer;

    if (newPassword) {
      newKey = await this.deriveKey({ password: newPassword });
    } else {
      newKey = this.generateKey();
    }

    // Store new key
    await this.storeMasterKey(newKey);
    this.masterKey = newKey;

    this.emit('key-rotated', { oldKey: oldKey.toString('hex').substring(0, 16) + '...' });
  }

  /**
   * Calculate file checksum (SHA-256)
   */
  private async calculateFileChecksum(filePath: string): Promise<string> {
    const hash = createHash('sha256');
    const input = createReadStream(filePath);

    await pipeline(input, hash);

    return hash.digest('hex');
  }

  /**
   * Load or generate master key
   */
  private async loadOrGenerateMasterKey(): Promise<void> {
    try {
      // Try to load existing key from OS secure storage
      if (safeStorage.isEncryptionAvailable()) {
        const encryptedKey = await fs.readFile(this.keyStorePath);
        const keyHex = safeStorage.decryptString(encryptedKey);
        this.masterKey = Buffer.from(keyHex, 'hex');
        return;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading master key:', error);
      }
    }

    // Generate new master key
    this.masterKey = this.generateKey();
    await this.storeMasterKey(this.masterKey);
  }

  /**
   * Store master key securely
   */
  private async storeMasterKey(key: Buffer): Promise<void> {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Secure storage not available - cannot store master key');
    }

    try {
      await fs.mkdir(path.dirname(this.keyStorePath), { recursive: true });
      const keyHex = key.toString('hex');
      const encryptedKey = safeStorage.encryptString(keyHex);
      await fs.writeFile(this.keyStorePath, encryptedKey);
    } catch (error) {
      console.error('Error storing master key:', error);
      throw new Error(`Failed to store master key: ${error}`);
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

  /**
   * Clear master key from memory (use with caution)
   */
  clearMasterKey(): void {
    if (this.masterKey) {
      this.masterKey.fill(0);
      this.masterKey = null;
    }
    this.initialized = false;
  }
}

export default new EncryptionService();
