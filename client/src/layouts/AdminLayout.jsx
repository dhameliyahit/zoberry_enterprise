import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import AdminLogin from '../pages/admin/AdminLogin';
import { 
  FiGrid, 
  FiBox, 
  FiList, 
  FiUsers, 
  FiShoppingCart, 
  FiSettings, 
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiTag
} from 'react-icons/fi';

const AdminLayout = () => {
  const { user, logout } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protect Admin Route
  if (!user || user.role !== 'admin') {
    return <AdminLogin />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <FiGrid size={20} />, exact: true },
    { name: 'Products', path: '/admin/products', icon: <FiBox size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <FiList size={20} /> },
    { name: 'Promotions', path: '/admin/promotions', icon: <FiTag size={20} /> },
  ];

  // Dynamically get the current page title based on the route
  const currentPage = navItems.find(item => 
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  )?.name || 'Admin Panel';

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Classic Professional Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950">
          <span className="text-xl font-bold text-white tracking-wide">Zoberry Admin</span>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white">
              <FiUser size={16} />
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="text-sm font-medium text-white truncate">{user.name || 'Administrator'}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <FiLogOut size={18} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Classic App Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{currentPage}</h1>
          </div>
          
          <div className="flex items-center">
            {/* Dynamic Status / User Profile in App Bar */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-green-500"></span>
              <span className="hidden sm:inline-block text-sm font-medium text-gray-600 mr-4 border-r border-gray-300 pr-4">
                System Online
              </span>
              <div className="text-sm font-medium text-gray-700">
                {user.email}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;
