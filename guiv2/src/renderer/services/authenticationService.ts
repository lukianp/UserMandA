/**
 * Authentication Service
 * User authentication and session management
 */

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  roles: string[];
}

interface AuthToken {
  token: string;
  expiresAt: Date;
  refreshToken: string;
}

class AuthenticationService {
  private currentUser: User | null = null;
  private authToken: AuthToken | null = null;

  async login(username: string, password: string): Promise<User> {
    // Call authentication endpoint
    const user: User = {
      id: '1',
      username,
      displayName: username,
      email: `${username}@example.com`,
      roles: ['user'],
    };

    this.currentUser = user;
    localStorage.setItem('current_user', JSON.stringify(user));

    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.authToken = null;
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('current_user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }
}

export default new AuthenticationService();


