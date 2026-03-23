import React, { useState } from 'react';
import { CheckCircle, XCircle, Search, Eye, FileText } from 'lucide-react';

function UserVerification() {
  const [requests, setRequests] = useState([
    { id: 'REQ-101', name: 'John Doe', email: 'john@example.com', type: 'Candidate', status: 'Pending', date: '2026-03-23' },
    { id: 'REQ-102', name: 'TechFlow Inc.', email: 'hr@techflow.com', type: 'Company', status: 'Pending', date: '2026-03-23' },
    { id: 'REQ-098', name: 'Sarah Smith', email: 'sarah.s@example.com', type: 'Candidate', status: 'Approved', date: '2026-03-22' }
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">Pending</span>;
      case 'Approved': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">Approved</span>;
      case 'Rejected': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">Rejected</span>;
      default: return null;
    }
  };

  const handleAction = (id, newStatus) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manual Verifications</h1>
          <p className="text-sm text-gray-500 mt-1">Review user submissions requiring manual identity or company verification.</p>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
            placeholder="Search pending requests..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {req.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{req.name}</div>
                    <div className="text-sm text-gray-500">{req.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {req.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {req.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Documents">
                        <FileText className="w-5 h-5" />
                      </button>
                      {req.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleAction(req.id, 'Approved')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'Rejected')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {requests.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No verification requests found.
          </div>
        )}
      </div>
    </div>
  );
}

export default UserVerification;
