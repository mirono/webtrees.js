/**
 * Typed API client for webtrees.js
 * Wraps fetch with base URL, credentials, and error handling.
 * All requests are proxied through Next.js rewrite: /api → localhost:3001
 */

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    ...init,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.status, `API error ${res.status}: ${res.statusText}`, body);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get<T>(path: string, init?: RequestInit): Promise<T> {
    return request<T>(path, { ...init, method: "GET" });
  },

  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...init,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...init,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...init,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, init?: RequestInit): Promise<T> {
    return request<T>(path, { ...init, method: "DELETE" });
  },
};

// ─── Domain helpers ───────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  realName: string;
  isAdmin: boolean;
}

export interface Tree {
  id: number;
  name: string;
  title: string;
  gedcomFile?: string;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  me: () => api.get<AuthUser>("/auth/me"),
  login: (username: string, password: string) =>
    api.post<AuthUser>("/auth/login", { username, password }),
  logout: () => api.post<void>("/auth/logout"),
  register: (data: { username: string; email: string; password: string; realName: string }) =>
    api.post<AuthUser>("/auth/register", data),
};

export const treesApi = {
  list: () => api.get<Tree[]>("/trees"),
  get: (id: number) => api.get<Tree>(`/trees/${id}`),
};
