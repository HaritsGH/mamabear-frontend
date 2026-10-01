"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CheckoutStepper } from "@/features/checkout/components/shared/CheckoutStepper";
import { checkPaymentStatus } from "../services/paymentService";
import { PAID_STATUSES } from "../types/payment.types";

interface CheckoutConfirmationViewProps {
  orderId: string;
}

const MAX_POLL_ATTEMPTS = 4;
const RETRY_DELAYS = [1000, 2000, 4000]; // jeda antar percobaan 1s, 2s, 4s

export function CheckoutConfirmationView({ orderId }: CheckoutConfirmationViewProps) {
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const poll = async () => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        if (cancelled) return;

        try {
          const order = await checkPaymentStatus(orderId);
          if (!cancelled && PAID_STATUSES.includes(order.status)) {
            setIsPaid(true);
            return;
          }
        } catch {
          // gagal — lanjut percobaan berikutnya
        }

        if (cancelled) return;
        if (attempt < MAX_POLL_ATTEMPTS - 1) {
          await sleep(RETRY_DELAYS[attempt] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1]);
        }
      }
      if (!cancelled) setIsPaid(false);
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, retryToken]);

  const handleRecheck = () => {
    setIsPaid(null);
    setRetryToken((t) => t + 1);
  };

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
            <p className="text-font-2 text-gray-500 max-w-sm mx-auto">Status pembayaran belum terkonfirmasi. Silakan cek daftar pesanan Anda untuk status terbaru.</p>
            <p className="text-font-1 text-gray-400">ID Pesanan: {orderId}</p>
            <button onClick={handleRecheck} className="inline-block bg-[var(--mama-pink)] hover:bg-[#f5b8c9] text-[var(--mama-brown)] font-bold py-3 px-8 rounded-full transition-colors text-font-2">
              Cek Ulang
            </button>
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
