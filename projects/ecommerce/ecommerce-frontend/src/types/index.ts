export type Role = 'ROLE_USER' | 'ROLE_ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  parentName: string | null;
  hasChildren: boolean;
  depth: number;
}

export interface CategoryTree {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  parentName: string | null;
  children: CategoryTree[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryName: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalAmount: number;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}