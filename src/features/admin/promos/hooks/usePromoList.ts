"use client";
import { PromoCode } from "../types/AdminPromo.types";
import { useState } from "react";
import { adminPromoService } from "../services/AdminPromoService";
import { useRouter } from "next/navigation";

export const usePromoList = (initialPromos: PromoCode[]) => {
  const router = useRouter();
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [promoToDelete, setPromoToDelete] = useState<PromoCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (code: string) => router.push(`/admin/promos/${encodeURIComponent(code)}/edit`);

  const toggleActive = async (promo: PromoCode) => {
    setError(null);
    try {
      const updated = await adminPromoService.updatePromo(promo.code, {
        isActive: !promo.isActive,
      });
      setPromos((prev) => prev.map((p) => (p.code === promo.code ? updated : p)));
    } catch (err) {
      console.error("Failed to toggle promo:", err);
      setError(err instanceof Error ? err.message : "Gagal mengubah status promo.");
    }
  };
  const initiateDelete = (promo: PromoCode) => setPromoToDelete(promo);
  const cancelDelete = () => {
    if (isDeleting === null) setPromoToDelete(null);
  };

  const confirmDelete = async () => {
    if (!promoToDelete) return;
    setIsDeleting(promoToDelete.id);
    setError(null);
    try {
      await adminPromoService.deletePromo(promoToDelete.code);
      setPromos((prev) => prev.filter((p) => p.code !== promoToDelete.code));
      setPromoToDelete(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete promo:", err);
      setError(err instanceof Error ? err.message : "Gagal menghapus promo.");
      setPromoToDelete(null);
    } finally {
      setIsDeleting(null);
    }
  };

  return {
    promos,
    isDeleting,
    promoToDelete,
    error,
    handleEdit,
    toggleActive,
    initiateDelete,
    cancelDelete,
    confirmDelete,
  };
};
