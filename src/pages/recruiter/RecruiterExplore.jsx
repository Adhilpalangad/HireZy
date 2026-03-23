import React, { useState } from 'react';
import { Search, MapPin, Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function RecruiterExplore() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxRate, setMaxRate] = useState('any');

  const [interestedModal, setInterestedModal] = useState({ show: false, worker: null, message: '' });

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/workers');
        const data = await res.json();
        if (Array.isArray(data)) {
          // Map backend User data to UI format
          const mapped = data.map(u => ({
            id: u._id,
            name: u.name,
            type: 'Professional', // Default or derived from skills
            role: (u.skills && u.skills[0]) || 'General Worker',
            rating: u.rating || 0.0,
            reviews: u.reviewsCount || 0,
            hourlyValue: 0,
            hourlyStr: 'Negotiable'
          }));
          setWorkers(mapped);
        }
      } catch (err) {
        console.error('Error fetching workers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter(w => {
    // 1. Tab filter
    if (activeTab !== 'all' && w.type !== activeTab) return false;
    
    // 2. Search text filter
    if (searchQuery.trim() && !w.role.toLowerCase().includes(searchQuery.toLowerCase()) && !w.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // 3. Max rate filter
    if (maxRate !== 'any') {
      const maxAllowed = parseInt(maxRate);
      if (w.hourlyValue > maxAllowed) return false;
    }

    return true;
  });

  const handleInterested = (e) => {
    e.preventDefault();
    alert(`Interest and message sent to ${interestedModal.worker.name}!`);
    setInterestedModal({ show: false, worker: null, message: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      
      {/* Header & Global Search */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Find the Perfect Worker</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          
          {/* Keyword Search */}
          <div className="flex-[2] relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill, name or profession..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Rate Filter */}
          <div className="flex-1">
            <select 
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
            >
              <option value="any">Any Hourly Rate</option>
              <option value="30">Under $30/hr</option>
              <option value="50">Under $50/hr</option>
              <option value="80">Under $80/hr</option>
            </select>
          </div>

        </div>

        {/* Filters */}
        <div className="flex space-x-2 border-b border-gray-100 pb-px">
          {['all', 'Professional', 'Local'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'all' ? 'All Profiles' : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading workers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredWorkers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 font-medium">
              No workers found matching your filters. Try adjusting your search.
            </div>
          ) : (
          filteredWorkers.map(worker => (
            <div key={worker.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row gap-6 hover:border-blue-200">
              <div className="flex flex-col items-center sm:w-1/3 border-r border-gray-50 pr-4">
                <img 
                  className="h-20 w-20 rounded-full mb-3 border border-gray-100 shadow-sm"
                  src={`https://ui-avatars.com/api/?name=${worker.name.replace(' ', '+')}&background=random&color=fff`}
                  alt="Avatar"
                />
                <h3 className="font-bold text-gray-900 text-center leading-tight">{worker.name}</h3>
                <div className="flex items-center text-sm font-bold text-yellow-500 mt-2 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 mr-1 fill-current" /> {worker.rating} 
                  <span className="text-yellow-700 font-semibold ml-1">({worker.reviews})</span>
                </div>
                <span className={`mt-3 px-3 py-1 text-xs font-bold font-sans rounded-full ${worker.type === 'Professional' ? 'bg-indigo-50 text-indigo-700' : 'bg-green-50 text-green-700'}`}>
                  {worker.type}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{worker.role}</h4>
                <p className="text-gray-500 font-medium text-sm mb-5">Hourly Rate: <span className="text-gray-900">{worker.hourlyStr}</span></p>
                
                <div className="flex gap-2 flex-col sm:flex-row mt-auto">
                  <button 
                    onClick={() => setInterestedModal({ show: true, worker, message: '' })}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex flex-row items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Interested
                  </button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      )}

      {/* Interested Modal */}
      {interestedModal.show && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="text-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Contact {interestedModal.worker?.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Send a message to express interest in their {interestedModal.worker?.role} services.</p>
            </div>

            <form onSubmit={handleInterested}>
              <div className="space-y-2 mb-8">
                <label className="text-sm font-bold text-gray-700">Your Message</label>
                <textarea 
                  rows="4" 
                  value={interestedModal.message}
                  onChange={(e) => setInterestedModal({...interestedModal, message: e.target.value})}
                  required
                  placeholder="Hi there, I saw your profile and I'm interested in discussing a potential job opportunity with you..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-medium"
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setInterestedModal({ show: false, worker: null, message: '' })}
                  className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!interestedModal.message.trim()}
                  className={`flex-1 py-3 font-bold rounded-xl transition-colors ${interestedModal.message.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-blue-200 text-blue-50 cursor-not-allowed'}`}
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default RecruiterExplore;
