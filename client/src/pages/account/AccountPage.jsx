import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiPackage, FiMapPin, FiHeart, FiLogOut, FiShield } from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';
import AccountOrders from './AccountOrders';
import AccountAddresses from './AccountAddresses';
import SEO from '../../components/common/SEO';
import { Card, CardBody, Badge, Button } from '../../components/ui';

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
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <SEO
        title="My Account | Zoberry Enterprise"
        description="Manage your account profile, addresses, and order history."
        url="/account"
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* User Greeting Banner */}
        <Card className="p-6 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl uppercase ring-4 ring-primary/5">
                {user?.email?.[0] || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">{user?.email}</h1>
                  <Badge variant={user?.role === 'admin' ? 'blue' : 'gray'} size="sm">
                    {user?.role === 'admin' ? 'Admin' : 'Member'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your personal details, saved shipping addresses, and live order tracking
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" leftIcon={<FiShield className="w-3.5 h-3.5" />}>
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                leftIcon={<FiLogOut className="w-3.5 h-3.5" />}
              >
                Log Out
              </Button>
            </div>
          </div>
        </Card>

        {/* Account Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Navigation (3 cols) */}
          <div className="md:col-span-3 space-y-1">
            <Card className="p-2 space-y-1">
              <button
                onClick={() => handleTabChange('orders')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'orders'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <FiPackage className="w-4 h-4" /> Orders & Tracking
              </button>

              <button
                onClick={() => handleTabChange('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'addresses'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <FiMapPin className="w-4 h-4" /> Saved Addresses
              </button>

              <Link
                to="/wishlist"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100/80 transition-all text-left"
              >
                <FiHeart className="w-4 h-4" /> Wishlist
              </Link>

              <button
                onClick={() => handleTabChange('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <FiUser className="w-4 h-4" /> Profile Details
              </button>
            </Card>
          </div>

          {/* Right Main Content (9 cols) */}
          <div className="md:col-span-9">
            {activeTab === 'orders' && <AccountOrders />}
            {activeTab === 'addresses' && <AccountAddresses />}
            {activeTab === 'profile' && (
              <Card>
                <CardBody className="p-6 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Account Profile
                  </h2>
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">Email Address</span>
                      <span className="text-slate-900 font-semibold text-sm">{user?.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">Account Role</span>
                      <span className="text-slate-700 font-medium capitalize">{user?.role || 'Standard Customer'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">Security Status</span>
                      <span className="text-slate-600">Password protected • Encrypted JWT session active</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
