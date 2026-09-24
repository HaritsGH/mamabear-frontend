import { Edit, Loader2, Trash2 } from "lucide-react";
import { PromoCode } from "../../types/AdminPromo.types";
import { formatIDR } from "@/lib/currency";

interface PromoTableProps {
  promos: PromoCode[];
  isDeleting: number | null;
  onEdit: (code: string) => void;
  onToggle: (promo: PromoCode) => void;
  onDelete: (promo: PromoCode) => void;
}

export default function PromoTable({ promos, isDeleting, onEdit, onToggle, onDelete }: PromoTableProps) {
  if (promos.length === 0) {
    return <div className="p-8 text-center text-[var(--color-gray)] text-font-2">Belum ada promo yang ditambahkan.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-font-1 text-[var(--color-gray)] uppercase tracking-wide border-b border-gray-100">
            <th className="px-6 py-3 font-semibold">Kode</th>
            <th className="px-6 py-3 font-semibold">Nama</th>
            <th className="px-6 py-3 font-semibold">Tipe</th>
            <th className="px-6 py-3 font-semibold">Nominal</th>
            <th className="px-6 py-3 font-semibold">Status</th>
            <th className="px-6 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {promos.map((promo) => (
            <tr key={promo.id} className="hover:bg-[var(--mama-pink)] hover:bg-opacity-20 transition-colors">
              <td className="px-6 py-4">
                <span className="font-mono font-bold text-[var(--mama-hot-pink)] bg-[var(--mama-pink)] bg-opacity-40 px-2 py-1 rounded-md">{promo.code}</span>
              </td>
              <td className="px-6 py-4 font-semibold text-[var(--mama-brown)]">{promo.name}</td>
              <td className="px-6 py-4">
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--mama-pink)] text-[var(--mama-brown)]">{promo.isPercentage ? "Persentase" : "Nominal"}</span>
              </td>
              <td className="px-6 py-4 text-[var(--color-gray)]">{promo.isPercentage ? `${promo.amount}%` : formatIDR(promo.amount)}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onToggle(promo)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${promo.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {promo.isActive ? "Aktif" : "Tidak Aktif"}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(promo.code)} className="p-2 text-[var(--color-gray)] hover:text-[var(--mama-brown)] hover:bg-white rounded-md transition-colors" title="Ubah Promo">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(promo)}
                    disabled={isDeleting === promo.id}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center min-w-[34px]"
                    title="Hapus Promo"
                  >
                    {isDeleting === promo.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
