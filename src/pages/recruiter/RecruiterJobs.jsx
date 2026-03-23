import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Briefcase, PlusCircle, Send, CheckCircle2, ShieldCheck, AlertTriangle, Users, ExternalLink, Video, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

function RecruiterJobs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // active | post | applicants
  const [userData, setUserData] = useState(null);
  const [hiredWorkers, setHiredWorkers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('hirezy_user');
    if (stored) setUserData(JSON.parse(stored));
  }, []);

  const token = localStorage.getItem('hirezy_token');

  // --- Job Form State ---
  const [jobForm, setJobForm] = useState({
    title: '',
    type: 'Local Task',
    budget: '',
    description: '',
    isShortTerm: false,
    requiresAdvance: false,
    availableTimeSlots: '' // Comma separated string for UI
  });
  const [isPosting, setIsPosting] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    if (activeTab === 'active') {
      fetchMyJobs();
    } else if (activeTab === 'applicants') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchMyJobs = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('hirezy_user') || '{}');
      if (!user.id) return;
      const res = await fetch(`${API}/api/jobs/recruiter/${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setHiredWorkers(data);
    } catch (err) {
      console.error('Failed to fetch my jobs', err);
    }
  };

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(`${API}/api/applications/recruiter/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await fetch(`${API}/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleInterview = async (appId) => {
    try {
      const res = await fetch(`${API}/api/applications/${appId}/schedule`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(prev => prev.map(a => a._id === appId ? { ...a, meetLink: data.meetLink } : a));
        alert('Google Meet link generated and attached to the application!');
      } else {
        alert(data.message || 'Failed to schedule interview');
      }
    } catch (err) {
      console.error(err);
      alert('Network Error');
    }
  };

  const initRazorpay = async (application) => {
    try {
      const token = localStorage.getItem('hirezy_token');
      
      const res = await fetch(`${API}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ applicationId: application._id })
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Failed to initiate payment.');
        return;
      }

      const user = JSON.parse(localStorage.getItem('hirezy_user') || '{}');

      const options = {
        key: 'rzp_test_SUlJzVSZSZliA2',
        amount: data.order.amount,
        currency: "INR",
        name: "HireZy Escrow (Recruiter Payment)",
        description: "50% Advance Payment to Seeker",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                applicationId: application._id
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert('Payment Successful! Advance sent to seeker.');
              setApplications(prev => prev.map(a => a._id === application._id ? { ...a, paymentStatus: 'paid' } : a));
            } else {
              alert('Payment Verification Failed!');
            }
          } catch(e) { console.error('Verification error', e); alert('Payment Error!'); }
        },
        prefill: {
          name: user.name || 'Recruiter',
          email: user.email || 'recruiter@hirezy.com',
          contact: "9999999999"
        },
        theme: {
          color: "#10b981" // emerald-500
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp1.open();

    } catch(err) {
      console.error(err);
      alert('Network Error starting Razorpay Checkout');
    }
  };

  // --- API Posting Logic ---
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!userData?.isVerified) { navigate('/verify'); return; }
    setIsPosting(true);
    const user = JSON.parse(localStorage.getItem('hirezy_user') || '{}');
    
    // Convert time slots from comma-string to array
    const timeSlotsArray = jobForm.availableTimeSlots.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const payload = { 
      ...jobForm, 
      availableTimeSlots: timeSlotsArray,
      posterName: user.name || 'Recruiter User', 
      posterId: user.id 
    };

    try {
      const res = await fetch(`${API}/api/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Job Successfully Posted to the Backend DB!');
        setJobForm({ title: '', type: 'Local Task', budget: '', description: '', isShortTerm: false, requiresAdvance: false, availableTimeSlots: '' });
        setActiveTab('active');
      } else {
        alert('Failed to post job. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network Error.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">

      {userData && !userData.isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Verify your account to post jobs</p>
            <p className="text-amber-700 text-xs">You can browse, but you'll need to verify before publishing.</p>
          </div>
          <button onClick={() => navigate('/verify')} className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Now
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Postings & Applicants</h1>
          <p className="text-gray-500 text-sm mt-1">Keep track of your active jobs and new applications.</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0 bg-blue-50 p-1.5 rounded-2xl border border-blue-100 overflow-x-auto w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'active' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-600/60 hover:text-blue-700'}`}
          >
            Your Posted Jobs
          </button>
          <button 
            onClick={() => setActiveTab('applicants')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center ${activeTab === 'applicants' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-600/60 hover:text-blue-700'}`}
          >
            Applicants
            {applications.filter(a=>a.status === 'pending').length > 0 && (
               <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{applications.filter(a=>a.status === 'pending').length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('post')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'post' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-600/60 hover:text-blue-700'}`}
          >
            Post a Job
          </button>
        </div>
      </div>

      {activeTab === 'active' && (
        <div className="space-y-4">
          {hiredWorkers.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-bold">You haven't posted any jobs yet.</div>
          ) : (
            hiredWorkers.map(job => (
              <div key={job._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{job.title}</h3>
                    <div className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-1 truncate">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${job.type === 'Professional Rank' ? 'bg-indigo-50 text-indigo-700' : 'bg-green-50 text-green-700'}`}>
                        {job.type}
                      </span>
                      • Budget: {job.budget}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center w-full md:w-auto gap-4 shrink-0">
                  <div className="text-sm text-gray-500">
                    Posted: <span className="font-bold text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-xl border border-blue-100 flex items-center justify-center">
                    Live
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {loadingApps ? (
            <div className="text-center py-10 text-gray-500 font-medium">Loading applicants...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No applicants yet</p>
            </div>
          ) : (
            applications.map(app => (
              <div key={app._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.seekerName)}&background=4f46e5&color=fff`} alt="Seeker" className="w-12 h-12 rounded-full border shadow-sm" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{app.seekerName}</h3>
                      <p className="text-xs text-gray-500 font-semibold">Applied for: <span className="text-blue-600">{app.jobTitle}</span></p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                      app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 
                      app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {app.coverMessage && (
                  <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 mb-4 border border-gray-100 italic">
                    "{app.coverMessage}"
                  </div>
                )}

                {app.selectedTimeSlot && (
                  <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm flex items-center gap-2">
                    <span className="font-bold text-indigo-900">Applicant Preferred Time:</span>
                    <span className="text-indigo-700">{app.selectedTimeSlot}</span>
                  </div>
                )}

                {app.meetLink && (
                  <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <Video className="w-5 h-5" />
                      <span className="font-bold">Google Meet Scheduled:</span>
                      <a href={app.meetLink} target="_blank" rel="noopener noreferrer" className="text-green-600 underline font-medium break-all">{app.meetLink}</a>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-4 border-t border-gray-50 gap-4">
                  <button 
                    onClick={() => navigate(`/recruiter/profile/${app.seekerId}`)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> View Full Profile
                  </button>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                    {/* Schedule GMeet Button - Appears if no meet link yet */}
                    {!app.meetLink && app.selectedTimeSlot && (
                      <button 
                        onClick={() => handleScheduleInterview(app._id)} 
                        className="px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                      >
                        <Video className="w-4 h-4" /> Schedule GMeet
                      </button>
                    )}

                    {/* Pay Advance Button - Appears if seeker requested payment */}
                    {app.paymentStatus === 'requested' && (
                      <button 
                        onClick={() => initRazorpay(app)} 
                        className="px-4 py-2 rounded-xl text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 border border-emerald-200"
                      >
                        <CreditCard className="w-4 h-4" /> Pay 50% Advance
                      </button>
                    )}

                    {app.paymentStatus === 'paid' && (
                      <span className="px-4 py-2 rounded-xl text-sm font-bold text-green-800 bg-green-100 border border-green-300 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Advance Paid (50%)
                      </span>
                    )}

                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(app._id, 'rejected')} className="px-4 py-2 flex-1 sm:flex-none rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Reject</button>
                        <button onClick={() => handleUpdateStatus(app._id, 'accepted')} className="px-4 py-2 flex-1 sm:flex-none rounded-xl text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 transition-colors">Accept</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'post' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm max-w-2xl mx-auto">
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-blue-600" /> Post a Job</h2>
            <p className="text-gray-500 text-sm">Post a real job hitting the Backend API. It will show up on the Seeker's Feed.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handlePostJob}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Job Title</label>
              <input 
                type="text" 
                required 
                value={jobForm.title}
                onChange={e => setJobForm({...jobForm, title: e.target.value})}
                placeholder="E.g. Fullstack Dev Needed" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Job Type</label>
                <select 
                  value={jobForm.type}
                  onChange={e => setJobForm({...jobForm, type: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-gray-700"
                >
                  <option>Local Task</option>
                  <option>Professional Rank</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Budget ($)</label>
                <input 
                  type="text" 
                  value={jobForm.budget}
                  onChange={e => setJobForm({...jobForm, budget: e.target.value})}
                  placeholder="E.g. $50/hr or $200 total" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 block">Description</label>
              <textarea 
                rows="4" 
                required 
                value={jobForm.description}
                onChange={e => setJobForm({...jobForm, description: e.target.value})}
                placeholder="Describe the work to be done..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium resize-none"
              ></textarea>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-indigo-900 mb-2">Advanced Options (Short Term / Video Conference)</h3>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={jobForm.isShortTerm}
                    onChange={e => setJobForm({...jobForm, isShortTerm: e.target.checked})}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span className="text-sm font-medium text-gray-800">Short-Term Job Tag</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={jobForm.requiresAdvance}
                    onChange={e => setJobForm({...jobForm, requiresAdvance: e.target.checked})}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span className="text-sm font-medium text-gray-800">50% Advance Payment Required</span>
                </label>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-indigo-100">
                <label className="text-sm font-bold text-gray-700 block">Your Available Time Slots for Video Interview <span className="font-normal text-gray-500">(Optional)</span></label>
                <input 
                  type="text" 
                  value={jobForm.availableTimeSlots}
                  onChange={e => setJobForm({...jobForm, availableTimeSlots: e.target.value})}
                  placeholder="E.g. Monday 10:00 AM, Tuesday 2:00 PM (comma separated)" 
                  className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-sm" 
                />
                <p className="text-xs text-gray-500 mt-1">Providing slots allows applicants to select a time when applying. You can later generate a Google Meet link from the Applicants tab.</p>
              </div>
            </div>

            <button type="submit" disabled={isPosting} className={`w-full text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center text-lg ${isPosting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>
              <PlusCircle className="w-5 h-5 mr-2" /> {isPosting ? 'Publishing...' : 'Publish to Live Feed'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default RecruiterJobs;
