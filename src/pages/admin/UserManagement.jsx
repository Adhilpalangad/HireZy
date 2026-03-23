import React, { useState } from 'react';
import { Search, Ban, Unlock, ShieldAlert, UserCheck } from 'lucide-react';

function UserManagement() {
  const [users, setUsers] = useState([
    { id: 'USR-2910', name: 'Alice Cooper', email: 'alice@example.com', role: 'Candidate', status: 'Active', joined: '2026-01-10' },
    { id: 'USR-2911', name: 'Bob Security', email: 'bob@techflow.com', role: 'Company', status: 'Blocked', joined: '2026-02-15' },
    { id: 'USR-2912', name: 'Charlie Davis', email: 'charlie.d@example.com', role: 'Candidate', status: 'Active', joined: '2026-03-01' }
  ]);

  const handleToggleBlock = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' };
      }
      return u;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform access, active status, and security blocks.</p>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
            placeholder="Search users..."
          />
        </div>
      </div>

      {/* Grid Cards (Alternative to table for varied UI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            
            <div className="flex justify-between items-start mb-4 mt-2">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  user.role === 'Company' ? 'bg-indigo-500' : 'bg-primary-500'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              
              {user.status === 'Blocked' && (
                <span className="flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Blocked
                </span>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <div className="text-sm text-gray-600 flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-medium truncate ml-2">{user.email}</span>
              </div>
              <div className="text-sm text-gray-600 flex justify-between">
                <span className="text-gray-400">Joined:</span>
                <span className="font-medium">{user.joined}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end">
              {user.status === 'Active' ? (
                <button 
                  onClick={() => handleToggleBlock(user.id)}
                  className="flex items-center w-full justify-center px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Block User
                </button>
              ) : (
                <button 
                  onClick={() => handleToggleBlock(user.id)}
                  className="flex items-center w-full justify-center px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Unblock User
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManagement;
