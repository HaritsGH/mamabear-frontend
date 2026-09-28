import type { Metadata } from "next";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { source } from "@/lib/docs/source";

type DocumentationPageProps = {
  params: { slug?: string[] };
};

export default function DocumentationPage({ params }: DocumentationPageProps) {
  const page = source.getPage(params.slug);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export function generateMetadata({
  params,
}: DocumentationPageProps): Metadata {
  const page = source.getPage(params.slug);

  if (!page) notFound();

  return {
    title: `${page.data.title} | MamaBear Docs`,
    description: page.data.description,
  };
}
