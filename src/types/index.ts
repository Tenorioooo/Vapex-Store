export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  images: string[];
  puffs: number | null;
  battery: string | null;
  intensity: string | null;
  flavors: string[];
  colors: string[];
  in_stock: boolean;
  stock_count: number;
  is_featured: boolean;
  is_new: boolean;
  is_limited: boolean;
  badge: string | null;
  rating: number;
  review_count: number;
  technology: string;
  features: Record<string, string>[];
  category?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  flavor: string | null;
  color: string | null;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  discount: number;
  coupon_code: string | null;
  shipping_address: Record<string, string> | null;
  payment_method: string | null;
  payment_status: string;
  subtotal: number;
  shipping: number;
  tracking_code: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  flavor: string | null;
  color: string | null;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
}
