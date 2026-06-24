"use client";
import React, { createContext, useContext, useState } from "react";

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  activeTab: "signin" | "signup";
  openAuthModal: (defaultTab?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  setActiveTab: (tab: "signin" | "signup") => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModalContext = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModalContext must be used within an AuthModalProvider");
  }
  return context;
};

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const openAuthModal = (defaultTab: "signin" | "signup" = "signin") => {
    setActiveTab(defaultTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isAuthModalOpen,
        activeTab,
        openAuthModal,
        closeAuthModal,
        setActiveTab,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};
