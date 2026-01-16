import express from "express";
import {
  addToCart,
  getCartItems,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", getCartItems);
router.post("/", addToCart);
router.put("/:id", updateCartQuantity);
router.delete("/:id", removeFromCart);

export default router;
