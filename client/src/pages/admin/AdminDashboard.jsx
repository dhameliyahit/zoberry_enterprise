import React from 'react';
import { FiTrendingUp, FiBox, FiUsers, FiDollarSign } from 'react-icons/fi';

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-black">{value}</h3>
      </div>
      <div className="h-12 w-12 bg-gray-100 flex items-center justify-center rounded-full text-black">
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs font-bold">
      <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
        {trend >= 0 ? '+' : ''}{trend}%
      </span>
      <span className="text-gray-400 ml-2">from last month</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-widest text-black">Overview</h2>
        <button className="bg-black text-white text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-gray-800 transition-colors">
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="$45,231" icon={<FiDollarSign size={24} />} trend={12.5} />
        <StatCard title="Total Orders" value="1,204" icon={<FiTrendingUp size={24} />} trend={8.2} />
        <StatCard title="Active Products" value="342" icon={<FiBox size={24} />} trend={-2.4} />
        <StatCard title="Total Customers" value="8,943" icon={<FiUsers size={24} />} trend={15.3} />
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="bg-white border border-gray-200 shadow-sm mt-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-black uppercase tracking-widest text-black">Recent Orders</h3>
        </div>
        <div className="p-6 text-center text-gray-500 text-sm font-medium py-12">
          Real-time order tracking component will be implemented here.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
