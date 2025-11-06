import mongoose, { Schema, Document } from 'mongoose';

export type VideoDisplayPage = 'shop' | 'home';

export interface IVideo extends Document {
  title: string;
  videoUrl: string;
  thumbnail: string;
  displayPage: VideoDisplayPage;
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
    displayPage: {
      type: String,
      enum: ['shop', 'home'],
      default: 'home',
      required: [true, 'Display page is required'],
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
