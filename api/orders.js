import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    if (req.method === 'GET') {
      // Get order history with items
      const query = `
        SELECT
          o.id as order_id,
          o.customer_name,
          o.customer_email,
          o.customer_address,
          o.total_amount,
          o.order_date,
          o.status,
          oi.product_id,
          oi.quantity,
          oi.price_at_purchase,
          p.title as product_title,
          p.image_url,
          p.discount_price
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        ORDER BY o.order_date DESC, o.id DESC
      `;

      const [results] = await connection.execute(query);

      // Group results by order
      const ordersMap = new Map();

      results.forEach(row => {
        if (!ordersMap.has(row.order_id)) {
          ordersMap.set(row.order_id, {
            id: row.order_id,
            customer_name: row.customer_name,
            customer_email: row.customer_email,
            customer_address: row.customer_address,
            total_amount: row.total_amount,
            order_date: row.order_date,
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
            price_at_purchase: row.price_at_purchase,
            discount_price: row.discount_price
          });
        }
      });

      const orders = Array.from(ordersMap.values());
      await connection.end();
      return res.status(200).json(orders);

    } else if (req.method === 'POST') {
      // Create new order
      const {
        customer_name,
        customer_email,
        customer_address,
        total_amount,
        items: cartItems
      } = req.body;

      if (!customer_name || !customer_email || !customer_address || !total_amount) {
        await connection.end();
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Get cart items if not provided
      let items = cartItems;
      if (!items) {
        const [cartRows] = await connection.execute(
          'SELECT * FROM cart JOIN products ON cart.product_id = products.id'
        );
        items = cartRows;
      }

      if (!items || items.length === 0) {
        await connection.end();
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Create order
      const orderDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (customer_name, customer_email, customer_address, total_amount, order_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [customer_name, customer_email, customer_address, total_amount, orderDate, 'completed']
      );

      const orderId = orderResult.insertId;

      // Create order items and update stock
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.discount_price || item.price]
        );

        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Clear cart if items were from cart
      if (!cartItems) {
        await connection.execute('DELETE FROM cart');
      }

      await connection.end();
      return res.status(200).json({ message: 'Order placed successfully' });

    } else {
      await connection.end();
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}