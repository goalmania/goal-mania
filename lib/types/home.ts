export interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  availablePatches?: any[];
  isMysteryBox?: boolean;
  videos?: string[]; // ✅ Add videos field
}

export interface Team {
  name: string;
  nickname: string;
  logo: string;
  href: string;
  colors: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

export interface Article {
  _id: any; // MongoDB ObjectId type
  title: string;
  summary: string;
  image: string;
  slug: string;
  category: string;
  content: string;
}

export interface Guarantee {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}
