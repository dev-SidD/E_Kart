import mysql from "mysql2";
import dotenv from "dotenv";
// FIX 1: Use named import for expand
import { expand } from "dotenv-expand";

// 1. Configure dotenv and capture the output object
const myEnv = dotenv.config();

// FIX 2: Check if dotenv actually found the file before expanding
if (myEnv.error) {
  console.warn("⚠️  .env file not found or could not be read");
} else {
  // FIX 3: Call expand() directly (since we imported it by name)
  expand(myEnv);
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL (Railway)");
  }
});

export default db;