import React, { useState, useRef, useCallback } from 'react';
import { Camera, RefreshCw, History, Sparkles, Info, Send, Download, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { HISTORICAL_SCENES, HistoricalScene } from './constants';
import { generateTimeTravelImage, analyzeHistoricalScene, editImageWithPrompt } from './services/geminiService';

export default function App() {
  const [step, setStep] = useState<'capture' | 'select' | 'processing' | 'result'>('capture');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<HistoricalScene | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera access.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(`Could not access camera: ${err.message || "Please ensure permissions are granted and you are using a secure connection (HTTPS)."}`);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Downscale image to max 1024px to avoid payload issues
        const MAX_DIM = 1024;
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG with compression
        setUserImage(dataUrl);
        setStep('select');
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleTimeTravel = async () => {
    if (!userImage || !selectedScene) return;
    setStep('processing');
    setError(null);
    try {
      const result = await generateTimeTravelImage(userImage, selectedScene.prompt);
      setResultImage(result);
      setStep('result');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F27D26', '#FFFFFF', '#000000']
      });
    } catch (err: any) {
      console.error("Time travel error:", err);
      setError(`Time travel failed: ${err.message || "The temporal connection is unstable."}`);
      setStep('select');
    }
  };

  const handleAnalyze = async () => {
    if (!resultImage) return;
    setIsAnalyzing(true);
    try {
      const text = await analyzeHistoricalScene(resultImage);
      setAnalysis(text);
    } catch (err) {
      setError("Could not analyze the scene.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEdit = async () => {
    if (!resultImage || !editPrompt) return;
    setIsEditing(true);
    try {
      const result = await editImageWithPrompt(resultImage, editPrompt);
      setResultImage(result);
      setEditPrompt('');
    } catch (err) {
      setError("Temporal adjustment failed.");
    } finally {
      setIsEditing(false);
    }
  };

  const reset = () => {
    setUserImage(null);
    setSelectedScene(null);
    setResultImage(null);
    setAnalysis(null);
    setError(null);
    setStep('capture');
    startCamera();
  };

  React.useEffect(() => {
    if (step === 'capture') {
      startCamera();
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F27D26] selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <History className="w-8 h-8 text-[#F27D26]" />
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Chronos Booth</h1>
        </div>
        {step !== 'capture' && (
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium uppercase tracking-widest"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Timeline
          </button>
        )}
      </header>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'capture' && (
            <motion.div 
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[70vh] gap-8"
            >
              <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-900">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover mirror"
                />
                <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Live Feed</span>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Prepare for Departure</h2>
                <p className="text-zinc-400 max-w-md mx-auto">Strike a pose. Your likeness will be projected across the annals of history.</p>
              </div>

              <button 
                onClick={capturePhoto}
                className="group relative w-24 h-24 rounded-full bg-[#F27D26] flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-[0_0_30px_rgba(242,125,38,0.4)]"
              >
                <Camera className="w-10 h-10 text-black" />
                <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping group-hover:animate-none" />
              </button>
            </motion.div>
          )}

          {step === 'select' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-2">
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">Choose Your Destination</h2>
                <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs font-bold">Temporal Coordinates Required</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {HISTORICAL_SCENES.map((scene) => (
                  <motion.button
                    key={scene.id}
                    whileHover={{ y: -10 }}
                    onClick={() => setSelectedScene(scene)}
                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all group text-left ${
                      selectedScene?.id === scene.id ? 'border-[#F27D26] ring-4 ring-[#F27D26]/20' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img 
                      src={scene.thumbnail} 
                      alt={scene.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 space-y-1">
                      <h3 className="text-2xl font-bold uppercase italic tracking-tight">{scene.name}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2">{scene.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <button
                  disabled={!selectedScene}
                  onClick={handleTimeTravel}
                  className="group flex items-center gap-4 px-12 py-6 bg-white text-black rounded-full font-black uppercase italic tracking-tighter text-2xl hover:bg-[#F27D26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Initiate Jump
                  <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-12 text-center"
            >
              <div className="relative w-48 h-48">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-r-4 border-[#F27D26] rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border-b-4 border-l-4 border-white/20 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <History className="w-12 h-12 text-[#F27D26] animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic animate-pulse">Rifting Through Time...</h2>
                <div className="flex flex-col gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                  <p>Synchronizing facial geometry...</p>
                  <p>Calibrating temporal flux...</p>
                  <p>Materializing in {selectedScene?.name}...</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && resultImage && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              <div className="lg:col-span-7 space-y-6">
                <div className="relative group rounded-3xl overflow-hidden border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  <img 
                    src={resultImage} 
                    alt="Time Travel Result" 
                    className="w-full aspect-square object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/20">
                    <Sparkles className="w-4 h-4 text-[#F27D26]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Chronos Render v2.5</span>
                  </div>
                  <div className="absolute bottom-6 right-6 flex gap-2">
                    <a 
                      href={resultImage} 
                      download="time-travel.png"
                      className="p-3 bg-white text-black rounded-full hover:bg-[#F27D26] transition-colors shadow-xl"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-[#F27D26]">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Temporal Adjustments</h3>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., 'Make it rain', 'Add a vintage filter'..."
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                    />
                    <button 
                      onClick={handleEdit}
                      disabled={isEditing || !editPrompt}
                      className="px-6 py-3 bg-[#F27D26] text-black rounded-xl font-bold uppercase text-xs hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isEditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Welcome to {selectedScene?.name}</h2>
                  <p className="text-zinc-400 leading-relaxed">{selectedScene?.description}</p>
                </div>

                <div className="space-y-4">
                  {!analysis ? (
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl border-2 border-white/10 hover:bg-white/5 transition-all group"
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-[#F27D26]" />
                      ) : (
                        <>
                          <Info className="w-6 h-6 group-hover:text-[#F27D26] transition-colors" />
                          <span className="font-bold uppercase tracking-widest text-sm">Analyze Historical Context</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#F27D26]">
                          <Info className="w-5 h-5" />
                          <h3 className="font-bold uppercase tracking-widest text-xs">Historical Briefing</h3>
                        </div>
                        <button onClick={() => setAnalysis(null)} className="text-zinc-500 hover:text-white">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-400 prose-headings:text-white prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter">
                        <Markdown>{analysis}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="pt-8 border-t border-white/10">
                  <button 
                    onClick={reset}
                    className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all font-bold uppercase tracking-[0.2em] text-[10px]"
                  >
                    Return to Present Day
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/20 backdrop-blur-xl border border-red-500/50 rounded-full text-red-200 text-sm font-medium z-50 flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
            <button onClick={() => setError(null)} className="ml-2 hover:text-white">×</button>
          </motion.div>
        )}
      </main>

      {/* Hidden Canvas for Capturing */}
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
        .prose p {
          margin-bottom: 1rem;
        }
        .prose h1, .prose h2, .prose h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
