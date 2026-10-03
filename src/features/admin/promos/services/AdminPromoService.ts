import { ApiResponse } from "@/types/api.types";
import { PromoCode, PromoFormValues } from "../types/AdminPromo.types";
import { API_BASE_URL } from "@/lib/config";
import { getSession } from "next-auth/react";
import { authOptions } from "@/lib/auth";

async function getAuthHeaders(options: RequestInit = {}): Promise<Headers> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-type") && !(options.body instanceof FormData)) {
    headers.set("Content-type", "application/json");
  }

  let token: string | undefined;

  // Browser (Client): ambil token dari NextAuth session
  if (typeof window !== "undefined") {
    const session = await getSession();
    token = session?.accessToken;
  } else {
    // Server: ambil token via getServerSession
    try {
      const { getServerSession } = await import("next-auth/next");
      const session = await getServerSession(authOptions);
      token = session?.accessToken;
    } catch (e) {
      console.warn("[adminPromoService] Server-side session resolution failed:", e);
    }
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const body: ApiResponse<T> = await res.json();
  if (!body.success) {
    throw new Error(body.message || "Operasi promo gagal");
  }
  return body.data;
}

/*
 *  GET /admin/promos - list promo
 */
export async function fetchPromos(): Promise<PromoCode[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/promo-shipment`, {
      cache: "no-store",
      headers,
    });
    return await handleResponse<PromoCode[]>(res);
  } catch (error) {
    console.error("[adminPromoService] fetchPromos failed:", error);
    throw error;
  }
}

/*
 * POST /admin/promos — buat promo
 */
export async function createPromo(data: PromoFormValues): Promise<PromoCode> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/admin/promo-shipment`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<PromoCode>(res);
}

/** PATCH /admin/promo-shipment/:code — update / toggle isActive */
export async function updatePromo(code: string, data: Partial<PromoFormValues>): Promise<PromoCode> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/admin/promo-shipment/${encodeURIComponent(code)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<PromoCode>(res);
}

/** DELETE /admin/promo-shipment/:code — hapus promo */
export async function deletePromo(code: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/admin/promo-shipment/${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers,
  });
  await handleResponse<null>(res);
  return true;
}

export const adminPromoService = {
  fetchPromos,
  createPromo,
  updatePromo,
  deletePromo,
};
