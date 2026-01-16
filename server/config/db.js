import dotenv from "dotenv";
dotenv.config(); // ✅ FORCE dotenv here

import mysql from "mysql2";

console.log("DB CONFIG USED 👉", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  passwordLoaded: !!process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

export default db;
