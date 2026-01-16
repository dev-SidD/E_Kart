import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { product_id } = req.query;

  if (!product_id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM wishlist WHERE product_id = ?',
      [product_id]
    );

    await connection.end();

    res.status(200).json({ isInWishlist: rows[0].count > 0 });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}