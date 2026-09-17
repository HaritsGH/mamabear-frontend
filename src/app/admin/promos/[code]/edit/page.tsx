import React from "react";
import { notFound } from "next/navigation";
import { adminPromoService } from "@/features/admin/promos/services/AdminPromoService";
import { PromoEditForm } from "@/features/admin/promos/components/edit/PromoEditForm";

export const dynamic = "force-dynamic";

export default async function AdminPromoEditPage({ params }: { params: { code: string } }) {
  const paramCode = params.code.toUpperCase();

  let promo = null;
  try {
    const promos = await adminPromoService.fetchPromos();
    promo = promos.find((p) => p.code.toUpperCase() === paramCode) || null;
  } catch (e) {
    console.error("[AdminPromoEditPage] SSR fetch failed:", e);
  }

  if (!promo) notFound();

  return <PromoEditForm initialData={promo} />;
}