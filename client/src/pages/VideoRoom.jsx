import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ZoomVideo from '@zoom/videosdk';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Phone,
  Send,
  Upload,
  FileText,
  X,
  Pill,
  Plus,
  Trash2,
  Download,
  Clock,
  User
} from 'lucide-react';
import { Button, Card, Avatar, Badge } from '../components/ui';
import { Textarea } from '../components/ui/Input';
import { clsx } from 'clsx';

const VideoRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useRef(ZoomVideo.createClient());
  const [inSession, setInSession] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const videoContainerRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Controls state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDoctorTools, setShowDoctorTools] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Abebe', text: 'Hello! How are you feeling today?', time: '10:01 AM', isDoctor: true },
    { id: 2, sender: 'Patient', text: 'Hi Doctor, I have been having headaches for the past 3 days.', time: '10:02 AM', isDoctor: false },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Doctor tools state
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isDoctor = user.role === 'doctor';

  // Call duration
  const [callDuration, setCallDuration] = useState(0);
  useEffect(() => {
    if (inSession) {
      const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [inSession]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsConnecting(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/zoom/${id}/signature`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const { signature, topic, name } = await res.json();

        await client.current.init('en-US', 'CDN');
        await client.current.join(topic, signature, name, '');
        setInSession(true);
        setIsConnecting(false);

        const stream = client.current.getMediaStream();
        await stream.startAudio();
        await stream.startVideo();

        const canvas = videoContainerRef.current;
        if (canvas) {
          await stream.renderVideo(canvas, client.current.getCurrentUserInfo().userId, 640, 360, 0, 0, 2);
        }
      } catch (error) {
        console.error('Zoom Error:', error);
        setIsConnecting(false);
      }
    };

    init();

    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/consultations/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.notes) setNotes(data.notes);
          if (data.prescription) {
            // Parse prescription if stored
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotes();

    return () => {
      ZoomVideo.destroyClient();
    };
  }, [id]);

  const toggleMute = async () => {
    try {
      const stream = client.current.getMediaStream();
      if (isMuted) {
        await stream.unmuteAudio();
      } else {
        await stream.muteAudio();
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Mute error:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      const stream = client.current.getMediaStream();
      if (isVideoOff) {
        await stream.startVideo();
      } else {
        await stream.stopVideo();
      }
      setIsVideoOff(!isVideoOff);
    } catch (error) {
      console.error('Video toggle error:', error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      const stream = client.current.getMediaStream();
      if (isScreenSharing) {
        await stream.stopShareScreen();
      } else {
        await stream.startShareScreen(document.querySelector('#screen-share-canvas'));
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const leaveSession = async () => {
    try {
      await client.current.leave();
    } catch (error) {
      console.error('Leave error:', error);
    }
    const redirectPath = isDoctor ? '/doctor/appointments' : '/patient/appointments';
    navigate(redirectPath);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      sender: isDoctor ? 'Dr. Abebe' : 'Patient',
      text: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isDoctor
    }]);
    setNewMessage('');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files.map(f => ({ name: f.name, size: f.size }))]);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const saveConsultation = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/consultations/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          notes, 
          prescription: JSON.stringify({ diagnosis, medications })
        })
      });
      alert('Consultation saved!');
    } catch (error) {
      console.error(error);
    }
  };

  const generatePrescription = () => {
    setShowPrescriptionModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Video Area */}
      <div className={clsx(
        'flex-1 flex flex-col transition-all duration-300',
        (showChat || (isDoctor && showDoctorTools)) && 'mr-80'
      )}>
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-semibold">Consultation Room</h1>
            <Badge variant="success" className="animate-pulse">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-gray-300">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-gray-900 p-4">
          {isConnecting ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Connecting to consultation...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Main Video (Remote participant) */}
              <div className="w-full h-full bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                <canvas 
                  ref={remoteVideoRef} 
                  className="max-w-full max-h-full"
                  style={{ backgroundColor: '#1f2937' }}
                />
                {/* Placeholder when no remote video */}
                <div className="text-center">
                  <Avatar name={isDoctor ? 'Patient' : 'Dr. Abebe'} size="2xl" className="mx-auto mb-4" />
                  <p className="text-white text-lg">{isDoctor ? 'Patient' : 'Dr. Abebe Kebede'}</p>
                  <p className="text-gray-400">Waiting for video...</p>
                </div>
              </div>

              {/* Self Video (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
                <canvas 
                  ref={videoContainerRef} 
                  width="192" 
                  height="144"
                  className="w-full h-full object-cover"
                  style={{ backgroundColor: '#374151' }}
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <Avatar name={user.email || 'You'} size="lg" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">You</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls Bar */}
        <div className="bg-gray-800 px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleMute}
              className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              )}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            <button
              onClick={toggleVideo}
              className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              )}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                isScreenSharing ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
              )}
            >
              <Monitor className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                showChat ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
              )}
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </button>

            {isDoctor && (
              <button
                onClick={() => setShowDoctorTools(!showDoctorTools)}
                className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                  showDoctorTools ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
                )}
              >
                <FileText className="w-5 h-5 text-white" />
              </button>
            )}

            <div className="w-px h-8 bg-gray-600 mx-2" />

            <button
              onClick={leaveSession}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            >
              <Phone className="w-5 h-5 text-white rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel - Chat */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white flex flex-col shadow-xl">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Chat</h2>
            <button onClick={() => setShowChat(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={clsx('flex', msg.isDoctor ? 'justify-start' : 'justify-end')}>
                <div className={clsx(
                  'max-w-[80%] rounded-lg px-3 py-2',
                  msg.isDoctor ? 'bg-gray-100' : 'bg-primary-500 text-white'
                )}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={clsx('text-xs mt-1', msg.isDoctor ? 'text-gray-400' : 'text-primary-100')}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* File Upload */}
          {uploadedFiles.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Shared files:</p>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="w-4 h-4" />
                  {file.name}
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <label className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                <Upload className="w-5 h-5 text-gray-500" />
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.png" />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Panel - Doctor Tools */}
      {isDoctor && showDoctorTools && !showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white flex flex-col shadow-xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Doctor Tools</h2>
            <button onClick={() => setShowDoctorTools(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Consultation Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter clinical notes..."
                className="w-full h-32 px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Medications</label>
                <button
                  onClick={addMedication}
                  className="text-primary-500 text-sm flex items-center gap-1 hover:text-primary-600"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {medications.map((med, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Medication {idx + 1}</span>
                      {medications.length > 1 && (
                        <button onClick={() => removeMedication(idx)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                      placeholder="Medication name"
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                        placeholder="Dosage"
                        className="px-2 py-1 border rounded text-xs"
                      />
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                        placeholder="Frequency"
                        className="px-2 py-1 border rounded text-xs"
                      />
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                        placeholder="Duration"
                        className="px-2 py-1 border rounded text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t space-y-2">
            <Button className="w-full" icon={Pill} onClick={generatePrescription}>
              Generate Prescription
            </Button>
            <Button variant="success" className="w-full" onClick={saveConsultation}>
              Save & Complete
            </Button>
          </div>
        </div>
      )}

      {/* Prescription Preview Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Prescription Preview</h2>
              <button onClick={() => setShowPrescriptionModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <h3 className="font-semibold text-primary-900">TilexCare Prescription</h3>
                <p className="text-sm text-primary-700">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Diagnosis</p>
                <p className="font-medium">{diagnosis || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Medications</p>
                {medications.filter(m => m.name).map((med, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg mb-2">
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-600">
                      {med.dosage} - {med.frequency} - {med.duration}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-700">{notes || 'No additional notes'}</p>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPrescriptionModal(false)}>
                Edit
              </Button>
              <Button className="flex-1" icon={Download}>
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for screen share */}
      <canvas id="screen-share-canvas" className="hidden" />
    </div>
  );
};

export default VideoRoom;
