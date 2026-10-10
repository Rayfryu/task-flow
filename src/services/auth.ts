/**
 * Local authentication service for TaskFlow prototype.
 * Credentials check is isolated here for clean transition to backend authentication.
 */

const SESSION_STORAGE_KEY = 'taskflow_auth_session_v1';

export interface AuthUser {
  username: string;
  displayName: string;
  avatarLetter: string;
}

const DEFAULT_USER: AuthUser = {
  username: 'ayub',
  displayName: 'Ayub',
  avatarLetter: 'A',
};

/**
 * Checks if an active session exists in sessionStorage.
 */
export function isAuthenticated(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session?.authenticated === true && session?.username === DEFAULT_USER.username;
  } catch {
    return false;
  }
}

/**
 * Returns the currently authenticated user or null.
 */
export function getCurrentUser(): AuthUser | null {
  if (!isAuthenticated()) return null;
  return DEFAULT_USER;
}

/**
 * Validates credentials and initializes sessionStorage upon success.
 * - Trims accidental whitespace from username only.
 * - Does not trim password.
 * - Does not store password in storage.
 */
export function login(usernameInput: string, passwordInput: string): { success: boolean; error?: string } {
  const trimmedUsername = usernameInput.trim();

  // Validate credentials exactly: ayub / root
  if (trimmedUsername === 'ayub' && passwordInput === 'root') {
    try {
      const sessionPayload = {
        authenticated: true,
        username: 'ayub',
        loggedInAt: new Date().toISOString(),
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Gagal menyimpan sesi browser.' };
    }
  }

  return { success: false, error: 'Username atau password salah.' };
}

/**
 * Clears the session from sessionStorage.
 */
export function logout(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('TaskFlow: Failed to clear session', err);
  }
}
