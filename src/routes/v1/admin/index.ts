import express from "express";
import { getAllUser } from "../../../controllers/admin/userController";
import { authorise } from "../../../middlewares/authorise";
import { setMaintenance } from "../../../controllers/admin/systemController";
import { createPost, deletePost, updatePost } from "../../../controllers/admin/postController";
import upload from "../../../middlewares/uploadFile";
import { createProduct, deleteProduct, updateProduct } from "../../../controllers/admin/productController";

const router = express.Router();

router.get("/users", authorise(true, "ADMIN"), getAllUser);
router.post("/maintenance", authorise(true, "ADMIN"), setMaintenance);


// CRUD for Posts
router.post("/posts", upload.single("image"), createPost);
router.patch("/posts", upload.single("image"), updatePost);
router.delete("/posts", deletePost);

// CRUD for Products
router.post("/products", upload.array("image"), createProduct);
router.patch("/products", upload.array("image"), updateProduct);
router.delete("/products", deleteProduct);


export default router;