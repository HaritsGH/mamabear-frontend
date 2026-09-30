export const RECOMMENDATION_LINE = /^REKOMENDASI\s+PRODUK:[ \t]*([^\n]*)$/m;
export const CONTACT_LINE = /^KONTAK\s+ADMIN:[ \t]*(62\d{8,13})[ \t]*$/m;

export function parseRecommendationSlugs(content: string): {
  text: string;
  slugs: string[];
} {
  const match = content.match(RECOMMENDATION_LINE);
  if (!match) return { text: content, slugs: [] };
  const slugs = Array.from(
    new Set(
      match[1]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 3);
  return { text: content.replace(RECOMMENDATION_LINE, "").trim(), slugs };
}

export function formatIDR(value: number | string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export function parseAssistantMessage(content: string): {
  text: string;
  slugs: string[];
  contactPhone: string | null;
} {
  const { text, slugs } = parseRecommendationSlugs(content);
  const match = content.match(CONTACT_LINE);
  return {
    text: text
      .replace(CONTACT_LINE, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    slugs,
    contactPhone: match ? match[1] : null,
  };
}
