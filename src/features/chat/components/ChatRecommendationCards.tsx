"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { productService } from "@/features/products/services/productService";
import { ProductDetail } from "@/features/products/types/product.types";
import { formatIDR } from "../utils/recommendations";

export function ChatRecommendationCards({ slugs }: { slugs: string[] }) {
  const [items, setItems] = useState<ProductDetail[] | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    Promise.allSettled(slugs.map((slug) => productService.getProductBySlug(slug))).then((results) => {
      if (!active) return;
      const resolved = results
        .filter((r): r is PromiseFulfilledResult<ProductDetail> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter(Boolean)
        .slice(0, 3);
      setItems(resolved);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);

  if (items === null) {
    return (
      <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memuat rekomendasi...
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="mt-2 grid grid-cols-1 gap-2">
      {items.map((p) => (
        <Link
          key={p.slug}
          href={`/products/${p.slug}`}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm hover:border-[var(--mama-hot-pink)] hover:shadow-md transition-all"
        >
          <Image
            src={p.images?.[0]?.imageUrl || "/images/layout/logo.png"}
            alt={p.name}
            width={52}
            height={52}
            unoptimized
            className="w-[52px] h-[52px] rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-800 line-clamp-2 leading-tight">{p.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {Number(p.discountPercent) > 0 && p.originalPrice && (
                <span className="text-[10px] text-stone-400 line-through">{formatIDR(p.originalPrice)}</span>
              )}
              <span className="text-[13px] font-black text-red-500">
                {formatIDR(p.currentPrice ?? p.originalPrice ?? 0)}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}