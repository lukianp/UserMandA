import { ProfileService } from '../services/ProfileService';

let profileService: ProfileService;

export function initializeProfileIPC(): void {
  profileService = new ProfileService();
  profileService.initialize();
}

export { profileService };