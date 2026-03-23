import React, { useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Maximize, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function RecruiterVideoCall() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <div className="h-full min-h-[500px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row border border-gray-800">
      
      {/* Main Video Area */}
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center">
        
        {/* Mock remote video */}
        {videoOn ? (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gray-800 flex items-center justify-center relative overflow-hidden">
               <div className="w-full h-full opacity-60 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2776&auto=format&fit=crop')] bg-cover bg-center"></div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center text-white">
             <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold mb-4">AS</div>
             <p className="font-semibold">Alice Smith (Camera Off)</p>
          </div>
        )}

        {/* Call Info Header */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
            <span className="text-white font-medium text-sm">11:42</span>
            <span className="mx-2 text-white/30">|</span>
            <span className="text-white font-medium text-sm flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-green-400" /> End-to-End Encrypted</span>
          </div>
          <button className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>

        {/* Self Video PIP */}
        <div className="absolute bottom-28 right-6 w-48 aspect-video bg-gray-800 rounded-xl border-2 border-blue-500 overflow-hidden shadow-xl z-10 hidden sm:block">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop')] bg-cover bg-center"></div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 z-10 shadow-lg">
          <button 
            onClick={() => setMicOn(!micOn)} 
            className={`p-4 rounded-2xl flex items-center justify-center transition-all ${micOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => setVideoOn(!videoOn)} 
            className={`p-4 rounded-2xl flex items-center justify-center transition-all ${videoOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            {videoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button 
            className="p-4 rounded-2xl flex items-center justify-center transition-all bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/50 px-8"
            onClick={() => navigate('/recruiter/explore')}
          >
            <PhoneOff className="w-6 h-6 mr-2" /> End Call
          </button>
        </div>
      </div>

      {/* Side Panel (Notes / Verification) */}
      <div className="w-full md:w-80 bg-gray-900 border-l border-gray-800 flex flex-col p-6 text-white h-[40vh] md:h-auto overflow-y-auto hidden lg:flex">
        <h3 className="font-bold text-lg mb-6 flex items-center pb-4 border-b border-gray-800">
          <ShieldCheck className="w-5 h-5 mr-2 text-blue-500" /> Verification Panel
        </h3>

        <div className="space-y-6 flex-1">
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Interviewee</h4>
            <p className="font-bold text-lg">Alice Smith</p>
            <p className="text-sm text-gray-400">UI/UX Designer</p>
          </div>

          <div className="bg-blue-900/30 rounded-2xl p-4 border border-blue-500/30">
            <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> Checklist</h4>
            <ul className="space-y-3 text-sm text-blue-100 font-medium">
              <li className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-blue-500 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" /> Confirm Identity
              </li>
              <li className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-blue-500 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" /> Discuss Portfolio
              </li>
              <li className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-blue-500 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" /> Skill Assessment
              </li>
            </ul>
          </div>
        </div>

        <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center">
          <ShieldCheck className="w-5 h-5 mr-2" /> Verify Professional
        </button>
      </div>

    </div>
  );
}

export default RecruiterVideoCall;
