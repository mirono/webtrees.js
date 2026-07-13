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

// ─── Individual types ─────────────────────────────────────────────────────────

export interface IndividualName {
  id: number;
  full: string;
  given?: string;
  surname?: string;
  type?: string;
  prefix?: string;
  suffix?: string;
}

export interface IndividualEvent {
  id: number;
  event_type: string;
  date?: string;
  place?: string;
  note?: string;
}

export interface Individual {
  id: number;
  gedcom_id: string;
  names: IndividualName[];
  events: IndividualEvent[];
  links: IndividualLink[];
  sex?: string;
  occupation?: string;
  father_id?: number;
  mother_id?: number;
}

export interface IndividualLink {
  id: number;
  role: string;
  family: { id: number; gedcom_id: string };
  individual: Individual;
}

// ─── Family types ──────────────────────────────────────────────────────────────

export interface Family {
  id: number;
  gedcom_id: string;
  husband?: Individual;
  wife?: Individual;
  children: Individual[];
  events: IndividualEvent[];
}

export interface TreeStats {
  individuals: number;
  families: number;
  sources: number;
  media: number;
  repositories: number;
  notes: number;
}

// ─── API endpoints ─────────────────────────────────────────────────────────────

export const individualsApi = {
  list: () => api.get<Individual[]>("/individuals"),
  get: (id: string) => api.get<Individual>(`/individuals/${id}`),
  ancestors: (id: string, depth = 3) =>
    api.get<Individual[]>(`/individuals/${id}/ancestors?depth=${depth}`),
  descendants: (id: string, depth = 3) =>
    api.get<Individual[]>(`/individuals/${id}/descendants?depth=${depth}`),
};

export const familiesApi = {
  list: () => api.get<Family[]>("/families"),
  get: (id: string) => api.get<Family>(`/families/${id}`),
};

export const searchApi = {
  search: (params: { q: string; treeId?: number; type?: string }) =>
    api.get<{ individuals: Individual[]; families: Family[] }>(
      `/search?q=${encodeURIComponent(params.q)}${params.treeId ? `&treeId=${params.treeId}` : ""}${params.type ? `&type=${params.type}` : ""}`
    ),
};

export const statsApi = {
  get: (treeId?: number) =>
    api.get<TreeStats>(`/stats${treeId ? `?treeId=${treeId}` : ""}`),
};

export interface CalendarEvent {
  id: number;
  type: string;
  date: string;
  place?: string;
  individual?: Individual;
  family?: Family;
}

export interface Place {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  individuals: number;
  families: number;
}

export interface MediaObject {
  id: number;
  filename: string;
  title: string;
  mimeType: string;
  url: string;
  thumbnail?: string;
  size: number;
  type: string;
  individuals: Individual[];
}

export const calendarApi = {
  getEvents: (params: { year: number; month?: number; day?: number; treeId?: number }) =>
    api.get<CalendarEvent[]>(
      `/calendar?year=${params.year}${params.month != null ? `&month=${params.month}` : ""}${params.day != null ? `&day=${params.day}` : ""}${params.treeId ? `&treeId=${params.treeId}` : ""}`
    ),
};

export const placesApi = {
  list: (params?: { treeId?: number; search?: string; limit?: number }) =>
    api.get<Place[]>(
      `/places${params?.search ? `?search=${encodeURIComponent(params.search)}` : ""}${params?.treeId ? `${params.search ? "&" : "?"}treeId=${params.treeId}` : ""}${params?.limit ? `${params.search || params.treeId ? "&" : "?"}limit=${params.limit}` : ""}`
    ),
  get: (id: string) => api.get<Place>(`/places/${id}`),
};

export const mediaApi = {
  list: (params?: { treeId?: number; type?: string }) =>
    api.get<MediaObject[]>(`/media${params?.treeId ? `?treeId=${params.treeId}` : ""}${params?.type ? `${params.treeId ? "&" : "?"}type=${params.type}` : ""}`),
  get: (id: string) => api.get<MediaObject>(`/media/${id}`),
};

export interface GedcomImportResult {
  individuals: number;
  families: number;
  sources: number;
  media: number;
  notes: number;
}

export const gedcomApi = {
  import: async (formData: FormData): Promise<GedcomImportResult> => {
    const res = await fetch("/api/gedcom/import", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Import failed" }));
      throw new ApiError(res.status, err.message, err);
    }
    return res.json() as Promise<GedcomImportResult>;
  },
};
