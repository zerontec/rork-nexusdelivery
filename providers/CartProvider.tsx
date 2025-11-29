import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { supabase } from '@/lib/supabase';

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (productId: string, quantity?: number, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getProduct: (productId: string) => Product | undefined;
};

export const [CartProvider, useCart] = createContextHook((): CartContextValue => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});

  // Fetch product details for items in cart
  useEffect(() => {
    const fetchMissingProducts = async () => {
      const missingIds = items
        .map(item => item.productId)
        .filter(id => !products[id]);

      if (missingIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', missingIds);

        if (error) throw error;

        if (data) {
          setProducts(prev => {
            const next = { ...prev };
            data.forEach((p: any) => {
              next[p.id] = {
                ...p,
                businessId: p.business_id,
                isBestSeller: p.is_best_seller,
                isNew: p.is_new,
                originalPrice: p.original_price,
              };
            });
            return next;
          });
        }
      } catch (error) {
        console.error('[CartProvider] Error fetching products:', error);
      }
    };

    fetchMissingProducts();
  }, [items, products]);

  const addItem = useCallback((productId: string, quantity = 1, notes?: string) => {
    console.log('[CartProvider] Adding item:', productId, quantity);
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === productId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          notes: notes || updated[existingIndex].notes,
        };
        return updated;
      }
      return [...prev, { productId, quantity, notes }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    console.log('[CartProvider] Removing item:', productId);
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    console.log('[CartProvider] Updating quantity:', productId, quantity);
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    console.log('[CartProvider] Clearing cart');
    setItems([]);
  }, []);

  const getProduct = useCallback((productId: string): Product | undefined => {
    return products[productId];
  }, [products]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products[item.productId];
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  }, [items, products]);

  return useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getProduct,
    }),
    [items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, getProduct]
  );
});
