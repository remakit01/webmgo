'use client';

// Client gọi API từ CMS. Xác thực bằng httpOnly cookie (access_token / refresh_token),
// không giữ token trong JS/localStorage.

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const API_URL = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function toError(res: Response): Promise<ApiError> {
  const data = await res.json().catch(() => null);
  const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
  return new ApiError(message || `Yêu cầu thất bại (HTTP ${res.status})`, res.status);
}

/** fetch kèm cookie; gặp 401 thì thử refresh một lần rồi gọi lại. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });

  let res: Response;
  try {
    res = await doFetch();
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ API', 0);
  }
  if (res.status === 401 && !path.startsWith('/auth/') && (await refreshSession())) {
    res = await doFetch();
  }
  if (!res.ok) throw await toError(res);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/**
 * Header khoá lạc quan: gửi phiên bản (updatedAt) nhận được lúc GET.
 * API trả 409 nếu người khác đã lưu trước. Chưa có phiên bản (chưa từng lưu) thì không gửi.
 */
export const ifMatch = (version: string | null | undefined): Record<string, string> =>
  version ? { 'If-Match': `"${version}"` } : {};

export const isConflict = (err: unknown) => err instanceof ApiError && err.status === 409;
