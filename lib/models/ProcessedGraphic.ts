import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProcessedGraphic extends Document {
  articleId: string;
  articleSlug: string;
  sentAt: Date;
  telegramMessageId?: number;
}

const ProcessedGraphicSchema = new Schema<IProcessedGraphic>(
  {
    articleId: { type: String, required: true, unique: true, index: true },
    articleSlug: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    telegramMessageId: { type: Number },
  },
  { timestamps: true }
);

export const ProcessedGraphic: Model<IProcessedGraphic> =
  mongoose.models.ProcessedGraphic ||
  mongoose.model<IProcessedGraphic>("ProcessedGraphic", ProcessedGraphicSchema);

export default ProcessedGraphic;
