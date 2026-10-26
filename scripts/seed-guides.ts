import { PrismaClient, BlogStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tips = await prisma.blogCategory.upsert({
    where: { slug: "roofing-tips" },
    update: {},
    create: { name: "Roofing Tips", slug: "roofing-tips" },
  });
  const hiring = await prisma.blogCategory.upsert({
    where: { slug: "hiring-a-pro" },
    update: {},
    create: { name: "Hiring a Pro", slug: "hiring-a-pro" },
  });
  const homeCare = await prisma.blogCategory.upsert({
    where: { slug: "home-care" },
    update: {},
    create: { name: "Home Care", slug: "home-care" },
  });

  const guides = [
    {
      title: "Best Roofing Materials for Florida Homes",
      slug: "best-roofing-materials-for-florida-homes",
      excerpt: "Metal, tile, and architectural shingles each handle heat, wind, and salt air differently. Here is how to choose.",
      content:
        "<p>Florida roofs fail from heat, wind, and water — not from a lack of product brochures. The right system depends on structure, HOA rules, and how you want the house to weather the next decade.</p><h2>Metal</h2><p>Standing seam and stone-coated steel shed wind-driven rain and often last longer than three shingle cycles.</p><h2>Tile</h2><p>Clay and concrete tile stay cooler and last, but they demand a structure that can carry the load.</p><h2>Shingles</h2><p>Architectural shingles remain the fastest replacement path after a storm if underlayment and ventilation are specified correctly.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      categoryId: tips.id,
      publishedAt: new Date("2026-09-03"),
    },
    {
      title: "How to Hire a Local Contractor Without Guesswork",
      slug: "how-to-hire-a-local-contractor",
      excerpt: "License, insurance, written scope, and a few references beat the lowest bid. Use this checklist before you sign.",
      content:
        "<p>The cheapest quote is often the most expensive job. A clean hiring process protects the house and your calendar.</p><h2>Verify the company</h2><p>Ask for license number, insurance certificate, and a physical address.</p><h2>Compare scope, not just price</h2><p>Three bids only help if they describe the same work.</p><h2>Check recent work</h2><p>Call two local references from the last year.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
      categoryId: hiring.id,
      publishedAt: new Date("2026-08-21"),
    },
    {
      title: "Storm Season Prep for Homeowners",
      slug: "storm-season-prep-for-homeowners",
      excerpt: "A two-hour walk-around before peak season catches loose flashing, clogged gutters, and weak trees.",
      content:
        "<p>Most storm damage starts as a small leak or a loose fastener. Walk the property while the weather is still calm.</p><h2>Outside</h2><p>Clear gutters, look for lifted shingles, and trim branches that can hit the roof.</p><h2>Inside</h2><p>Check attic stains and know where the main water shutoff is.</p><h2>After the storm</h2><p>Do not climb a wet roof. Document damage from the ground and call a licensed pro.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1527482797697-01785c6bc9dd?auto=format&fit=crop&w=1200&q=80",
      categoryId: homeCare.id,
      publishedAt: new Date("2026-08-08"),
    },
    {
      title: "10 Questions to Ask Before You Sign a Contract",
      slug: "questions-to-ask-before-you-sign",
      excerpt: "Who pulls the permit, what is excluded, and how change orders work. Ask these before a deposit leaves your account.",
      content:
        "<p>A contract should answer the awkward questions so you do not have to argue them on a job site.</p><h2>Who is doing the work?</h2><p>Ask whether employees or subcontractors will be on site.</p><h2>What is not included?</h2><p>Get exclusions in writing.</p><h2>How do payments work?</h2><p>Tie payments to milestones and keep a retainage until final walkthrough.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
      categoryId: hiring.id,
      publishedAt: new Date("2026-07-18"),
    },
  ];

  for (const guide of guides) {
    await prisma.blogPost.upsert({
      where: { slug: guide.slug },
      update: {
        title: guide.title,
        excerpt: guide.excerpt,
        content: guide.content,
        thumbnailUrl: guide.thumbnailUrl,
        categoryId: guide.categoryId,
        status: BlogStatus.PUBLISHED,
        publishedAt: guide.publishedAt,
      },
      create: {
        ...guide,
        authorName: "Editorial Team",
        status: BlogStatus.PUBLISHED,
        seoTitle: guide.title,
        metaDescription: guide.excerpt,
      },
    });
  }

  console.log(`Guides ready: ${guides.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
