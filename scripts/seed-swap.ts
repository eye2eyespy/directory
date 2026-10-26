import { PrismaClient, type SwapFormMode } from "@prisma/client";

const prisma = new PrismaClient();

const categories: {
  name: string;
  slug: string;
  description: string;
  formMode: SwapFormMode;
  sortOrder: number;
  fields: { name: string; slug: string; fieldType: "text" | "select"; options?: string; required?: boolean }[];
}[] = [
  {
    name: "General goods",
    slug: "general-goods",
    description: "Furniture, gear, household items, and anything else with a price.",
    formMode: "GOODS",
    sortOrder: 0,
    fields: [
      {
        name: "Condition",
        slug: "condition",
        fieldType: "select",
        options: "New\nLike new\nGood\nFair",
        required: true,
      },
    ],
  },
  {
    name: "Apparel",
    slug: "apparel",
    description: "Clothing, shoes, and accessories.",
    formMode: "APPAREL",
    sortOrder: 1,
    fields: [
      { name: "Size", slug: "size", fieldType: "select", options: "XS\nS\nM\nL\nXL\nXXL\nOther", required: true },
      { name: "Color", slug: "color", fieldType: "text", required: true },
      {
        name: "Condition",
        slug: "condition",
        fieldType: "select",
        options: "New with tags\nLike new\nGood\nFair",
        required: true,
      },
    ],
  },
  {
    name: "Digital goods",
    slug: "digital-goods",
    description: "Files, codes, and other items that are delivered online.",
    formMode: "DIGITAL",
    sortOrder: 2,
    fields: [],
  },
  {
    name: "Services",
    slug: "services",
    description: "Time, skills, and local help. Agree on a time in messages.",
    formMode: "SERVICE",
    sortOrder: 3,
    fields: [],
  },
];

const spots = [
  {
    name: "Main library lobby",
    slug: "main-library-lobby",
    address: "100 Public Square",
    city: "Tampa",
    region: "FL",
    postalCode: "33602",
    notes: "Meet inside by the front desk. Replace this example with a real place.",
    meetingTip: "Meet inside the public lobby during open hours. Tell someone where you are going.",
    latitude: 27.9506,
    longitude: -82.4572,
    cameraMonitored: true,
    wellLit: true,
    publicIndoor: true,
  },
  {
    name: "Community center entrance",
    slug: "community-center-entrance",
    address: "200 Community Way",
    city: "Tampa",
    region: "FL",
    postalCode: "33602",
    notes: "Meet at the main entrance. Replace this example with a real place.",
    meetingTip: "Stay in the public entrance. Inspect the item before you exchange payment.",
    latitude: 27.947,
    longitude: -82.464,
    cameraMonitored: false,
    wellLit: true,
    publicIndoor: false,
  },
];

async function main() {
  for (const category of categories) {
    const saved = await prisma.swapCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        formMode: category.formMode,
        sortOrder: category.sortOrder,
        active: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        formMode: category.formMode,
        sortOrder: category.sortOrder,
        active: true,
      },
    });

    for (const [index, field] of category.fields.entries()) {
      await prisma.swapField.upsert({
        where: { categoryId_slug: { categoryId: saved.id, slug: field.slug } },
        update: {
          name: field.name,
          fieldType: field.fieldType,
          options: field.options ?? null,
          required: field.required ?? false,
          sortOrder: index,
        },
        create: {
          categoryId: saved.id,
          name: field.name,
          slug: field.slug,
          fieldType: field.fieldType,
          options: field.options ?? null,
          required: field.required ?? false,
          sortOrder: index,
        },
      });
    }
  }

  for (const spot of spots) {
    await prisma.swapSpot.upsert({
      where: { slug: spot.slug },
      update: {},
      create: spot,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
