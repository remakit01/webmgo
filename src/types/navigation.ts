export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  isHot?: boolean;
  children?: SubNavItem[];
}

export interface SubNavItem {
  title: string;
  subtitle?: string;
  href: string;
  icon?: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  slogan: string;
  url: string;
  hotline: string;
  hotlineFormatted: string;
  email: string;
  addressHanoi: string;
  factoryHoaBinh: string;
  workingHours: string;
}
