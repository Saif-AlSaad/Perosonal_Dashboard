// Browser-native cryptographic passkey handling using SHA-256

const SALT = 'demo-life-os-v1-salt';
const SESSION_KEY = 'demo_life_os_authenticated';
const SESSION_TIMESTAMP = 'demo_life_os_last_active';

export async function hashPasskey(passkey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passkey + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function isAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAuthenticated(status: boolean): void {
  try {
    if (status) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      sessionStorage.setItem(SESSION_TIMESTAMP, Date.now().toString());
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_TIMESTAMP);
    }
  } catch {
    // Ignore storage issues
  }
}

export function updateLastActive(): void {
  try {
    sessionStorage.setItem(SESSION_TIMESTAMP, Date.now().toString());
  } catch {
    // Ignore
  }
}

export function checkAutoLock(timeoutMinutes: number): boolean {
  if (timeoutMinutes <= 0) return false;
  try {
    const lastActive = sessionStorage.getItem(SESSION_TIMESTAMP);
    if (!lastActive) return true;
    const elapsedMinutes = (Date.now() - parseInt(lastActive, 10)) / (1000 * 60);
    if (elapsedMinutes >= timeoutMinutes) {
      setAuthenticated(false);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
