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

  try {
    const connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT c.id, p.title, p.image_url, p.price, p.discount_price, c.quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
    `;

    const [rows] = await connection.execute(query);
    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}