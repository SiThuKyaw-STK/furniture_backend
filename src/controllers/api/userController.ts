import { NextFunction, Response, Request } from "express";
import { checkUserIfNotExist } from "../../utils/auth";
import { getAllCategoriesAndTypes } from "../../services/filterService";
import { getOrSetCache } from "../../utils/cache";
import { getUserById } from "../../services/authService";
import { body } from "express-validator";
import { addProductToFavourites, removeProductFromFavourites } from "../../services/userService";
import { cacheQueue } from "../../jobs/queues/cacheQueue";

interface CustomRequest extends Request {
  userId?: number;
}

export const toggleFavourite = [
  body("productId", "Product ID must not be empty").isInt({ gt: 0 }),
  body("favourite", "Favourite must be a boolean").isBoolean(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExist(user);

    const { productId, favourite } = req.body;

    if(favourite) {
        // Add product to user's favourites
        await addProductToFavourites(userId!, productId);
    } else {
        // Remove product from user's favourites
        await removeProductFromFavourites(userId!, productId);
    }

    await cacheQueue.add(
      "invalidate-product-cache",
      {
        pattern: "products:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );

    res.status(200).json({
      message: favourite ? "Product added to favourites" : "Product removed from favourites",
    });
  },
];
