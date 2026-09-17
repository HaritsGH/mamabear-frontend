import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/features/cart/store/use-cart-store";
import { cartService } from "@/features/cart/services/cartService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { validatePromo } from "@/features/admin/promos/services/PromoService";

export const useCartLogic = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const items = useCartStore((state) => state.items);
  const isLoading = useCartStore((state) => state.isLoading);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const selectedIds = useMemo(() => new Set((items || []).map((i) => i.id)), [items]);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [appliedPromoDiscount, setAppliedPromoDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/cart")}`);
      return;
    }
    try {
      const result = await validatePromo(promoCode);
      if (result.valid) {
        setAppliedPromo(promoCode.trim().toUpperCase());
        setAppliedPromoDiscount(result.discountAmount ?? 0);
        setPromoError(null);
        toast.success("Berhasil", {
          description: "Kode promo berhasil digunakan",
        });
      } else {
        setAppliedPromo(null);
        setAppliedPromoDiscount(0);
        setPromoError(result.message || "Kode promo tidak valid");
        toast.error("Gagal", {
          description: result.message || "Kode promo tidak valid",
        });
      }
    } catch (error) {
      console.error("Promo validation error:", error);
      setAppliedPromo(null);
      setPromoError("Terjadi kesalahan saat memvalidasi kode promo.");
      toast.error("Gagal", { description: "Terjadi kesalahan saat memvalidasi kode promo." });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast.success("Produk dihapus dari keranjang");
    } catch {
      toast.error("Gagal menghapus produk");
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item && quantity > item.variant.stock) {
      toast.error(`Stok maksimum tercapai (Sisa: ${item.variant.stock})`);
      return;
    }
    try {
      await updateQuantity(itemId, quantity);
    } catch {
      toast.error("Gagal memperbarui jumlah produk");
    }
  };

  const handleRemoveSelected = async () => {
    if (!items || items.length === 0) return;

    try {
      await clearCart();
      toast.success("Keranjang berhasil dikosongkan");
    } catch {
      toast.error("Gagal mengosongkan keranjang");
    }
  };

  const handleCheckout = async () => {
    const itemsQuery = items.map((i) => i.id).join(",");
    const promoQuery = appliedPromo ? `&promo=${encodeURIComponent(appliedPromo)}` : "";
    const targetUrl = `/checkout?items=${itemsQuery}${promoQuery}`;

    // 1. Immediately redirect guests to login BEFORE running any validation
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
      return;
    }

    // 2. Only run cart validation if the user is already authenticated
    setIsCheckingOut(true);
    try {
      const validation = await cartService.validateCart();

      if (!validation.valid) {
        toast.error("Perhatian", {
          description: "Ada perubahan stok pada produk. Memuat ulang keranjang...",
        });
        await useCartStore.getState().initializeCart();
        setIsCheckingOut(false);
        return;
      }

      router.push(targetUrl);
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Error", {
        description: "Terjadi kesalahan saat memvalidasi keranjang. Silakan coba lagi.",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const { subtotal, totalQuantity } = useMemo(() => {
    let subtotal = 0;
    let totalQuantity = 0;
    const safeItems = items || [];

    safeItems.forEach((item) => {
      subtotal += Number(item.price) * item.quantity;
      totalQuantity += item.quantity;
    });

    return { subtotal, totalQuantity };
  }, [items]);

  const discountAmount = appliedPromoDiscount ?? 0;
  const grandTotal = subtotal;

  const missingForFreeShipping = Math.max(0, 500000 - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / 500000) * 100);

  const handlePromoCodeChange = (val: string) => {
    setPromoCode(val);
    if (promoError) setPromoError(null);
  };

  return {
    items: items || [],
    isLoading,
    isLoggedIn,
    selectedIds,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    handleRemoveSelected,
    handleCheckout,
    subtotal,
    totalQuantity,
    grandTotal,
    discountAmount,
    appliedPromoDiscount,
    missingForFreeShipping,
    freeShippingProgress,
    promoCode,
    setPromoCode,
    handlePromoCodeChange,
    promoError,
    appliedPromo,
    handleApplyPromo,
    isCheckingOut,
  };
};
