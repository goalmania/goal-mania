import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'GoalMania',
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Product Schema (minimal version for this script)
const productSchema = new mongoose.Schema({
  title: String,
  feature: Boolean,
  isActive: Boolean,
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function markFeaturedProducts() {
  try {
    await connectDB();

    // First, unmark all products as featured
    console.log('📝 Unmarking all products as featured...');
    await Product.updateMany({}, { feature: false });

    // Get 10 random active products
    console.log('🔍 Finding 10 random active products...');
    let products = await Product.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 10 } }
    ]);

    // If no active products, try without the active filter
    if (products.length === 0) {
      console.log('⚠️  No active products found, trying all products...');
      products = await Product.aggregate([
        { $sample: { size: 10 } }
      ]);
    }

    if (products.length === 0) {
      console.log('⚠️  No products found in the database');
      return;
    }

    // Mark these products as featured
    const productIds = products.map(p => p._id);
    console.log(`✨ Marking ${products.length} products as featured...`);
    
    await Product.updateMany(
      { _id: { $in: productIds } },
      { feature: true }
    );

    console.log('\n✅ Successfully marked the following products as featured:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (ID: ${product._id})`);
    });

    console.log('\n🎉 Done! Featured products updated successfully.');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
markFeaturedProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
