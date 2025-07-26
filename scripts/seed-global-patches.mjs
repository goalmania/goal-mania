#!/usr/bin/env node
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectToDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "GoalMania",
    });
    console.log("✅ MongoDB connected");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

// Define the Patch schema
const patchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["champions-league", "serie-a", "coppa-italia", "europa-league", "other"],
      default: "other",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create the model
const Patch = mongoose.models.Patch || mongoose.model("Patch", patchSchema);

// Global patches data - previously hardcoded patches
const GLOBAL_PATCHES = [
  {
    title: "Champions League Patch",
    description: "Official UEFA Champions League patch for jerseys. Add the prestige of Europe's premier club competition to your shirt with this authentic embroidered patch.",
    imageUrl: "/patches/champions-league.svg",
    category: "champions-league",
    price: 3,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    metadata: {
      nameEn: "Champions League Patch",
      nameIt: "Patch Champions League",
      descriptionEn: "Official UEFA Champions League patch for jerseys. Add the prestige of Europe's premier club competition to your shirt with this authentic embroidered patch.",
      descriptionIt: "Patch ufficiale UEFA Champions League per maglie. Aggiungi il prestigio della principale competizione europea per club alla tua maglia con questo patch ricamato autentico.",
      competition: "UEFA Champions League",
      competitionType: "European",
      season: "2024/25"
    }
  },
  {
    title: "Serie A Patch",
    description: "Official Serie A TIM patch for jerseys. Show your passion for Italy's top football league with this premium quality embroidered patch.",
    imageUrl: "/patches/serie-a.svg", 
    category: "serie-a",
    price: 3,
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    metadata: {
      nameEn: "Serie A Patch",
      nameIt: "Patch Serie A",
      descriptionEn: "Official Serie A TIM patch for jerseys. Show your passion for Italy's top football league with this premium quality embroidered patch.",
      descriptionIt: "Patch ufficiale Serie A TIM per maglie. Mostra la tua passione per il campionato italiano di calcio con questo patch ricamato di qualità premium.",
      competition: "Serie A TIM",
      competitionType: "Domestic",
      league: "Italian",
      season: "2024/25"
    }
  },
  {
    title: "Coppa Italia Patch",
    description: "Official Coppa Italia patch for jerseys. Celebrate Italy's premier cup competition with this authentic tournament patch.",
    imageUrl: "/patches/coppa-italia.svg",
    category: "coppa-italia", 
    price: 3,
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
    metadata: {
      nameEn: "Coppa Italia Patch",
      nameIt: "Patch Coppa Italia",
      descriptionEn: "Official Coppa Italia patch for jerseys. Celebrate Italy's premier cup competition with this authentic tournament patch.",
      descriptionIt: "Patch ufficiale Coppa Italia per maglie. Celebra la principale competizione a coppa italiana con questo patch autentico del torneo.",
      competition: "Coppa Italia",
      competitionType: "Domestic Cup",
      league: "Italian",
      season: "2024/25"
    }
  },
  {
    title: "Europa League Patch",
    description: "Official UEFA Europa League patch for jerseys. Display your European football pride with this high-quality tournament patch.",
    imageUrl: "/patches/europa-league.svg",
    category: "europa-league",
    price: 3,
    isActive: true,
    isFeatured: false,
    sortOrder: 4,
    metadata: {
      nameEn: "Europa League Patch",
      nameIt: "Patch Europa League", 
      descriptionEn: "Official UEFA Europa League patch for jerseys. Display your European football pride with this high-quality tournament patch.",
      descriptionIt: "Patch ufficiale UEFA Europa League per maglie. Mostra il tuo orgoglio calcistico europeo con questo patch del torneo di alta qualità.",
      competition: "UEFA Europa League",
      competitionType: "European",
      season: "2024/25"
    }
  },
  {
    title: "Conference League Patch",
    description: "Official UEFA Conference League patch for jerseys. Join Europe's third-tier competition excitement with this official tournament patch.",
    imageUrl: "/patches/conference-league.svg",
    category: "europa-league",
    price: 3,
    isActive: true,
    isFeatured: false,
    sortOrder: 5,
    metadata: {
      nameEn: "Conference League Patch",
      nameIt: "Patch Conference League",
      descriptionEn: "Official UEFA Conference League patch for jerseys. Join Europe's third-tier competition excitement with this official tournament patch.",
      descriptionIt: "Patch ufficiale UEFA Conference League per maglie. Unisciti all'emozione della terza competizione europea con questo patch ufficiale del torneo.",
      competition: "UEFA Conference League", 
      competitionType: "European",
      season: "2024/25"
    }
  },
  {
    title: "Supercoppa Italiana Patch",
    description: "Official Supercoppa Italiana patch for jerseys. Commemorate Italy's super cup with this exclusive competition patch.",
    imageUrl: "/patches/supercoppa-italiana.svg",
    category: "other",
    price: 3,
    isActive: true,
    isFeatured: false,
    sortOrder: 6,
    metadata: {
      nameEn: "Supercoppa Italiana Patch",
      nameIt: "Patch Supercoppa Italiana",
      descriptionEn: "Official Supercoppa Italiana patch for jerseys. Commemorate Italy's super cup with this exclusive competition patch.",
      descriptionIt: "Patch ufficiale Supercoppa Italiana per maglie. Commemora la supercoppa italiana con questo patch esclusivo della competizione.",
      competition: "Supercoppa Italiana",
      competitionType: "Super Cup",
      league: "Italian",
      season: "2024/25"
    }
  }
];

// Admin user email for created/updated by fields
const ADMIN_EMAIL = "admin@goalmania.com";

// Function to seed global patches
const seedGlobalPatches = async () => {
  try {
    console.log("🌱 Starting global patches seeding...");

    // Check if patches already exist
    const existingPatches = await Patch.find({
      category: { $in: ["champions-league", "serie-a", "coppa-italia", "europa-league"] }
    });

    if (existingPatches.length > 0) {
      console.log(`⚠️  Found ${existingPatches.length} existing patches. Skipping seed to avoid duplicates.`);
      console.log("💡 Delete existing patches first if you want to re-seed.");
      return;
    }

    // Create patches
    let successCount = 0;
    let errorCount = 0;

    for (const patchData of GLOBAL_PATCHES) {
      try {
        const patch = new Patch({
          ...patchData,
          createdBy: ADMIN_EMAIL,
          updatedBy: ADMIN_EMAIL,
        });

        await patch.save();
        console.log(`✅ Created patch: ${patchData.title} (${patchData.category})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create patch "${patchData.title}":`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Seeding Summary:`);
    console.log(`✅ Successfully created: ${successCount} patches`);
    console.log(`❌ Failed: ${errorCount} patches`);
    console.log(`📦 Total patches in database: ${await Patch.countDocuments()}`);

    // Show featured patches
    const featuredPatches = await Patch.find({ isFeatured: true });
    console.log(`⭐ Featured patches: ${featuredPatches.length}`);
    featuredPatches.forEach(patch => {
      console.log(`   - ${patch.title} (${patch.category})`);
    });

  } catch (error) {
    console.error("❌ Error during global patches seeding:", error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectToDB();
    await seedGlobalPatches();
    console.log("🎉 Global patches seeding completed successfully!");
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Database connection closed");
  }
};

// Run the script
main().catch((error) => {
  console.error("💥 Script execution failed:", error);
  process.exit(1);
}); 