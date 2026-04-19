// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "admin";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string;
  address: string;
  is_active: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type Category =
  | "electronics"
  | "clothing"
  | "books"
  | "home"
  | "sports"
  | "beauty"
  | "toys"
  | "food"
  | "other";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // Django DecimalField returns as string
  category: Category;
  image_url: string;
  stock_quantity: number;
  min_stock_alert: number;
  is_active: boolean;
  is_low_stock: boolean;
  is_in_stock: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: number;
  product: number;
  product_detail: Product;
  quantity: number;
  unit_price: string;
  subtotal: number;
}

export interface Order {
  id: number;
  user: number;
  user_username: string;
  user_email: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: string;
  shipping_address: string;
  notes: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface SalesData {
  period: string;
  total: number;
  count: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  category: Category;
  total_sold: number;
  total_revenue: number;
}

export interface StockAlert {
  id: number;
  name: string;
  category: Category;
  stock_quantity: number;
  min_stock_alert: number;
}

export interface RevenueReport {
  revenue: {
    total: number;
    today: number;
    this_month: number;
  };
  orders: {
    total: number;
    today: number;
    pending: number;
  };
  low_stock_products: number;
}

// ─── Category Labels ─────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<Category, string> = {
  electronics: "Eletrônicos",
  clothing: "Vestuário",
  books: "Livros",
  home: "Casa & Jardim",
  sports: "Esportes",
  beauty: "Beleza & Saúde",
  toys: "Brinquedos",
  food: "Alimentos",
  other: "Outros",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Aguardando",
  paid: "Pago",
  failed: "Falhou",
  refunded: "Reembolsado",
};
