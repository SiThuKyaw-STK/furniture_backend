import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { limiter } from "./middlewares/rateLimiter";
import { check } from "./middlewares/check";
import { Request, Response, NextFunction } from "express";
import healthRoutes from "./routes/v1/health";

export const app = express();

app
    .use(morgan("dev"))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cors())
    .use(helmet())
    .use(compression())
    .use(limiter);

app.use("/api/v1", healthRoutes);
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500;
    const code = error.code || "Error_Code";
    const message = error.message || "Server Error";

    res.status(status).json({ message, error: code });
})