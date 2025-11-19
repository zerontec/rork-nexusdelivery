import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { CartItem, Product } from '@/types';
import { MOCK_PRODUCTS } from '@/mocks/products';

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
    return MOCK_PRODUCTS.find((p) => p.id === productId);
  }, []);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  }, [items, getProduct]);

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
