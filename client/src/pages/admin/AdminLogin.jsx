import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useUIStore } from '../../store/uiStore';
import {
  FiLock,
  FiMail,
  FiAlertCircle,
  FiShield,
  FiEye,
  FiEyeOff,
  FiPackage,
  FiTruck,
  FiLayers,
  FiArrowRight,
  FiCheckCircle
} from 'react-icons/fi';
import { Button, Input, Card, Badge } from '../../components/ui';

const LOGIN_ADMIN = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

const AdminLogin = () => {
  const { setUser } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [loginUser, { loading }] = useMutation(LOGIN_ADMIN);

  const sanitizeErrorMessage = (rawError) => {
    if (!rawError) return 'An unexpected error occurred. Please try again.';
    const str = typeof rawError === 'string' ? rawError : rawError.message || '';
    
    if (str.includes('Invalid credentials') || str.includes('User not found') || str.includes('password')) {
      return 'Invalid email or password. Please verify your administrator credentials.';
    }
    if (str.includes('Access denied') || str.includes('Admin role required')) {
      return 'Access denied. Administrator privileges are required to access this portal.';
    }
    if (str.includes('NetworkError') || str.includes('Failed to fetch') || str.includes('ECONNREFUSED')) {
      return 'Unable to reach the server. Please check your network connection.';
    }
    return str.replace('GraphQL error: ', '').trim() || 'Authentication failed. Please check your credentials.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please provide both your administrator email and password.');
      return;
    }

    try {
      const { data } = await loginUser({
        variables: {
          email: email.trim().toLowerCase(),
          password,
        },
      });

      const authData = data?.loginUser;
      if (!authData || !authData.user) {
        throw new Error('Authentication response is invalid.');
      }

      if (authData.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      localStorage.setItem('token', authData.token);
      setUser(authData.user);
    } catch (err) {
      setErrorMsg(sanitizeErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Container Container */}
      <div className="w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left: Brand & Business Operations Panel (5 cols on Desktop, hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-10 flex-col justify-between border-r border-slate-800 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-md">
                ZB
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block">ZOBERRY</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Enterprise Commerce</span>
              </div>
              <Badge variant="blue" size="sm" className="ml-auto">
                Admin Console
              </Badge>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight leading-snug mb-3">
              Storefront Operations & Fulfillment Hub
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-8">
              Secure administrative access to manage product catalogs, inventory levels, promotional campaigns, order fulfillment, and multi-carrier logistics.
            </p>

            {/* Core Capabilities */}
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 text-primary flex items-center justify-center shrink-0">
                  <FiPackage className="w-3.5 h-3.5" />
                </div>
                <span>Catalog & SKU inventory synchronization</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 text-emerald-400 flex items-center justify-center shrink-0">
                  <FiTruck className="w-3.5 h-3.5" />
                </div>
                <span>Phase 7 fulfillment & AWB tracking engine</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 text-amber-400 flex items-center justify-center shrink-0">
                  <FiLayers className="w-3.5 h-3.5" />
                </div>
                <span>PhonePe verified payments & coupon discounts</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Security Banner */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <FiShield className="w-4 h-4" />
              <span>RBAC Encrypted Session</span>
            </div>
            <span className="text-slate-500">v2.4.0</span>
          </div>
        </div>

        {/* Right: Clean Admin Sign In Form (7 cols on Desktop, full width on mobile) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 bg-slate-900 flex flex-col justify-center">
          
          {/* Mobile Brand Indicator */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-xs">
              ZB
            </div>
            <span className="font-bold text-white text-sm">Zoberry Admin Portal</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Sign In</h1>
            <p className="text-xs text-slate-400 mt-1">
              Please enter your administrator credentials to access the management console.
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-6 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 flex items-start gap-3 text-xs"
            >
              <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zoberry.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Password
                </label>
                <span className="text-[11px] text-slate-500">
                  Case-sensitive
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center py-2.5 font-semibold text-xs shadow-md"
                loading={loading}
                disabled={loading}
                rightIcon={!loading && <FiArrowRight className="w-3.5 h-3.5" />}
              >
                {loading ? 'Authenticating...' : 'Sign In to Operations Console'}
              </Button>
            </div>
          </form>

          {/* Help & Support Notice */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            <span>Forgot credentials or need access? </span>
            <span className="text-slate-400 font-medium">Contact your System Administrator</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
