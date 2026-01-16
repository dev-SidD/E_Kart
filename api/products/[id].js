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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Get product details
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    // Get product images
    const [images] = await connection.execute(
      'SELECT image_url FROM product_images WHERE product_id = ?',
      [id]
    );

    // Attach images array
    product.images = images.map(img => img.image_url);

    // Fallback if no extra images
    if (product.images.length === 0 && product.image_url) {
      product.images = [product.image_url];
    }

    await connection.end();
    res.status(200).json(product);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}