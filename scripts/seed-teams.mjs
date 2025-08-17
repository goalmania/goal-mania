import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set");
  process.exit(1);
}

// Team schema (copied from the model)
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      minlength: [2, "Team name must be at least 2 characters long"],
      maxlength: [50, "Team name cannot exceed 50 characters"],
    },
    nickname: {
      type: String,
      required: [true, "Team nickname is required"],
      trim: true,
      maxlength: [30, "Nickname cannot exceed 30 characters"],
    },
    logo: {
      type: String,
      required: [true, "Team logo URL is required"],
      trim: true,
    },
    href: {
      type: String,
      required: false,
      trim: true,
    },
    colors: {
      type: String,
      required: [true, "Team colors gradient is required"],
      trim: true,
    },
    bgGradient: {
      type: String,
      required: [true, "Background gradient is required"],
      trim: true,
    },
    borderColor: {
      type: String,
      required: [true, "Border color is required"],
      trim: true,
    },
    textColor: {
      type: String,
      required: [true, "Text color is required"],
      trim: true,
    },
    isInternational: {
      type: Boolean,
      default: false,
      index: true,
    },
    league: {
      type: String,
      trim: true,
      maxlength: [50, "League name cannot exceed 50 characters"],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, "Country name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware to generate slug if not provided
teamSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Create indexes for efficient queries
teamSchema.index({ name: "text", nickname: "text" });
teamSchema.index({ isInternational: 1, isActive: 1 });
teamSchema.index({ displayOrder: 1, name: 1 });
teamSchema.index({ league: 1 });

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

// Sample teams data from TeamCarousel
const teamsData = [
  {
    name: "Inter",
    nickname: "Nerazzurri",
    logo: "https://media.api-sports.io/football/teams/505.png",
    colors: "from-blue-900 via-blue-800 to-black",
    bgGradient: "from-blue-900/20 to-black/20",
    borderColor: "border-blue-500",
    textColor: "text-blue-400",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Milan",
    nickname: "Rossoneri",
    logo: "https://media.api-sports.io/football/teams/489.png",
    colors: "from-red-600 via-red-700 to-red-800",
    bgGradient: "from-red-600/20 to-red-800/20",
    borderColor: "border-red-500",
    textColor: "text-red-400",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 2,
    isActive: true,
  },
  {
    name: "Juventus",
    nickname: "Bianconeri",
    logo: "https://media.api-sports.io/football/teams/496.png",
    colors: "from-black via-gray-900 to-gray-800",
    bgGradient: "from-black/20 to-gray-800/20",
    borderColor: "border-gray-600",
    textColor: "text-gray-300",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 3,
    isActive: true,
  },
  {
    name: "Napoli",
    nickname: "Partenopei",
    logo: "https://media.api-sports.io/football/teams/492.png",
    colors: "from-blue-500 via-blue-600 to-blue-700",
    bgGradient: "from-blue-500/20 to-blue-700/20",
    borderColor: "border-blue-400",
    textColor: "text-blue-300",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 4,
    isActive: true,
  },
  {
    name: "Roma",
    nickname: "Giallorossi",
    logo: "https://media.api-sports.io/football/teams/497.png",
    colors: "from-yellow-400 via-orange-500 to-red-600",
    bgGradient: "from-yellow-400/20 to-red-600/20",
    borderColor: "border-orange-500",
    textColor: "text-orange-400",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 5,
    isActive: true,
  },
  {
    name: "Lazio",
    nickname: "Biancocelesti",
    logo: "https://media.api-sports.io/football/teams/487.png",
    colors: "from-blue-400 via-blue-500 to-blue-600",
    bgGradient: "from-blue-400/20 to-blue-600/20",
    borderColor: "border-blue-300",
    textColor: "text-blue-300",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 6,
    isActive: true,
  },
  {
    name: "Atalanta",
    nickname: "La Dea",
    logo: "https://media.api-sports.io/football/teams/499.png",
    colors: "from-blue-600 via-blue-700 to-blue-800",
    bgGradient: "from-blue-600/20 to-blue-800/20",
    borderColor: "border-blue-500",
    textColor: "text-blue-400",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 7,
    isActive: true,
  },
  {
    name: "Fiorentina",
    nickname: "Viola",
    logo: "https://media.api-sports.io/football/teams/502.png",
    colors: "from-purple-600 via-purple-700 to-purple-800",
    bgGradient: "from-purple-600/20 to-purple-800/20",
    borderColor: "border-purple-500",
    textColor: "text-purple-400",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 8,
    isActive: true,
  },
  {
    name: "Torino",
    nickname: "Granata",
    logo: "https://media.api-sports.io/football/teams/503.png",
    colors: "from-red-700 via-red-800 to-red-900",
    bgGradient: "from-red-700/20 to-red-900/20",
    borderColor: "border-red-600",
    textColor: "text-red-300",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 9,
    isActive: true,
  },
  {
    name: "Bologna",
    nickname: "Rossoblù",
    logo: "https://media.api-sports.io/football/teams/500.png",
    colors: "from-red-500 via-red-600 to-blue-600",
    bgGradient: "from-red-500/20 to-blue-600/20",
    borderColor: "border-red-400",
    textColor: "text-red-300",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 10,
    isActive: true,
  },
  {
    name: "Sassuolo",
    nickname: "Neroverdi",
    logo: "https://media.api-sports.io/football/teams/488.png",
    colors: "from-green-600 via-green-700 to-black",
    bgGradient: "from-green-600/20 to-black/20",
    borderColor: "border-green-500",
    textColor: "text-green-400",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 11,
    isActive: true,
  },
  {
    name: "Udinese",
    nickname: "Bianconeri",
    logo: "https://media.api-sports.io/football/teams/494.png",
    colors: "from-white via-gray-100 to-black",
    bgGradient: "from-white/20 to-black/20",
    borderColor: "border-gray-400",
    textColor: "text-gray-600",
    isInternational: false,
    league: "Serie A",
    country: "Italy",
    displayOrder: 12,
    isActive: true,
  },
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "GoalMania",
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

async function seedTeams() {
  try {
    console.log("🌱 Starting teams seeding...");

    // Clear existing teams (optional - comment out if you want to keep existing data)
    await Team.deleteMany({});
    console.log("🗑️ Cleared existing teams");

    // Insert teams
    const insertedTeams = await Team.insertMany(teamsData);
    console.log(`✅ Successfully seeded ${insertedTeams.length} teams`);

    // Display summary
    console.log("\n📊 Seeded Teams Summary:");
    console.log("========================");
    insertedTeams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.name} (${team.nickname}) - ${team.league}`);
    });

    console.log(`\n🎉 Teams seeding completed successfully!`);
  } catch (error) {
    console.error("❌ Error seeding teams:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await seedTeams();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seeding script
main(); 