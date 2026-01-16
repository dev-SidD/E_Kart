import db from "../config/db.js";

export const placeOrder = async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_address,
    total_amount,
  } = req.body;

  try {
    // 1️⃣ Get cart items first to validate
    const cartItems = await new Promise((resolve, reject) => {
      db.query(
        "SELECT cart.*, products.title, products.price, products.discount_price, products.stock_quantity " +
        "FROM cart JOIN products ON cart.product_id = products.id",
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2️⃣ Validate stock availability
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.title}. Available: ${item.stock_quantity}`
        });
      }
    }

    // 3️⃣ Create order
    const orderResult = await new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO orders
         (customer_name, customer_email, shipping_address, total_amount, status)
         VALUES (?, ?, ?, ?, ?)`,
        [customer_name, customer_email, customer_address, total_amount, 'pending'],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    const orderId = orderResult.insertId;

    // 4️⃣ Insert order items and update stock
    for (const item of cartItems) {
      // Insert order item
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO order_items
           (order_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.quantity,
            item.discount_price || item.price,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Update product stock
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.product_id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // 5️⃣ Clear cart
    await new Promise((resolve, reject) => {
      db.query("DELETE FROM cart", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: "Order placed successfully", orderId });

  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

export const getOrderHistory = (req, res) => {
  // Get all orders with their items
  const query = `
    SELECT
      o.id as order_id,
      o.customer_name,
      o.customer_email,
      o.shipping_address,
      o.total_amount,
      o.created_at,
      o.status,
      oi.product_id,
      oi.quantity,
      oi.price,
      p.title as product_title,
      p.image_url,
      p.discount_price
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    ORDER BY o.created_at DESC, o.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    // Group results by order
    const ordersMap = new Map();

    results.forEach(row => {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          id: row.order_id,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          shipping_address: row.shipping_address,
          total_amount: row.total_amount,
          created_at: row.created_at,
          status: row.status,
          items: []
        });
      }

      if (row.product_id) {
        ordersMap.get(row.order_id).items.push({
          product_id: row.product_id,
          title: row.product_title,
          image_url: row.image_url,
          quantity: row.quantity,
          price: row.price,
          discount_price: row.discount_price
        });
      }
    });

    const orders = Array.from(ordersMap.values());
    res.json(orders);
  });
};
