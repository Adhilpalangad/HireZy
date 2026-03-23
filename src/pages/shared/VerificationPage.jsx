import React, { useState, useEffect } from 'react';
import { ShieldCheck, Upload, Phone, MapPin, FileText, AlertCircle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function VerificationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({ phone: '', city: '' });
  const [user, setUser] = useState(null);
  const [pageState, setPageState] = useState('loading'); // 'loading' | 'form' | 'pending' | 'approved'

  useEffect(() => {
    const stored = localStorage.getItem('hirezy_user');
    if (!stored) {
      navigate('/login');
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.isVerified || u.verificationStatus === 'approved') {
      // Already fully verified — go to dashboard
      navigate(u.role === 'recruiter' ? '/recruiter/explore' : '/seeker/explore');
    } else if (u.verificationStatus === 'pending') {
      // Submitted but waiting for admin
      setPageState('pending');
    } else {
      // Not yet submitted
      setPageState('form');
    }
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedFile) {
      setError('Please upload your Government ID.');
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem('hirezy_token');
      const payload = new FormData();
      payload.append('phone', formData.phone);
      payload.append('city', formData.city);
      payload.append('govId', selectedFile);

      const res = await fetch('http://localhost:5000/api/verify/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Verification failed. Please try again.');
        setLoading(false);
        return;
      }

      // Update stored user to reflect pending status
      const updatedUser = { ...user, ...data.user, verificationStatus: 'pending', isVerified: false };
      localStorage.setItem('hirezy_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setPageState('pending');
    } catch (err) {
      console.error(err);
      setError('Network error. Make sure the backend is running.');
      setLoading(false);
    }
  };

  // ---- Loading ----
  if (pageState === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;
  }

  // ---- Pending Review Screen ----
  if (pageState === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Review</h2>
          <p className="text-gray-500 mb-1">Your documents have been submitted and are being reviewed by our admin team.</p>
          <p className="text-sm text-gray-400 mb-6">You'll be able to post and apply once approved.</p>
          <button
            onClick={() => navigate(user?.role === 'recruiter' ? '/recruiter/explore' : '/seeker/explore')}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ---- Verification Form ----
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Identity</h1>
          <p className="text-gray-500 mt-2">Required to post jobs or apply for work on HireZy.</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Why do we verify?</p>
            <p className="text-blue-600">Verification helps us ensure a safe, trusted marketplace. Your documents are stored securely and never shared.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name (read only) */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                readOnly
                value={user?.name || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 font-medium cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">City / Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai, India"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Gov ID Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Government ID *</label>
              <p className="text-xs text-gray-500">Upload a clear photo or scan of your National ID / Passport / Driver's License.</p>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                {selectedFile ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                    <span className="font-semibold text-green-700">{selectedFile.name}</span>
                    <span className="text-xs text-green-600 mt-1">Click to change file</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="font-semibold text-gray-700">Click to upload Gov ID</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF · Max 5MB</span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Accepted ID Types */}
            <div className="grid grid-cols-3 gap-3">
              {['National ID', 'Passport', "Driver's License"].map(type => (
                <div key={type} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-xs font-semibold text-gray-600">{type}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all shadow-md ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
            >
              {loading ? 'Submitting...' : (<>Submit & Get Verified <ArrowRight className="w-5 h-5" /></>)}
            </button>

            <p className="text-center text-xs text-gray-400">
              By submitting, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}

export default VerificationPage;
