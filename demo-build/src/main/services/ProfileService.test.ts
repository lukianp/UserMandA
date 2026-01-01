import * as fs from 'fs/promises';
import * as path from 'path';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import { CompanyProfile } from '../../shared/types/profile';

import { ProfileService } from './ProfileService';

// Mock electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => 'C:\\temp\\appData'),
  },
  ipcMain: {
    handle: jest.fn(),
  },
  BrowserWindow: {
    getAllWindows: jest.fn(() => []),
  },
}));

// Mock lowdb
jest.mock('lowdb', () => ({
  Low: jest.fn(),
}));

jest.mock('lowdb/node', () => ({
  JSONFile: jest.fn(),
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  rm: jest.fn(),
  stat: jest.fn(),
  rename: jest.fn(),
  readdir: jest.fn(),
}));

// Mock glob
jest.mock('glob', () => ({
  glob: jest.fn(),
}));

describe('ProfileService', () => {
  let service: ProfileService;
  let mockDb: any;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock the database
    mockDb = {
      data: { profiles: [], version: 1 },
      read: jest.fn().mockResolvedValue(undefined),
      write: jest.fn().mockResolvedValue(undefined),
    };

    (Low as jest.MockedClass<typeof Low>).mockImplementation(() => mockDb);

    // Create service instance
    service = new ProfileService();
    await service.initialize();
  });

  describe('initialize', () => {
    it('should initialize the service and register IPC handlers', async () => {
      expect(mockDb.read).toHaveBeenCalled();
      expect(ProfileService).toBeDefined();
    });

    it('should not re-initialize if already initialized', async () => {
      await service.initialize();
      expect(mockDb.read).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProfiles', () => {
    it('should return sorted profiles', async () => {
      mockDb.data.profiles = [
        { companyName: 'B Company', id: '2' },
        { companyName: 'A Company', id: '1' },
      ];

      const profiles = await service.getProfiles();
      expect(profiles[0].companyName).toBe('A Company');
      expect(profiles[1].companyName).toBe('B Company');
    });
  });

  describe('getCurrentProfile', () => {
    it('should return the active profile', async () => {
      mockDb.data.profiles = [
        { companyName: 'Company A', id: '1', isActive: false },
        { companyName: 'Company B', id: '2', isActive: true },
      ];

      const current = await service.getCurrentProfile();
      expect(current?.companyName).toBe('Company B');
    });

    it('should return null if no active profile', async () => {
      mockDb.data.profiles = [
        { companyName: 'Company A', id: '1', isActive: false },
      ];

      const current = await service.getCurrentProfile();
      expect(current).toBeNull();
    });
  });

  describe('setCurrentProfile', () => {
    it('should set the active profile by ID', async () => {
      mockDb.data.profiles = [
        { companyName: 'Company A', id: '1', isActive: true },
        { companyName: 'Company B', id: '2', isActive: false },
      ];

      const success = await service.setCurrentProfile('2');

      expect(success).toBe(true);
      expect(mockDb.data.profiles[0].isActive).toBe(false);
      expect(mockDb.data.profiles[1].isActive).toBe(true);
    });

    it('should set the active profile by company name', async () => {
      mockDb.data.profiles = [
        { companyName: 'Company A', id: '1', isActive: true },
        { companyName: 'Company B', id: '2', isActive: false },
      ];

      const success = await service.setCurrentProfile('Company B');

      expect(success).toBe(true);
      expect(mockDb.data.profiles[1].isActive).toBe(true);
    });

    it('should return false for non-existent profile', async () => {
      const success = await service.setCurrentProfile('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('createProfile', () => {
    it('should create a new profile successfully', async () => {
      const profileData = {
        companyName: 'New Company',
        description: 'Test company',
        domainController: 'dc.newcompany.com',
        tenantId: '12345678-1234-1234-1234-123456789abc',
        isActive: false,
        configuration: {},
      };

      const profile = await service.createProfile(profileData);

      expect(profile.companyName).toBe('New Company');
      expect(profile.id).toBeDefined();
      expect(profile.created).toBeDefined();
      expect(profile.lastModified).toBeDefined();
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error for duplicate company name', async () => {
      mockDb.data.profiles = [
        { companyName: 'Existing Company', id: '1' },
      ];

      const profileData = {
        companyName: 'Existing Company',
        description: 'Duplicate',
        domainController: 'dc.existing.com',
        tenantId: '12345678-1234-1234-1234-123456789abc',
        isActive: false,
        configuration: {},
      };

      await expect(service.createProfile(profileData)).rejects.toThrow('already exists');
    });
  });

  describe('updateProfile', () => {
    it('should update an existing profile', async () => {
      mockDb.data.profiles = [
        {
          id: '1',
          companyName: 'Old Name',
          description: 'Old desc',
          created: new Date('2023-01-01'),
          lastModified: new Date('2023-01-01'),
        },
      ];

      const updatedProfile = {
        ...mockDb.data.profiles[0],
        companyName: 'New Name',
        description: 'New desc',
        created: mockDb.data.profiles[0].created,
        lastModified: mockDb.data.profiles[0].lastModified,
      };

      const result = await service.updateProfile(updatedProfile);

      expect(result.companyName).toBe('New Name');
      expect(result.lastModified).not.toBe('2023-01-01');
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error for non-existent profile', async () => {
      const profile = {
        id: 'non-existent',
        companyName: 'Test',
        description: 'Test',
        domainController: 'dc.test.com',
        tenantId: '12345678-1234-1234-1234-123456789abc',
        isActive: false,
        created: '2023-01-01T00:00:00.000Z',
        lastModified: '2023-01-01T00:00:00.000Z',
        configuration: {},
      };

      await expect(service.updateProfile(profile)).rejects.toThrow('not found');
    });
  });

  describe('deleteProfile', () => {
    it('should delete an existing profile', async () => {
      mockDb.data.profiles = [
        { id: '1', companyName: 'Test Company', isActive: false },
      ];

      const success = await service.deleteProfile('1');

      expect(success).toBe(true);
      expect(mockDb.data.profiles).toHaveLength(0);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should return false for non-existent profile', async () => {
      const success = await service.deleteProfile('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('validateProfile', () => {
    it('should validate a correct profile', () => {
      const profile: CompanyProfile = {
        id: '1',
        companyName: 'Valid Company',
        description: 'Valid description',
        domainController: 'dc.valid.com',
        tenantId: '12345678-1234-1234-1234-123456789abc',
        isActive: false,
        created: '2023-01-01T00:00:00.000Z',
        lastModified: '2023-01-01T00:00:00.000Z',
        configuration: {},
      };

      const result = service.validateProfile(profile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      const profile: CompanyProfile = {
        id: '1',
        companyName: '', // Invalid: empty name
        description: 'Valid description',
        domainController: 'dc.valid.com',
        tenantId: 'invalid-guid', // Invalid: not a GUID
        isActive: false,
        created: '2023-01-01T00:00:00.000Z',
        lastModified: '2023-01-01T00:00:00.000Z',
        configuration: {},
      };

      const result = service.validateProfile(profile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Company name is required');
      expect(result.warnings).toContain('Tenant ID should be a valid GUID');
    });
  });

  describe('getCompanyDataPath', () => {
    it('should return correct data path for Windows', () => {
      const path = service.getCompanyDataPath('Test Company');
      expect(path).toContain('C:\\DiscoveryData');
      expect(path).toContain('Test Company');
    });
  });
});
