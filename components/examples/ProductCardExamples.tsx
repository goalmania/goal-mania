"use client";

import ProductCard from "@/components/ui/ProductCard";
import ProductGrid from "@/components/ui/ProductGrid";

// Example usage of the reusable ProductCard and ProductGrid components

// Example 1: Basic ProductCard usage
export function BasicProductCardExample() {
  const product = {
    id: "1",
    name: "Inter Milan Home Jersey 2024/25",
    price: 89.99,
    image: "/images/product/inter-home.jpg",
    category: "Home Jersey",
    team: "Inter Milan",
    availablePatches: ["serie-a", "champions-league"],
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Basic Product Card</h2>
      <div className="max-w-sm">
        <ProductCard
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          category={product.category}
          team={product.team}
          availablePatches={product.availablePatches}
        />
      </div>
    </div>
  );
}

// Example 2: ProductCard with custom badges
export function ProductCardWithCustomBadgesExample() {
  const product = {
    id: "2",
    name: "AC Milan Away Jersey 2024/25",
    price: 94.99,
    image: "/images/product/milan-away.jpg",
    category: "Away Jersey",
    team: "AC Milan",
  };

  const customBadges = [
    { text: "Limited Edition", bgColor: "bg-purple-500/80", color: "text-white" },
    { text: "Free Shipping", bgColor: "bg-green-500/80", color: "text-white" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Product Card with Custom Badges</h2>
      <div className="max-w-sm">
        <ProductCard
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          category={product.category}
          team={product.team}
          badges={customBadges}
        />
      </div>
    </div>
  );
}

// Example 3: ProductCard with different aspect ratios
export function ProductCardAspectRatioExample() {
  const product = {
    id: "3",
    name: "Juventus Third Jersey 2024/25",
    price: 79.99,
    image: "/images/product/juventus-third.jpg",
    category: "Third Jersey",
    team: "Juventus",
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Product Cards with Different Aspect Ratios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Square</h3>
          <ProductCard
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            category={product.category}
            team={product.team}
            imageAspectRatio="square"
            cardHeight="sm"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Portrait (Default)</h3>
          <ProductCard
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            category={product.category}
            team={product.team}
            imageAspectRatio="portrait"
            cardHeight="lg"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Landscape</h3>
          <ProductCard
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            category={product.category}
            team={product.team}
            imageAspectRatio="landscape"
            cardHeight="lg"
          />
        </div>
      </div>
    </div>
  );
}

// Example 4: ProductGrid with different configurations
export function ProductGridExamples() {
  const products = [
    {
      id: "1",
      name: "Inter Milan Home Jersey 2024/25",
      price: 89.99,
      image: "/images/product/inter-home.jpg",
      category: "Home Jersey",
      team: "Inter Milan",
      availablePatches: ["serie-a", "champions-league"],
    },
    {
      id: "2",
      name: "AC Milan Away Jersey 2024/25",
      price: 94.99,
      image: "/images/product/milan-away.jpg",
      category: "Away Jersey",
      team: "AC Milan",
      availablePatches: ["serie-a"],
    },
    {
      id: "3",
      name: "Juventus Third Jersey 2024/25",
      price: 79.99,
      image: "/images/product/juventus-third.jpg",
      category: "Third Jersey",
      team: "Juventus",
    },
    {
      id: "4",
      name: "Napoli Home Jersey 2024/25",
      price: 84.99,
      image: "/images/product/napoli-home.jpg",
      category: "Home Jersey",
      team: "Napoli",
      availablePatches: ["serie-a", "europa-league"],
    },
  ];

  const handleWishlistToggle = (product: any) => {
    console.log("Toggle wishlist for:", product.name);
  };

  const handleAddToCart = (product: any) => {
    console.log("Add to cart:", product.name);
  };

  const isInWishlist = (id: string) => {
    return id === "1"; // Example: only first product is in wishlist
  };

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-bold">Product Grid Examples</h2>

      {/* Example 4a: Basic grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Grid (3 columns)</h3>
        <ProductGrid
          products={products}
          onWishlistToggle={handleWishlistToggle}
          isInWishlist={isInWishlist}
          gridCols={3}
          gap="md"
        />
      </div>

      {/* Example 4b: Compact grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Grid (4 columns, small cards)</h3>
        <ProductGrid
          products={products}
          onWishlistToggle={handleWishlistToggle}
          isInWishlist={isInWishlist}
          gridCols={4}
          gap="sm"
          cardHeight="sm"
        />
      </div>

      {/* Example 4c: Grid with add to cart buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Grid with Add to Cart Buttons</h3>
        <ProductGrid
          products={products}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          isInWishlist={isInWishlist}
          showWishlistButton={true}
          showAddToCartButton={true}
          gridCols={2}
          gap="lg"
          cardHeight="lg"
        />
      </div>

      {/* Example 4d: Grid with custom badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Grid with Custom Badges</h3>
        <ProductGrid
          products={products}
          onWishlistToggle={handleWishlistToggle}
          isInWishlist={isInWishlist}
          gridCols={3}
          customBadges={(product) => [
            { text: "New Arrival", bgColor: "bg-blue-500/80", color: "text-white" },
            { text: "Free Shipping", bgColor: "bg-green-500/80", color: "text-white" },
          ]}
        />
      </div>
    </div>
  );
}

// Example 5: Mystery Box specific usage
export function MysteryBoxProductCardExample() {
  const mysteryBox = {
    id: "mystery-1",
    name: "Mystery Box - Serie A Edition",
    price: 49.99,
    image: "/images/product/mystery-box.jpg",
    category: "Mystery Box",
    team: "Serie A",
  };

  const mysteryBoxBadges = [
    { text: "Mystery Box", bgColor: "bg-purple-500/80", color: "text-white" },
    { text: "Limited Time", bgColor: "bg-red-500/80", color: "text-white" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mystery Box Product Card</h2>
      <div className="max-w-sm">
        <ProductCard
          id={mysteryBox.id}
          name={mysteryBox.name}
          price={mysteryBox.price}
          image={mysteryBox.image}
          category={mysteryBox.category}
          team={mysteryBox.team}
          badges={mysteryBoxBadges}
          href={`/shop/mystery-box/${mysteryBox.id}`}
        />
      </div>
    </div>
  );
}

// Example 6: Accessories/Other products
export function AccessoriesProductCardExample() {
  const accessory = {
    id: "acc-1",
    name: "Official Serie A Scarf",
    price: 24.99,
    image: "/images/product/scarf.jpg",
    category: "Accessories",
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Accessory Product Card</h2>
      <div className="max-w-sm">
        <ProductCard
          id={accessory.id}
          name={accessory.name}
          price={accessory.price}
          image={accessory.image}
          category={accessory.category}
          imageAspectRatio="square"
          cardHeight="sm"
        />
      </div>
    </div>
  );
} 