import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { limiter } from "./middlewares/rateLimiter";
import { corsMiddleware } from "./middlewares/cors";
import { Request, Response, NextFunction } from "express";
import authRoutes from "./routes/v1/auth";
import userRoutes from "./routes/v1/admin/user";
import { auth } from "./middlewares/auth";
import cookieParser from "cookie-parser";

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

app.use("/api/v1", authRoutes);
app.use("/api/v1/admin", auth, userRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500;
    const code = error.code || "Error_Code";
    const message = error.message || "Server Error";

    res.status(status).json({ message, error: code });
})