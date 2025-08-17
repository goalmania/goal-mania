const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goal-mania');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test team filtering function
const testTeamFiltering = async () => {
  await connectDB();
  
  // Get the Product model
  const Product = mongoose.models.Product;
  
  if (!Product) {
    console.error('Product model not found');
    return;
  }

  // Test teams
  const testTeams = ['Inter', 'Milan', 'Juventus', 'Napoli', 'Roma'];
  
  console.log('Testing team filtering with "Maglia [TeamName]" pattern...\n');
  
  for (const team of testTeams) {
    console.log(`Testing team: ${team}`);
    
    try {
      const products = await Product.find({
        category: "SeriesA",
        isActive: true,
        title: { $regex: new RegExp(`^Maglia\\s+${team}`, 'i') }
      }).select('title category isActive').limit(5);
      
      console.log(`Found ${products.length} products for ${team}:`);
      products.forEach(product => {
        console.log(`  - ${product.title} (${product.category})`);
      });
      console.log('');
    } catch (error) {
      console.error(`Error testing ${team}:`, error);
    }
  }
  
  // Test with lowercase team names
  console.log('Testing with lowercase team names...\n');
  
  for (const team of testTeams.map(t => t.toLowerCase())) {
    console.log(`Testing team: ${team}`);
    
    try {
      const teamName = team.charAt(0).toUpperCase() + team.slice(1).toLowerCase();
      const products = await Product.find({
        category: "SeriesA",
        isActive: true,
        title: { $regex: new RegExp(`^Maglia\\s+${teamName}`, 'i') }
      }).select('title category isActive').limit(5);
      
      console.log(`Found ${products.length} products for ${teamName}:`);
      products.forEach(product => {
        console.log(`  - ${product.title} (${product.category})`);
      });
      console.log('');
    } catch (error) {
      console.error(`Error testing ${team}:`, error);
    }
  }
  
  // Test team name extraction from titles
  console.log('Testing team name extraction from product titles...\n');
  
  try {
    const sampleProducts = await Product.find({
      category: "SeriesA",
      isActive: true
    }).select('title').limit(10);
    
    console.log('Sample products and extracted team names:');
    sampleProducts.forEach(product => {
      const words = product.title.split(' ');
      const extractedTeam = words.length > 1 ? words[1] : 'Unknown';
      console.log(`  - "${product.title}" -> Team: "${extractedTeam}"`);
    });
    console.log('');
  } catch (error) {
    console.error('Error testing team extraction:', error);
  }
  
  await mongoose.disconnect();
  console.log('Test completed');
};

// Run the test
testTeamFiltering().catch(console.error); 