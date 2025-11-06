import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  videoUrl: string;
  thumbnail: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
VideoSchema.index({ order: 1, isActive: 1 });

const Video = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
