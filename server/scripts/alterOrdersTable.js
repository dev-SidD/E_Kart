import db from "../config/db.js";

const alterOrdersTable = () => {
  // First check if columns exist
  const checkColumnsQuery = `
    SHOW COLUMNS FROM orders LIKE 'order_date'
  `;

  db.query(checkColumnsQuery, (err, result) => {
    if (err) {
      console.error("❌ Error checking columns:", err);
      return;
    }

    if (result.length === 0) {
      // order_date column doesn't exist, add it
      const addOrderDateQuery = `
        ALTER TABLE orders
        ADD COLUMN order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `;

      db.query(addOrderDateQuery, (err2, result2) => {
        if (err2) {
          console.error("❌ Error adding order_date column:", err2);
          return;
        }
        console.log("✅ order_date column added successfully");

        // Now check and add status column
        addStatusColumn();
      });
    } else {
      console.log("✅ order_date column already exists");
      addStatusColumn();
    }
  });
};

const addStatusColumn = () => {
  const checkStatusQuery = `
    SHOW COLUMNS FROM orders LIKE 'status'
  `;

  db.query(checkStatusQuery, (err, result) => {
    if (err) {
      console.error("❌ Error checking status column:", err);
      return;
    }

    if (result.length === 0) {
      // status column doesn't exist, add it
      const addStatusQuery = `
        ALTER TABLE orders
        ADD COLUMN status VARCHAR(50) DEFAULT 'completed'
      `;

      db.query(addStatusQuery, (err2, result2) => {
        if (err2) {
          console.error("❌ Error adding status column:", err2);
          return;
        }
        console.log("✅ status column added successfully");
        console.log("✅ Orders table altered successfully");
      });
    } else {
      console.log("✅ status column already exists");
      console.log("✅ Orders table is up to date");
    }
  });
};

alterOrdersTable();