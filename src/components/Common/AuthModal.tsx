"use client";
import React, { useEffect, useState } from "react";
import { useUI } from "@/app/context/UIContext";
import { authService } from "@/services";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
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

  const [errors, setErrors] = useState<{ 
    signinEmail?: string; 
    signinPassword?: string;
    signupName?: string;
    signupEmail?: string;
    signupPassword?: string;
    signupConfirm?: string;
  }>({});
  const [loading, setLoading] = useState(false);

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
      // Clear forms and errors on close
      setEmail("");
      setPassword("");
      setName("");
      setSignUpEmail("");
      setSignUpPassword("");
      setRePassword("");
      setErrors({});
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
          Swal.fire({
            icon: 'success',
            title: 'Welcome!',
            text: authModalTab === "signin" ? "Logged in successfully!" : "Signed up and logged in successfully!",
            timer: 1500,
            showConfirmButton: false
          });
          closeAuthModal();
          setTimeout(() => window.location.reload(), 1500);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Authentication Failed',
            text: res.error || "Authentication failed"
          });
        }
      } catch (err: any) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || "Google Authentication failed"
        });
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

  const validateSignIn = () => {
    const newErrors: any = {};
    if (!email) {
      newErrors.signinEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.signinEmail = "Invalid email format";
    }
    if (!password) {
      newErrors.signinPassword = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = () => {
    const newErrors: any = {};
    if (!name.trim()) {
      newErrors.signupName = "Full Name is required";
    }
    if (!signUpEmail) {
      newErrors.signupEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
      newErrors.signupEmail = "Invalid email format";
    }
    if (!signUpPassword) {
      newErrors.signupPassword = "Password is required";
    } else if (signUpPassword.length < 6) {
      newErrors.signupPassword = "Password must be at least 6 characters";
    }
    if (!rePassword) {
      newErrors.signupConfirm = "Confirm Password is required";
    } else if (signUpPassword !== rePassword) {
      newErrors.signupConfirm = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;

    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data?.token) {
        authService.setToken(res.data.token);
        localStorage.setItem("zoberry_user", JSON.stringify(res.data));
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Logged in successfully!',
          timer: 1500,
          showConfirmButton: false
        });
        closeAuthModal();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Credentials',
          text: res.error || "Invalid email or password. Please try again."
        });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.error || err.message || "Login failed due to a server error."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;

    setLoading(true);
    try {
      const res = await authService.register({ name, email: signUpEmail, password: signUpPassword });
      if (res.success && res.data?.token) {
        authService.setToken(res.data.token);
        localStorage.setItem("zoberry_user", JSON.stringify(res.data));
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Signed up and logged in successfully!',
          timer: 1500,
          showConfirmButton: false
        });
        closeAuthModal();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: res.error || "Registration failed. Please try again."
        });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.error || err.message || "Registration failed due to a server error."
      });
    } finally {
      setLoading(false);
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
            onClick={() => {
              setAuthModalTab("signin");
              setErrors({});
            }}
            className={`w-1/2 pb-3 font-semibold text-center border-b-2 transition-all ${
              authModalTab === "signin"
                ? "border-blue text-blue"
                : "border-transparent text-dark-5 hover:text-dark"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthModalTab("signup");
              setErrors({});
            }}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.signinEmail) setErrors({ ...errors, signinEmail: undefined });
                  }}
                  placeholder="Enter your email"
                  className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.signinEmail ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                />
                {errors.signinEmail && <p className="text-red text-xs mt-1">{errors.signinEmail}</p>}
              </div>
              <div>
                <label className="block mb-2 text-custom-sm font-medium text-dark">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.signinPassword) setErrors({ ...errors, signinPassword: undefined });
                  }}
                  placeholder="Enter your password"
                  autoComplete="on"
                  className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.signinPassword ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                />
                {errors.signinPassword && <p className="text-red text-xs mt-1">{errors.signinPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-2.5 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-4 disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Sign In"}
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
                  onClick={() => {
                    setAuthModalTab("signup");
                    setErrors({});
                  }}
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
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.signupName) setErrors({ ...errors, signupName: undefined });
                  }}
                  placeholder="Enter your full name"
                  className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.signupName ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                />
                {errors.signupName && <p className="text-red text-xs mt-1">{errors.signupName}</p>}
              </div>
              <div>
                <label className="block mb-1.5 text-custom-sm font-medium text-dark">
                  Email Address
                </label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => {
                    setSignUpEmail(e.target.value);
                    if (errors.signupEmail) setErrors({ ...errors, signupEmail: undefined });
                  }}
                  placeholder="Enter your email"
                  className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.signupEmail ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                />
                {errors.signupEmail && <p className="text-red text-xs mt-1">{errors.signupEmail}</p>}
              </div>
              <div>
                <label className="block mb-1.5 text-custom-sm font-medium text-dark">
                  Password
                </label>
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => {
                    setSignUpPassword(e.target.value);
                    if (errors.signupPassword) setErrors({ ...errors, signupPassword: undefined });
                  }}
                  placeholder="Enter your password"
                  autoComplete="on"
                  className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.signupPassword ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                />
                {errors.signupPassword && <p className="text-red text-xs mt-1">{errors.signupPassword}</p>}
              </div>
              <div>
                <label className="block mb-1.5 text-custom-sm font-medium text-dark">
                  Re-type Password
                </label>
                <input
                  type="password"
                  value={rePassword}
                  onChange={(e) => {
                    setRePassword(e.target.value);
                    if (errors.signupConfirm) setErrors({ ...errors, signupConfirm: undefined });
                  }}
                  placeholder="Re-type your password"
                  autoComplete="on"
                  className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.signupConfirm ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                />
                {errors.signupConfirm && <p className="text-red text-xs mt-1">{errors.signupConfirm}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-2.5 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-4 disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Create Account"}
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
                  onClick={() => {
                    setAuthModalTab("signin");
                    setErrors({});
                  }}
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
