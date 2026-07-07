import { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryProducts from "@/components/CategoryProducts";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} | Zoberry Enterprise`,
    description: `Browse products in ${name} category`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return (
    <main>
      <CategoryProducts slug={slug} />
    </main>
  );
}
