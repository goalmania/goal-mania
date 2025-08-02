#!/usr/bin/env node

// scripts/optimize-database.mjs - Apply database optimizations
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

async function optimizeDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: "GoalMania",
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);

    // Optimize Products collection
    console.log('\n🛍️  Optimizing Products collection...');
    const productIndexes = [
      { key: { title: 'text', description: 'text' }, name: 'text_search_idx' },
      { key: { category: 1 }, name: 'category_idx' },
      { key: { isActive: 1 }, name: 'active_idx' },
      { key: { feature: -1, createdAt: -1 }, name: 'featured_recent_idx' },
      { key: { slug: 1 }, name: 'slug_idx' },
      { key: { category: 1, isActive: 1, createdAt: -1 }, name: 'category_active_recent_idx' },
      { key: { feature: 1, isActive: 1, createdAt: -1 }, name: 'featured_active_recent_idx' },
      { key: { isMysteryBox: 1, isActive: 1 }, name: 'mystery_active_idx' },
    ];

    for (const index of productIndexes) {
      try {
        await db.collection('products').createIndex(index.key, { 
          name: index.name,
          background: true 
        });
        console.log(`  ✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️  Index ${index.name} already exists`);
        } else {
          console.log(`  ❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Optimize Users collection
    console.log('\n👥 Optimizing Users collection...');
    const userIndexes = [
      { key: { email: 1 }, name: 'email_idx' },
      { key: { role: 1 }, name: 'role_idx' },
      { key: { createdAt: -1 }, name: 'recent_users_idx' },
      { key: { name: 'text', email: 'text' }, name: 'user_text_search_idx' },
      { key: { role: 1, createdAt: -1 }, name: 'role_recent_idx' },
    ];

    for (const index of userIndexes) {
      try {
        await db.collection('users').createIndex(index.key, { 
          name: index.name,
          background: true 
        });
        console.log(`  ✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️  Index ${index.name} already exists`);
        } else {
          console.log(`  ❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Optimize Articles collection
    console.log('\n📰 Optimizing Articles collection...');
    const articleIndexes = [
      { key: { status: 1, publishedAt: -1 }, name: 'status_published_idx' },
      { key: { category: 1, status: 1, publishedAt: -1 }, name: 'category_status_published_idx' },
      { key: { featured: 1, status: 1, publishedAt: -1 }, name: 'featured_status_published_idx' },
      { key: { slug: 1 }, name: 'article_slug_idx' },
      { key: { league: 1, category: 1, status: 1 }, name: 'league_category_status_idx' },
      { key: { title: 'text', summary: 'text', content: 'text' }, name: 'article_text_search_idx' },
      { key: { createdAt: -1 }, name: 'recent_articles_idx' },
      { key: { author: 1, createdAt: -1 }, name: 'author_recent_idx' },
    ];

    for (const index of articleIndexes) {
      try {
        await db.collection('articles').createIndex(index.key, { 
          name: index.name,
          background: true 
        });
        console.log(`  ✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️  Index ${index.name} already exists`);
        } else {
          console.log(`  ❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Optimize Orders collection
    console.log('\n🛒 Optimizing Orders collection...');
    const orderIndexes = [
      { key: { status: 1 }, name: 'order_status_idx' },
      { key: { createdAt: -1 }, name: 'recent_orders_idx' },
      { key: { customerId: 1, createdAt: -1 }, name: 'customer_orders_idx' },
      { key: { status: 1, createdAt: -1 }, name: 'status_recent_orders_idx' },
      { key: { 'items.productId': 1 }, name: 'order_items_product_idx' },
      { key: { amount: -1 }, name: 'order_amount_idx' },
    ];

    for (const index of orderIndexes) {
      try {
        await db.collection('orders').createIndex(index.key, { 
          name: index.name,
          background: true 
        });
        console.log(`  ✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️  Index ${index.name} already exists`);
        } else {
          console.log(`  ❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Optimize Teams collection  
    console.log('\n⚽ Optimizing Teams collection...');
    const teamIndexes = [
      { key: { name: 'text', nickname: 'text' }, name: 'team_text_search_idx' },
      { key: { isInternational: 1, isActive: 1 }, name: 'international_active_idx' },
      { key: { isActive: 1 }, name: 'team_active_idx' },
      { key: { createdAt: -1 }, name: 'recent_teams_idx' },
    ];

    for (const index of teamIndexes) {
      try {
        await db.collection('teams').createIndex(index.key, { 
          name: index.name,
          background: true 
        });
        console.log(`  ✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️  Index ${index.name} already exists`);
        } else {
          console.log(`  ❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Optimize Patches collection
    console.log('\n🏷️  Optimizing Patches collection...');
    const patchIndexes = [
      { key: { isActive: 1 }, name: 'patch_active_idx' },
      { key: { isFeatured: 1 }, name: 'patch_featured_idx' },
      { key: { category: 1 }, name: 'patch_category_idx' },
      { key: { title: 'text', description: 'text' }, name: 'patch_text_search_idx' },
      { key: { sortOrder: 1 }, name: 'patch_sort_idx' },
      { key: { isActive: 1, isFeatured: -1, sortOrder: 1 }, name: 'patch_display_idx' },
    ];

    for (const index of patchIndexes) {
      try {
        await db.collection('patches').createIndex(index.key, { 
          name: index.name,
          background: true 
        });
        console.log(`  ✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️  Index ${index.name} already exists`);
        } else {
          console.log(`  ❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Show index statistics
    console.log('\n📊 Database Index Statistics:');
    const stats = await Promise.all([
      db.collection('products').indexInformation(),
      db.collection('users').indexInformation(),
      db.collection('articles').indexInformation(),
      db.collection('orders').indexInformation(),
      db.collection('teams').indexInformation(),
      db.collection('patches').indexInformation(),
    ]);

    const collections_names = ['products', 'users', 'articles', 'orders', 'teams', 'patches'];
    stats.forEach((indexInfo, i) => {
      const indexCount = Object.keys(indexInfo).length;
      console.log(`  ${collections_names[i]}: ${indexCount} indexes`);
    });

    console.log('\n✅ Database optimization completed successfully!');
    console.log('\n📝 Performance Tips:');
    console.log('  • Monitor query performance using db.collection.explain()');
    console.log('  • Use .lean() for read-only operations');
    console.log('  • Implement proper caching for frequently accessed data');
    console.log('  • Use field selection to limit data transfer');
    console.log('  • Consider connection pooling in production');

  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the optimization
optimizeDatabase();