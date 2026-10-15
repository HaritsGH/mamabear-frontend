import React, { Suspense } from "react";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function Unauthorized() {
  return (
    <>
      {/* Wrapped in Suspense to prevent CSR bailout from SearchBar's useSearchParams */}
      <Suspense fallback={<header className="h-16 md:h-20 w-full bg-[var(--mama-pink)] shadow-sm" />}>
        <Navbar />
      </Suspense>

      <main className="page-max-width min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-24 h-24 bg-[var(--mama-cream)] text-[var(--mama-hot-pink)] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[var(--mama-pink)]">
          <ShieldX size={48} strokeWidth={1.5} />
        </div>

        <h1 className="text-font-6 font-bold text-[var(--mama-brown)] mb-4">
          403 - Unauthorized
        </h1>
        <p className="text-font-2 text-[var(--color-gray)] max-w-xl mb-8 leading-relaxed">
          Maaf Ma, halaman ini hanya bisa diakses oleh admin.
        </p>

        <Link
          href="/"
          className="px-8 py-3 bg-[var(--mama-hot-pink)] text-white rounded-full font-bold hover:opacity-90 transition-opacity text-font-2 shadow-md"
        >
          Kembali ke Beranda
        </Link>
      </main>
      <Footer />
    </>
  );
}
