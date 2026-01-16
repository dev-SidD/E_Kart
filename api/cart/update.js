import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { quantity } = req.body;

  if (!id || quantity < 1) {
    return res.status(400).json({ message: 'Valid ID and quantity required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      [quantity, id]
    );

    await connection.end();
    res.status(200).json({ message: 'Quantity updated' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}