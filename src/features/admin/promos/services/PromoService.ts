import { apiClient } from "@/lib/api";

export interface ValidatePromoResult {
  valid: boolean;
  name?: string;
  discountAmount?: number;
  isPercentage?: boolean;
  amount?: number;
  message?: string;
}

export async function validatePromo(code: string): Promise<ValidatePromoResult> {
  try {
    const res = await apiClient.get(`/promo-shipment/${code.trim().toUpperCase()}`);
    const body = await res.json();
    const data = body?.data ?? {};
    const promo = data?.promo;
    if (res.ok && promo) {
      return {
        valid: true,
        name: promo.name,
        discountAmount: promo.amount,
        isPercentage: promo.isPercentage,
        amount: promo.amount,
        message: data.message,
      };
    }
    return {
      valid: false,
      message: body?.message || "Kode promo tidak valid",
    };
  } catch (error) {
    console.error("[promoService] validatePromo failed:", error);
    throw error;
  }
}

export async function consumePromo(code: string): Promise<ValidatePromoResult> {
  try {
    const res = await apiClient.post("/promo-shipment", { code });
    const body = await res.json();
    if (res.ok) {
      return {
        valid: true,
        message: body?.message || "Kode promo berhasil digunakan",
      };
    }
    return {
      valid: false,
      message: body?.message || "Kode promo gagal digunakan",
    };
  } catch (error) {
    console.error("[promoService] consumePromo failed:", error);
    throw error;
  }
}
