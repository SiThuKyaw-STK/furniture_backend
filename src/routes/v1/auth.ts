import express from "express";
import { login, register, verifyOtp, confirmPassword, forgetPassword, logout } from "../../controllers/authController";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/confirm-password", confirmPassword);
router.post("/forget-password", forgetPassword);

export default router;