import db from "../config/db.js";

const updatePricesToINR = async () => {
  try {
    // First, check if there are any products with prices that look like USD (< 1000)
    db.query(
      "SELECT COUNT(*) as count FROM products WHERE price < 1000",
      (err, result) => {
        if (err) {
          console.error("❌ Error checking products:", err);
          return;
        }

        const productCount = result[0].count;
        console.log(`Found ${productCount} products with prices under 1000 (likely USD prices)`);

        if (productCount === 0) {
          console.log("✅ No products found with USD prices. All prices appear to be in INR already.");
          return;
        }

        // Update prices: multiply by 92 to convert USD to INR
        db.query(
          "UPDATE products SET price = price * 92, discount_price = discount_price * 92 WHERE price < 1000",
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error("❌ Error updating prices:", updateErr);
              return;
            }

            console.log(`✅ Successfully updated ${updateResult.affectedRows} products`);
            console.log("💱 Converted USD prices to INR (multiplied by 92)");
          }
        );
      }
    );
  } catch (error) {
    console.error("❌ Script failed:", error);
  }
};

updatePricesToINR();