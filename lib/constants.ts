export const getCloudinaryUrl = (type: 'image' | 'video' = 'image'): string => {
    // Primary configuration from environment variables
    let url = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
    
    // Fallback configuration based on curl commands if env vars are missing
    if (!url) {
        console.warn("NEXT_PUBLIC_CLOUDINARY_URL not found, using fallback configuration");
        url = "https://api.cloudinary.com/v1_1/dj5p3cwir";
    }
    
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