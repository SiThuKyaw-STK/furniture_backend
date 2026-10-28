import { prisma } from "../lib/prisma";

export const getAllCategoriesAndTypes = async () => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const types = await prisma.type.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return { categories, types };
};
