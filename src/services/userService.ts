import { prisma } from "../lib/prisma";

export const addProductToFavourites = async (
  userId: number,
  productId: number,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      products: {
        connect: { id: productId },
      },
    },
  });
};

export const removeProductFromFavourites = async (
  userId: number,
  productId: number,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      products: {
        disconnect: { id: productId },
      },
    },
  });
};