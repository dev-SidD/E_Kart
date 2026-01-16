import db from "../config/db.js";

// Add product to cart
export const addToCart = (req, res) => {
 
  const { product_id } = req.body;
  console.log(product_id);
  const checkQuery = "SELECT * FROM cart WHERE product_id = ?";
  db.query(checkQuery, [product_id], (err, result) => {
    if (result.length > 0) {
      // If already exists, increase quantity
      db.query(
        "UPDATE cart SET quantity = quantity + 1 WHERE product_id = ?",
        [product_id],
        () => res.json({ message: "Quantity updated" })
      );
    } else {
      // Else insert new
      db.query(
        "INSERT INTO cart (product_id, quantity) VALUES (?, 1)",
        [product_id],
        () => res.json({ message: "Added to cart" })
      );
    }
  });
};

// Get cart items
export const getCartItems = (req, res) => {
  const query = `
    SELECT c.id, p.title, p.image_url, p.price, p.discount_price, c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.id
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

export const updateCartQuantity = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  db.query(
    "UPDATE cart SET quantity = ? WHERE id = ?",
    [quantity, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Quantity updated" });
    }
  );
};

export const removeFromCart = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM cart WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Item removed" });
    }
  );
};