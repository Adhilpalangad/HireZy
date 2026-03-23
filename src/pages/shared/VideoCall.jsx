// src/pages/shared/VideoCall.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from 'lucide-react';
import { io } from 'socket.io-client';

const API = 'http://localhost:5000';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState('Waiting for someone to join...');
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socket = useRef();
  const iceQueue = useRef([]);

  useEffect(() => {
    let isMounted = true;
    socket.current = io(API);
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        if (!isMounted) return;
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        socket.current.emit('join-video-room', roomId);

        socket.current.on('user-connected', (userId) => {
          console.log('Peer connected to room:', userId);
          setStatus('Connecting to peer...');
          callUser(userId, currentStream);
        });

        socket.current.on('video-offer', async (data) => {
          console.log('Received video offer');
          setStatus('Peer connected. Handshaking...');
          await answerCall(data, currentStream);
        });

        socket.current.on('video-answer', async (data) => {
          console.log('Received video answer');
          setStatus('Call established.');
          if (connectionRef.current) {
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            iceQueue.current.forEach(async (c) => {
              try { await connectionRef.current.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
            });
            iceQueue.current = [];
          }
        });

        socket.current.on('ice-candidate', async (data) => {
          if (connectionRef.current && connectionRef.current.remoteDescription) {
            try {
              await connectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) { console.error('Error adding ICE candidate', e); }
          } else {
            iceQueue.current.push(data.candidate);
          }
        });

        socket.current.on('user-disconnected', () => {
          console.log('Peer disconnected');
          setStatus('Peer disconnected.');
          if (userVideo.current) userVideo.current.srcObject = null;
          setRemoteStream(null);
        });
      })
      .catch(err => {
        console.error(err);
        setStatus('Failed to access camera/mic: ' + err.message);
      });

    return () => {
      isMounted = false;
      socket.current.emit('leave-video-room', roomId);
      socket.current.disconnect();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) {
        connectionRef.current.close();
      }
    };
  }, [roomId]); // eslint-disable-line

  const createPeer = (streamToSend, recipientId) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    streamToSend.getTracks().forEach(track => peer.addTrack(track, streamToSend));

    peer.ontrack = (event) => {
      console.log('Received remote track', event.streams[0]);
      setRemoteStream(event.streams[0]);
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit('ice-candidate', { candidate: event.candidate, to: recipientId });
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', peer.iceConnectionState);
      if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed') {
         setStatus('Connection lost. Please refresh.');
      }
    };

    return peer;
  };

  const callUser = async (userToCall, currentStream) => {
    const peer = createPeer(currentStream, userToCall);
    connectionRef.current = peer;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    
    socket.current.emit('video-offer', { offer, to: userToCall });
  };

  const answerCall = async (data, currentStream) => {
    const peer = createPeer(currentStream, data.from);
    connectionRef.current = peer;

    await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.current.emit('video-answer', { answer, to: data.from });

    // Process queued candidates
    iceQueue.current.forEach(async (c) => {
      try { await peer.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
    });
    iceQueue.current = [];
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveCall = () => {
    navigate(-1); // Go back
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto space-y-4">
        <div className="flex justify-between items-center text-white mb-4">
          <h1 className="text-2xl font-bold">1-on-1 Interview Call</h1>
          <span className="bg-gray-800 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-700">
            {status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] md:h-[70vh]">
          {/* Local Video */}
          <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm font-semibold">
              You
            </div>
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-gray-500" />
                </div>
              </div>
            )}
          </div>

          {/* Remote Video */}
          <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex items-center justify-center">
            {remoteStream ? (
              <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Waiting for peer connection...</p>
              </div>
            )}
            {remoteStream && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm font-semibold">
                Participant
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full shadow-lg transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full shadow-lg transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          <button 
            onClick={leaveCall}
            className="p-4 rounded-full shadow-lg transition-all bg-red-600 hover:bg-red-700 text-white px-8 flex items-center gap-2 font-bold"
          >
            <PhoneOff className="w-6 h-6" /> Leave
          </button>
        </div>
      </div>
    </div>
  );
};
export default VideoCall;
