import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { getUserByPhone } from "../services/authService";
import { checkUserExist } from "../utils/auth";

export const login = [
    body("phone", "Invalid phone number")
        .trim()
        .notEmpty()
        .isMobilePhone("any", { strictMode: true }).withMessage("Invalid phone number"),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        console.log(errors);

        if (!errors.isEmpty()) {
            console.log({ errors: errors.array() });
        }
        res.status(200).json({ message: "login" });
    },
];

export const register = [
    body("phone", "Invalid phone number")
        .trim()
        .notEmpty()
        // .matches("^[0-9]+$")
        .isLength({ min: 5, max: 12 }),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const errors = validationResult(req).array({ onlyFirstError: true });
        if (errors.length > 0) {
            const error: any = new Error(errors[0].msg)
            error.status = 400;
            error.code = "Error_Invalid";
            return next(error);
        }

        let phone = req.body.phone;
        if(phone.slice(0,2) === "09"){
            phone = phone.substring(2,phone.length);            
        }

        const user = await getUserByPhone(phone);        
        checkUserExist(user);

        res.status(200).json({ message: user });
    }
];

export const verifyOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.status(200).json({ message: "verify otp" });
};

export const confirmPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.status(200).json({ message: "confirm password" });
};

export const forgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.status(200).json({ message: "forget password" });
};
