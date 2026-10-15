import type { PageTree } from "fumadocs-core/server";

// Kept free of server-only imports: the Edge middleware uses this module too.
export const DEV_GUIDE_PREFIX = "/docs/developer-guide";

export function isDocsAdmin(role?: string | null): boolean {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export function isDevGuideUrl(url: string): boolean {
  return url === DEV_GUIDE_PREFIX || url.startsWith(`${DEV_GUIDE_PREFIX}/`);
}

function filterNodes(nodes: PageTree.Node[]): PageTree.Node[] {
  return nodes.flatMap((node): PageTree.Node[] => {
    if (node.type === "page") return isDevGuideUrl(node.url) ? [] : [node];
    if (node.type !== "folder") return [node];

    const index = node.index && !isDevGuideUrl(node.index.url) ? node.index : undefined;
    const children = filterNodes(node.children);
    if (!index && children.length === 0) return [];
    return [{ ...node, index, children }];
  });
}

/** Page tree without Developer Guide pages, for non-admin readers. */
export function hideDevGuide(tree: PageTree.Root): PageTree.Root {
  return { ...tree, children: filterNodes(tree.children) };
}
