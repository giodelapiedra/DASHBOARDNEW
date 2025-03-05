export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'editor';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Post {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: string | User;
  categories: string[] | Category[];
  tags?: string[];
  status: 'draft' | 'published';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: 'admin' | 'editor';
} 