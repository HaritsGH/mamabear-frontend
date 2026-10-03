"use client";
import React from "react";
import { PromoCode } from "../../types/AdminPromo.types";
import { usePromoList } from "../../hooks/usePromoList";
import PromoTable from "./PromoTable";
import DeletePromoModal from "./DeletePromoModal";

interface PromosListingClientProps {
  initialPromos: PromoCode[];
}

export default function PromosListingClient({ initialPromos }: PromosListingClientProps) {
  const { promos, isDeleting, promoToDelete, error, handleEdit, toggleActive, initiateDelete, cancelDelete, confirmDelete } = usePromoList(initialPromos);

  return (
    <div className="w-full flex flex-col gap-6">
      <DeletePromoModal isOpen={promoToDelete !== null} promo={promoToDelete} isDeleting={isDeleting !== null} onClose={cancelDelete} onConfirm={confirmDelete} />

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-100 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-font-3 font-bold text-[var(--mama-brown)]">Daftar Promo</h2>
          <p className="text-font-1 text-[var(--color-gray)] mt-1">Kode promo potongan ongkir yang berlaku untuk pelanggan</p>
        </div>
        <PromoTable promos={promos} isDeleting={isDeleting} onEdit={handleEdit} onToggle={toggleActive} onDelete={initiateDelete} />
      </div>
    </div>
  );
}
