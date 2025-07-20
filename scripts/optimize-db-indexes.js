const mongoose = require('mongoose');
require('dotenv').config();

async function optimizeProductIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    console.log('Creating optimized indexes for products collection...');

    // Drop existing indexes (except _id)
    const existingIndexes = await collection.indexes();
    for (const index of existingIndexes) {
      if (index.name !== '_id_') {
        console.log(`Dropping index: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }

    // Create optimized indexes for common query patterns
    const indexes = [
      // Primary query index - most common queries
      {
        key: { isActive: 1, category: 1, createdAt: -1 },
        name: 'idx_active_category_created',
        background: true
      },
      
      // Search index - for text search
      {
        key: { 
          title: 'text', 
          description: 'text', 
          category: 'text' 
        },
        name: 'idx_text_search',
        background: true,
        weights: {
          title: 10,
          description: 5,
          category: 3
        }
      },
      
      // Featured products index
      {
        key: { feature: 1, isActive: 1, createdAt: -1 },
        name: 'idx_featured_active',
        background: true
      },
      
      // Stock management index
      {
        key: { stockQuantity: 1, isActive: 1 },
        name: 'idx_stock_active',
        background: true
      },
      
      // Mystery box index
      {
        key: { isMysteryBox: 1, isActive: 1 },
        name: 'idx_mystery_box',
        background: true
      },
      
      // Slug index for direct product lookup
      {
        key: { slug: 1 },
        name: 'idx_slug_unique',
        unique: true,
        sparse: true,
        background: true
      },
      
      // Price range index
      {
        key: { basePrice: 1, isActive: 1 },
        name: 'idx_price_active',
        background: true
      },
      
      // Category and type index
      {
        key: { category: 1, isRetro: 1, isActive: 1 },
        name: 'idx_category_type_active',
        background: true
      }
    ];

    for (const index of indexes) {
      console.log(`Creating index: ${index.name}`);
      await collection.createIndex(index.key, {
        name: index.name,
        background: index.background,
        unique: index.unique || false,
        sparse: index.sparse || false,
        weights: index.weights
      });
    }

    console.log('All indexes created successfully!');

    // Show final index list
    const finalIndexes = await collection.indexes();
    console.log('\nFinal indexes:');
    finalIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Analyze query performance
    console.log('\nAnalyzing query performance...');
    
    // Test common queries
    const testQueries = [
      { isActive: true, category: '2024/25' },
      { feature: true, isActive: true },
      { stockQuantity: { $lte: 10 } },
      { isMysteryBox: true, isActive: true },
      { $text: { $search: 'milan' } }
    ];

    for (const query of testQueries) {
      const startTime = Date.now();
      const count = await collection.countDocuments(query);
      const endTime = Date.now();
      console.log(`Query ${JSON.stringify(query)}: ${count} results in ${endTime - startTime}ms`);
    }

  } catch (error) {
    console.error('Error optimizing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the optimization
if (require.main === module) {
  optimizeProductIndexes()
    .then(() => {
      console.log('Database optimization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Optimization failed:', error);
      process.exit(1);
    });
}

module.exports = { optimizeProductIndexes }; 