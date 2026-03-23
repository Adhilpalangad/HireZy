import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Briefcase, Search, UserCircle2, LogOut, MessageSquare } from 'lucide-react';

function SeekerLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Browse Jobs', path: '/seeker/explore', icon: Search },
    { name: 'Messages', path: '/seeker/messages', icon: MessageSquare },
    { name: 'My Profile', path: '/seeker/profile', icon: UserCircle2 },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 font-sans tracking-tight">HireZy <span className="text-green-600">Seeker</span></span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-green-50 text-green-700 shadow-sm shadow-green-500/10' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <Link to="/login" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            Sign Out
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            {navItems.find(item => location.pathname.includes(item.path))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">John Doe</div>
              <div className="text-xs text-gray-500 font-medium">Job Seeker</div>
            </div>
            <img 
              className="h-9 w-9 rounded-full bg-gray-200 border-2 border-green-100"
              src={`https://ui-avatars.com/api/?name=John+Doe&background=16a34a&color=fff`}
              alt="User Avatar"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SeekerLayout;
