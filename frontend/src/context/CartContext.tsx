import { createContext, useState, ReactNode, useEffect } from "react";
import { MenuItem } from "../types";

export interface CartItem {
  item: MenuItem;
  quantity: number;
  table?: string | null;
}

export interface CartContextType {
  table: string | null;
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setTable: (table: string | null) => void;
  subtotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "qr-menu-cart";
const TABLE_KEY = "qr-menu-table";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [table, setTable] = useState<string | null>(() => {
    const stored = localStorage.getItem(TABLE_KEY);
    console.log("Initial table from localStorage:", stored);
    return stored;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 🔥 Modified: Handle table changes and clear cart for new table
  const handleSetTable = (newTable: string | null) => {
    console.log("Setting new table:", newTable);
    console.log("Current table:", table);
    console.log("Current cart:", cart);
    
    // If it's a different table number, clear the cart
    if (newTable !== table) {
      console.log("Table changed - clearing cart for new table");
      setCart([]); // Clear cart for new table
    }
    
    setTable(newTable);
  };

  // 🔥 Modified: Clear cart when table changes (backup effect)
  useEffect(() => {
    console.log("Table state changed to:", table);
    if (table) {
      localStorage.setItem(TABLE_KEY, table);
    } else {
      localStorage.removeItem(TABLE_KEY);
    }
  }, [table]);

  // Persist cart every time it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);

      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, 
        { 
          item, 
          quantity: 1,
          table: table 
        }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce(
    (sum, i) => sum + i.item.price * i.quantity,
    0
  );

  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        table,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        setTable: handleSetTable, 
        subtotal,
        tax,
        total,
      }}
      >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };