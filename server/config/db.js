import mysql from "mysql2";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

// Load environment variables from .env for local development
const env = dotenv.config();
dotenvExpand.expand(env);

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL (local) as", process.env.DB_USER || "root");
  }
});

export default db;
