import { ChevronRight, MessageSquareMore } from "lucide-react";

function formatWaNumber(raw: string): string {
  const local = raw.replace(/\D/g, "").replace(/^62/, "");
  return `+62 ${[local.slice(0, 3), local.slice(3, 7), local.slice(7)].filter(Boolean).join("-")}`;
}

export function ChatContactCard({ phone }: { phone: string }) {
  return (
    <a
      href={`https://api.whatsapp.com/send/?phone=${phone}&text&type=phone_number&app_absent=0`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm transition-all hover:border-[var(--mama-hot-pink)] hover:shadow-md whitespace-normal"
    >
      <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg bg-[var(--mama-pink)]">
        <MessageSquareMore className="w-6 h-6 text-[var(--mama-brown)]" strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold leading-tight text-stone-800">Hubungi Admin MamaBear</span>
        <span className="mt-0.5 block text-[13px] font-black text-red-500">{formatWaNumber(phone)}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-stone-300" />
    </a>
  );
}
