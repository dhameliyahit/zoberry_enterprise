import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiPackage, FiMapPin, FiHeart, FiLogOut, FiShield } from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';
import AccountOrders from './AccountOrders';
import AccountAddresses from './AccountAddresses';
import SEO from '../../components/common/SEO';

const AccountPage = () => {
  const { user, logout } = useUIStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <SEO
        title="My Account | Zoberry Enterprise"
        description="Manage your account profile, addresses, and order history."
        url="/account"
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* User Greeting Banner */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-primary rounded-full flex items-center justify-center font-bold text-xl uppercase">
              {user?.email?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">{user?.email}</h1>
              <p className="text-xs text-gray-500">
                Customer Account • {user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="btn-outline py-2 px-3 text-xs flex items-center gap-1.5"
              >
                <FiShield size={13} /> Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded flex items-center gap-1.5 transition-colors"
            >
              <FiLogOut size={13} /> Log Out
            </button>
          </div>
        </div>

        {/* Account Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Navigation (3 cols) */}
          <div className="md:col-span-3 space-y-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs p-2 space-y-1">
              <button
                onClick={() => handleTabChange('orders')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold transition-all text-left ${
                  activeTab === 'orders'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiPackage size={15} /> Orders
              </button>

              <button
                onClick={() => handleTabChange('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold transition-all text-left ${
                  activeTab === 'addresses'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiMapPin size={15} /> Saved Addresses
              </button>

              <Link
                to="/wishlist"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all text-left"
              >
                <FiHeart size={15} /> Wishlist
              </Link>

              <button
                onClick={() => handleTabChange('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold transition-all text-left ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiUser size={15} /> Profile Info
              </button>
            </div>
          </div>

          {/* Right Main Content (9 cols) */}
          <div className="md:col-span-9">
            {activeTab === 'orders' && <AccountOrders />}
            {activeTab === 'addresses' && <AccountAddresses />}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Account Details
                </h2>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">Email Address</span>
                    <span className="text-gray-900 font-semibold text-sm">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">Account Role</span>
                    <span className="text-gray-700 font-medium capitalize">{user?.role}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">Security</span>
                    <span className="text-gray-600">Password protected • Encrypted JWT session</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
