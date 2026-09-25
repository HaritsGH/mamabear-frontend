"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CheckoutStepper } from "@/features/checkout/components/shared/CheckoutStepper";
import { checkPaymentStatus } from "../services/paymentService";

interface CheckoutConfirmationViewProps {
  orderId: string;
}

const PAID_STATUSES = ["PAYMENT_PAID", "CONFIRMED", "PROCESSED"];

export function CheckoutConfirmationView({ orderId }: CheckoutConfirmationViewProps) {
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      for (let i = 0; i < 4; i++) {
        try {
          const order = await checkPaymentStatus(orderId);
          if (!cancelled) {
            setIsPaid(PAID_STATUSES.includes(order.status));
            if (isPaidByUs(PAID_STATUSES.includes(order.status))) return;
          }
        } catch (error) {
          // retry
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      if (!cancelled) setIsPaid(false);
    };

    // helper agar logika jelas
    function isPaidByUs(paid: boolean) {
      return paid;
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [orderId]);
  return (
    <div className="w-full animate-fade-in">
      <h1 className="text-font-5 font-bold text-[var(--mama-brown)] mb-8">Check Out</h1>

      <CheckoutStepper activeStep={3} />

      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        {isPaid === null ? (
          <p className="text-font-2 text-gray-500">Memverifikasi status pembayaran...</p>
        ) : isPaid ? (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-24 h-24 text-[var(--mama-hot-pink)]" />
            </div>
            <h2 className="text-font-4 font-bold text-[var(--mama-brown)]">Pembayaran Berhasil!</h2>
            <p className="text-font-2 text-gray-600 max-w-sm mx-auto">Terima kasih, pembayaran pesanan Mama telah kami terima. Kami akan segera memproses dan mengirimkan pesanan Anda.</p>
            <p className="text-font-1 text-gray-400">ID Pesanan: {orderId}</p>
          </>
        ) : (
          <>
            <h2 className="text-font-4 font-bold text-[var(--mama-brown)]">Menunggu Konfirmasi Pembayaran</h2>
            <p className="text-font-2 text-gray-600 max-w-sm mx-auto">Status pembayaran belum terkonfirmasi. Silakan cek daftar pesanan Anda untuk status terbaru.</p>
          </>
        )}

        <div className="pt-8">
          <Link href="/account/orders" className="inline-block bg-[var(--mama-hot-pink)] hover:bg-[#c24467] text-white font-bold py-4 px-12 rounded-full transition-colors text-font-3 uppercase min-w-[280px]">
            Lihat Daftar Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}
