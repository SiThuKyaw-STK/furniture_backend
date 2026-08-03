import { Request, Response, NextFunction } from "express";

interface customRequest extends Request{
    userId?: number
};

export const getAllUser = async (req: customRequest, res: Response, next: NextFunction) => {
    const id = req.userId;
    res.status(200).json({message: "get all users", userId: id});
};