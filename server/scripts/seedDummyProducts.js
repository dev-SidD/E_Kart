import axios from "axios";
import db from "../config/db.js";

// Promisified query function
const query = (sql, values = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ SQL ERROR:", err.sqlMessage || err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

const seedProducts = async () => {
  try {
    console.log("🚀 Starting seeding process...");

    // 🔥 VERY IMPORTANT: force DB selection
    console.log("📦 Using database:", process.env.DB_NAME);
    await query(`USE ${process.env.DB_NAME}`);

    // Fetch ALL products (DummyJSON max = 100)
    const { data } = await axios.get(
      "https://dummyjson.com/products?limit=100"
    );

    console.log("📥 Products fetched:", data.products.length);

    if (!data.products || data.products.length === 0) {
      throw new Error("No products received from DummyJSON");
    }

    for (const p of data.products) {
      console.log("➕ Inserting:", p.title);

      // USD → INR conversion
      const usdPrice = p.price;
      const usdDiscountPrice =
        p.price - (p.price * p.discountPercentage) / 100;

      const inrPrice = usdPrice * 92;
      const inrDiscountPrice = usdDiscountPrice * 92;

      // Insert product
      const result = await query(
        `INSERT INTO products
        (title, category, description, price, discount_price, image_url, stock_quantity, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.title,
          p.category,
          p.description,
          inrPrice.toFixed(2),
          inrDiscountPrice.toFixed(2),
          p.thumbnail,
          p.stock,
          p.rating,
        ]
      );

      const productId = result.insertId;

      // Insert carousel images
      for (const img of p.images) {
        await query(
          `INSERT INTO product_images (product_id, image_url)
           VALUES (?, ?)`,
          [productId, img]
        );
      }
    }

    console.log("✅ ALL PRODUCTS SEEDED SUCCESSFULLY 🎉");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING FAILED:", error.message);
    process.exit(1);
  }
};

seedProducts();
