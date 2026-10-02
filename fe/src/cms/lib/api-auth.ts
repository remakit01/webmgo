'use client';

import { apiFetch, ApiError } from './api-client';

export interface AuthUser {
  id: string;
  username?: string;
  email: string;
  role: 'ADMIN' | 'EDITOR';
}

/** Người dùng hiện tại theo cookie phiên; null nếu chưa đăng nhập hoặc phiên hết hạn. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>('/auth/me');
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) return null;
    throw err;
  }
}

export async function loginWithApi(
  identifier: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const data = await apiFetch<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Đăng nhập không thành công' };
  }
}

export async function logoutWithApi(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error:', err);
  }
}
