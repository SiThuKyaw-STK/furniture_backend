import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface customRequest extends Request{
    userId?: number
};

export const auth = async (req: customRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies ? req.cookies.accessToken : null;
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  if (!refreshToken) {
    const error: any = new Error("Your are not authenticated user.");
    error.status = 401;
    error.code = "Error_Unauthenticated";
    throw error;
  }

  if (!accessToken) {
    const error: any = new Error("Access Token has expired.");
    error.status = 401;
    error.code = "Error_AccessTokenExpired";
    throw error;
  }

  let decoded;

  try {
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
        id: number
    };
  } catch (error: any) {
    if(error.name === "TokenExpiredError"){
        error.message = "Access Token is invalid.";
        error.status = 400;
        error.code = "Error_AccessTokenExpired";
    } else {
        error.message = "Access Token is invalid.";
        error.status = 400;
        error.code = "Error_Attack";
    }
    return next(error);
  }

  req.userId = decoded.id;

  next();
};
