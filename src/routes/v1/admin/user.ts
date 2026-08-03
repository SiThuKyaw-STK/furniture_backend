import express from "express";
import { getAllUser } from "../../../controllers/admin/userController";

const router = express.Router();

router.get("/users", getAllUser);

export default router;