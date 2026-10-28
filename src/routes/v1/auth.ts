import express from "express";
import { login, register, verifyOtp, confirmPassword, forgetPassword, logout, resetPassword, verifyOtpForPasswordReset, authCheck } from "../../controllers/authController";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/confirm-password", confirmPassword);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp-for-password-reset", verifyOtpForPasswordReset);

router.get("/auth-check", auth, authCheck);

export default router;