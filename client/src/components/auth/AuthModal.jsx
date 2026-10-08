import React, { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { GoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import Modal from '../common/Modal';
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
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal}>
      <div className="flex flex-col md:flex-row w-full h-full min-h-[500px]">
        {/* Left Side: Brand/Image */}
        <div className="hidden md:flex md:w-5/12 bg-primary p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <img src="/assets/zoberry_logo.png" alt="Zoberry" className="h-10 mb-8" />
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Welcome to the Premium Experience.
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Log in to unlock exclusive deals, track your orders, and enjoy a seamless shopping experience with Zoberry Enterprise.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
          <h2 className="text-2xl font-extrabold text-secondary mb-2 tracking-tight">
            {isLogin ? 'Sign In to Zoberry' : 'Create an Account'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Join Zoberry Enterprise today.'}
          </p>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded flex items-start gap-2 text-sm font-medium">
              <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" /> 
              <span>{errorMsg.replace('GraphQL error: ', '')}</span>
            </div>
          )}

          {/* Google Login Button (Full Width) */}
          <div className="mb-6 w-full flex justify-center [&>div]:w-full">
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
          <div className="mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="px-4 bg-white text-gray-400">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm outline-none"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loginLoading || registerLoading}
              className="btn-primary w-full mt-2"
            >
              {loginLoading || registerLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }} 
              className="font-bold text-primary hover:text-primary-hover transition-colors"
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
