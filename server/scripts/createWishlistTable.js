import db from "../config/db.js";

const createWishlistTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_product (product_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("❌ Error creating wishlist table:", err);
      return;
    }
    console.log("✅ Wishlist table created successfully");
  });
};

createWishlistTable();