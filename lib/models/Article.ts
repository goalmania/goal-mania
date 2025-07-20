import mongoose, { Document, Model, Schema } from "mongoose";

export interface ArticleImage {
  id: string;
  url: string;
  alt?: string;
  isMain?: boolean;
}

export interface IArticle extends Document {
  title: string;
  content: string;
  summary: string;
  image: string; // Keep for backward compatibility
  images: ArticleImage[]; // New multiple images array
  category: "news" | "transferMarket" | "serieA" | "internationalTeams";
  league?: string; // For internationalTeams: LaLiga, Premier League, Bundesliga, etc.
  author: string;
  status: "draft" | "published";
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  featured: boolean;
  featuredJerseyId?: string; // ID of a jersey to feature in this article
}

const ArticleImageSchema = new Schema<ArticleImage>({
  id: { type: String, required: true },
  url: { type: String, required: true },
  alt: { type: String },
  isMain: { type: Boolean, default: false },
}, { _id: false });

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    image: { type: String, required: true }, // Keep for backward compatibility
    images: { type: [ArticleImageSchema], default: [] }, // New multiple images array
    category: {
      type: String,
      required: true,
      enum: ["news", "transferMarket", "serieA", "internationalTeams"],
    },
    league: { type: String },
    author: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: { type: Date },
    slug: { type: String, required: true, unique: true },
    featured: { type: Boolean, default: false },
    featuredJerseyId: { type: String },
  },
  { timestamps: true }
);

// Generate slug from title
ArticleSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

// Only set publishedAt when status changes to published
ArticleSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

// Ensure main image is set for backward compatibility
ArticleSchema.pre("save", function (next) {
  // If we have images but no main image is set, set the first one as main
  if (this.images && this.images.length > 0) {
    const mainImage = this.images.find(img => img.isMain);
    if (mainImage) {
      this.image = mainImage.url;
    } else {
      // Set first image as main if no main image is specified
      this.images[0].isMain = true;
      this.image = this.images[0].url;
    }
  }
  next();
});

export const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
