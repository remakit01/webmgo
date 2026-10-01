export interface AuthUser {
  id: string;
  username?: string;
  email: string;
  role: 'ADMIN' | 'EDITOR';
  name?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
  loginAt: string;
}

const AUTH_STORAGE_KEY = 'remak_cms_auth_session';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    // Set a client cookie so SSR or middleware can detect presence
    document.cookie = `remak_cms_logged_in=1; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  } catch (err) {
    console.error('Failed to set auth session:', err);
  }
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = 'remak_cms_logged_in=; path=/; max-age=0';
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
}

export async function loginWithApi(
  identifier: string, 
  password: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Gửi và nhận httpOnly cookies từ API
      body: JSON.stringify({ 
        identifier, 
        username: identifier, 
        email: identifier, 
        password 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Đăng nhập không thành công');
      return { success: false, error: message };
    }

    const authUser: AuthUser = {
      id: data.user?.id || '1',
      username: data.user?.username,
      email: data.user?.email || identifier,
      role: data.user?.role || 'ADMIN',
      name: data.user?.role === 'ADMIN' ? 'Quản Trị Viên (Admin)' : 'Biên Tập Viên (Editor)',
    };

    setAuthSession({
      user: authUser,
      accessToken: data.accessToken,
      loginAt: new Date().toISOString(),
    });

    return { success: true, user: authUser };
  } catch (err) {
    console.error('Login API error:', err);
    return { 
      success: false, 
      error: 'Không thể kết nối đến máy chủ API (http://localhost:4000). Vui lòng đảm bảo backend đang chạy!' 
    };
  }
}

export async function logoutWithApi(): Promise<void> {
  const session = getAuthSession();
  try {
    if (session?.accessToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        credentials: 'include',
      });
    }
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    clearAuthSession();
  }
}
