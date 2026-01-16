import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Check if product already exists in cart
    const [existing] = await connection.execute(
      'SELECT * FROM cart WHERE product_id = ?',
      [product_id]
    );

    if (existing.length > 0) {
      // Update quantity
      await connection.execute(
        'UPDATE cart SET quantity = quantity + 1 WHERE product_id = ?',
        [product_id]
      );
      await connection.end();
      return res.status(200).json({ message: 'Quantity updated' });
    } else {
      // Add new item
      await connection.execute(
        'INSERT INTO cart (product_id, quantity) VALUES (?, 1)',
        [product_id]
      );
      await connection.end();
      return res.status(200).json({ message: 'Added to cart' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}