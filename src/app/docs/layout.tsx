import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { source } from "@/lib/docs/source";
import "./docs.css";
import { RootProvider } from "fumadocs-ui/provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hideDevGuide, isDevGuideUrl, isDocsAdmin } from "@/lib/docs/access";

const baseOptions: BaseLayoutProps = {
  nav: {
    title: "MamaBear Docs",
    url: "/docs",
  },
  links: [
    {
      text: "User Guide",
      url: "/docs/user-guide/authentication",
      active: "nested-url",
    },
    {
      text: "Developer Guide",
      url: "/docs/developer-guide/getting-started",
      active: "nested-url",
    },
    {
      text: "Back to Store",
      url: "/",
      active: "none",
    },
  ],
  githubUrl: "https://github.com/HaritsGH/mamabear-frontend",
};

export default async function DocumentationLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions);
  const isAdmin = isDocsAdmin(session?.user?.role);

  // Non-admins never see Developer Guide entries in the sidebar or nav
  const tree = isAdmin ? source.pageTree : hideDevGuide(source.pageTree);
  const links = isAdmin
    ? baseOptions.links
    : baseOptions.links?.filter((link) => !("url" in link && link.url && isDevGuideUrl(link.url)));

  return (
    <div className="mamabear-docs">
      <RootProvider>
        <DocsLayout {...baseOptions} tree={tree} links={links}>
          {children}
        </DocsLayout>
      </RootProvider>
    </div>
  );
}
