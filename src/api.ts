// API client — typed fetchers for the FastAPI backend.
// In development, Vite proxies /api/* to http://localhost:8000 (see vite.config.ts).
// For a quick start without a backend, set VITE_USE_MOCK=1 and the mock server in ./mockApi.ts is used.

import type {
  Me,
  MealsTodayResponse,
  BatchOrderRequest,
  BatchOrderResponse,
  OrdersTodayResponse,
  AdminMealsRequest,
  AdminMealsGetResponse,
  AdminOrdersResponse,
  ApiError,
} from "./types";
import { mockApi } from "./mockApi";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1" || import.meta.env.VITE_USE_MOCK === "true";
const BASE = import.meta.env.VITE_API_BASE ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // In production this will be replaced by Okta bearer token
      Authorization: "Bearer mock-user-token",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: await res.text().catch(() => res.statusText),
    };
    throw err;
  }
  // Some endpoints (export CSV) don't return JSON; callers handle that directly.
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

// --- User endpoints ------------------------------------------------------

export const api = {
  getMe: (): Promise<Me> =>
    USE_MOCK ? mockApi.getMe() : request<Me>("/me"),

  getMealsToday: (): Promise<MealsTodayResponse> =>
    USE_MOCK ? mockApi.getMealsToday() : request<MealsTodayResponse>("/meals/today"),

  postOrdersBatch: (body: BatchOrderRequest): Promise<BatchOrderResponse> =>
    USE_MOCK
      ? mockApi.postOrdersBatch(body)
      : request<BatchOrderResponse>("/orders/batch", {
          method: "POST",
          body: JSON.stringify(body),
        }),

  getOrdersToday: (): Promise<OrdersTodayResponse> =>
    USE_MOCK ? mockApi.getOrdersToday() : request<OrdersTodayResponse>("/orders/today"),

  // --- Admin --------------------------------------------------------------

  postAdminMeals: (body: AdminMealsRequest): Promise<{ status: string }> =>
    USE_MOCK
      ? mockApi.postAdminMeals(body)
      : request<{ status: string }>("/admin/meals", {
          method: "POST",
          body: JSON.stringify(body),
        }),

  getAdminMeals: (date: string): Promise<AdminMealsGetResponse> =>
    USE_MOCK
      ? mockApi.getAdminMeals(date)
      : request<AdminMealsGetResponse>(`/admin/meals?date=${encodeURIComponent(date)}`),

  getAdminOrders: (date: string): Promise<AdminOrdersResponse> =>
    USE_MOCK
      ? mockApi.getAdminOrders(date)
      : request<AdminOrdersResponse>(`/admin/orders?date=${encodeURIComponent(date)}`),

  exportCsvUrl: (date: string): string =>
    `${BASE}/admin/export?date=${encodeURIComponent(date)}`,
};
