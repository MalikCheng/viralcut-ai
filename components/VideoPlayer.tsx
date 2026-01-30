import React, { useState, useEffect, useRef } from 'react';
import { StoryboardSegment, AspectRatio } from '../types';
import { X, Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VideoPlayerProps {
  segments: StoryboardSegment[];
  onClose: () => void;
  aspectRatio: AspectRatio;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ segments, onClose, aspectRatio }) => {
  const { t } = useLanguage();
  // Only play completed segments
  const playlist = segments.filter(s => s.status === 'COMPLETED' && s.videoUri);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 1 for current slide

  const currentSegment = playlist[currentIndex];
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  // Animation Keyframes injection
  const getAnimationStyles = (movement: string) => {
    // Re-using the logic, but ensuring it triggers per slide by using 'key' prop on image
    let animationName = 'zoomIn';
    if (movement === 'Zoom Out') animationName = 'zoomOut';
    if (movement === 'Pan Right') animationName = 'panRight';
    if (movement === 'Pan Left') animationName = 'panLeft';
    if (movement === 'Static') return {};

    return {
        animation: `${animationName} ${currentSegment.duration + 1}s linear forwards`, 
    };
  };

  useEffect(() => {
    if (!isPlaying || !currentSegment) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        return;
    }

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const segDuration = currentSegment.duration;

      if (elapsed >= segDuration) {
        // Next slide
        if (currentIndex < playlist.length - 1) {
          setCurrentIndex(prev => prev + 1);
          startTimeRef.current = Date.now();
          setProgress(0);
        } else {
          // End of playlist
          setIsPlaying(false);
          setProgress(1);
        }
      } else {
        setProgress(elapsed / segDuration);
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, currentIndex, currentSegment, playlist.length]);

  // Reset timer when index changes manually
  useEffect(() => {
    startTimeRef.current = Date.now();
    setProgress(0);
  }, [currentIndex]);

  if (playlist.length === 0) return null;

  // Dynamic sizing based on aspect ratio
  // If 9:16 (vertical), we want a tall narrow player.
  // If 16:9 (horizontal), we want a wide player.
  const containerClass = aspectRatio === '9:16' 
    ? 'max-w-md aspect-[9/16]' 
    : 'max-w-4xl aspect-[16/9]';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-50 p-2 bg-gray-800/50 rounded-full"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Player Container */}
      <div className={`relative w-full ${containerClass} bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10`}>
        
        {/* Screen Content */}
        <div className="absolute inset-0 overflow-hidden">
             {/* Key allows React to unmount/remount img to restart CSS animation */}
            <img 
                key={currentSegment.id}
                src={currentSegment.videoUri} 
                alt="Scene"
                className="w-full h-full object-cover"
                style={getAnimationStyles(currentSegment.camera_movement)}
            />
            
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

            {/* Subtitle Overlay */}
            <div className="absolute bottom-20 left-4 right-4 text-center">
                <span className="inline-block px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg text-white font-bold text-lg shadow-lg border border-white/10 leading-snug">
                    {currentSegment.text}
                </span>
            </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
            {/* Progress Bar for Current Segment */}
            <div className="w-full h-1 bg-gray-700 rounded-full mb-6 overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            <div className="flex items-center justify-center gap-8">
                <button 
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                    <SkipBack className="w-6 h-6" />
                </button>

                <button 
                    onClick={() => {
                        if (!isPlaying && currentIndex === playlist.length - 1 && progress >= 1) {
                            setCurrentIndex(0);
                        }
                        setIsPlaying(!isPlaying);
                    }}
                    className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                    ) : (currentIndex === playlist.length - 1 && progress >= 1) ? (
                        <RotateCcw className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6 fill-current ml-1" />
                    )}
                </button>

                <button 
                    onClick={() => setCurrentIndex(Math.min(playlist.length - 1, currentIndex + 1))}
                    disabled={currentIndex === playlist.length - 1}
                    className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                    <SkipForward className="w-6 h-6" />
                </button>
            </div>
            
            <div className="text-center mt-4 text-xs text-gray-500 font-mono">
                {t('player.scene')} {currentIndex + 1} / {playlist.length} • {currentSegment.camera_movement.toUpperCase()}
            </div>
        </div>

      </div>
    </div>
  );
};