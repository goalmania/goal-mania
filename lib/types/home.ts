export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  isMysteryBox?: boolean;
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
}

export interface Guarantee {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
} 