// Centralized API client for ReservationSystem backend.

export type Role = "USER" | "ADMIN";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Ressource {
  id: number;
  name: string;
  category: "SPACE" | "EQUIPMENT" | "IT_INFRASTRUCTURE";
  status: "FREE" | "BUSY";
  availableQuantity: number;
}

export interface Reservation {
  id: number;
  quantity: number;
  startDateTime?: string;
  endDateTime?: string;
  user: { id: number; name?: string; email?: string };
  ressource: { id: number; name?: string };
}

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";

const TOKEN_KEY = "rs_token";
const USER_KEY = "rs_user";

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  set(token: string, user: AuthUser) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("rs-auth-change"));
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("rs-auth-change"));
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = auth.getToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch (e) {
    throw new ApiError(0, "Impossible de joindre le serveur");
  }

  if (res.status === 401) {
    auth.clear();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Session expirée, veuillez vous reconnecter");
  }
  if (res.status === 403) {
    throw new ApiError(403, "Accès refusé");
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data && (data as any).message) ||
      (typeof data === "string" ? data : "") ||
      `Erreur ${res.status}`;
    throw new ApiError(res.status, String(msg));
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  // Auth
  login(body: { email: string; password: string }) {
    return request<AuthResponse>("/api/auth/authenticate", {
      method: "POST",
      body: JSON.stringify({ ...body, role: "USER" }),
    });
  },
  register(body: { name: string; email: string; password: string; role: Role }) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Ressources
  listRessources() {
    return request<Ressource[]>("/api/ressources");
  },
  getRessource(id: number) {
    return request<Ressource>(`/api/ressources/${id}`);
  },
  createRessource(body: Omit<Ressource, "id">) {
    return request<Ressource>("/api/ressources", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateRessource(id: number, body: Omit<Ressource, "id">) {
    return request<Ressource>(`/api/ressources/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  deleteRessource(id: number) {
    return request<void>(`/api/ressources/${id}`, { method: "DELETE" });
  },

  // Reservations
  listReservations() {
    return request<Reservation[]>("/api/reservations");
  },
  createReservation(body: {
    quantity: number;
    startDateTime: string;
    endDateTime: string;
    ressource: { id: number };
  }) {
    return request<Reservation>("/api/reservations", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  deleteReservation(id: number) {
    return request<void>(`/api/reservations/${id}`, { method: "DELETE" });
  },
};
