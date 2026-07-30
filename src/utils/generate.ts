import { randomBytes, randomInt } from "crypto";

export const generateOTP = () => randomInt(100000,1000000);
export const generateToken = () => randomBytes(32).toString("hex");