"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";

const DEFAULT_PRESETS = [
  "Rumah",
  "Kantor",
  "Sekolah",
  "Apartemen",
  "Toko",
  "Gudang",
  "Orang Tua",
  "Keluarga",
];

interface LabelTagSelectProps {
  value: string;
  onChange: (value: string) => void;
  presets?: string[];
}

export function LabelTagSelect({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
}: LabelTagSelectProps) {
  const [customLabel, setCustomLabel] = useState("");

  const labels = value
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  const isSelected = (label: string) =>
    labels.some((l) => l.toLowerCase() === label.toLowerCase());

  const commit = (next: string[]) => {
    const unique: string[] = [];
    next.forEach((l) => {
      const trimmed = l.trim();
      if (
        trimmed &&
        !unique.some((u) => u.toLowerCase() === trimmed.toLowerCase())
      ) {
        unique.push(trimmed);
      }
    });
    onChange(unique.join(", "));
  };

  const handleTogglePreset = (label: string) => {
    if (isSelected(label)) {
      commit(labels.filter((l) => l.toLowerCase() !== label.toLowerCase()));
    } else {
      commit([...labels, label]);
    }
  };

  const handleRemoveLabel = (label: string) => {
    commit(labels.filter((l) => l.toLowerCase() !== label.toLowerCase()));
  };

  const handleAddCustomLabel = () => {
    if (!customLabel.trim()) return;
    commit([...labels, customLabel]);
    setCustomLabel("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {labels.map((lbl) => (
          <div
            key={lbl}
            className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-full shadow-sm text-font-2"
          >
            <span className="font-medium text-[var(--mama-brown)]">{lbl}</span>
            <button
              type="button"
              onClick={() => handleRemoveLabel(lbl)}
              className="text-gray-400 hover:text-red-500 transition-colors ml-1 p-0.5 rounded-full hover:bg-red-50"
              title={`Hapus label ${lbl}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {labels.length === 0 && (
          <p className="text-sm text-gray-500 italic px-2 py-1">
            Belum ada label. Klik preset di bawah atau tambah label baru.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleTogglePreset(preset)}
            className={`px-3 py-1 rounded-full text-font-2 font-medium transition-colors ${
              isSelected(preset)
                ? "bg-[var(--mama-hot-pink)] text-white border border-transparent"
                : "bg-white border border-gray-300 text-gray-700 hover:border-[var(--mama-hot-pink)] hover:text-[var(--mama-hot-pink)]"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-4 border-t border-gray-200">
        <input
          type="text"
          placeholder="Tambah label (mis. Kos, Kontrakan…)"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCustomLabel();
            }
          }}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-font-2 focus:outline-none focus:ring-2 focus:ring-[var(--mama-pink)] focus:border-[var(--mama-hot-pink)]"
        />
        <button
          type="button"
          onClick={handleAddCustomLabel}
          disabled={!customLabel.trim()}
          className="flex items-center justify-center gap-1 bg-[var(--mama-brown)] hover:bg-[#6c4e4e] text-white px-4 py-2 rounded-md font-medium text-font-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>
    </div>
  );
}