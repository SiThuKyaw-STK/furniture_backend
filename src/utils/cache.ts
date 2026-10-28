import {redis} from "../../config/redisClient";

export const getOrSetCache = async (key: any, cb: any) => {
  try {
    const cachedData = await redis.get(key); // "products:{"limit":5,"category":"1,2","type":"3"}"
    if (cachedData) {
      console.log("Cache hit");
      return JSON.parse(cachedData);
    }

    console.log("Cache miss");
    const freshData = await cb();
    await redis.setex(key, 3600, JSON.stringify(freshData)); // Cache for 1 hour
    return freshData;
  } catch (error) {
    console.error("Redis error: ", error);
    throw error;
  }
};