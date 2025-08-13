# Global Patches Seeding Script

This script seeds the database with global patches that were previously hardcoded in the application.

## Overview

The `seed-global-patches.mjs` script creates standardized patches for football competitions that can be applied to jerseys. These patches were previously hardcoded in various parts of the application and are now centralized as database entities.

## What Patches Are Created

### Featured Patches (isFeatured: true)
- **Champions League Patch** - UEFA Champions League competition
- **Serie A Patch** - Italian Serie A TIM league 
- **Coppa Italia Patch** - Italian domestic cup competition

### Standard Patches (isFeatured: false)
- **Europa League Patch** - UEFA Europa League competition
- **Conference League Patch** - UEFA Conference League competition
- **Supercoppa Italiana Patch** - Italian Super Cup

## Patch Details

All patches include:
- **Price**: €3.00 (matching previously hardcoded PATCH_PRICES)
- **Active Status**: All patches are active by default
- **Internationalization**: English and Italian names/descriptions
- **Metadata**: Competition details, type, league, season information
- **Sort Order**: Logical ordering for display

## Usage

### Prerequisites
- MongoDB connection configured in `.env`
- Database name: "GoalMania"
- Node.js environment

### Running the Script

```bash
# Run from project root
node scripts/seed-global-patches.mjs

# Or using npm/pnpm
pnpm run seed:patches  # (if added to package.json scripts)
```

### Environment Variables Required
```env
MONGODB_URI=your_mongodb_connection_string
```

## Script Features

### Duplicate Prevention
The script checks for existing patches and skips seeding if any are found to prevent duplicates.

### Comprehensive Logging
- Connection status
- Individual patch creation results
- Summary statistics
- Featured patches list

### Error Handling
- Individual patch creation errors don't stop the entire process
- Connection errors are properly handled
- Graceful database disconnection

## Database Schema

Each patch includes:
```javascript
{
  title: String,           // Display name
  description: String,     // Detailed description  
  imageUrl: String,        // Path to patch image
  category: String,        // Competition category
  price: Number,           // Price in euros
  isActive: Boolean,       // Whether available for selection
  isFeatured: Boolean,     // Whether to highlight in UI
  sortOrder: Number,       // Display order
  metadata: Map,           // Additional competition info
  createdBy: String,       // Admin email
  updatedBy: String,       // Admin email
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

## Previously Hardcoded Data Sources

This script consolidates patches from:
- `VALID_PATCHES` in `lib/types/product.ts`
- `DEFAULT_PATCHES` in `scripts/seed-all-products.mjs`
- `PATCH_PRICES` in `app/_components/ProductDetailClient.tsx`

## Integration Points

After seeding, patches can be:
- Managed through the admin panel (`/admin/patches`)
- Applied to products during creation/editing
- Filtered and searched via the patches API
- Displayed in the product customization UI

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MONGODB_URI in .env
   - Check database connectivity
   - Ensure "GoalMania" database exists

2. **Patches Already Exist**
   - Script skips seeding to prevent duplicates
   - Delete existing patches first if re-seeding needed
   - Check admin panel for current patches

3. **Image URLs Not Found**
   - Patch images should be placed in `/public/patches/`
   - SVG format recommended for crisp display
   - Update imageUrl paths in script if needed

### Re-seeding

To re-seed patches:
1. Delete existing patches through admin panel or MongoDB
2. Run the script again
3. Verify new patches in admin panel

## Next Steps

After seeding:
1. Add actual patch images to `/public/patches/`
2. Verify patches appear in admin panel
3. Test patch selection in product customization
4. Update any remaining hardcoded references

## Script Output Example

```
✅ MongoDB connected
🌱 Starting global patches seeding...
✅ Created patch: Champions League Patch (champions-league)
✅ Created patch: Serie A Patch (serie-a)
✅ Created patch: Coppa Italia Patch (coppa-italia)
✅ Created patch: Europa League Patch (europa-league)
✅ Created patch: Conference League Patch (europa-league)
✅ Created patch: Supercoppa Italiana Patch (other)

📊 Seeding Summary:
✅ Successfully created: 6 patches
❌ Failed: 0 patches
📦 Total patches in database: 6
⭐ Featured patches: 3
   - Champions League Patch (champions-league)
   - Serie A Patch (serie-a)
   - Coppa Italia Patch (coppa-italia)
🎉 Global patches seeding completed successfully!
👋 Database connection closed
``` 