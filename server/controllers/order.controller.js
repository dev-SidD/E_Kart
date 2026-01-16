import db from "../config/db.js";

export const placeOrder = async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_address,
    total_amount,
  } = req.body;

  // Start transaction
  const connection = await new Promise((resolve, reject) => {
    db.getConnection((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });

  try {
    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 1️⃣ Create order
    const orderResult = await new Promise((resolve, reject) => {
      connection.query(
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

    // 2️⃣ Get cart items
    const cartItems = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT cart.*, products.title, products.price, products.discount_price, products.stock_quantity " +
        "FROM cart JOIN products ON cart.product_id = products.id",
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    if (cartItems.length === 0) {
      await new Promise((resolve, reject) => {
        connection.rollback(() => resolve());
      });
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 3️⃣ Validate stock and insert order items
    for (const item of cartItems) {
      // Check stock availability
      if (item.stock_quantity < item.quantity) {
        await new Promise((resolve, reject) => {
          connection.rollback(() => resolve());
        });
        return res.status(400).json({
          message: `Insufficient stock for ${item.title}. Available: ${item.stock_quantity}`
        });
      }

      // Insert order item
      await new Promise((resolve, reject) => {
        connection.query(
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
        connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.product_id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // 4️⃣ Clear cart
    await new Promise((resolve, reject) => {
      connection.query("DELETE FROM cart", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: "Order placed successfully", orderId });

  } catch (error) {
    console.error("Order placement error:", error);
    await new Promise((resolve, reject) => {
      connection.rollback(() => resolve());
    });
    res.status(500).json({ message: "Failed to place order", error: error.message });
  } finally {
    connection.release();
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
