import db from "../config/db.js";

/**
 * GET /products
 * Supports search & category filter
 */
export const getProducts = (req, res) => {
  const { search, category } = req.query;

  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB Error", error: err });
    }
    res.json(results);
  });
};

/**
 * GET /products/:id
 */
export const getProductById = (req, res) => {
  const { id } = req.params;

  // 1️⃣ Fetch product
  db.query(
    "SELECT * FROM products WHERE id = ?",
    [id],
    (err, productResult) => {
      if (err) return res.status(500).json(err);
      if (productResult.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const product = productResult[0];

      // 2️⃣ Fetch product images
      db.query(
        "SELECT image_url FROM product_images WHERE product_id = ?",
        [id],
        (err, imageResults) => {
          if (err) return res.status(500).json(err);

          // 3️⃣ Attach images array
          product.images = imageResults.map(img => img.image_url);

          // 🔥 fallback if no extra images
          if (product.images.length === 0 && product.image_url) {
            product.images = [product.image_url];
          }

          res.json(product);
        }
      );
    }
  );
};
