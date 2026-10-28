import { NextFunction, Response, Request } from "express";
import { checkUserIfNotExist } from "../../utils/auth";
import { getAllCategoriesAndTypes } from "../../services/filterService";
import { getOrSetCache } from "../../utils/cache";
import { getUserById } from "../../services/authService";

interface CustomRequest extends Request {
  userId?: number;
}

export const getCategoriesAndTypes = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  const user = await getUserById(userId!);
  checkUserIfNotExist(user);

  const cacheKey = `filter:categoriesAndTypes`;

  const { categories, types } = await getOrSetCache(cacheKey, async () => {
    return await getAllCategoriesAndTypes();
  });

  res
    .status(200)
    .json({ message: "Categories and Types", data: { categories, types } });
};
