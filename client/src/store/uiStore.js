import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Cart Drawer
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  // Cart Badge Counter
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: count }),

  // Auth Modal
  isAuthModalOpen: false,
  authModalMode: 'login', // 'login' | 'register'
  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  // User State
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, wishlistIds: new Set() });
  },

  // Wishlist Cache
  wishlistIds: new Set(),
  setWishlistIds: (ids) => set({ wishlistIds: new Set(ids) }),
  toggleWishlistId: (id) => {
    const next = new Set(get().wishlistIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ wishlistIds: next });
  },

  // Toast Notifications
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
