import db from "../config/db.js";

export const placeOrder = (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_address,
    total_amount,
  } = req.body;

  // 1️⃣ Create order with timestamp and status
  db.query(
    `INSERT INTO orders
     (customer_name, customer_email, shipping_address, total_amount, status)
     VALUES (?, ?, ?, ?, ?)`,
    [customer_name, customer_email, customer_address, total_amount, 'pending'],
    (err, orderResult) => {
      if (err) return res.status(500).json(err);

      const orderId = orderResult.insertId;

      // 2️⃣ Get cart items
      db.query("SELECT * FROM cart JOIN products ON cart.product_id = products.id",
        (err, cartItems) => {
          if (err) return res.status(500).json(err);

          if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
          }

          let completedOperations = 0;
          const totalOperations = cartItems.length * 2; // INSERT + UPDATE per item

          // 3️⃣ Insert order items & reduce stock
          cartItems.forEach((item) => {
            // Insert order item
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
              (insertErr) => {
                if (insertErr) {
                  console.error("Error inserting order item:", insertErr);
                  return res.status(500).json({ message: "Error creating order items" });
                }

                completedOperations++;
                checkCompletion();
              }
            );

            // Update product stock
            db.query(
              "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
              [item.quantity, item.product_id],
              (updateErr) => {
                if (updateErr) {
                  console.error("Error updating stock:", updateErr);
                  return res.status(500).json({ message: "Error updating product stock" });
                }

                completedOperations++;
                checkCompletion();
              }
            );
          });

          const checkCompletion = () => {
            if (completedOperations === totalOperations) {
              // 4️⃣ Clear cart
              db.query("DELETE FROM cart", (cartErr) => {
                if (cartErr) {
                  console.error("Error clearing cart:", cartErr);
                  return res.status(500).json({ message: "Error clearing cart" });
                }

                res.json({ message: "Order placed successfully" });
              });
            }
          };
        }
      );
    }
  );
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
