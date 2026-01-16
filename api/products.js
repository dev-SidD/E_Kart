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

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Handle search
    const search = req.query.search;
    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    // Handle category filter
    const category = req.query.category;
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    const [rows] = await connection.execute(query, params);
    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}