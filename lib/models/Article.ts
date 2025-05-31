import mongoose, { Document, Model, Schema } from "mongoose";

export interface IArticle extends Document {
  title: string;
  content: string;
  summary: string;
  image: string;
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

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    image: { type: String, required: true },
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

export const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
