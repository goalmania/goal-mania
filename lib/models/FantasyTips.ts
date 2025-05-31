import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPlayer {
  name: string;
  team: string;
  reason: string;
}

export interface IFantasyTips extends Document {
  recommended: IPlayer[];
  notRecommended: IPlayer[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Optional user ID who created/updated the tips
}

const PlayerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  team: { type: String, required: true },
  reason: { type: String, required: true },
});

const FantasyTipsSchema = new Schema<IFantasyTips>(
  {
    recommended: [PlayerSchema],
    notRecommended: [PlayerSchema],
    createdBy: { type: String },
  },
  { timestamps: true }
);

export const FantasyTips: Model<IFantasyTips> =
  mongoose.models.FantasyTips ||
  mongoose.model<IFantasyTips>("FantasyTips", FantasyTipsSchema);

export default FantasyTips;
