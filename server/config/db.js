import mysql from "mysql2";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

// 1. Configure dotenv and capture the output object
const myEnv = dotenv.config();

// 2. Pass that object to dotenvExpand to handle the variables
dotenvExpand.expand(myEnv);

const db = mysql.createConnection({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL (Railway)");
  }
});

export default db;