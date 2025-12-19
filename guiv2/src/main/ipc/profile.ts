import { ProfileService } from '../services/profileService';

let profileService: ProfileService;

/**
 * Get profile service instance with proper error handling
 * @returns ProfileService instance
 */
function getProfileService(): ProfileService {
  if (!profileService) {
    throw new Error('ProfileService not initialized');
  }
  return profileService;
}

export function initializeProfileIPC(): void {
  profileService = new ProfileService();
  profileService.initialize();
}

export { profileService, getProfileService };