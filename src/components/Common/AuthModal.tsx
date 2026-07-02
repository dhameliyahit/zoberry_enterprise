"use client";
import React, { useEffect, useState } from "react";
import { useUI } from "@/app/context/UIContext";
import { authService } from "@/services";
import toast from "react-hot-toast";

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, authModalTab, setAuthModalTab } = useUI();
  
  // Sign In State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign Up State
  const [name, setName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target && !target.closest(".modal-content")) {
        closeAuthModal();
      }
    }

    if (authModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Clear forms on close
      setEmail("");
      setPassword("");
      setName("");
      setSignUpEmail("");
      setSignUpPassword("");
      setRePassword("");
    };
  }, [authModalOpen, closeAuthModal]);

  useEffect(() => {
    if (!authModalOpen) return;

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "369746489415-p3hp6lirrkpcdi8peb2d41psiurdcgch.apps.googleusercontent.com";

    const handleCredentialResponse = async (response: any) => {
      const idToken = response.credential;
      try {
        const res = await authService.googleLogin(idToken);
        if (res.success && res.data?.token) {
          authService.setToken(res.data.token);
          localStorage.setItem("zoberry_user", JSON.stringify(res.data));
          toast.success(authModalTab === "signin" ? "Logged in successfully!" : "Signed up and logged in successfully!");
          closeAuthModal();
          window.location.reload();
        } else {
          toast.error(res.error || "Authentication failed");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Google Authentication failed");
      }
    };

    const initializeGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        const btnId = authModalTab === "signin" ? "google-modal-signin-btn" : "google-modal-signup-btn";
        const btnContainer = document.getElementById(btnId);
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: "100%",
          });
        }
      }
    };

    let interval: NodeJS.Timeout;
    if (typeof window !== "undefined") {
      if ((window as any).google) {
        setTimeout(initializeGoogle, 50);
      } else {
        interval = setInterval(() => {
          if ((window as any).google) {
            initializeGoogle();
            clearInterval(interval);
          }
        }, 500);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authModalOpen, authModalTab, closeAuthModal]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data?.token) {
        authService.setToken(res.data.token);
        localStorage.setItem("zoberry_user", JSON.stringify(res.data));
        toast.success("Logged in successfully!");
        closeAuthModal();
        window.location.reload();
      } else {
        toast.error(res.error || "Invalid credentials");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || "Login failed");
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !signUpEmail || !signUpPassword || !rePassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (signUpPassword !== rePassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const res = await authService.register({ name, email: signUpEmail, password: signUpPassword });
      if (res.success && res.data?.token) {
        authService.setToken(res.data.token);
        localStorage.setItem("zoberry_user", JSON.stringify(res.data));
        toast.success("Signed up and logged in successfully!");
        closeAuthModal();
        window.location.reload();
      } else {
        toast.error(res.error || "Registration failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || "Registration failed");
    }
  };

  if (!authModalOpen) return null;

  return (
    <div className="fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 flex items-center justify-center z-99999 px-4 sm:px-8 py-5">
      <div className="w-full max-w-[500px] rounded-xl shadow-3 bg-white p-6 sm:p-7.5 relative modal-content flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full ease-in duration-150 bg-gray-2 text-body hover:text-dark z-50"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
            />
          </svg>
        </button>

        {/* Modal Tabs */}
        <div className="flex border-b border-gray-3 mt-4">
          <button
            onClick={() => setAuthModalTab("signin")}
            className={`w-1/2 pb-3 font-semibold text-center border-b-2 transition-all ${
              authModalTab === "signin"
                ? "border-blue text-blue"
                : "border-transparent text-dark-5 hover:text-dark"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModalTab("signup")}
            className={`w-1/2 pb-3 font-semibold text-center border-b-2 transition-all ${
              authModalTab === "signup"
                ? "border-blue text-blue"
                : "border-transparent text-dark-5 hover:text-dark"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Tab Contents */}
        {authModalTab === "signin" ? (
          <div>
            <form onSubmit={handleSignInSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-custom-sm font-medium text-dark">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div>
                <label className="block mb-2 text-custom-sm font-medium text-dark">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="on"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-2.5 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-4"
              >
                Sign In
              </button>

              <div className="relative z-1 block font-medium text-center my-2">
                <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                <span className="inline-block px-3 bg-white text-custom-sm">Or</span>
              </div>

              <div id="google-modal-signin-btn" className="w-full flex justify-center min-h-[44px]"></div>

              <p className="text-center text-custom-sm mt-4">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalTab("signup")}
                  className="text-blue hover:underline font-medium"
                >
                  Sign Up Now
                </button>
              </p>
            </form>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-custom-sm font-medium text-dark">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-custom-sm font-medium text-dark">
                  Email Address
                </label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-custom-sm font-medium text-dark">
                  Password
                </label>
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="on"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-custom-sm font-medium text-dark">
                  Re-type Password
                </label>
                <input
                  type="password"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  placeholder="Re-type your password"
                  autoComplete="on"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-2.5 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-4"
              >
                Create Account
              </button>

              <div className="relative z-1 block font-medium text-center my-2">
                <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                <span className="inline-block px-3 bg-white text-custom-sm">Or</span>
              </div>

              <div id="google-modal-signup-btn" className="w-full flex justify-center min-h-[44px]"></div>

              <p className="text-center text-custom-sm mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalTab("signin")}
                  className="text-blue hover:underline font-medium"
                >
                  Sign In Now
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
