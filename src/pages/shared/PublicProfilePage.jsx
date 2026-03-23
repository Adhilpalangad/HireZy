import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Briefcase, Link as LinkIcon, ExternalLink, ShieldCheck, Mail, MessageSquare } from 'lucide-react';

const API = 'http://localhost:5000';

function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem('hirezy_token');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('hirezy_user'));
    setCurrentUser(user);
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPublicProfile();
  }, [userId]);

  const fetchPublicProfile = async () => {
    setLoading(true);
    try {
      // We will slightly re-use the GET /api/users endpoint logic, but we need a specific public route
      // Wait, currently no public GET /api/users/:id exists. We need to create it! 
      // For now, assume it's created, or I will create it next.
      const res = await fetch(`${API}/api/users/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProfile(data);

      const postRes = await fetch(`${API}/api/posts/user/${userId}`);
      const postData = await postRes.json();
      setPosts(Array.isArray(postData) ? postData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API}/api/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: userId })
      });
      const conv = await res.json();
      if (res.ok) {
        // Navigate to messages with the conversation state
        navigate(`/${currentUser.role}/messages`, { state: { conversation: conv } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-400 font-medium">Loading profile...</div>;
  if (!profile) return <div className="text-center mt-10 text-gray-400 font-medium">User not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden pb-6">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
        <div className="px-8 -mt-12 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="relative">
            <img 
              className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg bg-white" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=4f46e5&color=fff&size=128`} 
              alt="Profile" 
            />
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left sm:pb-2">
            <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-3">
              <span className="capitalize font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{profile.role}</span>
              {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.city}</span>}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:pb-2 w-full sm:w-auto">
            {currentUser?.id !== profile._id && (
              <button 
                onClick={handleStartChat}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit mx-auto sm:mx-0">
        <button 
          onClick={() => setActiveTab('portfolio')}
          className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Portfolio & Skills
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'posts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Posts ({posts.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="md:col-span-2 space-y-6">
          
          {activeTab === 'portfolio' && (
            <>
              {/* Portfolio */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <LinkIcon className="w-5 h-5 text-indigo-600" /> Work Links & Portfolio
                </h3>
                <div className="space-y-3">
                  {!profile.portfolio || profile.portfolio.length === 0 ? (
                    <div className="text-gray-400 text-sm py-4 italic">No portfolio links added yet.</div>
                  ) : (
                    profile.portfolio.map((item, idx) => (
                      <a 
                        key={idx} 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-100 rounded-xl transition-all group"
                      >
                        <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600" />
                        <span className="font-semibold text-gray-700 group-hover:text-indigo-700 text-sm truncate">{item.label}</span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
               {posts.length === 0 ? (
                <div className="bg-white text-center py-12 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 font-semibold">No posts yet</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <p className="text-gray-800 text-sm leading-relaxed mb-4">{post.content}</p>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">#{tag}</span>
                        ))}
                      </div>
                    )}
                    {post.imageUrl && (
                      <img src={`${API}${post.imageUrl}`} alt="Post" className="w-full rounded-2xl max-h-80 object-cover border border-gray-100" />
                    )}
                    <p className="text-xs text-gray-400 mt-4 text-right">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {!profile.skills || profile.skills.length === 0 ? (
                <span className="text-gray-400 text-sm italic">No skills listed.</span>
              ) : (
                profile.skills.map(skill => (
                  <span key={skill} className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-lg">
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>
          
          {/* Contact Summary */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" /> Contact Info
            </h3>
            <div className="text-sm">
              <p className="text-gray-500 mb-1">Email</p>
              <a href={`mailto:${profile.email}`} className="font-semibold text-indigo-600 hover:underline break-all">{profile.email}</a>
            </div>
            {profile.phone && (
              <div className="text-sm">
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-semibold text-gray-700">{profile.phone}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PublicProfilePage;
