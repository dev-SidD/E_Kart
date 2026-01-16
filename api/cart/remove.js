import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute('DELETE FROM cart WHERE id = ?', [id]);
    await connection.end();

    res.status(200).json({ message: 'Item removed' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}