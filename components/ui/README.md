# Reusable Product Components

This directory contains reusable product display components that can be used throughout the application for consistent product presentation.

## Components

### ProductCard

A flexible, reusable product card component that can display any type of product with customizable styling and functionality.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | **required** | Product unique identifier |
| `name` | `string` | **required** | Product name |
| `price` | `number` | **required** | Product price |
| `image` | `string` | **required** | Product image URL |
| `href` | `string` | `/products/${id}` | Link destination |
| `category` | `string` | `undefined` | Product category |
| `team` | `string` | `undefined` | Team name |
| `availablePatches` | `string[]` | `[]` | Available patches for jerseys |
| `badges` | `Badge[]` | `[]` | Custom badges to display |
| `onWishlistToggle` | `(product: any) => void` | `undefined` | Wishlist toggle handler |
| `isInWishlist` | `(id: string) => boolean` | `undefined` | Check if product is in wishlist |
| `onAddToCart` | `(product: any) => void` | `undefined` | Add to cart handler |
| `showWishlistButton` | `boolean` | `true` | Show wishlist button |
| `showAddToCartButton` | `boolean` | `false` | Show add to cart button |
| `imageAspectRatio` | `"square" \| "portrait" \| "landscape"` | `"portrait"` | Image aspect ratio |
| `cardHeight` | `"sm" \| "md" \| "lg"` | `"md"` | Card height |
| `className` | `string` | `""` | Additional CSS classes |
| `product` | `any` | `undefined` | Full product object for callbacks |

#### Badge Interface

```typescript
interface Badge {
  text: string;
  color?: string;
  bgColor?: string;
}
```

#### Basic Usage

```tsx
import ProductCard from "@/components/ui/ProductCard";

<ProductCard
  id="1"
  name="Inter Milan Home Jersey 2024/25"
  price={89.99}
  image="/images/product/inter-home.jpg"
  category="Home Jersey"
  team="Inter Milan"
  availablePatches={["serie-a", "champions-league"]}
/>
```

#### With Custom Badges

```tsx
<ProductCard
  id="2"
  name="Limited Edition Jersey"
  price={99.99}
  image="/images/product/limited.jpg"
  badges={[
    { text: "Limited Edition", bgColor: "bg-purple-500/80", color: "text-white" },
    { text: "Free Shipping", bgColor: "bg-green-500/80", color: "text-white" },
  ]}
/>
```

#### With Event Handlers

```tsx
<ProductCard
  id="3"
  name="AC Milan Away Jersey"
  price={94.99}
  image="/images/product/milan-away.jpg"
  onWishlistToggle={(product) => console.log("Toggle wishlist:", product)}
  onAddToCart={(product) => console.log("Add to cart:", product)}
  isInWishlist={(id) => wishlist.includes(id)}
  showWishlistButton={true}
  showAddToCartButton={true}
  product={fullProductObject}
/>
```

### ProductGrid

A flexible grid component that renders multiple ProductCard components with customizable layout.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `products` | `Product[]` | **required** | Array of products to display |
| `onWishlistToggle` | `(product: Product) => void` | `undefined` | Wishlist toggle handler |
| `onAddToCart` | `(product: Product) => void` | `undefined` | Add to cart handler |
| `isInWishlist` | `(id: string) => boolean` | `undefined` | Check if product is in wishlist |
| `showWishlistButton` | `boolean` | `true` | Show wishlist buttons |
| `showAddToCartButton` | `boolean` | `false` | Show add to cart buttons |
| `gridCols` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3` | Number of grid columns |
| `gap` | `"sm" \| "md" \| "lg"` | `"md"` | Grid gap size |
| `cardHeight` | `"sm" \| "md" \| "lg"` | `"md"` | Card height |
| `imageAspectRatio` | `"square" \| "portrait" \| "landscape"` | `"portrait"` | Image aspect ratio |
| `className` | `string` | `""` | Additional CSS classes |
| `customBadges` | `(product: Product) => Badge[]` | `undefined` | Function to generate custom badges |

#### Product Interface

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  team?: string;
  availablePatches?: string[];
  [key: string]: any; // Allow additional properties
}
```

#### Basic Usage

```tsx
import ProductGrid from "@/components/ui/ProductGrid";

<ProductGrid
  products={products}
  onWishlistToggle={handleWishlistToggle}
  isInWishlist={isInWishlist}
  gridCols={3}
  gap="md"
/>
```

#### Compact Grid

```tsx
<ProductGrid
  products={products}
  gridCols={4}
  gap="sm"
  cardHeight="sm"
  imageAspectRatio="square"
/>
```

#### With Custom Badges

```tsx
<ProductGrid
  products={products}
  customBadges={(product) => [
    { text: "New Arrival", bgColor: "bg-blue-500/80", color: "text-white" },
    { text: "Free Shipping", bgColor: "bg-green-500/80", color: "text-white" },
  ]}
/>
```

## Use Cases

### 1. Football Jerseys
- Use `portrait` aspect ratio for jersey images
- Include `availablePatches` for patch options
- Set `team` and `category` for proper labeling

### 2. Mystery Boxes
- Use custom badges for special labeling
- Set custom `href` for mystery box specific pages
- Use purple/pink color scheme for badges

### 3. Accessories
- Use `square` aspect ratio for accessories
- Smaller card height (`sm`) for compact display
- Focus on `category` rather than `team`

### 4. Featured Products
- Larger card height (`lg`) for emphasis
- Add custom badges for promotional content
- Include add to cart buttons for quick purchase

## Styling

The components follow the established brand guidelines:

- **Primary Blue**: `#0e1924` - Used for text and borders
- **Primary Orange**: `#f5963c` - Used for prices, hover effects, and accents
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Performance

- **Hydration Safe**: Prevents hydration mismatches with client-side mounting
- **Image Optimization**: Uses Next.js Image component with proper sizing
- **Lazy Loading**: Images are optimized for performance
- **Skeleton Loading**: Shows loading states during hydration

## Examples

See `components/examples/ProductCardExamples.tsx` for comprehensive usage examples including:

- Basic product cards
- Cards with custom badges
- Different aspect ratios
- Grid layouts
- Mystery box specific usage
- Accessories display 