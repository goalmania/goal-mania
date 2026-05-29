export const getCloudinaryUrl = (type: 'image' | 'video' = 'image'): string => {
    let url = process.env.NEXT_PUBLIC_CLOUDINARY_URL || "https://api.cloudinary.com/v1_1/dj5p3cwir";
    // Strip any trailing /image/upload or /video/upload already present in the env var
    url = url.replace(/\/(image|video)\/upload\/?$/, "");
    return `${url}/${type}/upload`;
};

export const getCloudinaryUploadPreset = (): string => {
    // Primary configuration from environment variables
    let preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    // Fallback configuration based on curl commands if env vars are missing
    if (!preset) {
        console.warn("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET not found, using fallback configuration");
        preset = "ml_default";
    }
    
    return preset;
};