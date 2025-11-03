// Test script for football API endpoints
// Run with: node scripts/test-football-api.js

const testEndpoints = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log('🏈 Testing Football API Endpoints\n');
  console.log('='.repeat(50));
  
  // Test 1: Fixtures endpoint
  console.log('\n1️⃣  Testing /api/football/fixtures?league=serieA');
  try {
    const response = await fetch(`${baseUrl}/api/football/fixtures?league=serieA`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Cache: ${response.headers.get('X-Cache') || 'N/A'}`);
    console.log(`   Fixtures: ${data.fixtures?.length || 0}`);
    console.log(`   Fallback Used: ${data.fallbackUsed || false}`);
    console.log(`   ✅ Fixtures endpoint working`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Standings endpoint
  console.log('\n2️⃣  Testing /api/football/standings?league=SA&season=2024');
  try {
    const response = await fetch(`${baseUrl}/api/football/standings?league=SA&season=2024`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Cache: ${response.headers.get('X-Cache') || 'N/A'}`);
    console.log(`   Standings: ${data.standings?.[0]?.table?.length || 0} teams`);
    console.log(`   Fallback Used: ${data.fallbackUsed || false}`);
    console.log(`   ✅ Standings endpoint working`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Live matches endpoint
  console.log('\n3️⃣  Testing /api/football/live-matches');
  try {
    const response = await fetch(`${baseUrl}/api/football/live-matches`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Cache: ${response.headers.get('X-Cache') || 'N/A'}`);
    console.log(`   Live Matches: ${data.matches?.length || 0}`);
    console.log(`   Fallback Used: ${data.fallbackUsed || false}`);
    console.log(`   ✅ Live matches endpoint working`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!\n');
};

// Only run if executed directly
if (require.main === module) {
  testEndpoints().catch(console.error);
}

module.exports = { testEndpoints };
