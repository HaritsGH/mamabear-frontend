import type { PageTree } from "fumadocs-core/server";
import { hideDevGuide, isDevGuideUrl, isDocsAdmin } from "./access";

describe("docs access", () => {
  it("treats only ADMIN and SUPERADMIN as docs admins", () => {
    expect(isDocsAdmin("ADMIN")).toBe(true);
    expect(isDocsAdmin("SUPERADMIN")).toBe(true);
    expect(isDocsAdmin("USER")).toBe(false);
    expect(isDocsAdmin(undefined)).toBe(false);
  });

  it("matches Developer Guide urls by path segment", () => {
    expect(isDevGuideUrl("/docs/developer-guide")).toBe(true);
    expect(isDevGuideUrl("/docs/developer-guide/chat")).toBe(true);
    expect(isDevGuideUrl("/docs/developer-guide-extra")).toBe(false);
    expect(isDevGuideUrl("/docs/user-guide/shopping")).toBe(false);
  });

  it("removes the Developer Guide folder from the page tree", () => {
    const tree: PageTree.Root = {
      name: "Docs",
      children: [
        { type: "page", name: "Home", url: "/docs" },
        {
          type: "folder",
          name: "User Guide",
          children: [{ type: "page", name: "Shopping", url: "/docs/user-guide/shopping" }],
        },
        {
          type: "folder",
          name: "Developer Guide",
          children: [
            { type: "page", name: "Chat", url: "/docs/developer-guide/chat" },
            { type: "page", name: "Testing", url: "/docs/developer-guide/testing" },
          ],
        },
      ],
    };

    const urls = JSON.stringify(hideDevGuide(tree));
    expect(urls).toContain("/docs/user-guide/shopping");
    expect(urls).not.toContain("/docs/developer-guide");
    expect(urls).not.toContain("Developer Guide");
  });
});
