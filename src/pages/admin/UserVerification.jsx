import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, FileText, RefreshCw, ShieldCheck, Clock, User as UserIcon } from 'lucide-react';

function UserVerification() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hirezy_token');
      const res = await fetch('http://localhost:5000/api/admin/verifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVerifications(); }, []);

  const handleAction = async (userId, action) => {
    setActionLoading(userId + action);
    try {
      const token = localStorage.getItem('hirezy_token');
      const res = await fetch(`http://localhost:5000/api/admin/verifications/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Update local state immediately
        setRequests(prev => prev.map(r =>
          r._id === userId
            ? { ...r, verificationStatus: action === 'approve' ? 'approved' : 'rejected', isVerified: action === 'approve' }
            : r
        ));
      }
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">Pending Review</span>;
      case 'approved': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">Approved</span>;
      case 'rejected': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">Rejected</span>;
      default: return null;
    }
  };

  const filtered = requests.filter(r => {
    if (filter !== 'all' && r.verificationStatus !== filter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.verificationStatus === 'pending').length,
    approved: requests.filter(r => r.verificationStatus === 'approved').length,
    rejected: requests.filter(r => r.verificationStatus === 'rejected').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Identity Verifications</h1>
          <p className="text-sm text-gray-500 mt-1">Review submitted Gov ID documents and approve or reject users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search by name or email..."
            />
          </div>
          <button
            onClick={fetchVerifications}
            className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {[
          { key: 'pending', label: 'Pending', color: 'bg-yellow-500' },
          { key: 'approved', label: 'Approved', color: 'bg-green-500' },
          { key: 'rejected', label: 'Rejected', color: 'bg-red-500' },
          { key: 'all', label: 'All' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${filter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
            {counts[key] > 0 && (
              <span className={`text-white text-xs px-1.5 py-0.5 rounded-full ${color || 'bg-gray-400'}`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-gray-400" />
            Loading verification requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No {filter !== 'all' ? filter : ''} verification requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact / Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.phone || <span className="text-gray-300">—</span>}</div>
                      <div className="text-xs text-gray-500">{user.city || <span className="text-gray-300">—</span>}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full capitalize ${user.role === 'recruiter' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {/* View Gov ID */}
                        {user.govIdUrl ? (
                          <a
                            href={`http://localhost:5000${user.govIdUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Gov ID Document"
                          >
                            <FileText className="w-5 h-5" />
                          </a>
                        ) : (
                          <span className="p-1.5 text-gray-300 cursor-not-allowed" title="No document uploaded">
                            <FileText className="w-5 h-5" />
                          </span>
                        )}

                        {/* Approve / Reject — only show if pending */}
                        {user.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(user._id, 'approve')}
                              disabled={actionLoading === user._id + 'approve'}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAction(user._id, 'reject')}
                              disabled={actionLoading === user._id + 'reject'}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}

export default UserVerification;
