"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  CaretDownIcon,
  FacebookLogoIcon,
  GearIcon,
  Heart,
  InstagramLogoIcon,
  List,
  MagnifyingGlass,
  Phone,
  PhoneCallIcon,
  ShoppingCart,
  SignIn,
  SignOutIcon,
  User,
  WhatsappLogoIcon,
  X,
  XCircleIcon,
} from "@phosphor-icons/react";

import { usePopulatedCart } from "@/hooks/usePopulatedCart";
import { useUI } from "@/app/context/UIContext";
import { authService } from "@/services";
import { menuData } from "./menuData";

//-----------------------------------------
// Constants
//-----------------------------------------
const SUPPORT_EMAIL = "support@zoberryenterprise.shop";
const DEFAULT_AVATAR_TEXT = "A";
const SCROLL_THRESHOLD = 70;

const QUICK_LINKS = [
  { label: "Wishlist", path: "/wishlist" },
  { label: "Checkout", path: "/checkout" },
  { label: "My Account", path: "/my-account" },
  { label: "Contact", path: "/contact" },
] as const;

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://instagram.com/",
    icon: InstagramLogoIcon,
  },
  {
    name: "Facebook",
    href: "https://facebook.com/",
    icon: FacebookLogoIcon,
  },
  {
    name: "WhatsApp",
    href: "https://facebook.com/",
    icon: WhatsappLogoIcon,
  },
  {
    name: "Call",
    href: "https://facebook.com/",
    icon: PhoneCallIcon,
  },
];

//-----------------------------------------
// Types
//-----------------------------------------
interface SearchBarProps {
  readonly mobile?: boolean;
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

interface TopBarProps {
  readonly stickyMenu: boolean;
}

interface DesktopNavigationProps {
  readonly isActivePath: (path: string) => boolean;
}

interface NavigationItemProps {
  readonly title: string;
  readonly path: string;
  readonly isActive: boolean;
  readonly onClick?: () => void;
}

interface ProfileMenuProps {
  readonly isMounted: boolean;
  readonly isLoggedIn: boolean;
  readonly userName: string;
  readonly userImage: string;
  readonly profileDropdownOpen: boolean;
  readonly setProfileDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly onLogout: () => void;
  readonly onSignInClick: () => void;
}

interface UserAvatarProps {
  readonly userName: string;
  readonly userImage: string;
  readonly size?: "sm" | "md";
}

interface CartButtonProps {
  readonly isMounted: boolean;
  readonly cartItemsCount: number;
  readonly totalPrice: number;
  readonly onClick: () => void;
}

interface WishlistButtonProps {
  readonly onClick?: () => void;
}

interface MobileMenuButtonProps {
  readonly navigationOpen: boolean;
  readonly onClick: () => void;
}

interface HeaderActionsProps {
  readonly isMounted: boolean;
  readonly isLoggedIn: boolean;
  readonly userName: string;
  readonly userImage: string;
  readonly profileDropdownOpen: boolean;
  readonly setProfileDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly onLogout: () => void;
  readonly onSignInClick: () => void;
  readonly cartItemsCount: number;
  readonly totalPrice: number;
  readonly onCartClick: () => void;
  readonly onMenuClick: () => void;
  readonly navigationOpen: boolean;
}

interface MobileDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isLoggedIn: boolean;
  readonly userName: string;
  readonly userImage: string;
  readonly onLogout: () => void;
  readonly onSignInClick: () => void;
  readonly isActivePath: (path: string) => boolean;
}

interface MobileDrawerContentProps {
  readonly isLoggedIn: boolean;
  readonly userName: string;
  readonly userImage: string;
  readonly onClose: () => void;
  readonly onLogout: () => void;
  readonly onSignInClick: () => void;
  readonly isActivePath: (path: string) => boolean;
}

interface MobileUserSectionProps {
  readonly isLoggedIn: boolean;
  readonly userName: string;
  readonly userImage: string;
  readonly onClose: () => void;
  readonly onSignInClick: () => void;
}

interface MobileNavigationListProps {
  readonly onClose: () => void;
  readonly isActivePath: (path: string) => boolean;
}

interface MobileNavigationItemProps {
  readonly title: string;
  readonly path: string;
  readonly isActive: boolean;
  readonly onClose: () => void;
}

interface QuickLinksProps {
  readonly onClose: () => void;
  readonly isActivePath: (path: string) => boolean;
}

interface SupportCardProps {
  readonly email: string;
}

interface HeaderContentProps {
  readonly stickyMenu: boolean;
  readonly children: React.ReactNode;
}

interface HeaderNavigationRowProps {
  readonly isMounted: boolean;
  readonly isLoggedIn: boolean;
  readonly userName: string;
  readonly userImage: string;
  readonly profileDropdownOpen: boolean;
  readonly setProfileDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly onLogout: () => void;
  readonly onSignInClick: () => void;
  readonly cartItemsCount: number;
  readonly totalPrice: number;
  readonly onCartClick: () => void;
  readonly onMenuClick: () => void;
  readonly navigationOpen: boolean;
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly isActivePath: (path: string) => boolean;
}

//-----------------------------------------
// Hooks
//-----------------------------------------
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

function useStickyHeader(): boolean {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY >= SCROLL_THRESHOLD);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return sticky;
}

interface AuthState {
  isLoggedIn: boolean;
  userName: string;
  userImage: string;
}

function useAuthState(
  pathname: string,
  router: ReturnType<typeof useRouter>,
  closeNavigation: () => void,
  setProfileDropdownOpen: (open: boolean) => void
) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    userName: "",
    userImage: "",
  });

  const syncAuthState = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const authToken = localStorage.getItem("zoberry_token");
    const storedUser = localStorage.getItem("zoberry_user");

    if (!authToken) {
      setState({ isLoggedIn: false, userName: "", userImage: "" });
      return;
    }

    if (!storedUser) {
      setState({ isLoggedIn: true, userName: "My Account", userImage: "" });
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      const name = userData.data?.name || userData.name || "My Account";
      const image = userData.data?.image || userData.image || "";
      setState({ isLoggedIn: true, userName: name, userImage: image });
    } catch {
      setState({ isLoggedIn: true, userName: "My Account", userImage: "" });
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setProfileDropdownOpen(false);
    closeNavigation();
    syncAuthState();
    toast.success("Logged out successfully!");
    router.push("/");
    router.refresh();
  }, [router, syncAuthState, closeNavigation, setProfileDropdownOpen]);

  useEffect(() => {
    syncAuthState();
    window.addEventListener("focus", syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener("focus", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, [syncAuthState]);

  useEffect(() => {
    syncAuthState();
  }, [pathname, syncAuthState]);

  return {
    ...state,
    syncAuthState,
    logout,
  };
}

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler, enabled]);
}

function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);
}

//-----------------------------------------
// Small Components
//-----------------------------------------
function Logo() {
  return (
    <Link className="flex shrink-0 items-center" href="/" aria-label="Go to homepage">
      <Image
        src="/images/zb_header.png"
        alt="Zoberry Logo"
        width={100}
        height={25}
        className="h-auto w-[100px] object-contain sm:w-[130px] lg:w-[140px]"
        priority
      />
    </Link>
  );
}

export function TopBarSupportInfo() {
  return (
    <div className="flex items-center gap-2 text-white/70">
      <Phone size={14} weight="regular" className="text-white/50" />
      <span className="text-[11px] font-bold tracking-wider uppercase text-white/40">Support:</span>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="text-[11px] font-semibold text-white/85 hover:text-white transition-colors tracking-wide"
      >
        {SUPPORT_EMAIL}
      </a>
    </div>
  );
}

// 3. Updated Quick Links & Social Media Area
export function TopBarQuickLinks() {
  return (
    <div className="flex items-center gap-5">
      
      {/* Existing Contact Link */}
      <Link
        href="/contact"
        className="text-[11px] font-bold tracking-wider uppercase text-white/65 hover:text-white transition-colors duration-150"
      >
        Contact
      </Link>

      {/* Elegant Vertical Divider between Contact and Socials */}
      <div className="h-3.5 w-px bg-white/20" />

      {/* Social Media Platform Icons Group */}
      <div className="flex items-center gap-3">
        {SOCIAL_LINKS.map((social) => {
          const IconComponent = social.icon;
          return (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${social.name}`}
              className="text-white/60 hover:text-white transition-colors duration-150 p-0.5 flex items-center justify-center"
            >
              <IconComponent size={15} weight="regular" />
            </a>
          );
        })}
      </div>

    </div>
  );
}

// TopBar is defined with specific CSS classes.
function TopBar({ stickyMenu }: TopBarProps) {
  const heightClass = stickyMenu ? "h-0 opacity-0 overflow-hidden" : "h-9 opacity-100";

  return (
    <div className={`hidden lg:block border-b border-white/10 transition-all duration-300 ease-in-out ${heightClass}`}>
      <div className="mx-auto max-w-[1170px] h-full px-4 sm:px-7.5 xl:px-0 flex items-center justify-between">
        <TopBarSupportInfo />
        <TopBarQuickLinks />
      </div>
    </div>
  );
}

export function NavigationItem({ title, path, isActive, onClick }: NavigationItemProps) {
  return (
    <Link
      href={path}
      onClick={onClick}
      /* 
        Uses relative tracking so we can position a clean animated underline text bar.
        Smoothly shifts text from a clean white/75 opacity to high-contrast full white.
      */
      className={`relative py-2 text-[13px] font-bold uppercase tracking-wider transition-colors duration-200 block
        ${isActive ? "text-white" : "text-white/75 hover:text-white"}
        group
      `}
    >
      {title}

      {/* Modern, clean bottom accent border line */}
      <span
        className={`absolute bottom-0 left-0 h-[2px] bg-cyan-400 transition-all duration-300 ease-out-expo
          ${isActive 
            ? "w-full opacity-100" 
            : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
          }
        `}
      />
    </Link>
  );
}

function DesktopNavigation({ isActivePath }: DesktopNavigationProps) {
  return (
    <nav className="hidden xl:block" aria-label="Primary navigation">
      <ul className="flex items-center gap-6 xl:gap-8">
        {menuData.map((menuItem) => (
          <li key={menuItem.id}>
            <NavigationItem
              title={menuItem.title}
              path={menuItem.path || "/"}
              isActive={isActivePath(menuItem.path || "/")}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SearchBar({ mobile = false, searchQuery, setSearchQuery, onSubmit }: SearchBarProps) {
  const inputId = mobile ? "mobile-search" : "desktop-search";
  const nameAttr = mobile ? "mobile-search" : "search";

  // Shared wrapper classes to keep layout identical, just changing sizes/visibility
  const containerClasses = mobile
    ? "mt-2.5 lg:hidden w-full"
    : "hidden min-w-0 flex-1 lg:block lg:max-w-[320px] xl:max-w-[400px]";

  const inputPaddingClasses = mobile 
    ? "py-2.5 pl-4 pr-24 text-sm" 
    : "py-2 pl-4.5 pr-20 text-sm";

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className={containerClasses}>
      <form onSubmit={onSubmit}>
        <div className="relative flex items-center bg-white rounded border border-gray-3 shadow-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/15 duration-150">
          
          {/* Text Input */}
          <input
            onChange={(event) => setSearchQuery(event.target.value)}
            value={searchQuery}
            type="text" // Changed from 'search' to remove native browser clear buttons
            name={nameAttr}
            id={inputId}
            placeholder="Search products, brands or categories..."
            autoComplete="off"
            className={`w-full bg-transparent text-dark placeholder-gray-4 outline-none ${inputPaddingClasses}`}
          />

          {/* Action Group (Right Side) */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3 bg-gradient-to-l from-white via-white to-transparent pl-4 rounded-r">
            
            {/* Clear Button (Only shows when there is text) */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="text-gray-4 hover:text-dark transition-colors"
              >
                <XCircleIcon size={18} weight="fill" />
              </button>
            )}

            {/* Vertical Divider (Only shows when there is text to separate X from Search) */}
            {searchQuery && <div className="h-4 w-px bg-gray-3" />}

            {/* Submit Search Button */}
            <button
              type="submit"
              aria-label="Search products"
              className="text-gray-4 hover:text-blue transition-colors flex items-center justify-center"
            >
              <MagnifyingGlass size={18} weight="bold" />
            </button>
            
          </div>
        </div>
      </form>
    </div>
  );
}

function UserAvatar({ userName, userImage, size = "sm" }: UserAvatarProps) {
  // Switched from rounded-full to matching square-ish "rounded" layout with subtle borders
  const sizeClasses = size === "sm" ? "h-7 w-7 rounded" : "h-11 w-11 rounded";
  const textClasses = size === "sm" ? "text-[11px] bg-white/20 text-white" : "text-sm bg-blue text-white";

  if (userImage) {
    return (
      <img
        src={userImage}
        alt={userName}
        width={size === "sm" ? 28 : 44}
        height={size === "sm" ? 28 : 44}
        className={`${sizeClasses} border border-white/10 object-cover`}
      />
    );
  }

  const initial = (userName || DEFAULT_AVATAR_TEXT).charAt(0).toUpperCase();

  return (
    <div className={`flex items-center justify-center font-semibold ${sizeClasses} ${textClasses}`}>
      {initial}
    </div>
  );
}

export function ProfileMenu({
  isMounted,
  isLoggedIn,
  userName,
  userImage,
  profileDropdownOpen,
  setProfileDropdownOpen,
  onLogout,
  onSignInClick,
}: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // useClickOutside(menuRef, () => setProfileDropdownOpen(false), profileDropdownOpen);

  if (!isMounted) return null;

  // 1. SIGN IN BUTTON (Logged Out State)
  if (!isLoggedIn) {
    return (
      <button
        onClick={onSignInClick}
        className="hidden items-center gap-2 py-1.5 px-3 rounded border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-white sm:flex text-xs font-medium"
      >
        <User size={14} weight="bold" />
        <span>Sign In</span>
      </button>
    );
  }

  const firstName = userName.split(" ")[0];

  // 2. DROPDOWN TRIGGER & MENU (Logged In State)
  return (
    <div className="relative hidden sm:block" ref={menuRef}>
      <button
        onClick={() => setProfileDropdownOpen((current) => !current)}
        className="flex items-center gap-2 py-1.5 px-2.5 rounded border border-transparent hover:border-white/20 hover:bg-white/5 transition-all text-white/90 hover:text-white"
        aria-label="Open account menu"
        aria-expanded={profileDropdownOpen}
      >
        <UserAvatar userName={userName} userImage={userImage} size="sm" />
        <span className="truncate text-[13px] font-semibold max-w-[90px]">
          Hi, {firstName}
        </span>
        <CaretDownIcon
          size={14} 
          weight="bold" 
          className={`text-white/60 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180 text-white" : ""}`} 
        />
      </button>

      {profileDropdownOpen && (
     /* Dropdown Container */
     <div className="absolute right-0 mt-2 w-52 rounded border border-gray-3 bg-white shadow-lg z-[999] overflow-hidden">
       
       {/* User Info Header Block */}
       <div className="bg-gray-1 px-4 py-3 border-b border-gray-2 flex items-center gap-2.5">
         <UserAvatar userName={userName} userImage={userImage} size="sm" />
         <div className="flex flex-col min-w-0">
           {/* Darker, rich text for the main name */}
           <span className="text-xs font-bold text-dark truncate">{userName}</span>
           {/* Boosted contrast from faint gray to readable neutral gray */}
           <span className="text-[10px] font-medium text-dark-4 truncate">Verified Account</span>
         </div>
       </div>

       {/* Links Section */}
       <div className="py-1">
         {/* Switched to a slightly deeper slate/gray color for standard state, shifts to vibrant blue on hover */}
         <Link
           href="/my-account"
           onClick={() => setProfileDropdownOpen(false)}
           className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-dark-2 transition-colors hover:bg-gray-1 hover:text-blue font-medium"
         >
           <GearIcon size={16} className="text-dark-4 transition-colors group-hover:text-blue" />
           <span>Manage Account</span>
         </Link>
         {/* Fixed contrast: now matches Manage Account visibility perfectly */}
         <Link
           href="/wishlist"
           onClick={() => setProfileDropdownOpen(false)}
           className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-dark-2 transition-colors hover:bg-gray-1 hover:text-blue font-medium"
         >
           <Heart size={16} className="text-dark-4 transition-colors group-hover:text-blue" />
           <span>Wishlist</span>
         </Link>
       </div>

       {/* Action Divider */}
       <div className="border-t border-gray-2" />
       
       {/* Logout Block */}
       <div className="py-1">
         {/* Clean, high-visibility red that pops without being harsh */}
         <button
           onClick={onLogout}
           className="group flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-red transition-colors hover:bg-red-light-6 font-semibold"
         >
           <SignOutIcon size={16} weight="bold" className="text-red transition-colors group-hover:text-red-dark" />
           <span>Logout</span>
         </button>
       </div>
       
     </div>
   )}
      
    </div>
  );
}

export function WishlistButton({ onClick }: WishlistButtonProps) {
  return (
    <Link
      href="/wishlist"
      onClick={onClick}
      /* 
        Changed rounded-full to rounded 
        Added subtle transparent border that reveals a clean frame on hover
      */
      className="hidden h-9 w-9 items-center justify-center rounded border border-transparent hover:border-white/20 bg-transparent hover:bg-white/5 text-white/90 hover:text-white transition-all md:flex"
      aria-label="Open wishlist"
    >
      <Heart size={18} weight="bold" />
    </Link>
  );
}

export function CartButton({ isMounted, cartItemsCount, totalPrice, onClick }: CartButtonProps) {
  const displayCount = isMounted ? cartItemsCount : 0;
  const displayPrice = isMounted ? totalPrice : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      /* Clean focus styling with spacing adjustment */
      className="flex items-center gap-2.5 bg-transparent text-white/90 hover:text-white transition-colors duration-150 py-1 px-1.5 -mx-1.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-white/35"
      aria-label="Open cart"
    >
      {/* Icon + Badge wrapper */}
      <div className="relative flex items-center justify-center">
        <ShoppingCart size={22} weight="regular" />
        
        {/* Perfectly centered, rounded-full badge in #00BBDB */}
        {displayCount > 0 && (
          <span className="absolute -right-2 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#00BBDB] px-1 text-[8.5px] font-bold leading-none text-white shadow-sm select-none">
            {displayCount}
          </span>
        )}
      </div>

      {/* Label / Price state */}
      <span className="text-sm font-medium tracking-wide">
        {displayPrice > 0 ? `₹${displayPrice.toLocaleString("en-IN")}` : "Cart"}
      </span>
    </button>
  );
}

function MobileMenuButton({ navigationOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      aria-label="Open navigation menu"
      aria-expanded={navigationOpen}
      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors xl:hidden"
      onClick={onClick}
    >
      <List size={22} weight="bold" />
    </button>
  );
}

function HeaderActions({
  isMounted,
  isLoggedIn,
  userName,
  userImage,
  profileDropdownOpen,
  setProfileDropdownOpen,
  onLogout,
  onSignInClick,
  cartItemsCount,
  totalPrice,
  onCartClick,
  onMenuClick,
  navigationOpen,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-3.5 sm:gap-4 lg:gap-5">
      <ProfileMenu
        isMounted={isMounted}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userImage={userImage}
        profileDropdownOpen={profileDropdownOpen}
        setProfileDropdownOpen={setProfileDropdownOpen}
        onLogout={onLogout}
        onSignInClick={onSignInClick}
      />
      <WishlistButton />
      <CartButton
        isMounted={isMounted}
        cartItemsCount={cartItemsCount}
        totalPrice={totalPrice}
        onClick={onCartClick}
      />
      <MobileMenuButton
        navigationOpen={navigationOpen}
        onClick={onMenuClick}
      />
    </div>
  );
}

function MobileUserSection({
  isLoggedIn,
  userName,
  userImage,
  onClose,
  onSignInClick,
}: MobileUserSectionProps) {
  if (isLoggedIn) {
    return (
      <div className="rounded-xl bg-gray-1 p-4 border border-gray-2 flex items-center gap-3">
        <UserAvatar userName={userName} userImage={userImage} size="md" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-dark-4">Signed in</p>
          <p className="truncate text-base font-semibold text-dark">{userName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-1 p-4 border border-gray-2">
      <div className="flex flex-col gap-3.5">
        <div className="min-w-0">
          <p className="text-base font-bold text-dark">Welcome to Zoberry</p>
          <p className="mt-1 text-xs text-dark-4">Sign in to track orders and save your wishlist.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            onSignInClick();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-dark active:scale-[0.98]"
        >
          <SignIn size={14} weight="bold" />
          Sign In
        </button>
      </div>
    </div>
  );
}

function MobileNavigationItem({ title, path, isActive, onClose }: MobileNavigationItemProps) {
  const borderClass = isActive ? "border-blue bg-blue/5 text-blue" : "border-gray-2 text-dark-2 hover:bg-gray-1";
  const iconColorClass = isActive ? "text-blue" : "text-dark-4";

  return (
    <li>
      <Link
        href={path}
        onClick={onClose}
        className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-[15px] font-bold transition-all ${borderClass}`}
      >
        <span>{title}</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isActive ? "translate-x-0.5" : ""} ${iconColorClass}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7-7" />
        </svg>
      </Link>
    </li>
  );
}

function MobileNavigationList({ onClose, isActivePath }: MobileNavigationListProps) {
  return (
    <nav className="mt-6" aria-label="Mobile primary navigation">
      <ul className="space-y-2">
        {menuData.map((menuItem) => (
          <MobileNavigationItem
            key={menuItem.id}
            title={menuItem.title}
            path={menuItem.path || "/"}
            isActive={isActivePath(menuItem.path || "/")}
            onClose={onClose}
          />
        ))}
      </ul>
    </nav>
  );
}

function QuickLinks({ onClose, isActivePath }: QuickLinksProps) {
  return (
    <div className="mt-6">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-dark-4">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map((link) => {
          const isActive = isActivePath(link.path);
          const borderClass = isActive 
            ? "border-blue bg-blue/5 text-blue" 
            : "border-gray-2 text-dark-3 hover:bg-gray-1";

          return (
            <Link
              key={link.path}
              href={link.path}
              onClick={onClose}
              className={`rounded-xl border px-3 py-3 text-xs font-bold text-center transition-all ${borderClass}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SupportCard({ email }: SupportCardProps) {
  return (
    <div className="mt-6 rounded-xl border border-gray-2 bg-gray-1/30 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-dark-4">Need help?</p>
      <a
        href={`mailto:${email}`}
        className="mt-1.5 block text-[13px] font-semibold text-dark transition-colors hover:text-blue"
      >
        {email}
      </a>
    </div>
  );
}

function MobileDrawerContent({
  isLoggedIn,
  userName,
  userImage,
  onClose,
  onLogout,
  onSignInClick,
  isActivePath,
}: MobileDrawerContentProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-2 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-dark uppercase tracking-wider">Navigation</p>
          <p className="text-[11px] text-dark-4 font-medium">Zoberry Enterprise Menu</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-3 text-dark transition-all hover:border-blue hover:text-blue active:scale-95"
          aria-label="Close navigation"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <MobileUserSection
          isLoggedIn={isLoggedIn}
          userName={userName}
          userImage={userImage}
          onClose={onClose}
          onSignInClick={onSignInClick}
        />
        <MobileNavigationList onClose={onClose} isActivePath={isActivePath} />
        <QuickLinks onClose={onClose} isActivePath={isActivePath} />
        <SupportCard email={SUPPORT_EMAIL} />
      </div>

      <div className="border-t border-gray-2 px-5 py-4">
        {isLoggedIn ? (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red/25 px-4 py-3 text-sm font-bold text-red transition-all hover:bg-red-light-6 active:scale-[0.99]"
          >
            <SignOutIcon size={16} weight="bold" />
            Logout
          </button>
        ) : (
          <Link
            href="/shop-with-sidebar"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-dark active:scale-[0.99]"
          >
            Start Shopping
          </Link>
        )}
      </div>
    </>
  );
}

function MobileDrawer({
  isOpen,
  onClose,
  isLoggedIn,
  userName,
  userImage,
  onLogout,
  onSignInClick,
  isActivePath,
}: MobileDrawerProps) {
  const pointerClass = isOpen ? "pointer-events-auto" : "pointer-events-none";
  const opacityClass = isOpen ? "opacity-100" : "opacity-0";
  const translateClass = isOpen ? "translate-x-0" : "translate-x-full";

  return (
    <div
      className={`fixed inset-0 z-[10000] xl:hidden ${pointerClass}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/45 transition-opacity duration-300 ${opacityClass}`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-[360px] max-w-[88vw] flex-col bg-white text-dark shadow-2xl transition-transform duration-300 ${translateClass}`}
      >
        <MobileDrawerContent
          isLoggedIn={isLoggedIn}
          userName={userName}
          userImage={userImage}
          onClose={onClose}
          onLogout={onLogout}
          onSignInClick={onSignInClick}
          isActivePath={isActivePath}
        />
      </aside>
    </div>
  );
}

function HeaderContent({ stickyMenu, children }: HeaderContentProps) {
  const pyClasses = stickyMenu ? "py-2 lg:py-2.5" : "py-3 lg:py-2";
  return (
    <div className="border-b border-white/10">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-7.5 xl:px-0">
        <div className={`transition-all duration-300 ${pyClasses}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function HeaderNavigationRow({
  isMounted,
  isLoggedIn,
  userName,
  userImage,
  profileDropdownOpen,
  setProfileDropdownOpen,
  onLogout,
  onSignInClick,
  cartItemsCount,
  totalPrice,
  onCartClick,
  onMenuClick,
  navigationOpen,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  isActivePath,
}: Omit<HeaderNavigationRowProps, "stickyMenu">) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 lg:gap-5">
        <Logo />
        <DesktopNavigation isActivePath={isActivePath} />
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSubmit={onSearchSubmit}
        />
        <HeaderActions
          isMounted={isMounted}
          isLoggedIn={isLoggedIn}
          userName={userName}
          userImage={userImage}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          onLogout={onLogout}
          onSignInClick={onSignInClick}
          cartItemsCount={cartItemsCount}
          totalPrice={totalPrice}
          onCartClick={onCartClick}
          onMenuClick={onMenuClick}
          navigationOpen={navigationOpen}
        />
      </div>
      <SearchBar
        mobile
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmit={onSearchSubmit}
      />
    </>
  );
}

//-----------------------------------------
// Main Component
//-----------------------------------------
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isMounted = useMounted();
  const stickyMenu = useStickyHeader();

  const { openCartSidebar, openAuthModal } = useUI();
  const { items: cartItems, totalPrice } = usePopulatedCart();

  const closeNavigation = useCallback(() => setNavigationOpen(false), []);

  const { isLoggedIn, userName, userImage, logout } = useAuthState(
    pathname,
    router,
    closeNavigation,
    setProfileDropdownOpen
  );

  useBodyScrollLock(navigationOpen);

  const handleSearchSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      router.push("/shop-with-sidebar");
      closeNavigation();
      return;
    }
    router.push(`/shop-with-sidebar?search=${encodeURIComponent(trimmedQuery)}`);
    closeNavigation();
  }, [searchQuery, router, closeNavigation]);

  const isActivePath = useCallback((path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  }, [pathname]);

  const onSignInClick = useCallback(() => {
    openAuthModal("signin");
  }, [openAuthModal]);

  const shadowClass = stickyMenu ? "shadow-xl shadow-slate-950/10" : "";

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-[99999] w-full bg-blue-dark text-white transition-all duration-300 ${shadowClass}`}
      >
        <TopBar stickyMenu={stickyMenu} />
        <HeaderContent stickyMenu={stickyMenu}>
          <HeaderNavigationRow
            isMounted={isMounted}
            isLoggedIn={isLoggedIn}
            userName={userName}
            userImage={userImage}
            profileDropdownOpen={profileDropdownOpen}
            setProfileDropdownOpen={setProfileDropdownOpen}
            onLogout={logout}
            onSignInClick={onSignInClick}
            cartItemsCount={cartItems.length}
            totalPrice={totalPrice}
            onCartClick={openCartSidebar}
            onMenuClick={() => setNavigationOpen(true)}
            navigationOpen={navigationOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            isActivePath={isActivePath}
          />
        </HeaderContent>
      </header>

      <MobileDrawer
        isOpen={navigationOpen}
        onClose={closeNavigation}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userImage={userImage}
        onLogout={logout}
        onSignInClick={onSignInClick}
        isActivePath={isActivePath}
      />
    </>
  );
}
