import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function optimizeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Optimize Products collection
    console.log('\nOptimizing Products collection...');
    const products = db.collection('products');
    
    // Create product indexes
    const productIndexes = [
      { key: { slug: 1 }, unique: true, sparse: true },
      { key: { category: 1, isActive: 1 } },
      { key: { createdAt: -1 } },
      { key: { title: 'text', description: 'text', category: 'text' }, 
        weights: { title: 10, description: 5, category: 3 } },
      { key: { feature: 1, isActive: 1, createdAt: -1 } },
      { key: { stockQuantity: 1, isActive: 1 } },
      { key: { isMysteryBox: 1, isActive: 1 } },
      { key: { basePrice: 1, isActive: 1 } }
    ];

    for (const index of productIndexes) {
      try {
        await products.createIndex(index.key, index);
        console.log(`✅ Created index: ${JSON.stringify(index.key)}`);
      } catch (error) {
        console.warn(`⚠️ Error creating index: ${error.message}`);
      }
    }

    // Optimize Orders collection
    console.log('\nOptimizing Orders collection...');
    const orders = db.collection('orders');
    const orderIndexes = [
      { key: { userId: 1 } },
      { key: { createdAt: -1 } },
      { key: { status: 1 } },
      { key: { paymentIntentId: 1 }, unique: true, sparse: true }
    ];

    for (const index of orderIndexes) {
      try {
        await orders.createIndex(index.key, index);
        console.log(`✅ Created index: ${JSON.stringify(index.key)}`);
      } catch (error) {
        console.warn(`⚠️ Error creating index: ${error.message}`);
      }
    }

    // Optimize Users collection
    console.log('\nOptimizing Users collection...');
    const users = db.collection('users');
    const userIndexes = [
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { createdAt: -1 } }
    ];

    for (const index of userIndexes) {
      try {
        await users.createIndex(index.key, index);
        console.log(`✅ Created index: ${JSON.stringify(index.key)}`);
      } catch (error) {
        console.warn(`⚠️ Error creating index: ${error.message}`);
      }
    }

    // Optimize Articles collection
    console.log('\nOptimizing Articles collection...');
    const articles = db.collection('articles');
    const articleIndexes = [
      { key: { slug: 1 }, unique: true },
      { key: { category: 1 } },
      { key: { createdAt: -1 } },
      { key: { title: 'text', content: 'text' }, 
        weights: { title: 10, content: 5 } }
    ];

    for (const index of articleIndexes) {
      try {
        await articles.createIndex(index.key, index);
        console.log(`✅ Created index: ${JSON.stringify(index.key)}`);
      } catch (error) {
        console.warn(`⚠️ Error creating index: ${error.message}`);
      }
    }

    console.log('\n✅ All database optimizations completed successfully!');

  } catch (error) {
    console.error('Error during optimization:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run optimization
optimizeDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 