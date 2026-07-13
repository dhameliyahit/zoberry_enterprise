"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Product } from "@/types/product";

type UIContextType = {
  cartSidebarOpen: boolean;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;

  quickViewOpen: boolean;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  previewSliderOpen: boolean;
  openPreviewSlider: () => void;
  closePreviewSlider: () => void;

  authModalOpen: boolean;
  authModalTab: "signin" | "signup";
  openAuthModal: (tab?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: "signin" | "signup") => void;

  homeLoading: boolean;
  setHomeLoading: (loading: boolean) => void;
};

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [previewSliderOpen, setPreviewSliderOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const [homeLoading, setHomeLoading] = useState(true);

  const openCartSidebar = useCallback(() => setCartSidebarOpen(true), []);
  const closeCartSidebar = useCallback(() => setCartSidebarOpen(false), []);

  const openQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  const openPreviewSlider = useCallback(() => setPreviewSliderOpen(true), []);
  const closePreviewSlider = useCallback(() => setPreviewSliderOpen(false), []);

  const openAuthModal = useCallback((tab: "signin" | "signup" = "signin") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const value = {
    cartSidebarOpen,
    openCartSidebar,
    closeCartSidebar,
    quickViewOpen,
    quickViewProduct,
    openQuickView,
    closeQuickView,
    previewSliderOpen,
    openPreviewSlider,
    closePreviewSlider,
    authModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    setAuthModalTab,
    homeLoading,
    setHomeLoading,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
