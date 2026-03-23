import React from 'react';
import { Briefcase, Search, MapPin, ChevronRight, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
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
              <a href="#" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Find Jobs</a>
              <a href="#" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Companies</a>
              <a href="#" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Candidates</a>
              <Link to="/admin/login" className="text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors">Admin Portal ➜</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors">
                <User className="w-5 h-5 text-primary-700" />
              </div>
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
                  placeholder="Job title, keyword, or company" 
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
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-2">
                Search
              </button>
            </div>

            {/* Popular Searches */}
            <div className="pt-6 flex flex-wrap justify-center items-center gap-2 text-sm">
              <span className="text-gray-500">Popular:</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 cursor-pointer hover:border-primary-300 hover:text-primary-600 transition-colors">Frontend Developer</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 cursor-pointer hover:border-primary-300 hover:text-primary-600 transition-colors">Product Designer</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 cursor-pointer hover:border-primary-300 hover:text-primary-600 transition-colors">Data Analyst</span>
            </div>
          </div>
        </div>

        {/* Featured Jobs Preview */}
        <div className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Opportunities</h2>
                <p className="text-gray-500 mt-2">Jobs customized for your profile</p>
              </div>
              <button className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium group">
                View all jobs
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Job Card 1 */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/40 hover:border-primary-100 transition-all duration-300 group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">S</div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Full-Time</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Senior React Developer</h3>
                <p className="text-gray-500 text-sm mb-4">Stripe</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-6">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> Remote</span>
                  <span className="flex items-center text-gray-400">• $120k - $160k</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">React</span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">TypeScript</span>
                </div>
              </div>

              {/* Job Card 2 */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/40 hover:border-primary-100 transition-all duration-300 group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">F</div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">Contract</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">UX/UI Designer</h3>
                <p className="text-gray-500 text-sm mb-4">Figma</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-6">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> San Francisco</span>
                  <span className="flex items-center text-gray-400">• $90k - $130k</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">Figma</span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">Prototyping</span>
                </div>
              </div>

              {/* Job Card 3 */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/40 hover:border-primary-100 transition-all duration-300 group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl">N</div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Full-Time</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Backend Engineer</h3>
                <p className="text-gray-500 text-sm mb-4">Netflix</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-6">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> Los Gatos, CA</span>
                  <span className="flex items-center text-gray-400">• $150k - $200k</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">Node.js</span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">PostgreSQL</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-3 sm:hidden text-primary-600 font-medium border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors flex justify-center items-center">
              View all jobs <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
