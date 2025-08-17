# Team Logo Carousel - Team Filtering Feature

## Overview
The team logo carousel feature allows users to click on team logos and navigate to dedicated pages showing only shirts from that specific team. This provides a seamless shopping experience for users who want to browse products by their favorite teams.

## Implementation Details

### 1. Team Carousel Component
- **Location**: `components/home/TeamCarousel.tsx`
- **Features**:
  - Horizontal scrolling carousel with team logos
  - Each team card has hover effects and animations
  - Direct links to team-specific product pages
  - Responsive design for all screen sizes

### 2. Team-Specific Pages
- **URL Structure**: `/shop/serieA/[team]`
- **Example URLs**:
  - `/shop/serieA/inter` - Inter Milan products
  - `/shop/serieA/milan` - AC Milan products
  - `/shop/serieA/juventus` - Juventus products
  - `/shop/serieA/napoli` - Napoli products

### 3. Product Filtering Logic
- **Database Query**: Filters products by team name as the second word in the product title
- **Title Pattern**: Products follow the pattern "Maglia [TeamName] [Season/Type]"
- **Case-Insensitive**: Matches team names regardless of case
- **Category Filter**: Only shows Serie A category products
- **Active Products**: Only shows active (isActive: true) products

### 4. Product Title Structure
Products in the database follow this naming convention:
```
"Maglia [TeamName] [Season/Type]"
```

**Examples:**
- "Maglia Inter 2025/26 Home"
- "Maglia Milan 2025/26 Home"
- "Maglia Juventus 2025/26 Home"
- "Maglia Napoli 2025/26 Home"
- "Maglia Roma 2025/26 Home"

The team name is extracted as the **second word** in the title (after "Maglia").

### 5. Supported Teams
The following teams are supported in the carousel and filtering:

#### Major Teams (Featured in Carousel)
- **Inter** - Nerazzurri
- **Milan** - Rossoneri  
- **Juventus** - Bianconeri
- **Napoli** - Partenopei
- **Roma** - Giallorossi
- **Lazio** - Biancocelesti
- **Atalanta** - La Dea
- **Fiorentina** - Viola
- **Torino** - Granata
- **Bologna** - Rossoblù
- **Sassuolo** - Neroverdi
- **Udinese** - Bianconeri

#### Additional Supported Teams
- Monza
- Lecce
- Frosinone
- Cagliari
- Genoa
- Empoli
- Verona
- Salernitana

### 6. User Experience Features

#### Breadcrumb Navigation
- Clear navigation path: Home > Shop > Serie A > [Team Name]
- Helps users understand their current location
- Easy navigation back to parent pages

#### Team-Specific Content
- Custom page titles: "[Team Name] Collection"
- Descriptive text explaining the team's products
- Consistent branding with team colors and styling

#### Responsive Design
- Mobile-optimized carousel navigation
- Touch-friendly team cards
- Adaptive layout for different screen sizes

### 7. Technical Implementation

#### File Structure
```
app/shop/serieA/
├── page.tsx                    # Main Serie A page
├── [team]/
│   └── page.tsx               # Team-specific page
└── international/
    └── page.tsx               # International Serie A page

components/home/
├── TeamCarousel.tsx           # Team carousel component
└── TeamCard.tsx               # Individual team card

app/_components/
└── SerieAClient.tsx           # Client component for Serie A pages
```

#### Database Query Example
```javascript
const products = await Product.find({
  category: "SeriesA",
  isActive: true,
  title: { $regex: new RegExp(`^Maglia\\s+${teamName}`, 'i') }
}).sort({ feature: -1, createdAt: -1 });
```

#### Team Name Extraction
```javascript
// Extract team name from product title
const team = product.title ? product.title.split(" ")[1] : "Unknown";
```

### 8. Internationalization
- All text content is internationalized using i18n
- Supports English and Italian languages
- Team names are properly translated and displayed

### 9. SEO Benefits
- Clean URL structure for team pages
- Proper page titles and descriptions
- Breadcrumb navigation for search engines
- Semantic HTML structure

## Usage Instructions

### For Users
1. Navigate to the homepage
2. Scroll to the "Your Favorite Teams" section
3. Click on any team logo in the carousel
4. Browse team-specific products
5. Use breadcrumb navigation to return to previous pages

### For Developers
1. Add new teams to the `validTeams` array in `app/shop/serieA/[team]/page.tsx`
2. Update team display names in `SerieAClient.tsx`
3. Add team data to the carousel in `TeamCarousel.tsx`
4. Ensure products follow the "Maglia [TeamName]" title pattern

## Future Enhancements
- Add team-specific banners and branding
- Implement team color schemes for product pages
- Add team statistics and information
- Create team-specific promotional campaigns
- Add team comparison features 