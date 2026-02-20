import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
} from "../controllers/productController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createProduct)
  .get(getProducts);

router.route("/:id")
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

router.post("/:id/favorite", protect, addFavorite);
router.delete("/:id/favorite", protect, removeFavorite);

export default router;
