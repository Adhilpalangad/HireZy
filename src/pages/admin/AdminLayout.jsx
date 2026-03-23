import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Briefcase, ShieldCheck, Users, HeadphonesIcon, LogOut } from 'lucide-react';

function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Verification Queue', path: '/admin/verification', icon: ShieldCheck },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Customer Support', path: '/admin/support', icon: HeadphonesIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex-shrink-0 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 font-sans tracking-tight">HireZy Admin</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            Sign Out
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            {navItems.find(item => location.pathname.includes(item.path))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 font-medium">System Admin</div>
            <img 
              className="h-8 w-8 rounded-full bg-gray-200"
              src={`https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff`}
              alt="Admin Avatar"
            />
          </div>
        </header>

        {/* Outlet Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
