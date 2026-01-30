import React, { useState, useRef, useEffect } from 'react';
import { SrtUploader } from '../components/SrtUploader';
import { StyleSelector } from '../components/StyleSelector';
import { StoryboardViewer } from '../components/StoryboardViewer';
import { ApiKeySelector } from '../components/ApiKeySelector';
import { UserMenu } from '../components/UserMenu';
import { SeoContent } from '../components/SeoContent';
import { VIDEO_STYLES, VideoStyle, StoryboardSegment, VideoStatus, AspectRatio, QUOTA_LIMITS } from '../types';
import { generateStoryboardFromSrt, generateImageForSegment, refineVisualPrompt, analyzeReferenceImages } from '../services/geminiService';
import { parseSrt } from '../utils/srtParser';
import { Clapperboard, Sparkles, AlertCircle, StopCircle, ScanEye, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { needsConfig } = useAuth(); // Keeping hook for auth state, though needsConfig should be false now
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Style, 3: Production
  const [srtText, setSrtText] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>(VIDEO_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  
  // Project-wide seed for consistent style generation
  const [projectSeed, setProjectSeed] = useState<number>(Math.floor(Math.random() * 1000000));

  // Changed to Array for multi-image support
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  // Store the analysis of what the images actually are
  const [referenceImageDescriptions, setReferenceImageDescriptions] = useState<string[]>([]);
  
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>(''); // 'images' | 'script'
  const [storyboard, setStoryboard] = useState<StoryboardSegment[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isKeySelectorOpen, setIsKeySelectorOpen] = useState(false);
  
  // Quota Management
  const [dailyUsage, setDailyUsage] = useState<number>(0);

  // Abort Controller Ref for cancelling generation
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  // Initialize Quota from LocalStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const stored = localStorage.getItem('viralcut_quota');
    if (stored) {
        const { date, count } = JSON.parse(stored);
        if (date === today) {
            setDailyUsage(count);
        } else {
            // Reset for new day
            setDailyUsage(0);
            localStorage.setItem('viralcut_quota', JSON.stringify({ date: today, count: 0 }));
        }
    } else {
        localStorage.setItem('viralcut_quota', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  const incrementUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const newCount = dailyUsage + 1;
    setDailyUsage(newCount);
    localStorage.setItem('viralcut_quota', JSON.stringify({ date: today, count: newCount }));
  };

  const handleFileLoaded = (content: string) => {
    setGlobalError(null);
    setSrtText(content);
    // Reset seed for new file
    setProjectSeed(Math.floor(Math.random() * 1000000));
    
    // Basic format check
    if (!content.includes('-->')) {
        setGlobalError(t('config.invalid_srt'));
        return;
    }

    // Quota Check: Duration
    const parsed = parseSrt(content);
    if (parsed.length > 0) {
        const duration = parsed[parsed.length - 1].endSeconds;
        if (duration > QUOTA_LIMITS.MAX_SCRIPT_DURATION) {
            setGlobalError(t('error.script_too_long'));
            return;
        }
    } else {
        setGlobalError(t('config.invalid_srt'));
        return;
    }

    setStep(2);
  };

  const handleCreateStoryboard = async () => {
    setIsAnalysing(true);
    setGlobalError(null);
    try {
      // 1. Analyze Images first (if any)
      let descriptions: string[] = [];
      if (referenceImages.length > 0) {
          setAnalysisPhase('images');
          // Only analyze if we haven't already (or if images changed, but simplistic check here)
          descriptions = await analyzeReferenceImages(referenceImages);
          setReferenceImageDescriptions(descriptions);
      }

      // 2. Generate Storyboard
      setAnalysisPhase('script');
      const parsedSrt = parseSrt(srtText);
      // Pass the descriptions, not just the count
      const segments = await generateStoryboardFromSrt(parsedSrt, selectedStyle, descriptions);
      
      // Post-process: Append style modifier manually here if not done in service
      // In the new service logic, we want the LLM to generate the full prompt, BUT 
      // adding the modifier ensures the specific art style tokens are always present.
      const styledSegments = segments.map(s => ({
          ...s,
          visual_prompt: `${s.visual_prompt}. ${selectedStyle.promptModifier}`
      }));

      setStoryboard(styledSegments);
      setStep(3);
    } catch (err: any) {
      setGlobalError(err.message || "Failed to analyze script. Please try again.");
    } finally {
      setIsAnalysing(false);
      setAnalysisPhase('');
    }
  };

  const handleStyleChangeFromViewer = async (newStyle: VideoStyle) => {
    if (isAnalysing) return;
    setSelectedStyle(newStyle);
    setIsAnalysing(true);
    setGlobalError(null);
    
    await delay(100);
    try {
        const parsedSrt = parseSrt(srtText);
        // Regenerate storyboard with new style logic, reusing existing descriptions
        const segments = await generateStoryboardFromSrt(parsedSrt, newStyle, referenceImageDescriptions);
        
        const styledSegments = segments.map(s => ({
          ...s,
          visual_prompt: `${s.visual_prompt}. ${newStyle.promptModifier}`
        }));

        setStoryboard(styledSegments);
    } catch (err: any) {
        setGlobalError(err.message || "Failed to regenerate storyboard.");
    } finally {
        setIsAnalysing(false);
    }
  };

  const handleUpdatePrompt = (id: string, newPrompt: string) => {
    setStoryboard(prev => prev.map(seg => {
        if (seg.id === id) {
            return { ...seg, visual_prompt: newPrompt };
        }
        return seg;
    }));
  };

  const handleRefinePrompt = async (id: string) => {
      const segment = storyboard.find(s => s.id === id);
      if (!segment) return;
      try {
          const refined = await refineVisualPrompt(segment.visual_prompt, selectedStyle);
          handleUpdatePrompt(id, refined);
      } catch (err) {
          console.error("Failed to refine prompt", err);
      }
  };

  const handleRegenerateSingle = async (id: string) => {
      if (dailyUsage >= QUOTA_LIMITS.MAX_DAILY_IMAGES) {
          setGlobalError(t('error.quota_exceeded'));
          return;
      }

      const segment = storyboard.find(s => s.id === id);
      if (!segment) return;
      updateSegmentStatus(id, VideoStatus.GENERATING);
      try {
          // Pass all reference images; the service picks the right one based on segment.reference_image_index
          // Pass the project seed
          const imageUri = await generateImageForSegment(segment, aspectRatio, referenceImages, undefined, projectSeed);
          updateSegmentStatus(id, VideoStatus.COMPLETED, imageUri);
          incrementUsage();
      } catch (error: any) {
          console.error(error);
          updateSegmentStatus(id, VideoStatus.FAILED, undefined, error.message || "Generation failed");
      }
  };

  const handleStopGeneration = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
          setIsBatchGenerating(false);
      }
  };

  const handleGenerateAll = async () => {
    if (dailyUsage >= QUOTA_LIMITS.MAX_DAILY_IMAGES) {
        setGlobalError(t('error.quota_exceeded'));
        return;
    }

    // 1. Setup AbortController
    if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Cancel previous if exists
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setIsBatchGenerating(true);
    setGlobalError(null);

    const segmentsToProcess = storyboard.filter(s => 
        s.status !== VideoStatus.COMPLETED && 
        s.status !== VideoStatus.GENERATING
    );

    if (segmentsToProcess.length === 0) {
        setIsBatchGenerating(false);
        return;
    }

    // Dynamic concurrency: lower it if we suspect issues
    const CONCURRENCY_LIMIT = 3; 
    const executing = new Set<Promise<void>>();

    // Create a local usage counter to stop loop early if quota hit during batch
    let currentSessionUsage = dailyUsage;

    try {
        for (const segment of segmentsToProcess) {
            if (signal.aborted) break;
            
            if (currentSessionUsage >= QUOTA_LIMITS.MAX_DAILY_IMAGES) {
                setGlobalError(t('error.quota_exceeded'));
                break;
            }

            const task = (async () => {
                if (signal.aborted) return;
                updateSegmentStatus(segment.id, VideoStatus.GENERATING);

                try {
                    // Pass signal to service and the PROJECT SEED
                    const imageUri = await generateImageForSegment(segment, aspectRatio, referenceImages, signal, projectSeed);
                    if (!signal.aborted) {
                        updateSegmentStatus(segment.id, VideoStatus.COMPLETED, imageUri);
                        incrementUsage();
                        currentSessionUsage++;
                    }
                } catch (error: any) {
                    if (error.message !== "Cancelled" && !signal.aborted) {
                        console.error(`Error generating segment ${segment.id}:`, error);
                        // If 429, we might want to pause everything, but simpler to just fail this one
                        updateSegmentStatus(segment.id, VideoStatus.FAILED, undefined, error.message || "Generation failed");
                    } else {
                        // Reset to IDLE if cancelled so user can try again
                        updateSegmentStatus(segment.id, VideoStatus.IDLE);
                    }
                }
            })();

            const p = task.then(() => {
                executing.delete(p);
            });
            
            executing.add(p);

            if (executing.size >= CONCURRENCY_LIMIT) {
                await Promise.race(executing);
            }
        }
        await Promise.all(executing);
    } catch (e) {
        console.log("Batch generation interrupted");
    } finally {
        setIsBatchGenerating(false);
        abortControllerRef.current = null;
    }
  };

  const updateSegmentStatus = (id: string, status: VideoStatus, uri?: string, error?: string) => {
    setStoryboard(prev => prev.map(seg => {
        if (seg.id === id) {
            return { ...seg, status, videoUri: uri, error };
        }
        return seg;
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {isKeySelectorOpen && (
          <ApiKeySelector 
            onKeySelected={() => {
                setIsKeySelectorOpen(false);
                setGlobalError(null);
            }}
            onCancel={() => setIsKeySelectorOpen(false)}
          />
      )}

      <header className="border-b border-gray-800 bg-black/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">{t('app.title')}<span className="text-indigo-400">AI</span></span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
             
             {/* Quota removed from display for unlimited mode */}

             {/* Language Dropdown */}
             <div className="relative group">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-200 transition-all border border-gray-700 hover:border-gray-600 cursor-pointer">
                    <Languages className="w-4 h-4" />
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="bg-transparent border-none outline-none text-xs font-medium appearance-none cursor-pointer"
                        style={{ textAlignLast: 'center' }}
                    >
                        <option value="en" className="bg-gray-800 text-gray-200">English</option>
                        <option value="zh" className="bg-gray-800 text-gray-200">中文</option>
                        <option value="es" className="bg-gray-800 text-gray-200">Español</option>
                        <option value="fr" className="bg-gray-800 text-gray-200">Français</option>
                        <option value="de" className="bg-gray-800 text-gray-200">Deutsch</option>
                        <option value="ja" className="bg-gray-800 text-gray-200">日本語</option>
                        <option value="ko" className="bg-gray-800 text-gray-200">한국어</option>
                    </select>
                </div>
             </div>

             <div className="h-4 w-px bg-gray-700 hidden md:block"></div>
             
             {/* User Login Menu */}
             <div>
                <UserMenu />
             </div>

          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {globalError && (
            <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-red-900/10">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {globalError}
            </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
            <>
                <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                            <span className="block text-2xl md:text-3xl font-medium text-indigo-400 mb-2">{t('upload.h1_prefix')}</span>
                            {t('upload.main_title')} <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t('upload.highlight_title')}</span>
                        </h1>
                        <p className="text-lg text-gray-400">
                            {t('upload.description')}
                        </p>
                    </div>
                    <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 shadow-2xl">
                        <SrtUploader onFileLoaded={handleFileLoaded} />
                    </div>
                </div>
                
                {/* SEO Content: Rich Text & Features - Only visible on Landing Page */}
                <SeoContent />
            </>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{t('config.title')}</h2>
                    <button 
                        onClick={() => setStep(1)}
                        className="text-sm text-gray-500 hover:text-gray-300"
                    >
                        {t('config.back')}
                    </button>
                </div>

                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">{t('config.script_preview')}</h3>
                    <div className="bg-black/40 p-4 rounded-lg text-gray-300 font-mono text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {srtText.slice(0, 500)}...
                    </div>
                </div>

                <StyleSelector 
                    selectedStyle={selectedStyle} 
                    onSelectStyle={setSelectedStyle}
                    selectedRatio={aspectRatio}
                    onSelectRatio={setAspectRatio}
                    referenceImages={referenceImages}
                    onSetReferenceImages={setReferenceImages}
                />

                <div className="flex justify-end pt-8">
                    <button
                        onClick={handleCreateStoryboard}
                        disabled={isAnalysing}
                        className={`
                            flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all
                            ${isAnalysing 
                                ? 'bg-gray-700 text-gray-400 cursor-wait' 
                                : 'bg-white text-black hover:scale-105 hover:bg-gray-100'}
                        `}
                    >
                        {isAnalysing ? (
                            analysisPhase === 'images' ? (
                                <>
                                    <ScanEye className="w-5 h-5 animate-pulse" /> {t('config.analyzing_images')}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 animate-spin" /> {t('config.analyzing_script')}
                                </>
                            )
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 text-indigo-600" /> {t('config.create_btn')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* Step 3: Production */}
        {step === 3 && (
            <div className="relative">
                {isBatchGenerating && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                        <button
                            onClick={handleStopGeneration}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold animate-in slide-in-from-bottom-4"
                        >
                            <StopCircle className="w-5 h-5" />
                            Stop Generation
                        </button>
                    </div>
                )}
                
                <StoryboardViewer 
                    segments={storyboard} 
                    onGenerateAll={handleGenerateAll}
                    onUpdatePrompt={handleUpdatePrompt}
                    onRefinePrompt={handleRefinePrompt}
                    onRegenerateImage={handleRegenerateSingle}
                    isGenerating={isBatchGenerating || storyboard.some(s => s.status === VideoStatus.GENERATING)}
                    isAnalysing={isAnalysing}
                    aspectRatio={aspectRatio}
                    onBack={() => setStep(2)}
                    onChangeStyle={handleStyleChangeFromViewer}
                    currentStyle={selectedStyle}
                />
            </div>
        )}

      </main>
    </div>
  );
};

export default App;