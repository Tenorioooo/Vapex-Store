import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import type { CartItem, Product } from '../../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addItem: (product: Product, flavor?: string, color?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user || !import.meta.env.VITE_SUPABASE_URL) {
      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id);

    if (data) setItems(data as CartItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = async (product: Product, flavor?: string, color?: string) => {
    if (user) {
      const existing = items.find(i => i.product_id === product.id && i.flavor === (flavor || null) && i.color === (color || null));
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
          flavor: flavor || null,
          color: color || null,
        });
      }
      fetchCart();
    } else {
      const existing = items.find(i => i.product_id === product.id && i.flavor === (flavor || null) && i.color === (color || null));
      if (existing) {
        setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          user_id: '',
          product_id: product.id,
          quantity: 1,
          flavor: flavor || null,
          color: color || null,
          product,
        };
        setItems(prev => [...prev, newItem]);
      }
    }
  };

  const removeItem = async (id: string) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', id);
      fetchCart();
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    if (user) {
      await supabase.from('cart_items').update({ quantity }).eq('id', id);
      fetchCart();
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      fetchCart();
    } else {
      setItems([]);
      localStorage.removeItem('guest_cart');
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, loading, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
