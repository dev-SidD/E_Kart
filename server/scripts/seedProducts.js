import axios from "axios";
import db from "../config/db.js";

const USD_TO_INR = 92;

const seedProducts = async () => {
  try {
    console.log("🚀 Fetching products from DummyJSON...");

    const { data } = await axios.get(
      "https://dummyjson.com/products?limit=0"
    );

    console.log(`📦 Total products fetched: ${data.products.length}`);

    for (const p of data.products) {
      const priceInr = (p.price * USD_TO_INR).toFixed(2);
      const discountInr = (
        (p.price - (p.price * p.discountPercentage) / 100) *
        USD_TO_INR
      ).toFixed(2);

      // Insert product
      const [result] = await db.promise().query(
        `
        INSERT INTO products
        (title, category, description, price, discount_price, image_url, stock_quantity, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          p.title,
          p.category,
          p.description,
          priceInr,
          discountInr,
          p.thumbnail,
          p.stock,
          p.rating
        ]
      );

      const productId = result.insertId;

      // Insert carousel images
      for (const img of p.images) {
        await db.promise().query(
          `
          INSERT INTO product_images (product_id, image_url)
          VALUES (?, ?)
          `,
          [productId, img]
        );
      }

      console.log(`✅ Inserted: ${p.title}`);
    }

    console.log("🎉 ALL PRODUCTS SEEDED SUCCESSFULLY");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING FAILED:", error.message);
    process.exit(1);
  }
};

seedProducts();
