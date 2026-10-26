import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Guides",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-5xl font-bold tracking-tight text-navy">Guides</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            {post.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.thumbnailUrl} alt="" className="h-48 w-full object-cover" />
            ) : null}
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-primary">{post.category?.name}</p>
              <h2 className="serif mt-1 text-2xl">{post.title}</h2>
              <p className="mt-2 text-sm text-ink-soft">{post.excerpt}</p>
              {post.publishedAt ? (
                <p className="mt-3 text-xs text-ink-soft">{format(post.publishedAt, "MMMM d, yyyy")}</p>
              ) : null}
              <span className="mt-3 inline-block text-sm font-semibold text-primary">Read more</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
