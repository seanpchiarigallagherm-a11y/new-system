
import React, { useRef, useEffect, useState } from 'react';

interface NonVerbalTrackerProps {
  isCamOn: boolean;
  isMicOn: boolean;
  isActive: boolean;
}

const NonVerbalTracker: React.FC<NonVerbalTrackerProps> = ({ isCamOn, isMicOn, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cues, setCues] = useState<string[]>([]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: isMicOn 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    if (isCamOn && isActive) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isCamOn, isMicOn, isActive]);

  // Simulated visual cue analysis
  useEffect(() => {
    if (!isActive || !isCamOn) return;
    
    const interval = setInterval(() => {
      const mockCues = [
        "Slight eye gaze shift detected",
        "Micro-expression: Suppressed hesitation",
        "Posture leaning toward stimulus",
        "Pupil dilation consistent with interest",
        "Vocal pitch variance stable",
        "Blink rate normalization"
      ];
      const randomCue = mockCues[Math.floor(Math.random() * mockCues.length)];
      setCues(prev => [randomCue, ...prev.slice(0, 4)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive, isCamOn]);

  return (
    <div className="flex-grow flex flex-col min-h-0">
      <div className="relative flex-grow bg-black rounded-lg overflow-hidden border border-white/10">
        {isCamOn ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-700 mono text-[10px]">LENS_IDLE</div>
          </div>
        )}
        
        {isCamOn && isActive && (
          <div className="absolute top-2 left-2 flex gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-bold text-red-500">ANALYZING</span>
          </div>
        )}
      </div>

      {isCamOn && isActive && (
        <div className="mt-2 space-y-1">
          {cues.map((cue, idx) => (
            <div key={idx} className="text-[10px] text-gray-500 font-medium flex gap-2 items-center">
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              {cue}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NonVerbalTracker;
