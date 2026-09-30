export interface ApplicationItem {
  id: string;
  slug: string;
  title: string;
  category: 'duct' | 'wall' | 'floor' | 'industry' | 'door';
  categoryLabel: string;
  fireRating: string;
  recommendedThickness: string;
  applicableStandards: string[];
  image: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
  systemLayers: string[];
  compatibleProductSlug: string;
  compatibleProductName: string;
  typicalProjects: string;
  weightAdvantage: string;
}

export interface ApplicationCategoryTab {
  id: string;
  label: string;
  count: number;
}
