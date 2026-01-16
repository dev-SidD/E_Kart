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
      // Get wishlist items
      const query = `
        SELECT w.id, p.id as product_id, p.title, p.image_url, p.price, p.discount_price
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        ORDER BY w.created_at DESC
      `;

      const [rows] = await connection.execute(query);
      await connection.end();
      return res.status(200).json(rows);

    } else if (req.method === 'POST') {
      // Add to wishlist
      const { product_id } = req.body;

      if (!product_id) {
        await connection.end();
        return res.status(400).json({ message: 'Product ID is required' });
      }

      // Check if already exists
      const [existing] = await connection.execute(
        'SELECT * FROM wishlist WHERE product_id = ?',
        [product_id]
      );

      if (existing.length > 0) {
        await connection.end();
        return res.status(200).json({ message: 'Product already in wishlist' });
      }

      await connection.execute(
        'INSERT INTO wishlist (product_id) VALUES (?)',
        [product_id]
      );

      await connection.end();
      return res.status(200).json({ message: 'Added to wishlist' });

    } else if (req.method === 'DELETE') {
      // Remove from wishlist
      const { id } = req.query;

      if (!id) {
        await connection.end();
        return res.status(400).json({ message: 'ID is required' });
      }

      await connection.execute('DELETE FROM wishlist WHERE id = ?', [id]);
      await connection.end();
      return res.status(200).json({ message: 'Removed from wishlist' });

    } else {
      await connection.end();
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}