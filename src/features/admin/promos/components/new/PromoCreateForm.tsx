"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PromoFormValues } from "../../types/AdminPromo.types";
import { adminPromoService } from "../../services/AdminPromoService";

export const PromoCreateForm = () => {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<PromoFormValues>({
    defaultValues: { name: "", code: "", isPercentage: false, amount: 0, isActive: true },
  });

  const isPercentage = watch("isPercentage");
  const isActiveValue = watch("isActive");

  const normalizeCode = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue("code", e.target.value.toUpperCase(), { shouldValidate: true });

  const handlePercentageChange = (value: boolean) => {
    setValue("isPercentage", value, { shouldValidate: true, shouldDirty: true });
    // Trigger revalidasi amount saat berpindah tipe
    trigger("amount");
  };

  const onSubmit = async (data: PromoFormValues) => {
    try {
      setError(null);
      await adminPromoService.createPromo({
        ...data,
        code: data.code.trim().toUpperCase(),
        amount: Number(data.amount),
      });
      toast.success(`Promo ${data.code} berhasil dibuat`);
      router.push("/admin/promos");
      router.refresh();
    } catch (err) {
      console.error("Create promo error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat membuat promo.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-font-3 font-bold text-[var(--mama-brown)]">Tambah Promo Baru</h2>
        </div>

        {error && <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-font-2">{error}</div>}

        <div className="p-6 flex flex-col gap-6">
          {/* Nama */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-font-2 font-bold text-[var(--mama-brown)]">
              Nama Promo
            </label>
            <input
              id="name"
              type="text"
              placeholder="mis., Promo Akhir Tahun"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--mama-pink)] focus:border-[var(--mama-hot-pink)] transition-all text-font-2 text-gray-800 disabled:bg-gray-50"
              {...register("name", { required: "Nama promo wajib diisi" })}
            />
            {errors.name && <span className="text-red-500 text-font-1">{errors.name.message}</span>}
          </div>

          {/* Kode */}
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-font-2 font-bold text-[var(--mama-brown)]">
              Kode Promo
            </label>
            <input
              id="code"
              type="text"
              placeholder="mis., GRATIS20"
              disabled={isSubmitting}
              className="w-full uppercase px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--mama-pink)] focus:border-[var(--mama-hot-pink)] transition-all text-font-2 text-gray-800 disabled:bg-gray-50"
              {...register("code", { required: "Kode promo wajib diisi", onChange: normalizeCode })}
            />
            {errors.code && <span className="text-red-500 text-font-1">{errors.code.message}</span>}
          </div>

          {/* Tipe Promo */}
          <div className="flex flex-col gap-2">
            <label className="text-font-2 font-bold text-[var(--mama-brown)]">Tipe Promo</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isPercentage"
                  checked={!isPercentage}
                  disabled={isSubmitting}
                  onChange={() => handlePercentageChange(false)}
                />
                <span className="text-font-2 text-[var(--color-gray)]">Nominal (Rp)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isPercentage"
                  checked={Boolean(isPercentage)}
                  disabled={isSubmitting}
                  onChange={() => handlePercentageChange(true)}
                />
                <span className="text-font-2 text-[var(--color-gray)]">Persentase (%)</span>
              </label>
            </div>
          </div>

          {/* Nominal / Persentase */}
          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className="text-font-2 font-bold text-[var(--mama-brown)]">
              {isPercentage ? "Persentase (%)" : "Nominal (Rp)"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gray)] font-semibold">
                {isPercentage ? "%" : "Rp"}
              </span>
              <input
                id="amount"
                type="number"
                min={isPercentage ? 1 : 0.01}
                max={isPercentage ? 100 : undefined}
                disabled={isSubmitting}
                className="w-full pl-14 pr-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--mama-pink)] focus:border-[var(--mama-hot-pink)] transition-all text-font-2 text-gray-800 disabled:bg-gray-50"
                {...register("amount", {
                  required: "Nominal wajib diisi",
                  valueAsNumber: true,
                  validate: (v) =>
                    (isPercentage ? v > 0 && v <= 100 : v > 0) ||
                    (isPercentage ? "Persentase harus 1–100" : "Nominal harus lebih dari 0"),
                })}
              />
            </div>
            {errors.amount && <span className="text-red-500 text-font-1">{errors.amount.message}</span>}
          </div>

          {/* Toggle isActive */}
          <div className="flex flex-col gap-2">
            <label className="text-font-2 font-bold text-[var(--mama-brown)]">Status Promo</label>
            <label className="relative inline-flex items-center cursor-pointer w-max group">
              <input type="checkbox" className="sr-only peer" disabled={isSubmitting} {...register("isActive")} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--mama-pink)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--mama-hot-pink)] disabled:opacity-50 disabled:cursor-not-allowed group-hover:after:scale-95"></div>
              <span className={`ml-3 text-font-2 font-medium transition-colors ${isActiveValue ? "text-[var(--mama-hot-pink)]" : "text-gray-500"}`}>
                {isActiveValue ? "Aktif" : "Tidak Aktif"}
              </span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center gap-4 bg-gray-50 bg-opacity-50">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[var(--mama-hot-pink)] text-white px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity text-font-2 font-semibold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Buat Promo"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/promos")}
            disabled={isSubmitting}
            className="bg-white text-[var(--color-gray)] border border-gray-200 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-font-2 font-semibold disabled:opacity-70"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};