/**
 * Cleanup script for test/dummy data in MongoDB.
 *
 * Finds and removes:
 *  - Users with @example.com / @test.com email addresses
 *  - Addresses whose fullName contains Lorem ipsum text
 *  - Orders linked to those users
 *
 * Run with: npx ts-node -P tsconfig.json scripts/cleanup-test-data.ts
 * Use --dry-run to preview without deleting.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  if (DRY_RUN) console.log("[DRY RUN] No data will be deleted.\n");

  const db = mongoose.connection.db!;

  // --- Test users ---
  const testUserFilter = {
    $or: [
      { email: /@example\.com$/i },
      { email: /@test\.com$/i },
      { email: /^test@/i },
    ],
  };
  const testUsers = await db.collection("users").find(testUserFilter).toArray();
  console.log(`Found ${testUsers.length} test user(s)`);
  testUsers.forEach((u) => console.log("  -", u.email, u._id));

  if (!DRY_RUN && testUsers.length > 0) {
    const result = await db.collection("users").deleteMany(testUserFilter);
    console.log(`  Deleted ${result.deletedCount} user(s)`);
  }

  const testUserIds = testUsers.map((u) => u._id);

  // --- Lorem ipsum addresses ---
  const loremFilter = {
    $or: [
      { fullName: /lorem/i },
      { addressLine1: /lorem/i },
      { city: /lorem/i },
    ],
  };
  const loremAddresses = await db.collection("addresses").find(loremFilter).toArray();
  console.log(`\nFound ${loremAddresses.length} Lorem ipsum address(es)`);

  if (!DRY_RUN && loremAddresses.length > 0) {
    const result = await db.collection("addresses").deleteMany(loremFilter);
    console.log(`  Deleted ${result.deletedCount} address(es)`);
  }

  // --- Addresses belonging to test users ---
  if (testUserIds.length > 0) {
    const userAddrFilter = { userId: { $in: testUserIds } };
    const userAddresses = await db.collection("addresses").find(userAddrFilter).toArray();
    console.log(`\nFound ${userAddresses.length} address(es) linked to test users`);

    if (!DRY_RUN && userAddresses.length > 0) {
      const result = await db.collection("addresses").deleteMany(userAddrFilter);
      console.log(`  Deleted ${result.deletedCount} address(es)`);
    }
  }

  // --- Orders belonging to test users ---
  if (testUserIds.length > 0) {
    const orderFilter = { userId: { $in: testUserIds } };
    const testOrders = await db.collection("orders").find(orderFilter).toArray();
    console.log(`\nFound ${testOrders.length} order(s) linked to test users`);

    if (!DRY_RUN && testOrders.length > 0) {
      const result = await db.collection("orders").deleteMany(orderFilter);
      console.log(`  Deleted ${result.deletedCount} order(s)`);
    }
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
