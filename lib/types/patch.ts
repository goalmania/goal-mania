export const PATCH_CATEGORIES = [
  "champions-league",
  "serie-a", 
  "coppa-italia",
  "europa-league",
  "other"
] as const;

export type PatchCategory = (typeof PATCH_CATEGORIES)[number];

export interface IPatch {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: PatchCategory;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  metadata: Record<string, string>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  formattedPrice?: string;
}

export interface CreatePatchRequest {
  title: string;
  description: string;
  imageUrl: string;
  category: PatchCategory;
  price: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  metadata?: Record<string, string>;
}

export interface UpdatePatchRequest extends Partial<CreatePatchRequest> {
  id: string;
}

export interface PatchFilters {
  category?: PatchCategory;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'price' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
} 