import React, { useState } from 'react';
import { Briefcase, Mail, KeyRound, User as UserIcon, Building2, UserCircle2, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker' // 'seeker' or 'hiring' (which becomes recruiter)
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      // Convert 'hiring' to 'recruiter' for backend
      const payload = { ...formData };
      if (payload.role === 'hiring') payload.role = 'recruiter';
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setErrorMsg(data.message || 'Authentication failed');
        setLoading(false);
        return;
      }
      
      // Save token to localStorage
      localStorage.setItem('hirezy_token', data.token);
      localStorage.setItem('hirezy_user', JSON.stringify(data.user));

      // Route based on role
      if (data.user?.role === 'admin') {
        navigate('/admin/verification');
      } 
      else if (data.user?.role === 'recruiter') {
        navigate('/recruiter/explore');
      } 
      else {
        navigate('/seeker/explore');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Ensure the backend server is running and MongoDB is connected.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 relative overflow-hidden">
        <Link to="/" className="absolute top-6 left-6 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors">
          ← Back to Home
        </Link>

        {/* Branding */}
        <div className="flex flex-col items-center justify-center mb-10 pt-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isLogin ? 'Welcome back to HireZy' : 'Create your HireZy account'}
          </h1>
          <p className="text-gray-500 mt-2 text-center text-sm">
            {isLogin ? 'Enter your credentials to access your account' : 'Join thousands of professionals and local workers'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-sm font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required={!isLogin}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 pb-2">
                <label className="text-sm font-semibold text-gray-700">I am here to:</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => handleRoleSelect('seeker')}
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      formData.role === 'seeker' 
                        ? 'border-primary-600 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 hover:border-primary-300 text-gray-500'
                    }`}
                  >
                    <UserCircle2 className={`w-8 h-8 mb-2 ${formData.role === 'seeker' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-sm">Find Jobs</span>
                    <span className="text-xs mt-1 opacity-70">Seek professional or local work</span>
                  </div>

                  <div 
                    onClick={() => handleRoleSelect('hiring')}
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      formData.role === 'hiring' 
                        ? 'border-primary-600 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 hover:border-primary-300 text-gray-500'
                    }`}
                  >
                    <Building2 className={`w-8 h-8 mb-2 ${formData.role === 'hiring' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-sm">Hire Talent</span>
                    <span className="text-xs mt-1 opacity-70">Recruit local or pro workers</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all mt-6 ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'}`}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')} {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{' '}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ ...formData, password: '' });
                setErrorMsg('');
              }}
              className="font-bold text-primary-600 hover:underline transition-all"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
