import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
console.log("🔥 THIS IS THE ACTIVE APP.JS FILE 🔥");

app.use("/products", productRoutes);
app.use("/cart", cartRoutes);   // 🔥 THIS LINE IS CRITICAL
app.use("/orders", orderRoutes);
app.use("/wishlist", wishlistRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

export default app;
