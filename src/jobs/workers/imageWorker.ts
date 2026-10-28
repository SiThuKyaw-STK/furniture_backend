import { Worker } from "bullmq";
import ImageQueue from "../queues/imageQueue";
import sharp from "sharp";
import path from "path";
import { redis } from "../../../config/redisClient";

// create a new worker to process image jobs
const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { filePath, fileName, width, height, quality } = job.data;

    const optimizedImagePath = path.join(
      __dirname,
      "../../..",
      "/uploads/optimize",
      fileName,
    );
    await sharp(filePath)
      .resize(width, height)
      .webp({ quality: quality })
      .toFile(optimizedImagePath);
  },
  { connection: redis },
);

imageWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

imageWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

export default imageWorker;
