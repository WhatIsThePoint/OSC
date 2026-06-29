import type { Slot } from "./types";

const BASE = "/api";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

type Options = {
  method?: string;
  body?: unknown;
};

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data && (typeof data.error === "string" ? data.error : data.error?.formErrors?.[0])) ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export function getVenueSlots(id: string): Promise<Slot[]> {
  return api<Slot[]>(`/venues/${id}/slots`);
}
