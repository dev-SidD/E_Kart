import express from "express";
import cors from "cors";

// 🔥 Initialize DB connection (VERY IMPORTANT)
import "./config/db.js";

// Routes
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Debug log (you already saw this in Railway logs)
console.log("🔥 THIS IS THE ACTIVE APP.JS FILE 🔥");

// Routes
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/wishlist", wishlistRoutes);

// Health check (important for Railway)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ❌ NO app.listen() here
export default app;
