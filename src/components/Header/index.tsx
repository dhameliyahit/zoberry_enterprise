"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CustomSelect from "./CustomSelect";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useUI } from "@/app/context/UIContext";
import { authService } from "@/services";
import toast from "react-hot-toast";
import Image from "next/image";
import { Phone, User, ShoppingCart, Clock, Heart, List } from "@phosphor-icons/react";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { openCartSidebar, openAuthModal } = useUI();
  const profileRef = useRef<HTMLDivElement>(null);

  const product = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  const handleOpenCartModal = () => {
    openCartSidebar();
  };

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const token = localStorage.getItem("zoberry_token");
    const userStr = localStorage.getItem("zoberry_user");
    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const name = userData.data?.name || userData.name || "My Account";
          setUserName(name);
        } catch (e) {
          setUserName("My Account");
        }
      } else {
        setUserName("My Account");
      }
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  }, [isMounted]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const options = [
    { label: "All Categories", value: "0" },
    { label: "Desktop", value: "1" },
    { label: "Laptop", value: "2" },
    { label: "Monitor", value: "3" },
    { label: "Phone", value: "4" },
    { label: "Watch", value: "5" },
    { label: "Mouse", value: "6" },
    { label: "Tablet", value: "7" },
  ];

  return (
    <header
      className={`fixed left-0 top-0 w-full z-9999 bg-blue-dark text-white transition-all ease-in-out duration-300 ${
        stickyMenu ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        <div
          className={`flex flex-col lg:flex-row gap-5 items-end lg:items-center xl:justify-between ease-out duration-200 ${
            stickyMenu ? "py-3" : "py-4.5"
          }`}
        >
          <div className="xl:w-auto flex-col bg-blue-dark sm:flex-row w-full flex sm:justify-between sm:items-center gap-5 sm:gap-10">
            <Link className="flex-shrink-0 flex items-center" href="/">
              <Image
                src="/images/zb_header.png"
                alt="Zoberry Logo"
                width={160}
                height={40}
                className="object-contain max-h-[45px] w-auto"
                priority
              />
            </Link>

            <div className="max-w-[475px] w-full">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex items-center">
                  <CustomSelect options={options} />

                  <div className="relative max-w-[333px] sm:min-w-[333px] w-full">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-px h-5.5 bg-gray-4"></span>
                    <input
                      onChange={(e) => setSearchQuery(e.target.value)}
                      value={searchQuery}
                      type="search"
                      name="search"
                      id="search"
                      placeholder="I am shopping for..."
                      autoComplete="off"
                      className="custom-search w-full rounded-r-[5px] bg-gray-1 !border-l-0 border border-gray-3 py-2.5 pl-4 pr-10 outline-none ease-in duration-200 text-dark"
                    />

                    <button
                      type="submit"
                      id="search-btn"
                      aria-label="Search"
                      className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 text-dark hover:text-blue"
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="flex w-full lg:w-auto items-center gap-7.5">
            <div className="hidden xl:flex items-center gap-3.5">
              <Phone size={24} weight="light" />

              <div>
                <span className="block text-2xs text-white/70 uppercase">
                  24/7 SUPPORT
                </span>
                <a href="tel:9638601192" className="block font-medium text-custom-sm text-white hover:text-blue-light-3">
                  9638601192
                </a>
                <a href="mailto:work.heetdhameliya59@gmail.com" className="block text-2xs text-white/70 hover:text-blue-light-3 lowercase">
                  work.heetdhameliya59@gmail.com
                </a>
              </div>
            </div>

            <span className="hidden xl:block w-px h-7.5 bg-white/20"></span>

            <div className="flex w-full lg:w-auto justify-between items-center gap-5">
              <div className="flex items-center gap-5">
                {isMounted && isLoggedIn ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2.5 focus:outline-none"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue text-white font-semibold text-lg border border-white/20 shadow-sm hover:bg-blue-dark duration-150">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden sm:block text-left">
                        <span className="block text-2xs text-white/70 uppercase">
                          Welcome
                        </span>
                        <p className="font-medium text-custom-sm text-white truncate max-w-[80px]">
                          {userName.split(" ")[0]}
                        </p>
                      </div>
                    </button>
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-3 rounded-lg shadow-lg py-2 z-999">
                        <Link
                          href="/my-account"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-custom-sm text-dark hover:bg-gray-1 hover:text-blue transition-all"
                        >
                          My Account
                        </Link>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            authService.logout();
                            toast.success("Logged out successfully!");
                            window.location.reload();
                          }}
                          className="block w-full text-left px-4 py-2 text-custom-sm text-red hover:bg-gray-1 transition-all"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => openAuthModal("signin")}
                    className="flex items-center gap-2.5 text-left focus:outline-none"
                  >
                    <User size={24} weight="light" />
                    <div>
                      <span className="block text-2xs text-white/70 uppercase">
                        account
                      </span>
                      <p className="font-medium text-custom-sm text-white hover:text-blue-light-3 transition-colors">
                        Sign In
                      </p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenCartModal}
                  className="flex items-center gap-2.5"
                >
                  <span className="inline-block relative">
                    <ShoppingCart size={24} weight="light" />
                    <span className="flex items-center justify-center font-medium text-2xs absolute -right-2 -top-2.5 bg-blue w-4.5 h-4.5 rounded-full text-white border border-brand-navy">
                      {isMounted ? product.length : 0}
                    </span>
                  </span>

                  <div>
                    <span className="block text-2xs text-white/70 uppercase">
                      cart
                    </span>
                    <p className="font-medium text-custom-sm text-white">
                      ₹{isMounted ? totalPrice : 0}
                    </p>
                  </div>
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                id="Toggle"
                aria-label="Toggler"
                className="xl:hidden block"
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <List size={24} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="flex items-center justify-between">
            <div
              className={`w-[288px] absolute right-4 top-full xl:static xl:w-auto h-0 xl:h-auto invisible xl:visible xl:flex items-center justify-between ${
                navigationOpen &&
                `!visible bg-white shadow-lg border border-gray-3 !h-auto max-h-[400px] overflow-y-scroll rounded-md p-5`
              }`}
            >
              <nav>
                <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
                  {menuData.map((menuItem, i) =>
                    menuItem.submenu ? (
                      <Dropdown
                        key={i}
                        menuItem={menuItem}
                        stickyMenu={stickyMenu}
                      />
                    ) : (
                      <li
                        key={i}
                        className="group relative before:w-0 before:h-[3px] before:bg-blue before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full "
                      >
                        <Link
                          href={menuItem.path}
                          className={`hover:text-blue xl:hover:text-blue-light-3 text-custom-sm font-medium text-dark xl:text-white flex ${
                            stickyMenu ? "xl:py-2.5" : "xl:py-3.5"
                          }`}
                        >
                          {menuItem.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </div>

            <div className="hidden xl:block">
              <ul className="flex items-center gap-5.5">
                <li className={`flex ${stickyMenu ? "py-2.5" : "py-3.5"}`}>
                  <Link
                    href="/history"
                    className="flex items-center gap-1.5 font-medium text-custom-sm text-white hover:text-blue-light-3"
                  >
                    <Clock size={16} weight="bold" />
                    Recently Viewed
                  </Link>
                </li>

                <li className={`flex ${stickyMenu ? "py-2.5" : "py-3.5"}`}>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-1.5 font-medium text-custom-sm text-white hover:text-blue-light-3"
                  >
                    <Heart size={16} weight="bold" />
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
