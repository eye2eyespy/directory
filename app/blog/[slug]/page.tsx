import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } });
  if (!post || post.status !== "PUBLISHED") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: post.publishedAt,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs uppercase tracking-wide text-primary">{post.category?.name}</p>
      <h1 className="serif mt-2 text-4xl text-navy md:text-5xl">{post.title}</h1>
      {post.publishedAt ? <p className="mt-3 text-sm text-ink-soft">{format(post.publishedAt, "MMMM d, yyyy")}</p> : null}
      {post.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.thumbnailUrl} alt="" className="mt-8 w-full rounded-sm object-cover" />
      ) : null}
      <div className="prose mt-8 max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
      <p className="mt-12 border-t border-line pt-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to all Guides
        </Link>
      </p>
    </article>
  );
}
