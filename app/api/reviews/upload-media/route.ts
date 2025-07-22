import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to upload media" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const uploadPromises = files.map(async (file) => {
      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
      }

      // Validate file type
      const isValidImage = validImageTypes.includes(file.type);
      const isValidVideo = validVideoTypes.includes(file.type);
      
      if (!isValidImage && !isValidVideo) {
        throw new Error(`File ${file.name} has an unsupported format.`);
      }

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      // Add folder for reviews
      formData.append("folder", "reviews");

      const response = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL!, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}: ${response.status}`);
      }

      const result = await response.json();
      return {
        url: result.secure_url,
        type: isValidImage ? "image" : "video",
        filename: file.name,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      {
        error: "Failed to upload media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 