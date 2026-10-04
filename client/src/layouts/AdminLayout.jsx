import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  FiCommand
} from 'react-icons/fi';

const AdminLayout = () => {
  const { user, logout } = useUIStore();
  const navigate = useNavigate();

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
    { name: 'Orders', path: '/admin/orders', icon: <FiShoppingCart size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <FiUsers size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden text-black selection:bg-black selection:text-white">
      
      {/* Strict Left Sidebar (Black & White Theme) */}
      <aside className="w-64 bg-black text-white flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <FiCommand size={24} className="mr-3" />
          <span className="text-lg font-black uppercase tracking-widest">Admin</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => 
                  `flex items-center px-3 py-3 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors ${
                    isActive 
                      ? 'bg-white text-black' 
                      : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded bg-gray-800 flex items-center justify-center font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 truncate text-xs font-medium text-gray-400">
              {user.email}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-bold uppercase tracking-wider text-gray-400 hover:bg-gray-900 hover:text-white transition-colors rounded-sm"
          >
            <FiLogOut size={18} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar inside Admin */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-xl font-black uppercase tracking-widest">Zoberry Enterprise Control</h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold bg-black text-white px-3 py-1 rounded-full uppercase tracking-wider">
              Live System
            </span>
          </div>
        </header>

        {/* Dynamic Outlet Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;
