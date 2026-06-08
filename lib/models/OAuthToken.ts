import mongoose, { Schema, Document } from "mongoose";

export interface IOAuthToken extends Document {
  provider: string;
  refreshToken: string;
  updatedAt: Date;
}

const OAuthTokenSchema = new Schema<IOAuthToken>({
  provider: { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.OAuthToken ||
  mongoose.model<IOAuthToken>("OAuthToken", OAuthTokenSchema);
