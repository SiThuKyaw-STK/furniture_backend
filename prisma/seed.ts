import { PrismaClient, Prisma, Status } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

function createRandomUser() {
  return {
    phone: faker.phone.number({ style: "international" }),
    password: "",
    randToken: faker.internet.jwt(),
  };
}

function createRandomProduct() {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: new Prisma.Decimal(
      faker.commerce.price({ min: 49, max: 4999, dec: 2 })
    ),
    discount: faker.helpers.maybe(
      () =>
        new Prisma.Decimal(
          faker.commerce.price({ min: 5, max: 60, dec: 2 })
        ),
      { probability: 0.4 }
    ),
    rating: faker.number.int({ min: 1, max: 5 }),
    inventory: faker.number.int({ min: 0, max: 150 }),
    status: faker.helpers.arrayElement([
      Status.ACTIVE,
      Status.INACTIVE,
      Status.FREEZE,
    ]),
  };
}

function createRandomPost() {
  return {
    title: faker.lorem.sentence(faker.number.int({ min: 4, max: 10 })),
    content: faker.lorem.paragraph(faker.number.int({ min: 2, max: 4 })),
    body: faker.lorem.paragraphs(faker.number.int({ min: 3, max: 6 })),
    image: faker.image.url({ width: 1280, height: 720 }),
  };
}

// ---------------------------------------------------------------------------
// Seed data (also exported so tests/scripts can reuse it)
// ---------------------------------------------------------------------------

export const userData = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

export const productData = faker.helpers.multiple(createRandomProduct, {
  count: 20,
});

export const postData = faker.helpers.multiple(createRandomPost, {
  count: 15,
});

const CATEGORY_NAMES = [
  "Sofas",
  "Tables",
  "Chairs",
  "Beds",
  "Storage",
  "Decor",
];

const TYPE_NAMES = ["New", "Featured", "Best Seller", "Sale", "Limited"];

const PRODUCT_TAG_NAMES = [
  "Modern",
  "Wooden",
  "Premium",
  "Handmade",
  "Cozy",
  "Durable",
];

const POST_TAG_NAMES = [
  "Furniture",
  "Interior",
  "Design",
  "Tips",
  "Trending",
  "Lifestyle",
];

async function main() {
  console.log(`Start seeding ...`);

  // Reset existing data (in FK-safe order) so the seed can be re-run safely.
  await prisma.productsOnOrders.deleteMany();
  await prisma.order.deleteMany();
  await prisma.image.deleteMany();
  await prisma.product.deleteMany();
  await prisma.post.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.type.deleteMany();

  // --- Users ---
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("12345678", salt);

  for (const u of userData) {
    u.password = password;
    await prisma.user.create({
      data: u,
    });
  }

  const users = await prisma.user.findMany();
  console.log(`Created ${users.length} users.`);

  // --- Categories & types (shared by products and posts) ---
  const categories = await Promise.all(
    CATEGORY_NAMES.map((name) =>
      prisma.category.create({
        data: { name },
      })
    )
  );
  console.log(`Created ${categories.length} categories.`);

  const types = await Promise.all(
    TYPE_NAMES.map((name) =>
      prisma.type.create({
        data: { name },
      })
    )
  );
  console.log(`Created ${types.length} types.`);

  // --- Tags ---
  const productTags = await Promise.all(
    PRODUCT_TAG_NAMES.map((name) =>
      prisma.productTag.create({
        data: { name },
      })
    )
  );
  console.log(`Created ${productTags.length} product tags.`);

  const postTags = await Promise.all(
    POST_TAG_NAMES.map((name) =>
      prisma.postTag.create({
        data: { name },
      })
    )
  );
  console.log(`Created ${postTags.length} post tags.`);

  const categoryIds = categories.map((c) => c.id);
  const typeIds = types.map((t) => t.id);
  const userIds = users.map((u) => u.id);
  const productTagIds = productTags.map((t) => t.id);
  const postTagIds = postTags.map((t) => t.id);

  // --- Products ---
  for (const p of productData) {
    await prisma.product.create({
      data: {
        ...p,
        categoryId: faker.helpers.arrayElement(categoryIds),
        typeId: faker.helpers.arrayElement(typeIds),
        images: {
          create: Array.from({ length: 3 }, () => ({
            path: faker.image.url({ width: 1280, height: 1024 }),
          })),
        },
        tags: {
          connect: faker.helpers
            .arrayElements(productTagIds, 3)
            .map((id) => ({ id })),
        },
        users: {
          connect: faker.helpers
            .arrayElements(userIds, 2)
            .map((id) => ({ id })),
        },
      },
    });
  }
  console.log(`Created ${productData.length} products.`);

  // --- Posts ---
  for (const post of postData) {
    await prisma.post.create({
      data: {
        ...post,
        authorId: faker.helpers.arrayElement(userIds),
        categoryId: faker.helpers.arrayElement(categoryIds),
        typeId: faker.helpers.arrayElement(typeIds),
        tags: {
          connect: faker.helpers
            .arrayElements(postTagIds, 3)
            .map((id) => ({ id })),
        },
      },
    });
  }
  console.log(`Created ${postData.length} posts.`);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });