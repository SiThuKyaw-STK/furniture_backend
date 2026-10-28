import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { limiter } from "./middlewares/rateLimiter";
import { corsMiddleware } from "./middlewares/cors";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/v1";
import cron from "node-cron";
import {
  createOrUpdateSettingStatus,
  getSettingStatus,
} from "./services/settingService";

export const app = express();

app
    .use(morgan("dev"))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cookieParser())
    .use(corsMiddleware)
    .use(helmet())
    .use(compression())
    .use(limiter);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use(routes);
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500;
    const code = error.code || "Error_Code";
    const message = error.message || "Server Error";

    res.status(status).json({ message, error: code });
});


// cron.schedule("* 5 * * *", async () => {
//   console.log("Running a task every 5am For testing purpose");
//   const setting = await getSettingStatus("maintenance");
//   if (setting?.value === "true") {
//     await createOrUpdateSettingStatus("maintenance", "false");
//     console.log("Now maintenance mode is off");
//   }
// });