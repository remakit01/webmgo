export interface ProjectItem {
  id: string;
  slug: string;
  name: string;
  category: 'kcn' | 'commercial' | 'residential' | 'infrastructure';
  categoryLabel: string;
  location: string;
  scale: string;
  application: string;
  fireRating: string;
  completedYear: number;
  image: string;
  client: string;
  applicationSlug?: string;
  highlight?: boolean;
}

export interface ProjectCategory {
  id: string;
  label: string;
  count: number;
}
