import db from "../config/db.js";

export const placeOrder = async (req, res) => {
  console.log("🔄 Starting order placement process...");

  const {
    customer_name,
    customer_email,
    customer_address,
    total_amount,
  } = req.body;

  console.log("📦 Order data:", { customer_name, customer_email, customer_address, total_amount });

  try {
    // 1️⃣ Get cart items first to validate
    console.log("🛒 Getting cart items...");
    const cartItems = await new Promise((resolve, reject) => {
      db.query(
        "SELECT cart.*, products.title, products.price, products.discount_price, products.stock_quantity " +
        "FROM cart JOIN products ON cart.product_id = products.id",
        (err, results) => {
          if (err) {
            console.error("❌ Error getting cart items:", err);
            reject(err);
          } else {
            console.log("✅ Found cart items:", results.length);
            resolve(results);
          }
        }
      );
    });

    if (cartItems.length === 0) {
      console.log("❌ Cart is empty");
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2️⃣ Validate stock availability
    console.log("📊 Validating stock...");
    for (const item of cartItems) {
      console.log(`🔍 Checking ${item.title}: requested ${item.quantity}, available ${item.stock_quantity}`);
      if (item.stock_quantity < item.quantity) {
        console.log(`❌ Insufficient stock for ${item.title}`);
        return res.status(400).json({
          message: `Insufficient stock for ${item.title}. Available: ${item.stock_quantity}`
        });
      }
    }
    console.log("✅ Stock validation passed");

    // 3️⃣ Create order
    console.log("📝 Creating order...");
    const orderResult = await new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO orders
         (customer_name, customer_email, shipping_address, total_amount, status)
         VALUES (?, ?, ?, ?, ?)`,
        [customer_name, customer_email, customer_address, total_amount, 'pending'],
        (err, result) => {
          if (err) {
            console.error("❌ Error creating order:", err);
            reject(err);
          } else {
            console.log("✅ Order created with ID:", result.insertId);
            resolve(result);
          }
        }
      );
    });

    const orderId = orderResult.insertId;

    // 4️⃣ Insert order items and update stock
    console.log("📦 Processing order items...");
    for (const item of cartItems) {
      console.log(`🔄 Processing item: ${item.title} (ID: ${item.product_id})`);

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
            if (err) {
              console.error(`❌ Error inserting order item for ${item.title}:`, err);
              reject(err);
            } else {
              console.log(`✅ Order item inserted for ${item.title}`);
              resolve();
            }
          }
        );
      });

      // Update product stock
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.product_id],
          (err) => {
            if (err) {
              console.error(`❌ Error updating stock for ${item.title}:`, err);
              reject(err);
            } else {
              console.log(`✅ Stock updated for ${item.title}`);
              resolve();
            }
          }
        );
      });
    }

    // 5️⃣ Clear cart
    console.log("🗑️ Clearing cart...");
    await new Promise((resolve, reject) => {
      db.query("DELETE FROM cart", (err) => {
        if (err) {
          console.error("❌ Error clearing cart:", err);
          reject(err);
        } else {
          console.log("✅ Cart cleared");
          resolve();
        }
      });
    });

    console.log("🎉 Order placement completed successfully!");
    res.json({ message: "Order placed successfully", orderId });

  } catch (error) {
    console.error("💥 Order placement failed:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
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
      COALESCE(o.shipping_address, o.customer_address) as shipping_address,
      o.total_amount,
      COALESCE(o.created_at, o.order_date) as created_at,
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
    ORDER BY COALESCE(o.created_at, o.order_date) DESC, o.id DESC
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
          shipping_address: row.shipping_address || row.customer_address,
          total_amount: row.total_amount,
          created_at: row.created_at || row.order_date,
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
