export interface MgoThicknessSpec {
  thickness: string;
  weightPerSheet: string;
  density: string;
  fireRating: string;
  standardApplication: string;
  category: 'all' | 'duct' | 'wall' | 'floor';
  flexuralStrength?: string;
  isPopular?: boolean;
}

export interface FeaturedProject {
  id: string;
  name: string;
  category: string;
  location: string;
  scale: string;
  application: string;
  fireRating: string;
  image: string;
}

export interface MaterialComparisonItem {
  feature: string;
  mgoRemak: string;
  cemboard: string;
  gypsum: string;
  winner: 'mgo' | 'tie' | 'cemboard' | 'gypsum';
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface BannerSlide {
  id: number;
  image: string;
  alt: string;
  link?: string;
  title: string;
}

export interface ProductSystemAssembly {
  title: string;
  fireRating: string;
  description: string;
  layers: string[];
}

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tradeMark: string;
  category: 'duct' | 'wall' | 'floor' | 'acoustic' | 'accessory';
  categoryLabel: string;
  fireRating: string;
  testedStandards: string[];
  tagline: string;
  description: string;
  image: string;
  galleryImages: string[];
  thicknessList: string[];
  density: string;
  flexuralStrength: string;
  thermalConductivity: string;
  dimension: string;
  highlights: string[];
  specsTable: { label: string; value: string }[];
  systemAssemblies: ProductSystemAssembly[];
  advantages: { title: string; desc: string }[];
  certifiedBy: string[];
  isPopular?: boolean;
  badge?: string;
}

export interface AccessoryItem {
  id: string;
  slug: string;
  name: string;
  role: string;
  spec: string;
  description: string;
  image: string;
  packaging: string;
  compatibleProducts: string[];
}
