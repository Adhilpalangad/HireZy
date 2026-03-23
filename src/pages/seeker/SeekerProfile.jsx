import React, { useState, useEffect, useRef } from 'react';
import { Upload, Star, FileText, Briefcase, Link as LinkIcon, PlusCircle, Trash2, ExternalLink, ShieldCheck, AlertTriangle, Heart, Image as ImageIcon, X, Send, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

function SeekerProfile() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [userData, setUserData] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [linkSaving, setLinkSaving] = useState(false);

  // Posts state
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('posts'); // 'posts' | 'portfolio' | 'skills'
  const imageInputRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('hirezy_token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) return;
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUserData(data);
        if (data.skills) setSkills(data.skills);
        if (data.portfolio) setPortfolio(data.portfolio);

        // Fetch user posts
        fetchUserPosts(data._id);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const fetchUserPosts = async (userId) => {
    setPostsLoading(true);
    try {
      const res = await fetch(`${API}/api/posts/user/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const updateBackendProfile = async (updatedSkills, updatedPortfolio) => {
    try {
      await fetch(`${API}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ skills: updatedSkills, portfolio: updatedPortfolio })
      });
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill('');
      updateBackendProfile(updated, portfolio);
    }
  };

  const removeSkill = (s) => {
    const updated = skills.filter(x => x !== s);
    setSkills(updated);
    updateBackendProfile(updated, portfolio);
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.label.trim() || !newLink.url.trim()) return;
    const url = newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`;
    const updated = [...portfolio, { label: newLink.label, url }];
    setPortfolio(updated);
    setNewLink({ label: '', url: '' });
    setLinkSaving(true);
    await updateBackendProfile(skills, updated);
    setLinkSaving(false);
  };

  const handleRemoveLink = async (idx) => {
    const updated = portfolio.filter((_, i) => i !== idx);
    setPortfolio(updated);
    await updateBackendProfile(skills, updated);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setPostImage(null);
    setPostImagePreview('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setPostLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent.trim());
      if (postTags.trim()) formData.append('tags', postTags.trim());
      if (postImage) formData.append('image', postImage);

      const res = await fetch(`${API}/api/posts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setPosts(prev => [data, ...prev]);
        setPostContent('');
        setPostTags('');
        clearImage();
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setPostLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(prev => prev.map(p =>
          p._id === postId
            ? { ...p, likes: Array(data.likes).fill(null), _liked: data.liked }
            : p
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`${API}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!userData) {
    return <div className="text-center mt-10 text-gray-500 font-bold">Loading Profile...</div>;
  }

  const tabs = [
    { key: 'posts', label: 'Posts', count: posts.length },
    { key: 'portfolio', label: 'Portfolio & Links', count: portfolio.length },
    { key: 'skills', label: 'Skills', count: skills.length },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Verification Banners */}
      {!userData.isVerified && userData.verificationStatus !== 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Account not verified</p>
            <p className="text-amber-700 text-sm">Verify your identity to apply for jobs and unlock all features.</p>
          </div>
          <button onClick={() => navigate('/verify')} className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1 whitespace-nowrap">
            <ShieldCheck className="w-4 h-4" /> Verify Now
          </button>
        </div>
      )}

      {userData.verificationStatus === 'pending' && !userData.isVerified && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="font-semibold text-blue-800 text-sm">Verification under review — you'll be approved shortly.</p>
        </div>
      )}

      {userData.isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
          <p className="font-semibold text-green-800 text-sm">Verified Account — You can apply for any job on HireZy!</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
        <div className="px-6 pb-6 -mt-10 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="relative">
            <img
              className="h-20 w-20 rounded-2xl border-4 border-white shadow-lg bg-white"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4f46e5&color=fff&size=128`}
              alt="Profile"
            />
            {userData.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 sm:pb-1">
            <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
            <p className="text-gray-500 text-sm">{skills[0] || 'Job Seeker'}{userData.city ? ` · 📍 ${userData.city}` : ''}</p>
            <div className="flex items-center text-yellow-500 text-sm font-semibold mt-1">
              <Star className="w-4 h-4 mr-1 fill-current" /> {userData.rating || '0.0'} / 5.0
              <span className="text-gray-400 font-normal ml-2">({userData.reviewsCount || 0} jobs)</span>
            </div>
          </div>
          <div className="flex gap-2 pb-1">
            <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-lg">{posts.length} Posts</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeSection === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeSection === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- POSTS SECTION ---- */}
      {activeSection === 'posts' && (
        <div className="space-y-4">
          {/* Create Post Box */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex gap-3">
              <img
                className="h-10 w-10 rounded-xl shrink-0 bg-indigo-100"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4f46e5&color=fff`}
                alt=""
              />
              <form onSubmit={handleCreatePost} className="flex-1 space-y-3">
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder={`Share your work, achievements, or anything on your mind, ${userData.name.split(' ')[0]}...`}
                  rows={postContent ? 4 : 2}
                  maxLength={2000}
                  className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-gray-200 rounded-2xl px-4 py-3 text-sm placeholder-gray-400 font-medium outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none"
                />

                {/* Image Preview */}
                {postImagePreview && (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                    <img src={postImagePreview} alt="preview" className="w-full max-h-64 object-cover" />
                    <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-full p-1 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Tags input (appears when content is typed) */}
                {postContent && (
                  <input
                    type="text"
                    value={postTags}
                    onChange={e => setPostTags(e.target.value)}
                    placeholder="Add tags: React, Design, Freelance (comma-separated)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                )}

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" /> Photo
                    </button>
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </div>

                  <div className="flex items-center gap-3">
                    {postContent && (
                      <span className="text-xs text-gray-400">{postContent.length}/2000</span>
                    )}
                    <button
                      type="submit"
                      disabled={!postContent.trim() || postLoading}
                      className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-bold transition-all ${postContent.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {postLoading ? 'Posting...' : <><Send className="w-4 h-4" /> Post</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Posts Feed */}
          {postsLoading ? (
            <div className="text-center py-8 text-gray-400 font-medium">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white text-center py-14 rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Send className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-600 font-semibold">No posts yet</p>
              <p className="text-gray-400 text-sm mt-1">Share your work, achievements, or anything professional!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3 items-center">
                    <img
                      className="h-10 w-10 rounded-xl shrink-0"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=4f46e5&color=fff`}
                      alt=""
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{post.authorName}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Image */}
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-gray-100 mb-3">
                    <img
                      src={`${API}${post.imageUrl}`}
                      alt="Post"
                      className="w-full max-h-80 object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${post._liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart className={`w-4 h-4 ${post._liked ? 'fill-current' : ''}`} />
                    {post.likes?.length || 0}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- PORTFOLIO / LINKS SECTION ---- */}
      {activeSection === 'portfolio' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-indigo-600" /> Work Links & Portfolio
          </h3>
          <p className="text-sm text-gray-500 mb-5">Add LinkedIn posts, GitHub repos, Behance, or any work link.</p>

          <form onSubmit={handleAddLink} className="space-y-2 mb-5">
            <input
              type="text"
              placeholder="Label — e.g. My GitHub, Behance Portfolio, Dribbble"
              value={newLink.label}
              onChange={e => setNewLink({ ...newLink, label: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            <input
              type="url"
              placeholder="https://github.com/yourname"
              value={newLink.url}
              onChange={e => setNewLink({ ...newLink, url: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            <button
              type="submit"
              disabled={!newLink.label.trim() || !newLink.url.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-4 h-4" /> {linkSaving ? 'Saving...' : 'Add Work Link'}
            </button>
          </form>

          <div className="space-y-2">
            {portfolio.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl">
                No work links added yet
              </div>
            ) : (
              portfolio.map((item, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between group">
                  <a href={item.url} target="_blank" rel="noreferrer" className="font-medium text-gray-700 hover:text-indigo-600 flex items-center gap-2 transition-colors flex-1 min-w-0 text-sm">
                    <ExternalLink className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </a>
                  <button onClick={() => handleRemoveLink(idx)} className="ml-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---- SKILLS SECTION ---- */}
      {activeSection === 'skills' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" /> My Skills
          </h3>
          <p className="text-sm text-gray-500 mb-5">Highlight what you're good at to attract recruiters.</p>

          <form onSubmit={handleAddSkill} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              placeholder="React.js, Data Entry, Plumbing, Carpentry..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors">
              Add
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {skills.length === 0 && <p className="text-sm text-gray-400">No skills added yet.</p>}
            {skills.map(skill => (
              <span key={skill} className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                {skill}
                <button onClick={() => removeSkill(skill)} className="text-indigo-300 hover:text-red-500 focus:outline-none transition-colors">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default SeekerProfile;
