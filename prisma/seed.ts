import { PrismaClient, MediaType, MediaSource, BlogStatus, PromotionStatus, type Category, type Service } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setting(key: string, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("changeme", 12);

  await prisma.user.upsert({
    where: { email: "admin@local" },
    update: {},
    create: {
      email: "admin@local",
      name: "Directory Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  await setting("directoryName", "Florida Roofing Directory");
  await setting("tagline", "Find trusted local roofing contractors");
  await setting("contactEmail", "hello@example.com");
  await setting("theme", "marketplace");
  await setting("paperColor", "#FFFFFF");
  await setting("paper2Color", "#F4F6F5");
  await setting("inkColor", "#1A1D21");
  await setting("inkSoftColor", "#5C6570");
  await setting("primaryColor", "#2F8F3A");
  await setting("secondaryColor", "#1F3A2E");
  await setting("accentColor", "#F5C518");
  await setting("installed", "true");
  await setting("mediaPriority", "video,hero,google,logo,placeholder");
  await setting("rankingSponsored", "separate");
  await setting("rankingFeatured", "separate+highlight");
  await setting("organicSort", "relevance");

  const industry = await prisma.industry.upsert({
    where: { slug: "roofers" },
    update: {},
    create: {
      name: "Roofing Contractors",
      slug: "roofers",
      description: "Licensed local roofing contractors for repair, replacement, and new installation.",
      active: true,
      sortOrder: 0,
    },
  });

  const categoryNames = [
    ["Shingle Roofing", "shingle-roofing"],
    ["Metal Roofing", "metal-roofing"],
    ["Standing Seam", "standing-seam"],
    ["Stone-Coated Steel", "stone-coated-steel"],
    ["Tile Roofing", "tile-roofing"],
    ["Roof Repair", "roof-repair"],
    ["Commercial Roofing", "commercial-roofing"],
    ["Flat Roofing", "flat-roofing"],
    ["TPO Roofing", "tpo-roofing"],
    ["Storm Damage", "storm-damage"],
    ["Gutters", "gutters"],
  ];

  const categories: Category[] = [];
  for (const [i, [name, slug]] of categoryNames.entries()) {
    categories.push(
      await prisma.category.upsert({
        where: { industryId_slug: { industryId: industry.id, slug } },
        update: {},
        create: { industryId: industry.id, name, slug, sortOrder: i },
      }),
    );
  }

  const serviceNames = [
    ["Roof Replacement", "roof-replacement"],
    ["Roof Repair", "roof-repair"],
    ["Inspection", "inspection"],
    ["Storm Restoration", "storm-restoration"],
    ["Gutter Installation", "gutter-installation"],
    ["Commercial Installation", "commercial-installation"],
  ];
  const services: Service[] = [];
  for (const [i, [name, slug]] of serviceNames.entries()) {
    services.push(
      await prisma.service.upsert({
        where: { industryId_slug: { industryId: industry.id, slug } },
        update: {},
        create: { industryId: industry.id, name, slug, sortOrder: i },
      }),
    );
  }

  const customFieldDefs = [
    { name: "License Number", slug: "license-number", fieldType: "text" },
    { name: "Insurance Status", slug: "insurance-status", fieldType: "text" },
    { name: "Emergency Service", slug: "emergency-service", fieldType: "boolean" },
    { name: "Financing", slug: "financing", fieldType: "boolean" },
    { name: "Roofing Types", slug: "roofing-types", fieldType: "text" },
    { name: "Manufacturer Certifications", slug: "manufacturer-certifications", fieldType: "text" },
  ];
  for (const [i, field] of customFieldDefs.entries()) {
    await prisma.customField.upsert({
      where: { industryId_slug: { industryId: industry.id, slug: field.slug } },
      update: {},
      create: { ...field, industryId: industry.id, sortOrder: i },
    });
  }

  const florida = await prisma.state.upsert({
    where: { slug: "florida" },
    update: {},
    create: { name: "Florida", slug: "florida", abbr: "FL" },
  });

  const cityDefs = [
    { name: "Orlando", slug: "orlando", latitude: 28.5383, longitude: -81.3792 },
    { name: "Sarasota", slug: "sarasota", latitude: 27.3364, longitude: -82.5307 },
    { name: "Tampa", slug: "tampa", latitude: 27.9506, longitude: -82.4572 },
    { name: "Miami", slug: "miami", latitude: 25.7617, longitude: -80.1918 },
    { name: "Jacksonville", slug: "jacksonville", latitude: 30.3322, longitude: -81.6557 },
    { name: "Winter Park", slug: "winter-park", latitude: 28.6, longitude: -81.3392 },
  ];
  const cities = [];
  for (const city of cityDefs) {
    cities.push(
      await prisma.city.upsert({
        where: { stateId_slug: { stateId: florida.id, slug: city.slug } },
        update: {},
        create: { ...city, stateId: florida.id },
      }),
    );
  }

  const packages = [
    { name: "Featured Listing", slug: "featured", priceCents: 4500, description: "Get noticed with enhanced placement in the directory.", sortOrder: 1 },
    { name: "Sponsored Listing", slug: "sponsored", priceCents: 9500, description: "Put your business front and center with premium sponsored placement.", sortOrder: 2 },
    { name: "Homepage Featured", slug: "homepage-featured", priceCents: 19500, description: "Give your business premium exposure on the homepage.", sortOrder: 3 },
    { name: "Exclusive City Sponsor", slug: "exclusive-city-sponsor", priceCents: 49500, description: "Own the spotlight in your city with our highest-level advertising package.", sortOrder: 4 },
  ];
  for (const pkg of packages) {
    await prisma.promotionPackage.upsert({
      where: { slug: pkg.slug },
      update: { priceCents: pkg.priceCents, description: pkg.description },
      create: pkg,
    });
  }

  const cat = (slug: string) => categories.find((c) => c.slug === slug)!;
  const svc = (slug: string) => services.find((s) => s.slug === slug)!;

  type SeedBiz = {
    externalId: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    phone: string;
    websiteUrl: string;
    city: string;
    citySlug: string;
    lat: number;
    lng: number;
    rating: number;
    reviews: number;
    verified: boolean;
    featured: boolean;
    sponsored: boolean;
    homepageFeatured: boolean;
    yearEstablished: number;
    categories: string[];
    services: string[];
    video?: string;
    images: string[];
    awards?: { name: string; year: number; organization: string }[];
    credentials?: string[];
    reviewSnippets: { authorName: string; rating: number; text: string }[];
    serviceAreas: string[];
  };

  const businesses: SeedBiz[] = [
    {
      externalId: "ROOF-000001",
      name: "GMR Metal Roofs Florida",
      slug: "gmr-metal-roofs-florida",
      description:
        "GMR Metal Roofs Florida designs and installs standing-seam and stone-coated metal roofing for coastal and inland Florida homes. The team focuses on storm performance, manufacturer-backed systems, and clean job-site communication from inspection through final walkthrough.",
      shortDescription: "Standing-seam and stone-coated metal roofing for Florida homes and storm country.",
      phone: "(941) 555-0140",
      websiteUrl: "https://example.com/gmr",
      city: "Sarasota",
      citySlug: "sarasota",
      lat: 27.3364,
      lng: -82.5307,
      rating: 4.9,
      reviews: 185,
      verified: true,
      featured: true,
      sponsored: true,
      homepageFeatured: true,
      yearEstablished: 2006,
      categories: ["metal-roofing", "standing-seam", "stone-coated-steel", "roof-repair"],
      services: ["roof-replacement", "roof-repair", "inspection", "storm-restoration"],
      video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
      ],
      awards: [
        { name: "2026 Best Roofing Contractor", year: 2026, organization: "Gulf Coast Home Awards" },
        { name: "2025 Customer Service Award", year: 2025, organization: "Sarasota Business Council" },
      ],
      credentials: ["Licensed Contractor", "Manufacturer Certified", "Insured"],
      reviewSnippets: [
        { authorName: "Elena P.", rating: 5, text: "Fantastic company. The metal roof looks exact to the renderings and the crew protected the landscaping." },
        { authorName: "Marcus T.", rating: 5, text: "Excellent workmanship on our standing-seam replacement after the last storm season." },
        { authorName: "Priya S.", rating: 5, text: "Would definitely recommend. Clear pricing and they finished ahead of schedule." },
        { authorName: "Jon H.", rating: 5, text: "Great experience from inspection to final magnet sweep." },
        { authorName: "Dana R.", rating: 5, text: "Professional crew, daily photo updates, and a roof that already quieted a few noisy rooms." },
      ],
      serviceAreas: ["Sarasota", "Bradenton", "Venice", "Lakewood Ranch", "Siesta Key"],
    },
    {
      externalId: "ROOF-000002",
      name: "Orlando Ridge Roofing",
      slug: "orlando-ridge-roofing",
      description:
        "Central Florida shingle and repair specialists serving Orlando, Winter Park, and nearby suburbs. Orlando Ridge handles storm claims, full replacements, and leak diagnosis with documented photo reports.",
      shortDescription: "Shingle replacement, leak repair, and storm restoration in Greater Orlando.",
      phone: "(407) 555-0198",
      websiteUrl: "https://example.com/orlando-ridge",
      city: "Orlando",
      citySlug: "orlando",
      lat: 28.5383,
      lng: -81.3792,
      rating: 4.8,
      reviews: 142,
      verified: true,
      featured: true,
      sponsored: false,
      homepageFeatured: true,
      yearEstablished: 2012,
      categories: ["shingle-roofing", "roof-repair", "storm-damage", "gutters"],
      services: ["roof-replacement", "roof-repair", "storm-restoration", "gutter-installation"],
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
      ],
      credentials: ["Licensed Contractor", "Insured"],
      reviewSnippets: [
        { authorName: "Chris N.", rating: 5, text: "They found the leak in an afternoon and replaced the damaged valley the next morning." },
        { authorName: "Alicia M.", rating: 5, text: "Insurance paperwork was handled without drama. Roof looks sharp." },
        { authorName: "Ben K.", rating: 4, text: "Solid crew. A little weather delay, but communication stayed consistent." },
      ],
      serviceAreas: ["Orlando", "Winter Park", "Sanford", "Lake Mary", "Kissimmee", "Altamonte Springs"],
    },
    {
      externalId: "ROOF-000003",
      name: "Harborline Commercial Roofing",
      slug: "harborline-commercial-roofing",
      description:
        "TPO, modified bitumen, and flat roof systems for Tampa Bay warehouses, offices, and mixed-use buildings. Harborline schedules around operating hours and provides infrared moisture scans.",
      shortDescription: "Commercial TPO and flat roofing for Tampa Bay properties.",
      phone: "(813) 555-0166",
      websiteUrl: "https://example.com/harborline",
      city: "Tampa",
      citySlug: "tampa",
      lat: 27.9506,
      lng: -82.4572,
      rating: 4.7,
      reviews: 89,
      verified: true,
      featured: false,
      sponsored: true,
      homepageFeatured: false,
      yearEstablished: 1999,
      categories: ["commercial-roofing", "flat-roofing", "tpo-roofing"],
      services: ["commercial-installation", "inspection", "roof-repair"],
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
      ],
      credentials: ["Licensed Contractor", "OSHA Trained"],
      reviewSnippets: [
        { authorName: "Property Manager, Westshore", rating: 5, text: "Night work kept the building open. Zero interior leaks after the first summer storms." },
        { authorName: "Luis A.", rating: 4, text: "Competitive bid and a clean TPO install on our 42,000 sq ft warehouse." },
      ],
      serviceAreas: ["Tampa", "St. Petersburg", "Clearwater", "Brandon"],
    },
    {
      externalId: "ROOF-000004",
      name: "Tile & Barrel Miami",
      slug: "tile-and-barrel-miami",
      description:
        "Clay and concrete tile specialists for Miami-Dade and Broward. Tile & Barrel restores historic barrels, upgrades underlayment, and matches hurricane-rated fastening patterns.",
      shortDescription: "Clay and concrete tile roofing for Miami-Dade homes.",
      phone: "(305) 555-0112",
      websiteUrl: "https://example.com/tile-barrel",
      city: "Miami",
      citySlug: "miami",
      lat: 25.7617,
      lng: -80.1918,
      rating: 4.6,
      reviews: 73,
      verified: true,
      featured: true,
      sponsored: false,
      homepageFeatured: false,
      yearEstablished: 2008,
      categories: ["tile-roofing", "roof-repair", "storm-damage"],
      services: ["roof-replacement", "roof-repair", "inspection"],
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      ],
      credentials: ["Licensed Contractor", "Miami-Dade Approved Systems"],
      reviewSnippets: [
        { authorName: "Sofia L.", rating: 5, text: "Matched our 1920s barrels better than two other bids. Beautiful finish." },
      ],
      serviceAreas: ["Miami", "Coral Gables", "Miami Beach", "Fort Lauderdale"],
    },
    {
      externalId: "ROOF-000005",
      name: "First Coast Storm Roofs",
      slug: "first-coast-storm-roofs",
      description:
        "Jacksonville storm restoration and emergency tarping. First Coast documents wind damage, works with adjusters, and keeps occupied homes dry until replacement.",
      shortDescription: "Emergency tarping and storm restoration in Jacksonville.",
      phone: "(904) 555-0177",
      websiteUrl: "https://example.com/first-coast",
      city: "Jacksonville",
      citySlug: "jacksonville",
      lat: 30.3322,
      lng: -81.6557,
      rating: 4.5,
      reviews: 61,
      verified: false,
      featured: false,
      sponsored: false,
      homepageFeatured: false,
      yearEstablished: 2018,
      categories: ["storm-damage", "roof-repair", "shingle-roofing"],
      services: ["storm-restoration", "roof-repair", "inspection"],
      images: [
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
      ],
      credentials: ["Licensed Contractor"],
      reviewSnippets: [
        { authorName: "Heather B.", rating: 5, text: "They tarped the same night as the storm. Replacement was scheduled within a week." },
      ],
      serviceAreas: ["Jacksonville", "Orange Park", "St. Augustine"],
    },
    {
      externalId: "ROOF-000006",
      name: "Park Avenue Sheet Metal",
      slug: "park-avenue-sheet-metal",
      description:
        "Boutique metal and gutter work for Winter Park historic homes. Custom flashing, copper accents, and quiet standing-seam retrofits.",
      shortDescription: "Custom metal, copper, and gutters for Winter Park historic homes.",
      phone: "(407) 555-0133",
      websiteUrl: "https://example.com/park-avenue",
      city: "Winter Park",
      citySlug: "winter-park",
      lat: 28.6,
      lng: -81.3392,
      rating: 4.9,
      reviews: 44,
      verified: true,
      featured: false,
      sponsored: false,
      homepageFeatured: false,
      yearEstablished: 2015,
      categories: ["metal-roofing", "standing-seam", "gutters"],
      services: ["roof-replacement", "gutter-installation", "inspection"],
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
      ],
      credentials: ["Licensed Contractor", "Manufacturer Certified"],
      reviewSnippets: [
        { authorName: "Nadine W.", rating: 5, text: "Copper valleys on a 1930s bungalow. They treated the house like a museum piece." },
      ],
      serviceAreas: ["Winter Park", "Orlando", "Maitland"],
    },
  ];

  const weekdayHours = [
    { dayOfWeek: 0, closed: true },
    { dayOfWeek: 1, openTime: "08:00", closeTime: "18:00", closed: false },
    { dayOfWeek: 2, openTime: "08:00", closeTime: "18:00", closed: false },
    { dayOfWeek: 3, openTime: "08:00", closeTime: "18:00", closed: false },
    { dayOfWeek: 4, openTime: "08:00", closeTime: "18:00", closed: false },
    { dayOfWeek: 5, openTime: "08:00", closeTime: "18:00", closed: false },
    { dayOfWeek: 6, openTime: "10:00", closeTime: "16:00", closed: false },
  ];

  for (const biz of businesses) {
    const created = await prisma.business.upsert({
      where: { externalId: biz.externalId },
      update: {},
      create: {
        externalId: biz.externalId,
        industryId: industry.id,
        name: biz.name,
        slug: biz.slug,
        description: biz.description,
        shortDescription: biz.shortDescription,
        phone: biz.phone,
        websiteUrl: biz.websiteUrl,
        googleRating: biz.rating,
        googleReviewCount: biz.reviews,
        address1: "123 S Main St",
        city: biz.city,
        citySlug: biz.citySlug,
        state: "Florida",
        stateSlug: "florida",
        postalCode: "00000",
        country: "US",
        latitude: biz.lat,
        longitude: biz.lng,
        yearEstablished: biz.yearEstablished,
        verified: biz.verified,
        featured: biz.featured,
        sponsored: biz.sponsored,
        homepageFeatured: biz.homepageFeatured,
        published: true,
        seoTitle: `${biz.name} | ${biz.city}, FL Roofing`,
        metaDescription: biz.shortDescription,
        categories: {
          create: biz.categories.map((slug) => ({ categoryId: cat(slug).id })),
        },
        services: {
          create: biz.services.map((slug) => ({ serviceId: svc(slug).id })),
        },
        hours: { create: weekdayHours },
        locations: {
          create: biz.serviceAreas.map((city, i) => ({
            city,
            state: "FL",
            isPrimary: i === 0,
          })),
        },
        credentials: {
          create: (biz.credentials ?? []).map((name, i) => ({ name, sortOrder: i })),
        },
        awards: {
          create: (biz.awards ?? []).map((a) => a),
        },
        reviews: {
          create: biz.reviewSnippets.map((r, i) => ({ ...r, sortOrder: i })),
        },
        social: {
          create: [{ network: "facebook", url: "https://facebook.com" }],
        },
        media: {
          create: [
            ...(biz.video
              ? [
                  {
                    type: MediaType.VIDEO,
                    source: MediaSource.YOUTUBE,
                    url: biz.video,
                    thumbnailUrl: biz.images[0],
                    featured: true,
                    sortOrder: 0,
                    title: "Featured video",
                  },
                ]
              : []),
            ...biz.images.map((url, i) => ({
              type: MediaType.IMAGE,
              source: MediaSource.EXTERNAL,
              url,
              thumbnailUrl: url,
              featured: !biz.video && i === 0,
              sortOrder: i + 1,
              title: `${biz.name} photo ${i + 1}`,
            })),
          ],
        },
      },
    });

    const existingPromos = await prisma.businessPromotion.count({ where: { businessId: created.id } });
    if (existingPromos === 0) {
      if (biz.sponsored) {
        const sponsoredPkg = await prisma.promotionPackage.findUnique({ where: { slug: "sponsored" } });
        if (sponsoredPkg) {
          await prisma.businessPromotion.create({
            data: {
              businessId: created.id,
              packageId: sponsoredPkg.id,
              status: PromotionStatus.ACTIVE,
              startsAt: new Date(),
              complimentary: true,
              adminNote: "Launch seed",
            },
          });
        }
      }
      if (biz.featured) {
        const featuredPkg = await prisma.promotionPackage.findUnique({ where: { slug: "featured" } });
        if (featuredPkg) {
          await prisma.businessPromotion.create({
            data: {
              businessId: created.id,
              packageId: featuredPkg.id,
              status: PromotionStatus.ACTIVE,
              startsAt: new Date(),
              complimentary: true,
              adminNote: "Launch seed",
            },
          });
        }
      }
    }
  }

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
        "<p>Florida roofs fail from heat, wind, and water — not from a lack of product brochures. The right system depends on structure, HOA rules, and how you want the house to weather the next decade.</p><h2>Metal</h2><p>Standing seam and stone-coated steel shed wind-driven rain and often last longer than three shingle cycles. Fastening patterns and coastal coatings matter more than color charts.</p><h2>Tile</h2><p>Clay and concrete tile stay cooler and last, but they demand a structure that can carry the load and a crew that understands Miami-Dade fastening.</p><h2>Shingles</h2><p>Architectural shingles remain the fastest replacement path after a storm if underlayment and ventilation are specified correctly.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      categoryId: tips.id,
      publishedAt: new Date("2026-09-03"),
    },
    {
      title: "How to Hire a Local Contractor Without Guesswork",
      slug: "how-to-hire-a-local-contractor",
      excerpt: "License, insurance, written scope, and a few references beat the lowest bid. Use this checklist before you sign.",
      content:
        "<p>The cheapest quote is often the most expensive job. A clean hiring process protects the house and your calendar.</p><h2>Verify the company</h2><p>Ask for license number, insurance certificate, and a physical address. Match the name on the contract to the name on the policy.</p><h2>Compare scope, not just price</h2><p>Three bids only help if they describe the same work. Materials, tear-off, permits, and cleanup should be written down.</p><h2>Check recent work</h2><p>Call two local references from the last year. Ask whether the crew showed up, how they handled extras, and whether the punch list actually closed.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
      categoryId: hiring.id,
      publishedAt: new Date("2026-08-21"),
    },
    {
      title: "Storm Season Prep for Homeowners",
      slug: "storm-season-prep-for-homeowners",
      excerpt: "A two-hour walk-around before peak season catches loose flashing, clogged gutters, and weak trees.",
      content:
        "<p>Most storm damage starts as a small leak or a loose fastener. Walk the property while the weather is still calm.</p><h2>Outside</h2><p>Clear gutters, look for lifted shingles or open seams, and trim branches that can hit the roof. Photograph the exterior so you have a before record.</p><h2>Inside</h2><p>Check attic stains, test sump pumps, and know where the main water shutoff is. Store important documents in one bag.</p><h2>After the storm</h2><p>Do not climb a wet roof. Document damage from the ground, stop active leaks if it is safe, and call a licensed pro for tarping or repairs.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1527482797697-01785c6bc9dd?auto=format&fit=crop&w=1200&q=80",
      categoryId: homeCare.id,
      publishedAt: new Date("2026-08-08"),
    },
    {
      title: "10 Questions to Ask Before You Sign a Contract",
      slug: "questions-to-ask-before-you-sign",
      excerpt: "Who pulls the permit, what is excluded, and how change orders work. Ask these before a deposit leaves your account.",
      content:
        "<p>A contract should answer the awkward questions so you do not have to argue them on a job site.</p><h2>Who is doing the work?</h2><p>Ask whether employees or subcontractors will be on site, who supervises them, and how you reach someone after hours.</p><h2>What is not included?</h2><p>Deck boards, hidden rot, dump fees, and paint touch-up are common extras. Get exclusions in writing.</p><h2>How do payments work?</h2><p>Avoid large deposits. Tie payments to milestones, keep a retainage until final walkthrough, and never pay cash without a receipt.</p><h2>What happens if something fails?</h2><p>Get the warranty length, what voids it, and whether labor is covered or only materials.</p>",
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

  console.log("Seed complete. Admin login: admin@local / changeme");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
