export interface Product {
  id: string;
  name: string;
  category: string;
  thickness: string[];
  fireRating: string;
  price: string;
  status: 'active' | 'draft';
  stock: number;
  updatedAt: string;
}

export interface Application {
  id: string;
  title: string;
  category: string;
  eiRating: string;
  recommendedThickness: string;
  layersCount: number;
  status: 'published' | 'draft';
  updatedAt: string;
}

export interface SampleRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  solution: string;
  thickness: string;
  note?: string;
  status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface TechDoc {
  id: string;
  title: string;
  category: 'ibst' | 'cad' | 'iso' | 'catalog';
  code: string;
  fileSize: string;
  downloads: number;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  investor: string;
  area: string;
  productsUsed: string;
  year: number;
  status: 'completed' | 'ongoing';
}
