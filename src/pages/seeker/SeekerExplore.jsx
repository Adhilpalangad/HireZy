import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShieldCheck, AlertTriangle, Users, Zap, Clock, PlusCircle, X, Send, Briefcase, Video, CreditCard, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

function SeekerExplore() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'community' | 'applications'
  const [jobs, setJobs] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Post form state
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    location: '',
    budget: '',
    description: '',
    peopleNeeded: 1,
    urgency: 'Flexible'
  });
  const [posting, setPosting] = useState(false);
  // Apply form state
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverMessage, setCoverMessage] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('hirezy_user');
    if (stored) setUserData(JSON.parse(stored));
    fetchJobs();
    fetchCommunity();
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchMyApplications();
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/jobs`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`${API}/api/jobs/community`);
      const data = await res.json();
      setCommunityRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setCommunityRequests([]);
    }
  };

  const fetchMyApplications = async () => {
    setAppsLoading(true);
    try {
      const token = localStorage.getItem('hirezy_token');
      const res = await fetch(`${API}/api/applications/seeker/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMyApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setAppsLoading(false);
    }
  };

  const requestAdvance = async (applicationId) => {
    try {
      const token = localStorage.getItem('hirezy_token');
      const res = await fetch(`${API}/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus: 'requested' })
      });
      if (res.ok) {
        setMyApplications(prev => prev.map(a => a._id === applicationId ? { ...a, paymentStatus: 'requested' } : a));
        alert('Advance payment requested successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Network Error');
    }
  };

  const handleApplyClick = (job) => {
    if (!userData?.isVerified) {
      navigate('/verify');
      return;
    }
    setSelectedJob(job);
    setSelectedTimeSlot(job.availableTimeSlots?.[0] || '');
    setShowApplyForm(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const token = localStorage.getItem('hirezy_token');
      const res = await fetch(`${API}/api/applications/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId: selectedJob._id, coverMessage, selectedTimeSlot })
      });
      const data = await res.json();
      if (res.ok) {
        setShowApplyForm(false);
        setCoverMessage('');
        navigate('/seeker/messages', { state: { conversation: data.conversation } });
      } else {
        alert(data.message || 'Error applying');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setApplying(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostError('');
    if (!userData?.isVerified) {
      navigate('/verify');
      return;
    }
    if (!postForm.title.trim() || !postForm.budget.trim()) {
      setPostError('Title and budget are required.');
      return;
    }
    setPosting(true);
    try {
      const token = localStorage.getItem('hirezy_token');
      const res = await fetch(`${API}/api/jobs/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setPostError(data.message || 'Failed to post request.');
        setPosting(false);
        return;
      }
      setCommunityRequests(prev => [data, ...prev]);
      setShowPostForm(false);
      setPostForm({ title: '', location: '', budget: '', description: '', peopleNeeded: 1, urgency: 'Flexible' });
      setActiveTab('community');
    } catch (err) {
      setPostError('Network error. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const urgencyConfig = {
    'ASAP':      { color: 'bg-red-50 text-red-700 border-red-200',    icon: '🔴' },
    'Today':     { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '🟠' },
    'This Week': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '🟡' },
    'Flexible':  { color: 'bg-green-50 text-green-700 border-green-200',  icon: '🟢' },
  };

  const filteredJobs = jobs.filter(j =>
    !searchQuery || j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || j.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunity = communityRequests.filter(r =>
    !searchQuery || r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatAgo = (d) => {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Verification Banner */}
      {userData && !userData.isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Verify your identity to apply or post job requests</p>
            <p className="text-amber-700 text-xs">You can browse freely for now.</p>
          </div>
          <button onClick={() => navigate('/verify')} className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Explore Opportunities</h1>
            <p className="text-gray-500 text-sm mt-0.5">Browse recruiter jobs & community requests</p>
          </div>
          <button
            onClick={() => setShowPostForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl transition-all shadow-md shadow-indigo-500/20 text-sm whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" /> Post a Request
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, skill, or location..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 bg-gray-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Briefcase className="w-4 h-4" /> Job Postings
            {jobs.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'jobs' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                {jobs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'community' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users className="w-4 h-4" /> Community Requests
            {communityRequests.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'community' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                {communityRequests.length}
              </span>
            )}
          </button>
          {userData?.isVerified && (
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Send className="w-4 h-4" /> My Applications
            </button>
          )}
        </div>
      </div>

      {/* ---- RECRUITER JOB POSTINGS TAB ---- */}
      {activeTab === 'jobs' && (
        loading ? (
          <div className="text-center py-12 text-gray-400 font-medium">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No jobs found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map(job => (
              <div key={job._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all group flex flex-col">
                <div className="flex flex-wrap gap-2 items-start mb-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 ${job.type === 'Professional Rank' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                    {job.type}
                  </span>
                  {job.isShortTerm && <span className="px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 bg-pink-50 text-pink-700 border-pink-200">⏱️ Short-Term</span>}
                  {job.requiresAdvance && <span className="px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 bg-emerald-50 text-emerald-800 border-emerald-200">💳 50% Adv</span>}
                </div>
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors pr-2">{job.title}</h3>
                  <span className="text-sm font-bold text-gray-900 ml-2 whitespace-nowrap">{job.budget}</span>
                </div>
                <p className="text-gray-500 text-sm mb-3 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />{job.location || 'Remote'}
                </p>
                {job.description && (
                  <p className="text-gray-400 text-xs mb-4 line-clamp-2">{job.description}</p>
                )}
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold uppercase">
                      {job.posterName?.charAt(0) || 'H'}
                    </span>
                    <span className="text-xs">{job.posterName}</span>
                  </div>
                  <button
                    onClick={() => handleApplyClick(job)}
                    className={`font-bold text-sm px-4 py-2 rounded-xl transition-colors ${userData?.isVerified ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-700'}`}
                  >
                    {userData?.isVerified ? 'Apply' : '🔒 Verify to Apply'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ---- COMMUNITY REQUESTS TAB ---- */}
      {activeTab === 'community' && (
        filteredCommunity.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No community requests yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Be the first to post a local job request!</p>
            <button
              onClick={() => setShowPostForm(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-2xl text-sm hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Post a Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCommunity.map(req => {
              const ug = urgencyConfig[req.urgency] || urgencyConfig['Flexible'];
              return (
                <div key={req._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all">
                  {/* Header row */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{req.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Posted by {req.posterName} · {formatAgo(req.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${ug.color}`}>
                      {ug.icon} {req.urgency}
                    </span>
                  </div>

                  {req.description && (
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{req.description}</p>
                  )}

                  {/* Info chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5" /> {req.peopleNeeded} {req.peopleNeeded === 1 ? 'person' : 'people'} needed
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3.5 h-3.5" /> {req.location || 'On-site'}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg">
                      💰 {req.budget}
                    </span>
                  </div>

                  <button
                    onClick={() => handleApplyClick(req)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${userData?.isVerified ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20' : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-700'}`}
                  >
                    {userData?.isVerified ? 'I Can Help — Contact' : '🔒 Verify to Respond'}
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ---- MY APPLICATIONS TAB ---- */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Track Your Applications</h2>
          {appsLoading ? (
            <div className="text-center py-10 text-gray-500 font-medium">Loading your applications...</div>
          ) : myApplications.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
              <Send className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">You haven't applied to any jobs yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myApplications.map(app => (
                <div key={app._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{app.jobTitle}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                      app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 
                      app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  {app.meetLink && (
                    <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm">
                      <div className="flex items-center gap-2 text-indigo-900 mb-1">
                        <Video className="w-4 h-4" />
                        <span className="font-bold">Interview Scheduled</span>
                      </div>
                      <a href={app.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs font-semibold break-all">
                        {app.meetLink}
                      </a>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-sm">
                      {app.paymentStatus === 'requested' && (
                        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-bold">
                          <AlertTriangle className="w-4 h-4" /> Payment Requested
                        </div>
                      )}
                      {app.paymentStatus === 'paid' && (
                        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Advance Paid (50%)
                        </div>
                      )}
                    </div>
                    {app.paymentStatus === 'none' && app.meetLink && (
                      <button 
                        onClick={() => requestAdvance(app._id)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all text-sm"
                      >
                        <CreditCard className="w-4 h-4" /> Request 50% Advance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- POST A REQUEST MODAL ---- */}
      {showPostForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Post a Local Request</h2>
                <p className="text-gray-500 text-sm">Find helpers for any task — manual, skilled, or professional</p>
              </div>
              <button onClick={() => { setShowPostForm(false); setPostError(''); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">What do you need? *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="e.g. Need 10 people for construction work, Plumber needed today"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">More details</label>
                <textarea
                  rows={3}
                  value={postForm.description}
                  onChange={e => setPostForm({ ...postForm, description: e.target.value })}
                  placeholder="Describe the task, requirements, working hours, etc."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* People Needed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">People Needed</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={postForm.peopleNeeded}
                      onChange={e => setPostForm({ ...postForm, peopleNeeded: parseInt(e.target.value) || 1 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency</label>
                  <select
                    value={postForm.urgency}
                    onChange={e => setPostForm({ ...postForm, urgency: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                  >
                    <option value="Flexible">🟢 Flexible</option>
                    <option value="This Week">🟡 This Week</option>
                    <option value="Today">🟠 Today</option>
                    <option value="ASAP">🔴 ASAP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={postForm.location}
                      onChange={e => setPostForm({ ...postForm, location: e.target.value })}
                      placeholder="Site address or city"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Pay / Budget *</label>
                  <input
                    type="text"
                    value={postForm.budget}
                    onChange={e => setPostForm({ ...postForm, budget: e.target.value })}
                    placeholder="₹500/day, $20/hr, Negotiate"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                  />
                </div>
              </div>

              {postError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 font-semibold">
                  {postError}
                </div>
              )}

              {!userData?.isVerified && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl p-3 font-medium">
                  ⚠️ You need to verify your account before posting a request.
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowPostForm(false); setPostError(''); }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${posting ? 'bg-indigo-400 cursor-not-allowed text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'}`}
                >
                  {posting ? 'Posting...' : <><Send className="w-4 h-4" /> Post Request</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- APPLY MODAL ---- */}
      {showApplyForm && selectedJob && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Apply for Job</h2>
                <p className="text-sm font-semibold text-indigo-600">{selectedJob.title}</p>
              </div>
              <button onClick={() => setShowApplyForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={submitApplication} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Message (Optional)</label>
                <textarea
                  rows={4}
                  value={coverMessage}
                  onChange={e => setCoverMessage(e.target.value)}
                  placeholder="Why are you a good fit for this job?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none text-sm"
                />
              </div>

              {selectedJob.availableTimeSlots && selectedJob.availableTimeSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Interview Slot</label>
                  <select 
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-gray-700"
                  >
                    {selectedJob.availableTimeSlots.map((slot, idx) => (
                      <option key={idx} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className={`flex-1 flex items-center justify-center py-3 rounded-2xl font-bold text-sm transition-all text-white ${applying ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20'}`}
                >
                  {applying ? 'Sending...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeekerExplore;
