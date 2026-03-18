export type Role        = 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_VENDOR';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'CREDIT_CARD';

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

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ProductVariantResponse {
  id: number;
  sku: string;
  price: number;
  maxPrice?: number;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
  displayLabel: string;
  attributes: Record<string, string>;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  maxPrice?: number;
  stock: number;
  categoryName: string;
  vendorId?: number;
  vendorName?: string;
  vendorSlug?: string;
  averageRating?: number;
  reviewCount?: number;
  primaryImageUrl?: string;
  images?: ProductImage[];
  variants?: ProductVariantResponse[];
  hasVariants: boolean;
  slug: string;
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'DELETED'; // ← add this
  createdAt?: string;                                    // ← add this too
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
  variantId?: number;
  productName: string;
  variantLabel?: string;
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
  id:          number;
  productId:   number;
  productName: string;
  variantId?:  number;
  variantInfo?: Record<string, string>;
  quantity:    number;
  unitPrice:   number;
  subtotal:    number;
}

export interface Order {
  id:            number;
  status:        OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount:   number;
  fullName:      string;
  phone:         string;
  addressLine:   string;
  city:          string;
  country:       string;
  notes?:        string;
  items:         OrderItemResponse[];
  createdAt:     string;
}

export interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface VendorApplication {
  id: number;
  storeName: string;
  storeSlug: string;
  description: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  username: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Vendor {
  id: number;
  storeName: string;
  storeSlug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  email: string;
  phone?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  commissionRate: number;
  totalSales: number;
  rating: number;
  username: string;
  createdAt: string;
}

export interface VendorDashboard {
  vendorId: number;
  storeName: string;
  storeSlug: string;
  status: string;
  totalRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  commissionRate: number;
  totalCommission: number;
  netEarnings: number;
  recentOrders: Order[];
}

export interface Address {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressRequest {
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}