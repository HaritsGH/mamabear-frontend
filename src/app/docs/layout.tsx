import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { source } from "@/lib/docs/source";
import "./docs.css";

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

export default function DocumentationLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="mamabear-docs">
      <DocsLayout tree={source.pageTree} {...baseOptions}>
        {children}
      </DocsLayout>
    </div>
  );
}
