import AdminPromosHeader from "@/features/admin/promos/components/listing/AdminPromosHeader";
import PromosListingClient from "@/features/admin/promos/components/listing/PromosListingClient";
import { adminPromoService } from "@/features/admin/promos/services/AdminPromoService";
import { PromoCode } from "@/features/admin/promos/types/AdminPromo.types";
import React from "react";

export default async function page() {
  let initialPromos: PromoCode[] = [];

  // SSR fetch via getServerSession (auth token dipasang di dalam service).
  // Bila gagal (backend belum ada / auth bermasalah), jatuh ke list kosong
  // dan PromosListingClient tetap merender dengan state loading/error-nya.
  try {
    initialPromos = await adminPromoService.fetchPromos();
  } catch (error) {
    console.error("[AdminPromosPage] SSR fetch failed:", error);
  }

  return (
    <div className="page-max-width p-6 min-h-screen">
      <AdminPromosHeader />
      <PromosListingClient initialPromos={initialPromos} />
    </div>
  );
}
