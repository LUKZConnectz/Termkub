export type Profile = {
  id: string;
  username: string;
  role: 'user' | 'admin';
  balance: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  low_stock: number;
  featured: boolean;
  image_url: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
};

export type TopupRequest = {
  id: string;
  user_id: string;
  amount: number;
  slip_url: string | null;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type Donation = {
  id: string;
  user_id: string;
  amount: number;
  message: string | null;
  created_at: string;
};

// Minimal Database type placeholder — replace with `supabase gen types typescript`
// output once the project is linked, for full query type-safety.
export type Database = any;
