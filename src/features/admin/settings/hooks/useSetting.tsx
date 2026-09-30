import { useState, useMemo } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { useRouter } from "next/navigation";
import { updateSettingByKey } from "../services/settingService";
import { Setting } from "@/features/admin/settings/types/setting.types";

const RAW_JSON_KEYS = ["courier", "payment_type"];

export const useSettings = (initialSettings: Setting[], managedKeys: string[] = []) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noChanges, setNoChanges] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const mappedValues = useMemo(() => {
    const values: FieldValues = {};

    initialSettings.forEach((setting) => {
      if (RAW_JSON_KEYS.includes(setting.key)) {
        try {
          values[setting.key] = JSON.stringify(JSON.parse(setting.value), null, 2);
        } catch {
          values[setting.key] = setting.value;
        }
      } else if (setting.type === "boolean" || setting.value === "true" || setting.value === "false") {
        values[setting.key] = setting.value === "true";
      } else {
        // Clear out corrupted string "[object Object]" from backend so UI shows an empty input
        values[setting.key] = setting.value === "[object Object]" ? "" : setting.value;
      }
    });

    return values;
  }, [initialSettings]);

  const form = useForm<FieldValues>({
    defaultValues: mappedValues,
    // values: mappedValues,
  });

  const onSubmit = async (data: FieldValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    setNoChanges(false);

    try {
      const settingsByKey = new Map(initialSettings.map((s) => [s.key, s]));
      // managedKeys ikut diproses walau belum ada di DB, supaya admin tetap
      // bisa mengisi key AI baru dan backend menyimpannya lewat upsert.
      const keysToSync = new Set<string>([...settingsByKey.keys(), ...managedKeys]);

      const updatePromises: {
        key: string;
        promise: Promise<Setting>;
      }[] = [];

      for (const key of keysToSync) {
        const setting = settingsByKey.get(key);
        const rawNew = data[key];

        // Key ini ada di DB tapi tidak dirender di tab mana pun.
        // Mengirim "" di sini akan MENGHAPUS nilainya, jadi dilewati.
        if (rawNew === undefined) continue;

        let newValue: string;
        let originalValue = setting?.value ?? "";

        if (RAW_JSON_KEYS.includes(key)) {
          try {
            newValue = JSON.stringify(JSON.parse(rawNew));
            originalValue = JSON.stringify(JSON.parse(setting?.value ?? ""));
          } catch {
            newValue = String(rawNew);
          }
        } else if (setting?.type === "boolean" || typeof rawNew === "boolean") {
          newValue = String(rawNew);
        } else if (typeof rawNew === "object" && rawNew !== null) {
          const extractedString = Object.values(rawNew)[0];
          newValue = extractedString ? String(extractedString) : "";
        } else {
          newValue = String(rawNew);
        }

        if (originalValue === "[object Object]" && newValue !== "[object Object]") {
          originalValue = "CORRUPTED_FORCE_UPDATE";
        }

        if (newValue !== originalValue) {
          updatePromises.push({
            key,
            promise: updateSettingByKey(key, newValue),
          });
        }
      }

      if (updatePromises.length === 0) {
        // Sebelumnya return tanpa apa-apa, jadi admin menekan Simpan dan
        // tidak melihat apa pun terjadi. Sekarangogenesis diberi tahu.
        setNoChanges(true);
        setTimeout(() => setNoChanges(false), 3000);
        return;
      }

      // allSettled, bukan Promise.all: kalau satu setting gagal, setting
      // lain yang sudah terkirim tidak boleh disembunyikan di balik satu
      // pesan error generik.
      const results = await Promise.allSettled(updatePromises.map((u) => u.promise));

      const failed = results
        .map((result, i) => ({
          result,
          key: updatePromises[i].key,
        }))
        .filter(({ result }) => result.status === "rejected");

      if (failed.length > 0) {
        setSubmitError(failed.length === results.length ? "Gagal menyimpan pengaturan. Coba lagi." : `Sebagian tersimpan, ${failed.length} gagal: ${failed.map((f) => f.key).join(", ")}`);
        return;
      }

      form.reset(data);
      setSubmitSuccess(true);
      router.refresh();

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("[useSettings] Error updating settings:", error);
      setSubmitError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    submitError,
    submitSuccess,
    noChanges,
  };
};
