import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
    userId?: number
};

export const healthCheck = (req: CustomRequest,res: Response) => {
    res.status(200).json({ message: "ok lee pal", userId: req.userId });
}