import express from "express";
import { placeOrder, getOrderHistory } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getOrderHistory);
router.post("/", placeOrder);

export default router;
