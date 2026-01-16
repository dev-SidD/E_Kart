import axios from "axios";
import db from "../config/db.js";

const seedProducts = async () => {
  try {
    const { data } = await axios.get(
      "https://dummyjson.com/products?limit=0"
    );

    for (const p of data.products) {
      // Convert prices from USD to INR (multiply by 92)
      const usdPrice = p.price;
      const usdDiscountPrice = p.price - (p.price * p.discountPercentage) / 100;
      const inrPrice = usdPrice * 92;
      const inrDiscountPrice = usdDiscountPrice * 92;

      // Insert product
      db.query(
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
        ],
        (err, result) => {
          if (err) return console.error("❌ Product insert failed", err);

          const productId = result.insertId;

          // Insert carousel images
          p.images.forEach((img) => {
            db.query(
              `INSERT INTO product_images (product_id, image_url)
               VALUES (?, ?)`,
              [productId, img]
            );
          });
        }
      );
    }

    console.log("✅ Database seeded successfully");
  } catch (error) {
    console.error("❌ Seeding failed", error);
  }
};

seedProducts();
