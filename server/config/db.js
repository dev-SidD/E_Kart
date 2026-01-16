import mysql from "mysql2";


const db = mysql.createConnection({
  host: process.env.DB_HOST || "mysql",   // Railway internal service
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,                             // Default MySQL port
  connectTimeout: 10000,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL (Railway)");
  }
});

export default db;
