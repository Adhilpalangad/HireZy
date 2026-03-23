import React, { useState } from 'react';
import { MessageSquare, AlertCircle, Clock, CheckCircle2, Send, Search } from 'lucide-react';

function CustomerSupport() {
  const [tickets, setTickets] = useState([
    { id: 'TKT-892', subject: 'Unable to upload resume', user: 'johndoe@email.com', status: 'Open', priority: 'High', date: '2 hours ago' },
    { id: 'TKT-891', subject: 'Billing inquiry for premium posting', user: 'finance@techco.com', status: 'In Progress', priority: 'Medium', date: '5 hours ago' },
    { id: 'TKT-890', subject: 'Account deletion request', user: 'sarah@email.com', status: 'Closed', priority: 'Low', date: 'Yesterday' }
  ]);

  const [activeTicket, setActiveTicket] = useState(tickets[0]);
  const [reply, setReply] = useState('');

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'text-red-600 bg-red-50 border-red-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'High': return <AlertCircle className="w-4 h-4 text-red-500 mr-1" />;
      case 'Medium': return <Clock className="w-4 h-4 text-yellow-500 mr-1" />;
      case 'Low': return <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />;
      default: return null;
    }
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;
    // Simulate sending email/reply
    setReply('');
    setTickets(tickets.map(t => t.id === activeTicket.id ? { ...t, status: 'Closed' } : t));
    setActiveTicket({ ...activeTicket, status: 'Closed' });
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
          <p className="text-sm text-gray-500 mt-1">Review user issues, feature requests, and inquiries.</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm flex overflow-hidden">
        {/* Ticket List (Left Panel) */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Search tickets..."
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => setActiveTicket(ticket)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                  activeTicket.id === ticket.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900 text-sm truncate pr-2">{ticket.subject}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{ticket.user}</div>
                <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2">
                  <span className={`px-2 py-0.5 rounded-md border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className="flex items-center text-gray-500 font-medium">
                    {getPriorityIcon(ticket.priority)} {ticket.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail (Right Panel) */}
        <div className="w-2/3 flex flex-col">
          {activeTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(activeTicket.status)}`}>
                    {activeTicket.status}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> {activeTicket.id}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{activeTicket.subject}</h2>
                <p className="text-sm text-gray-500">From: <span className="text-gray-900 font-medium">{activeTicket.user}</span></p>
              </div>

              {/* Message History Mockup */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-6">
                {/* User Message */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold">
                    {activeTicket.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm max-w-[80%]">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Hello, I am trying to upload my resume in PDF format but the system keeps throwing an error saying "Internal Server Error". Can you please help me fix this? I need to apply for a job before tomorrow.
                    </p>
                    <span className="text-xs text-gray-400 mt-2 block">{activeTicket.date}</span>
                  </div>
                </div>

                {/* Agent Reply Mockup (if closed) */}
                {activeTicket.status === 'Closed' && (
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-700 font-bold">
                      A
                    </div>
                    <div className="bg-primary-600 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] text-white">
                      <p className="text-sm leading-relaxed">
                        Hi there, we have resolved this issue on our backend. Please refresh the page and try uploading your resume again. Let us know if the issue persists!
                      </p>
                      <span className="text-xs text-primary-200 mt-2 block">Just now</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative">
                  <textarea
                    rows="3"
                    className="w-full border border-gray-200 rounded-xl p-3 pr-16 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-sm resize-none"
                    placeholder="Type your reply here..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    disabled={activeTicket.status === 'Closed'}
                  ></textarea>
                  <button 
                    onClick={handleSendReply}
                    disabled={!reply.trim() || activeTicket.status === 'Closed'}
                    className={`absolute bottom-3 right-3 p-2 rounded-lg flex items-center justify-center transition-colors ${
                      reply.trim() && activeTicket.status !== 'Closed' ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p>Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerSupport;
