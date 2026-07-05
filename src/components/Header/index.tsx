"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Heart,
  List,
  MagnifyingGlass,
  Phone,
  ShoppingCart,
  SignIn,
  User,
  X,
} from "@phosphor-icons/react";
import { menuData } from "./menuData";
import { usePopulatedCart } from "@/hooks/usePopulatedCart";
import { useUI } from "@/app/context/UIContext";
import { authService } from "@/services";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);


  const { openCartSidebar, openAuthModal } = useUI();
  const { items: cartItems, totalPrice } = usePopulatedCart();

  const quickLinks = useMemo(
    () => [
      { label: "Wishlist", path: "/wishlist" },
      { label: "Checkout", path: "/checkout" },
      { label: "My Account", path: "/my-account" },
      { label: "Contact", path: "/contact" },
    ],
    []
  );

  const closeNavigation = () => setNavigationOpen(false);

  const syncAuthState = () => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("zoberry_token");
    const userStr = localStorage.getItem("zoberry_user");

    if (!token) {
      setIsLoggedIn(false);
      setUserName("");
      setUserImage("");
      return;
    }

    setIsLoggedIn(true);

    if (!userStr) {
      setUserName("My Account");
      setUserImage("");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      const name = userData.data?.name || userData.name || "My Account";
      const image = userData.data?.image || userData.image || "";
      setUserName(name);
      setUserImage(image);
    } catch {
      setUserName("My Account");
      setUserImage("");
    }
  };

  const handleStickyMenu = () => {
    setStickyMenu(window.scrollY >= 80);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      router.push("/shop-with-sidebar");
      closeNavigation();
      return;
    }

    router.push(`/shop-with-sidebar?search=${encodeURIComponent(trimmedQuery)}`);
    closeNavigation();
  };

  const handleLogout = () => {
    authService.logout();
    setProfileDropdownOpen(false);
    closeNavigation();
    syncAuthState();
    toast.success("Logged out successfully!");
    router.push("/");
    router.refresh();
  };

  const isActivePath = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  useEffect(() => {
    setIsMounted(true);
    syncAuthState();
    window.addEventListener("scroll", handleStickyMenu);
    window.addEventListener("focus", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
      window.removeEventListener("focus", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  useEffect(() => {
    closeNavigation();
    setProfileDropdownOpen(false);
    syncAuthState();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = navigationOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [navigationOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);



  return (
    <>
      <header
        className={`fixed left-0 top-0 z-9999 w-full bg-blue-dark text-white transition-all duration-300 ${
          stickyMenu ? "shadow-xl shadow-slate-950/10" : ""
        }`}
      >
        {/* Top Utility Row (Desktop Only) */}
        <div
          className={`hidden lg:block border-b border-white/10 transition-all duration-300 ease-in-out ${
            stickyMenu ? "h-0 opacity-0 overflow-hidden" : "h-9 opacity-100"
          }`}
        >
          <div className="mx-auto max-w-[1170px] h-full px-4 sm:px-7.5 xl:px-0 flex items-center justify-between">
            {/* Support Info */}
            <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-150">
              <Phone size={14} weight="regular" className="text-white/50" />
              <span className="text-[10px] font-medium tracking-wider uppercase text-white/40">Support:</span>
              <a
                href="mailto:support.zoberryenterprise@gmail.com"
                className="text-[11px] font-medium text-white/90 hover:text-white transition-colors"
              >
                support.zoberryenterprise@gmail.com
              </a>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/checkout"
                className="text-[10px] font-medium tracking-wider uppercase text-white/60 hover:text-white transition-colors duration-150"
              >
                Checkout
              </Link>
              <Link
                href="/contact"
                className="text-[10px] font-medium tracking-wider uppercase text-white/60 hover:text-white transition-colors duration-150"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation Row */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-7.5 xl:px-0">
            <div className={`transition-all duration-300 ${stickyMenu ? "py-2 lg:py-2.5" : "py-3 lg:py-3.5"}`}>
              <div className="flex items-center justify-between gap-3 lg:gap-5">
                {/* Logo */}
                <Link className="flex shrink-0 items-center" href="/" aria-label="Go to homepage">
                  <Image
                    src="/images/zb_header.png"
                    alt="Zoberry Logo"
                    width={140}
                    height={35}
                    className="h-auto w-[118px] object-contain sm:w-[130px] lg:w-[140px]"
                    priority
                  />
                </Link>

                {/* Primary Navigation Links (Desktop: xl and above) */}
                <nav className="hidden xl:block" aria-label="Primary navigation">
                  <ul className="flex items-center gap-6 xl:gap-8">
                    {menuData.map((menuItem) => {
                      const active = isActivePath(menuItem.path || "/");
                      return (
                        <li key={menuItem.id}>
                          <Link
                            href={menuItem.path || "/"}
                            className={`header-nav-link ${
                              active ? "header-nav-link-active" : ""
                            }`}
                          >
                            {menuItem.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Search Bar (Desktop: lg and above) */}
                <div className="hidden min-w-0 flex-1 lg:block lg:max-w-[320px] xl:max-w-[400px]">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative w-full">
                      <input
                        onChange={(event) => setSearchQuery(event.target.value)}
                        value={searchQuery}
                        type="search"
                        name="search"
                        id="desktop-search"
                        placeholder="Search products, brands or categories..."
                        autoComplete="off"
                        className="peer w-full rounded-full border border-gray-3 bg-white py-1.5 pl-5 pr-11 text-xs text-dark placeholder-gray-4 outline-none duration-150 focus:border-blue focus:ring-2 focus:ring-blue/15 shadow-sm"
                      />

                      <button
                        type="submit"
                        aria-label="Search products"
                        className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-4 transition-colors hover:text-blue"
                      >
                        <MagnifyingGlass size={16} weight="bold" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-3.5 sm:gap-4 lg:gap-5">
                  {/* Account Section */}
                  {isMounted && isLoggedIn ? (
                    <div className="relative hidden sm:block" ref={profileRef}>
                      <button
                        onClick={() => setProfileDropdownOpen((current) => !current)}
                        className="flex items-center gap-2 py-1 text-left transition-colors text-white/80 hover:text-white"
                        aria-label="Open account menu"
                      >
                        {userImage ? (
                          <img
                            src={userImage}
                            alt={userName}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                            {(userName || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate text-xs font-medium text-white/95 max-w-[80px]">
                          Hi, {userName.split(" ")[0]}
                        </span>
                        <svg
                          className={`h-3 w-3 text-white/50 transition-transform duration-200 ${
                            profileDropdownOpen ? "rotate-180 text-white" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {profileDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-48 rounded-xl border border-gray-3 bg-white py-1.5 text-dark shadow-2xl z-999">
                          <Link
                            href="/my-account"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm transition-colors hover:bg-gray-1 hover:text-blue font-medium"
                          >
                            Manage account
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm transition-colors hover:bg-gray-1 hover:text-blue font-medium"
                          >
                            Wishlist
                          </Link>
                          <div className="my-1 border-t border-gray-2" />
                          <button
                            onClick={handleLogout}
                            className="block w-full px-4 py-2.5 text-left text-sm text-red transition-colors hover:bg-red/5 font-medium"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => openAuthModal("signin")}
                      className="hidden items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white sm:flex text-xs font-medium"
                    >
                      <User size={16} weight="regular" className="text-white/60" />
                      <span>Sign In</span>
                    </button>
                  )}

                  {/* Wishlist Link */}
                  <Link
                    href="/wishlist"
                    className="hidden h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors md:flex"
                    aria-label="Open wishlist"
                  >
                    <Heart size={20} weight="regular" />
                  </Link>

                  {/* Cart Action (Primary Pill) */}
                  <button
                    type="button"
                    onClick={openCartSidebar}
                    className="flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-150 border border-white/5"
                    aria-label="Open cart"
                  >
                    <span className="relative inline-flex">
                      <ShoppingCart size={18} weight="bold" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red px-1 text-[8.5px] font-bold text-white shadow-sm">
                        {isMounted ? cartItems.length : 0}
                      </span>
                    </span>
                    <span className="hidden text-xs font-semibold sm:block">₹{isMounted ? totalPrice : 0}</span>
                  </button>

                  {/* Mobile Hamburger Menu Toggle */}
                  <button
                    type="button"
                    aria-label="Open navigation menu"
                    aria-expanded={navigationOpen}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors xl:hidden"
                    onClick={() => setNavigationOpen(true)}
                  >
                    <List size={22} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Mobile Search Row */}
              <div className="mt-2.5 lg:hidden">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      onChange={(event) => setSearchQuery(event.target.value)}
                      value={searchQuery}
                      type="search"
                      name="mobile-search"
                      placeholder="Search products, brands or categories..."
                      autoComplete="off"
                      className="w-full rounded-full border border-gray-3 bg-white px-4 py-2 pr-11 text-sm text-dark outline-none duration-150 focus:border-blue focus:ring-2 focus:ring-blue/15 shadow-sm placeholder-gray-4"
                    />
                    <button
                      type="submit"
                      aria-label="Search products"
                      className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-4 transition-colors hover:text-blue"
                    >
                      <MagnifyingGlass size={18} weight="bold" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation drawer (mobile menu) */}
      <div
        className={`fixed inset-0 z-[10000] xl:hidden ${
          navigationOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!navigationOpen}
      >
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeNavigation}
          className={`absolute inset-0 bg-slate-950/45 transition-opacity duration-300 ${
            navigationOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-[360px] max-w-[88vw] flex-col bg-white text-dark shadow-2xl transition-transform duration-300 ${
            navigationOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-3 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-dark">Navigation</p>
              <p className="text-xs text-dark-4">Zoberry Enterprise Menu</p>
            </div>
            <button
              type="button"
              onClick={closeNavigation}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-3 text-dark transition-colors hover:border-blue hover:text-blue"
              aria-label="Close navigation"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="rounded-xl bg-gray-1 p-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue text-sm font-semibold text-white">
                      {(userName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-dark-4">Signed in</p>
                    <p className="truncate text-base font-semibold text-dark">{userName}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-dark">Welcome to Zoberry</p>
                    <p className="mt-1 text-sm text-dark-4">Sign in to track orders and save your wishlist.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeNavigation();
                      openAuthModal("signin");
                    }}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-dark"
                  >
                    <SignIn size={16} weight="bold" />
                    Sign In
                  </button>
                </div>
              )}
            </div>

            <nav className="mt-6" aria-label="Mobile primary navigation">
              <ul className="space-y-2">
                {menuData.map((menuItem) => (
                  <li key={menuItem.id}>
                    <Link
                      href={menuItem.path || "/"}
                      onClick={closeNavigation}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-base font-medium transition-colors ${
                        isActivePath(menuItem.path || "/")
                          ? "border-blue bg-blue/5 text-blue"
                          : "border-gray-3 text-dark hover:border-blue/40 hover:bg-gray-1"
                      }`}
                    >
                      <span>{menuItem.title}</span>
                      <svg
                        className={`h-4 w-4 transition-colors ${
                          isActivePath(menuItem.path || "/") ? "text-blue" : "text-gray-4"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-dark-4">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={closeNavigation}
                    className={`rounded-xl border px-4 py-4 text-sm font-medium transition-colors ${
                      isActivePath(link.path)
                        ? "border-blue bg-blue/5 text-blue"
                        : "border-gray-3 text-dark hover:border-blue/40 hover:bg-gray-1"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-dark-4">Need help?</p>
              <a
                href="mailto:support.zoberryenterprise@gmail.com"
                className="mt-2 block text-sm font-medium text-dark transition-colors hover:text-blue"
              >
                support.zoberryenterprise@gmail.com
              </a>
            </div>
          </div>

          <div className="border-t border-gray-3 px-5 py-4">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-full border border-red/30 px-4 py-3 text-sm font-semibold text-red transition-colors hover:bg-red/5"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/shop-with-sidebar"
                onClick={closeNavigation}
                className="flex w-full items-center justify-center rounded-full bg-blue px-4 py-3 text-sm font-semibold text-white"
              >
                Start Shopping
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Header;
