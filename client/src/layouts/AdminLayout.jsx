import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import AdminLogin from '../pages/admin/AdminLogin';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Tag, 
  Truck, 
  LogOut,
  Menu,
  X,
  User,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../components/ui';

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
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
    { name: 'Products', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { name: 'Categories', path: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
    { name: 'Promotions', path: '/admin/promotions', icon: <Tag className="w-4 h-4" /> },
    { name: 'Shipping & Tax', path: '/admin/shipping', icon: <Truck className="w-4 h-4" /> },
  ];

  // Dynamically get the current page title based on the route
  const currentPage = navItems.find(item => 
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  )?.name || 'Admin Panel';

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Classic Professional Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0
        transition-transform duration-300 ease-in-out border-r border-slate-800
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base tracking-tight">ZOBERRY</span>
            <Badge variant="blue" size="sm">Admin</Badge>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
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
                  `flex items-center px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-xs' 
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
        <div className="p-4 bg-slate-950 border-t border-slate-800/80">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{user.name || 'Administrator'}</div>
              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Classic App Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">{currentPage}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2 text-xs text-slate-600 pl-3 border-l border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden md:inline font-medium">Enterprise Admin</span>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;
