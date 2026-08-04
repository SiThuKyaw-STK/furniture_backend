import cors, { CorsOptions } from "cors";
import { errorCode } from "../../config/errorCode";

const allowedOrigins: string[] = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const error: any = new Error("Not allowed by CORS");
        error.status = 403;
        error.code = errorCode.cors;
        return callback(error);
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);