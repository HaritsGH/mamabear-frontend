import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { createFromSource, createSearchAPI } from "fumadocs-core/search/server";
import { authOptions } from "@/lib/auth";
import { isDevGuideUrl, isDocsAdmin } from "@/lib/docs/access";
import { source } from "@/lib/docs/source";

const adminSearch = createFromSource(source);

// Separate index so Developer Guide content never reaches non-admin results
const publicSearch = createSearchAPI("advanced", {
  indexes: source
    .getPages()
    .filter((page) => !isDevGuideUrl(page.url))
    .map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const search = isDocsAdmin(session?.user?.role) ? adminSearch : publicSearch;
  return search.GET(request);
}
