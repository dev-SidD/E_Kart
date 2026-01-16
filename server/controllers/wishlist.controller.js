import db from "../config/db.js";

// Add product to wishlist
export const addToWishlist = (req, res) => {
  const { product_id } = req.body;

  // Check if product already exists in wishlist
  const checkQuery = "SELECT * FROM wishlist WHERE product_id = ?";
  db.query(checkQuery, [product_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.length > 0) {
      return res.json({ message: "Product already in wishlist" });
    }

    // Add to wishlist
    const insertQuery = "INSERT INTO wishlist (product_id) VALUES (?)";
    db.query(insertQuery, [product_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      res.json({ message: "Added to wishlist" });
    });
  });
};

// Get wishlist items
export const getWishlistItems = (req, res) => {
  const query = `
    SELECT w.id, p.id as product_id, p.title, p.image_url, p.price, p.discount_price
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    ORDER BY w.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(result);
  });
};

// Remove from wishlist
export const removeFromWishlist = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM wishlist WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json({ message: "Removed from wishlist" });
  });
};

// Check if product is in wishlist
export const checkWishlistStatus = (req, res) => {
  const { product_id } = req.params;

  const query = "SELECT COUNT(*) as count FROM wishlist WHERE product_id = ?";
  db.query(query, [product_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json({ isInWishlist: result[0].count > 0 });
  });
};