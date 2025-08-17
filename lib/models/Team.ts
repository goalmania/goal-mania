import mongoose from "mongoose";

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

export default Team; 