import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'GoalMania' });
    const collection = mongoose.connection.db.collection('products');
    
    // Delete products with "Jersey" in the title that are World Cup products
    const res = await collection.deleteMany({ 
      isWorldCup: true, 
      title: { $regex: /Jersey/i } 
    });
    
    console.log(`✅ Cleaned up ${res.deletedCount} old World Cup products.`);
  } catch (err) {
    console.error("❌ Cleanup Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
