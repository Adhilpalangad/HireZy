import React, { useState, useEffect } from 'react';
import { Briefcase, Search, MapPin, ChevronRight, User, Bell, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function LandingPage() {
  const [latestJobs, setLatestJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/jobs');
        const data = await res.json();
        if (Array.isArray(data)) {
          setLatestJobs(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Could not fetch jobs for landing page:', err);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchLatestJobs();
  }, []);

  const budgetColors = ['bg-green-50 text-green-700', 'bg-blue-50 text-blue-700', 'bg-purple-50 text-purple-700'];
  const iconColors = ['bg-blue-50 text-blue-600', 'bg-purple-50 text-purple-600', 'bg-orange-50 text-orange-600'];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 font-sans tracking-tight">HireZy</span>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#jobs" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Find Jobs</a>
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Sign In</Link>
              <Link to="/login" className="text-primary-600 font-semibold bg-primary-50 px-4 py-2 rounded-xl border border-primary-200 hover:bg-primary-100 transition-colors">Get Started ➜</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 md:hidden">
              <Link to="/login">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors">
                  <User className="w-5 h-5 text-primary-700" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Find your next <span className="text-primary-600">dream job</span> with ease
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
              Discover thousands of local and remote opportunities that perfectly match your skills and aspirations. Simple to apply, fast to match.
            </p>

            {/* Search Bar */}
            <div className="mt-10 max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-lg shadow-gray-200/50 flex flex-col sm:flex-row gap-2 border border-gray-100">
              <div className="flex-1 flex items-center px-4 bg-gray-50/50 rounded-xl">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, keyword, or skill"
                  className="w-full bg-transparent border-0 focus:ring-0 py-3 px-3 text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>
              <div className="hidden sm:block w-px bg-gray-200 my-2"></div>
              <div className="flex-1 flex items-center px-4 bg-gray-50/50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location or 'Remote'"
                  className="w-full bg-transparent border-0 focus:ring-0 py-3 px-3 text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>
              <Link to="/login" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-2">
                Search
              </Link>
            </div>

            {/* Popular Searches */}
            <div className="pt-6 flex flex-wrap justify-center items-center gap-2 text-sm">
              <span className="text-gray-500">Popular:</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 cursor-pointer hover:border-primary-300 hover:text-primary-600 transition-colors">Frontend Developer</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 cursor-pointer hover:border-primary-300 hover:text-primary-600 transition-colors">Product Designer</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 cursor-pointer hover:border-primary-300 hover:text-primary-600 transition-colors">Local Tasks</span>
            </div>
          </div>
        </div>

        {/* Live Jobs Section */}
        <div id="jobs" className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Latest Opportunities</h2>
                <p className="text-gray-500 mt-2">Live jobs posted by real recruiters on HireZy</p>
              </div>
              <Link to="/login" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium group">
                See all jobs
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {jobsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : latestJobs.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-600">No jobs posted yet</h3>
                <p className="text-gray-400 mt-1 mb-6">Be the first to post an opportunity on HireZy!</p>
                <Link to="/login" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors">
                  Get Started <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestJobs.map((job, idx) => (
                  <div key={job._id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/40 hover:border-primary-100 transition-all duration-300 group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${iconColors[idx % 3]}`}>
                        {job.posterName?.charAt(0)?.toUpperCase() || 'H'}
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${budgetColors[idx % 3]}`}>
                        {job.type === 'Local Task' ? 'Local' : 'Professional'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">{job.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">Posted by {job.posterName}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{job.location || 'Remote'}</span>
                      <span className="text-gray-400">• {job.budget}</span>
                    </div>
                    <Link to="/login" className="block w-full text-center py-2 px-4 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 text-gray-700 hover:text-primary-700 font-semibold rounded-xl transition-colors text-sm">
                      View & Apply
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <Link to="/login" className="w-full mt-6 py-3 sm:hidden text-primary-600 font-medium border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors flex justify-center items-center">
              See all jobs <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
