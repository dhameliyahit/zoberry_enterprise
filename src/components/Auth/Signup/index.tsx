"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { authService } from "@/services";
import toast from "react-hot-toast";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!name.trim()) {
      newErrors.name = "Full Name is required";
    }
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await authService.register({ name, email, password });
      if (res.success && res.data?.token) {
        authService.setToken(res.data.token);
        localStorage.setItem("zoberry_user", JSON.stringify(res.data));
        toast.success("Account created successfully!");
        window.location.href = "/";
      } else {
        toast.error(res.error || "Registration failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1068863641775-mockgoogleclientid123456789.apps.googleusercontent.com";

    const handleCredentialResponse = async (response: any) => {
      const idToken = response.credential;
      try {
        const res = await authService.googleLogin(idToken);
        if (res.success && res.data?.token) {
          authService.setToken(res.data.token);
          localStorage.setItem("zoberry_user", JSON.stringify(res.data));
          toast.success("Signed up and logged in successfully!");
          window.location.href = "/";
        } else {
          toast.error(res.error || "Signup failed");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Google Signup failed");
      }
    };

    const initializeGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    };

    if (typeof window !== "undefined") {
      if ((window as any).google) {
        initializeGoogle();
      } else {
        const interval = setInterval(() => {
          if ((window as any).google) {
            initializeGoogle();
            clearInterval(interval);
          }
        }, 500);
        return () => clearInterval(interval);
      }
    }
  }, []);

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <div className="flex flex-col gap-4.5">
              <div id="google-signup-btn" className="w-full flex justify-center"></div>
            </div>

            <span className="relative z-1 block font-medium text-center mt-4.5">
              <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
              <span className="inline-block px-3 bg-white">Or</span>
            </span>

            <div className="mt-5.5">
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5">
                    Full Name <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="Enter your full name"
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.name ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                  />
                  {errors.name && <p className="text-red text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email Address <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    placeholder="Enter your email address"
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.email ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                  />
                  {errors.email && <p className="text-red text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder="Enter your password"
                    autoComplete="on"
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.password ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                  />
                  {errors.password && <p className="text-red text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="mb-5.5">
                  <label htmlFor="re-type-password" className="block mb-2.5">
                    Re-type Password <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="re-type-password"
                    id="re-type-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    placeholder="Re-type your password"
                    autoComplete="on"
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.confirmPassword ? 'border-red focus:border-red' : 'border-gray-3 focus:border-transparent'}`}
                  />
                  {errors.confirmPassword && <p className="text-red text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-70"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-center mt-6">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign in Now
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;

