/**
 * Image Proxy API
 * 
 * Proxies image requests to handle certificate errors and CORS issues
 * Falls back to placeholder if image cannot be loaded
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Missing image URL", { status: 400 });
    }

    // Validate URL
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    // Only allow specific domains for security
    const allowedDomains = [
      "goalmania.shop",
      "res.cloudinary.com",
      "crests.football-data.org",
      "media.api-sports.io",
    ];

    if (!allowedDomains.some((domain) => url.hostname.includes(domain))) {
      return new NextResponse("Domain not allowed", { status: 403 });
    }

    try {
      // Use Node.js https module to handle certificate errors
      const https = require("https");
      const http = require("http");
      
      const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
        const protocol = url.protocol === "https:" ? https : http;
        
        const requestOptions: any = {
          timeout: 10000,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; GoalMania/1.0)",
          },
        };

        // In development, ignore certificate errors
        if (process.env.NODE_ENV === "development" && url.protocol === "https:") {
          requestOptions.rejectUnauthorized = false;
        }

        const req = protocol.get(imageUrl, requestOptions, (res: any) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to fetch: ${res.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
        });

        req.on("error", reject);
        req.on("timeout", () => {
          req.destroy();
          reject(new Error("Request timeout"));
        });
      });

      // Determine content type from URL extension
      const contentType = imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        ? `image/${imageUrl.split('.').pop()?.toLowerCase() || 'jpeg'}`
        : "image/jpeg";

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error: any) {
      // Log the error but don't expose details to client
      const errorMessage = error.message || "Unknown error";
      console.warn(`Image proxy error for ${imageUrl}:`, errorMessage);

      // Return a 1x1 transparent PNG as fallback
      // This prevents broken image icons in the browser
      const fallbackImage = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );

      return new NextResponse(fallbackImage, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=60",
          "X-Image-Error": "true", // Header to indicate fallback was used
        },
        status: 200, // Return 200 with fallback image to prevent broken images
      });
    }
  } catch (error: any) {
    console.error("Image proxy route error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

