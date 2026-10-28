import express from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import userRoutes from "./api";
import { auth } from "../../middlewares/auth";
import { maintenance } from "../../middlewares/maintenance";

const router = express.Router();
router.use("/api/v1", maintenance, authRoutes);
router.use("/api/v1/admins", maintenance, auth, adminRoutes);
router.use("/api/v1/users", maintenance, auth, userRoutes);

export default router;