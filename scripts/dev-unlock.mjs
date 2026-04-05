import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

async function unlockDevMode() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "GoalMania" });
  
  const result = await mongoose.connection.db.collection("products").updateMany(
    {}, 
    { 
      $set: { 
        isActive: true, 
        feature: true,
        videos: ["https://res.cloudinary.com/goal-mania/video/upload/v1/samples/sea-turtle.mp4"] 
      } 
    }
  );

  console.log(`✅ Success! ${result.modifiedCount} products are now active with videos.`);
  await mongoose.disconnect();
}

unlockDevMode();