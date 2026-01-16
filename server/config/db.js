import mysql from "mysql2";

/**
 * Railway injects these variables AUTOMATICALLY
 * when your backend service is connected to MySQL.
 * Do NOT use dotenv or dotenv-expand in production.
 */

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "mysql",
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL (Railway)");
  }
});

export default db;
