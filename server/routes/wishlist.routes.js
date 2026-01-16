import express from "express";
import {
  addToWishlist,
  getWishlistItems,
  removeFromWishlist,
  checkWishlistStatus,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/", getWishlistItems);
router.post("/", addToWishlist);
router.delete("/:id", removeFromWishlist);
router.get("/status/:product_id", checkWishlistStatus);

export default router;