import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import Link from "next/link";

async function createPost(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await prisma.blogPost.create({
    data: {
      title,
      slug: slugify(title),
      excerpt: String(formData.get("excerpt") ?? "") || null,
      content: String(formData.get("content") ?? ""),
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || null,
      authorName: session.user.name ?? "Admin",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-navy">Guides</h1>
      <form action={createPost} className="mt-6 max-w-2xl space-y-3 rounded-sm border border-line bg-white p-5">
        <div>
          <Label>Title</Label>
          <Input name="title" required />
        </div>
        <div>
          <Label>Excerpt</Label>
          <Input name="excerpt" />
        </div>
        <div>
          <Label>Thumbnail URL</Label>
          <Input name="thumbnailUrl" />
        </div>
        <div>
          <Label>Content (HTML)</Label>
          <Textarea name="content" rows={8} />
        </div>
        <Button type="submit">Publish</Button>
      </form>
      <ul className="mt-8 divide-y divide-line rounded-sm border border-line bg-white">
        {posts.map((post) => (
          <li key={post.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              {post.title} <span className="text-ink-soft">({post.status})</span>
            </span>
            {post.status === "PUBLISHED" ? (
              <Link href={`/blog/${post.slug}`} className="text-primary">
                View
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
