import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { GoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiAlertCircle, FiShield } from 'react-icons/fi';
import { Modal, Button, Input } from '../ui';
import { useUIStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';
import { LOGIN_USER, REGISTER_USER, GOOGLE_LOGIN } from '../../graphql/auth';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, setUser, authModalMode, addToast } = useUIStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { mergeCart } = useCart();

  useEffect(() => {
    setIsLogin(authModalMode === 'login');
  }, [authModalMode, isAuthModalOpen]);

  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER);
  const [registerUser, { loading: registerLoading }] = useMutation(REGISTER_USER);
  const [googleLogin, { loading: googleLoading }] = useMutation(GOOGLE_LOGIN);

  const handleAuthSuccess = async (data, type) => {
    const authData = data[type];
    localStorage.setItem('token', authData.token);
    setUser(authData.user);
    closeAuthModal();
    setEmail('');
    setPassword('');
    setErrorMsg('');
    addToast(isLogin ? `Welcome back, ${authData.user.email}!` : 'Account created successfully!', 'success');
    
    // Merge guest cart items into authenticated user cart
    await mergeCart();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        const { data } = await loginUser({ variables: { email, password } });
        await handleAuthSuccess(data, 'loginUser');
      } else {
        const { data } = await registerUser({ variables: { email, password } });
        await handleAuthSuccess(data, 'registerUser');
      }
    } catch (err) {
      setErrorMsg(err.message?.replace('GraphQL error: ', ''));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await googleLogin({ variables: { token: credentialResponse.credential } });
      await handleAuthSuccess(data, 'googleLoginUser');
    } catch (err) {
      setErrorMsg(err.message?.replace('GraphQL error: ', ''));
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} size="lg">
      <div className="flex flex-col md:flex-row -m-6 min-h-[460px]">
        {/* Left Side: Brand Value Prop */}
        <div className="hidden md:flex md:w-5/12 bg-slate-900 p-8 flex-col justify-between relative overflow-hidden rounded-l-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-extrabold text-white text-lg tracking-tight">ZOBERRY</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                Enterprise
              </span>
            </div>
            <h2 className="text-xl font-bold text-white leading-snug mb-3">
              Fast, seamless & reliable shopping.
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Sign in to save addresses, track live courier shipments, unlock special offers, and manage orders with 1-click.
            </p>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <FiShield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted & secure customer sessions</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 bg-white flex flex-col justify-center rounded-r-xl">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isLogin ? 'Sign In to Your Account' : 'Create an Account'}
          </h2>
          <p className="text-slate-500 text-xs mt-1 mb-6">
            {isLogin ? 'Welcome back! Enter your details to continue.' : 'Join Zoberry Enterprise today in seconds.'}
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-xs font-medium">
              <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> 
              <span>{errorMsg.replace('GraphQL error: ', '')}</span>
            </div>
          )}

          {/* Google Login Button (Full Width) */}
          <div className="mb-4 w-full flex justify-center [&>div]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google Login Failed')}
              theme="outline"
              size="large"
              shape="rectangular"
              width="100%"
              text={isLogin ? 'signin_with' : 'signup_with'}
            />
          </div>

          {/* Divider */}
          <div className="mb-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
              <span className="px-3 bg-white text-slate-400">Or with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<FiMail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<FiLock className="w-4 h-4 text-slate-400" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loginLoading || registerLoading}
              className="w-full mt-2"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }} 
              className="font-bold text-primary hover:underline transition-colors cursor-pointer"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
