import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const API = 'http://localhost:5000';

function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Real-time tracking state
  const [userStatuses, setUserStatuses] = useState({});
  const [typingState, setTypingState] = useState({});
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const activeConvRef = useRef(null);
  const location = useLocation();

  const token = localStorage.getItem('hirezy_token');

  // Keep ref up to date to avoid stale closures inside socket events
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('hirezy_user'));
    setCurrentUser(user);
    if (!token) return;

    fetchConversations();

    // Connect to Socket.io
    socketRef.current = io(API);
    if (user && user.id) {
      socketRef.current.emit('register', user.id);
    }

    // Listen for new messages globally
    socketRef.current.on('newMessage', (message) => {
       // If the incoming message belongs to the current open chat
       if (activeConvRef.current && activeConvRef.current._id === message.conversationId) {
          setMessages(prev => {
             // Prevent duplicates if we already optimistically added it
             if (prev.find(m => m._id === message._id)) return prev;
             return [...prev, message];
          });
          scrollToBottom();
       }

       // Always update the sidebar conversation preview
       setConversations(prev => {
         const convExists = prev.find(c => c._id === message.conversationId);
         if (!convExists) return prev; // Optionally refetch conversations here
         return prev.map(c => 
           c._id === message.conversationId 
             ? { ...c, lastMessage: message.content, updatedAt: message.createdAt || new Date().toISOString() } 
             : c
         ).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
       });
    });

    socketRef.current.on('userStatus', ({ userId, isOnline, lastSeen }) => {
      setUserStatuses(prev => ({ ...prev, [userId]: { isOnline, lastSeen } }));
    });

    socketRef.current.on('typing', ({ conversationId, userId }) => {
      setTypingState(prev => ({ ...prev, [conversationId]: userId }));
    });

    socketRef.current.on('stopTyping', ({ conversationId, userId }) => {
      setTypingState(prev => {
        if (prev[conversationId] === userId) {
          const newState = { ...prev };
          delete newState[conversationId];
          return newState;
        }
        return prev;
      });
    });

    return () => {
       if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Handle incoming state (like starting a chat from a profile)
  useEffect(() => {
    if (location.state?.conversation && currentUser) {
      handleSelectConv(location.state.conversation);
    }
  }, [location.state, currentUser]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data);
      
      // Initialize statuses
      const statuses = {};
      data.forEach(conv => {
        conv.participants.forEach(p => {
          statuses[p._id] = { isOnline: p.isOnline, lastSeen: p.lastSeen };
        });
      });
      setUserStatuses(statuses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`${API}/api/messages/${convId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    fetchMessages(conv._id);
    
    // Join the specific room via socket
    if (socketRef.current) {
      socketRef.current.emit('joinChat', conv._id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    try {
      const res = await fetch(`${API}/api/messages/${activeConv._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });
      const data = await res.json();
      if (res.ok) {
        // Stop typing indicator on message send
        if (socketRef.current) {
           socketRef.current.emit('stopTyping', { conversationId: activeConv._id, userId: currentUser.id });
           if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
           typingTimeoutRef.current = null;
        }

        setMessages(prev => [...prev, data]);
        setNewMessage('');
        scrollToBottom();
        
        // Update conversation preview locally
        setConversations(prev => prev.map(c => 
          c._id === activeConv._id 
            ? { ...c, lastMessage: data.content, updatedAt: new Date().toISOString() } 
            : c
        ).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getOtherParticipant = (conv) => {
    if (!currentUser) return null;
    return conv.participants.find(p => p._id !== currentUser.id) || conv.participants[0];
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (activeConvRef.current && currentUser && socketRef.current) {
      if (!typingTimeoutRef.current) {
         socketRef.current.emit('typing', { conversationId: activeConvRef.current._id, userId: currentUser.id });
      } else {
         clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
         socketRef.current.emit('stopTyping', { conversationId: activeConvRef.current._id, userId: currentUser.id });
         typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Offline';
    const s = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="text-center mt-10 text-gray-400 font-medium">Loading messages...</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 flex h-[80vh] overflow-hidden">
      
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No conversations yet.
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv);
              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-white transition-colors flex items-start gap-3 ${activeConv?._id === conv._id ? 'bg-white border-l-4 border-l-indigo-500' : ''}`}
                >
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(other.name)}&background=4f46e5&color=fff`} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-gray-900 truncate">{other.name}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {conv.jobTitle && (
                      <p className="text-xs font-semibold text-indigo-600 truncate mb-0.5">{conv.jobTitle}</p>
                    )}
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'Click to chat'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel: Active Chat */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
              <div className="relative">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherParticipant(activeConv).name)}&background=4f46e5&color=fff`} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-full"
                />
                {userStatuses[getOtherParticipant(activeConv)._id]?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{getOtherParticipant(activeConv).name}</h3>
                <p className="text-xs text-gray-500 capitalize">
                  {typingState[activeConv._id] === getOtherParticipant(activeConv)._id ? (
                    <span className="text-indigo-600 font-bold italic">Typing...</span>
                  ) : userStatuses[getOtherParticipant(activeConv)._id]?.isOnline ? (
                    <span className="text-green-600 font-medium tracking-wide">● Online</span>
                  ) : (
                    `Last seen: ${formatLastSeen(userStatuses[getOtherParticipant(activeConv)._id]?.lastSeen)}`
                  )}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
              {messagesLoading ? (
                <div className="text-center text-sm text-gray-400">Loading chat...</div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageSquare className="w-12 h-12 mb-2 text-gray-300" />
                  <p>Send a message to start chatting</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-200" />
            <p className="font-medium text-lg text-gray-600">Your Messages</p>
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default MessagesPage;
