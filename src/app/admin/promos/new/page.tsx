import { PromoCreateForm } from "@/features/admin/promos/components/new/PromoCreateForm";
import React from "react";

export default function AdminPromoCreatePage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-font-5 font-bold text-[var(--mama-brown)]">Promo</h1>
          <p className="text-font-2 text-[var(--color-gray)] mt-1">Buat kode promo baru</p>
        </div>
      </div>
      <PromoCreateForm />
    </div>
  );
}
