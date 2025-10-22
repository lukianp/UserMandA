import { ProfileService } from '../services/profileService';

let profileService: ProfileService;

export function initializeProfileIPC(): void {
  profileService = new ProfileService();
  profileService.initialize();
}

export { profileService };