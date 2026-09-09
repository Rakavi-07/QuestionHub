import "dotenv/config";
import mongoose from "mongoose";

console.log("URI exists:", !!process.env.MONGODB_URI);

try {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected:", conn.connection.host);
  process.exit(0);
} catch (err) {
  console.error("❌ Error:");
  console.error(err);
  process.exit(1);
}