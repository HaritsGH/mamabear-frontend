import React from "react";
import { UseFormRegister, FieldValues } from "react-hook-form";
import { ExternalLink } from "lucide-react";

export const AI_MODEL_FIELDS = [
    {
        key: "ai_model_generation",
        label: "Model Jawaban Chatbot",
        hint: "Menyusun jawaban chatbot untuk pelanggan.",
        placeholder: "nvidia/nemotron-3-super-120b-a12b:free",
    },
    {
        key: "ai_model_guardrail",
        label: "Model Guardrail",
        hint: "Menyaring pertanyaan (medis, di luar topik) sebelum dijawab.",
        placeholder: "nvidia/nemotron-3-super-120b-a12b:free",
    },
    {
        key: "ai_model_embedding",
        label: "Model Embedding",
        hint: "Untuk pencarian produk. Mengganti model ini bisa butuh embedding ulang.",
        placeholder: "nvidia/nemotron-3-embed-1b:free",
    },
] as const;

const OPENROUTER_MODELS_URL = "https://openrouter.ai/models";

export const AiModelTab: React.FC<{ register: UseFormRegister<FieldValues> }> = ({
    register,
}) => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h2 className="text-font-3 md:text-font-4 font-bold text-[var(--mama-brown)]">
            Pengaturan Model AI
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AI_MODEL_FIELDS.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                    <label
                        htmlFor={field.key}
                        className="text-font-1 md:text-font-2 font-semibold text-[var(--mama-brown)]"
                    >
                        {field.label}
                    </label>
                    <input
                        id={field.key}
                        {...register(field.key)}
                        type="text"
                        autoComplete="off"
                        placeholder={field.placeholder}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-font-2 focus:outline-none focus:ring-2 focus:ring-[var(--mama-pink)] focus:border-[var(--mama-hot-pink)] transition-all"
                    />
                    <p className="text-font-1 text-[var(--color-gray)]">{field.hint}</p>
                </div>
            ))}
        </div>

        <p className="text-font-1 md:text-font-2 text-[var(--color-gray)]">
            Isi dengan ID model sesuai format OpenRouter (
            <code>penyedia/nama-model</code>). Cek daftar model yang tersedia di{" "}
            <a
                href={OPENROUTER_MODELS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[var(--mama-hot-pink)] hover:underline"
            >
                openrouter.ai/models
                <ExternalLink className="w-3.5 h-3.5" />
            </a>
            .
        </p>
    </div>
);