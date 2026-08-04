import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorCode } from "../../config/errorCode";
import { getUserById, updateUser } from "../services/authService";
import { createError } from "../utils/error";

interface customRequest extends Request {
  userId?: number
};

export const auth = async (req: customRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies ? req.cookies.accessToken : null;
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  if (!refreshToken) {
    const error: any = new Error("Your are not authenticated user.");
    error.status = 401;
    error.code = errorCode.unauthenticated;
    throw error;
  }

  const generateNewTokens = async () => {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        id: number;
        phone: string;
      };
    } catch (error) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    if (isNaN(decoded.id)) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      return next(
        createError(
          "This account has not registered!.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    if (user.phone !== decoded.phone) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    if (user.randToken !== refreshToken) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    // Authorization token
    const accessTokenPayload = { id: user.id };
    const refreshTokenPayload = { id: user.id, phone: user.phone };

    const newAccessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 min
      }
    );

    const newRefreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      }
    );

    const userData = {
      randToken: newRefreshToken,
    };

    await updateUser(userData, user.id);

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

    req.userId = user.id;
    next();
  };

  if (!accessToken) {
    generateNewTokens();
  } else {
    // Verify access Token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
        id: number;
      };

      if (isNaN(decoded.id)) {
        return next(
          createError(
            "You are not an authenticated user.",
            401,
            errorCode.unauthenticated
          )
        );
      }

      req.userId = decoded.id;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        generateNewTokens(); // await generateNewTokens();
        // error.message = "Access Token has expired.";
        // error.status = 401;
        // error.code = errorCode.accessTokenExpired;
      } else {
        error.message = "Acess Token is invalid.";
        error.status = 400;
        error.code = errorCode.attack;
        return next(
          createError("Acess Token is invalid.", 400, errorCode.attack)
        );
      }
    }
  }
};