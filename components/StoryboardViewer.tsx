import React, { useState } from 'react';
import { StoryboardSegment, VideoStatus, AspectRatio, VideoStyle, VIDEO_STYLES } from '../types';
import { Film, Zap, Clock, Camera, Image as ImageIcon, PlayCircle, Download, Loader2, AlertTriangle, RefreshCw, Wand2, ArrowLeft, Palette, Captions } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { exportVideo } from '../services/videoExportService';
import { useLanguage } from '../contexts/LanguageContext';

interface StoryboardViewerProps {
  segments: StoryboardSegment[];
  onGenerateAll: () => void;
  onUpdatePrompt: (id: string, text: string) => void;
  onRefinePrompt: (id: string) => void;
  onRegenerateImage: (id: string) => void;
  isGenerating: boolean;
  isAnalysing?: boolean;
  aspectRatio: AspectRatio;
  onBack: () => void;
  onChangeStyle: (style: VideoStyle) => void;
  currentStyle: VideoStyle;
}

export const StoryboardViewer: React.FC<StoryboardViewerProps> = ({ 
    segments, 
    onGenerateAll, 
    onUpdatePrompt,
    onRefinePrompt,
    onRegenerateImage,
    isGenerating,
    isAnalysing = false,
    aspectRatio,
    onBack,
    onChangeStyle,
    currentStyle
}) => {
  const { t } = useLanguage();
  const [showPlayer, setShowPlayer] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [burnSubtitles, setBurnSubtitles] = useState(false);

  // Track which specific buttons are loading
  const [refiningPromptId, setRefiningPromptId] = useState<string | null>(null);

  if (segments.length === 0 && !isAnalysing) return null;

  const completedCount = segments.filter(s => s.status === VideoStatus.COMPLETED).length;
  const canPlay = completedCount > 0 && completedCount === segments.length; 
  const hasSomeCompleted = completedCount > 0;

  const handleRefineClick = async (id: string) => {
      setRefiningPromptId(id);
      await onRefinePrompt(id);
      setRefiningPromptId(null);
  };

  const handleDownloadVideo = async () => {
    const completedSegments = segments.filter(s => s.status === VideoStatus.COMPLETED && s.videoUri);
    if (completedSegments.length === 0) return;

    // Warning for partial export (Non-blocking)
    if (completedSegments.length < segments.length) {
        console.warn(`Exporting partial video: Only ${completedSegments.length} out of ${segments.length} scenes are generated.`);
    }

    // REMOVED blocking confirm dialogs here to prevent browser interference.
    // The UI below (yellow box) already warns the user to keep the tab active.

    setIsExporting(true);
    setExportProgress(0);

    // Short delay to allow UI update
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const blob = await exportVideo(completedSegments, aspectRatio, (progress) => {
        setExportProgress(progress);
      }, burnSubtitles);

      // Create download link
      const isMp4 = blob.type.includes('mp4');
      const ext = isMp4 ? 'mp4' : 'webm';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `viral_cut_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error("Export failed:", error);
      alert(`Failed to export video: ${error.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Styles for the preview thumbnails hover effect
  const getAnimationStyles = (movement: string) => {
    const baseDuration = '5s';
    let animationName = 'zoomIn'; 
    if (movement === 'Zoom Out') animationName = 'zoomOut';
    if (movement === 'Pan Right') animationName = 'panRight';
    if (movement === 'Pan Left') animationName = 'panLeft';
    if (movement === 'Static') return {};

    return {
        animation: `${animationName} ${baseDuration} linear forwards`,
    };
  };

  const containerAspectClass = aspectRatio === '9:16' ? 'aspect-[9/16] w-full md:w-[200px]' : 'aspect-[16/9] w-full md:w-[320px]';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[500px]">
      
      {/* Loading Overlay for Style Switching */}
      {isAnalysing && (
          <div className="absolute inset-0 z-50 bg-[#0f0f12]/80 backdrop-blur-sm rounded-xl">
              <div className="sticky top-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-white">{t('viewer.reimagining')}</h3>
                  <p className="text-gray-400 text-sm">Applying new artistic direction</p>
              </div>
          </div>
      )}

      {showPlayer && (
        <VideoPlayer 
            segments={segments} 
            aspectRatio={aspectRatio}
            onClose={() => setShowPlayer(false)} 
        />
      )}

      <style>{`
        @keyframes zoomIn { from { transform: scale(1); } to { transform: scale(1.25); } }
        @keyframes zoomOut { from { transform: scale(1.25); } to { transform: scale(1); } }
        @keyframes panRight { from { object-position: 0% 50%; transform: scale(1.2); } to { object-position: 100% 50%; transform: scale(1.2); } }
        @keyframes panLeft { from { object-position: 100% 50%; transform: scale(1.2); } to { object-position: 0% 50%; transform: scale(1.2); } }
      `}</style>
      
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium px-2 py-1"
          >
              <ArrowLeft className="w-4 h-4" />
              {t('app.back_config')}
          </button>

          <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
             <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2 flex-shrink-0">
                <Palette className="w-4 h-4" /> Style:
             </div>
             <div className="flex gap-2">
                {VIDEO_STYLES.map(style => {
                    const isActive = currentStyle.id === style.id;
                    const isLoadingThis = isActive && isAnalysing;
                    // Lookup style name translation
                    const nameKey = `styles.${style.id}_name`;
                    let displayName = t(nameKey);
                    if (displayName === nameKey) displayName = style.name;
                    
                    return (
                        <button
                            key={style.id}
                            onClick={() => onChangeStyle(style)}
                            disabled={isGenerating || isAnalysing}
                            className={`
                                whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2
                                ${isActive 
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200'}
                                ${isGenerating || (isAnalysing && !isActive) ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {isLoadingThis ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    {t('viewer.applying')}
                                </>
                            ) : (
                                displayName
                            )}
                        </button>
                    )
                })}
             </div>
          </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-indigo-400" />
            {t('viewer.title')}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {t('viewer.subtitle')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            {/* Generate Button */}
            <button
                onClick={onGenerateAll}
                disabled={isGenerating || completedCount === segments.length}
                className={`px-5 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                    isGenerating || completedCount === segments.length
                    ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                }`}
            >
                {isGenerating ? t('viewer.btn_generating') : completedCount === segments.length ? t('viewer.btn_all_generated') : t('viewer.btn_generate_all')}
            </button>

            {/* Preview Button */}
            <button
                onClick={() => setShowPlayer(true)}
                disabled={!hasSomeCompleted}
                className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    hasSomeCompleted
                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-transparent'
                }`}
            >
                <PlayCircle className="w-5 h-5" />
                {t('viewer.btn_preview')}
            </button>
            
            <div className="h-10 w-px bg-gray-700 mx-1 hidden md:block"></div>

            {/* Burn Subtitles Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-gray-800/50 px-3 py-3 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors">
                <input 
                    type="checkbox" 
                    checked={burnSubtitles}
                    onChange={(e) => setBurnSubtitles(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700 accent-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-gray-300 select-none flex items-center gap-2 font-medium">
                    <Captions className="w-4 h-4" />
                    {t('viewer.burn_subtitles')}
                </span>
            </label>

             {/* Export Button */}
             <button
                onClick={handleDownloadVideo}
                disabled={!hasSomeCompleted || isExporting}
                className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all min-w-[160px] justify-center ${
                    hasSomeCompleted
                    ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'
                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                }`}
            >
                {isExporting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{Math.round(exportProgress)}%</span>
                    </>
                ) : (
                    <>
                        <Download className="w-5 h-5" />
                        {t('viewer.btn_export')}
                    </>
                )}
            </button>
        </div>
      </div>
      
      {isExporting && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-center gap-3 text-yellow-200 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                  {t('viewer.rendering')}
                  <span className="block font-bold mt-1 text-yellow-400">DO NOT SWITCH TABS.</span>
              </p>
          </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {segments.map((segment, index) => (
          <div 
            key={segment.id} 
            className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 hover:border-indigo-500/30 transition-colors"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono px-2 py-1 rounded">
                            {t('viewer.scene')} {index + 1}
                        </span>
                        <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {segment.tactic}
                        </span>
                        <span className="bg-gray-700 text-gray-300 text-xs font-mono px-2 py-1 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {segment.duration.toFixed(1)}s
                        </span>
                    </div>

                    {/* Regenerate Button */}
                    <button 
                        onClick={() => onRegenerateImage(segment.id)}
                        disabled={segment.status === VideoStatus.GENERATING}
                        className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors disabled:opacity-50"
                    >
                        {segment.status === VideoStatus.GENERATING ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3 h-3" />
                        )}
                        {t('viewer.regenerate_image')}
                    </button>
                </div>
                
                <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-1">Subtitle Audio Context</h4>
                    <p className="text-lg text-white font-medium">"{segment.text}"</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                     <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 group focus-within:border-indigo-500/50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <h5 className="text-xs text-gray-400 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> {t('viewer.visual_prompt')}
                            </h5>
                            <button
                                onClick={() => handleRefineClick(segment.id)}
                                disabled={refiningPromptId === segment.id || segment.status === VideoStatus.GENERATING}
                                className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                title="Use AI to rewrite and improve this prompt"
                            >
                                {refiningPromptId === segment.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Wand2 className="w-3 h-3" />
                                )}
                                {t('viewer.ai_refine')}
                            </button>
                        </div>
                        <textarea 
                            className="w-full bg-transparent text-sm text-gray-300 italic focus:outline-none focus:text-white resize-none h-20 leading-relaxed custom-scrollbar"
                            value={segment.visual_prompt}
                            onChange={(e) => onUpdatePrompt(segment.id, e.target.value)}
                            placeholder="Describe the visual scene..."
                        />
                     </div>
                </div>
              </div>

              {/* Right: Video Output or Placeholder */}
              <div className={`${containerAspectClass} bg-black rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-800 group`}>
                {segment.status === VideoStatus.COMPLETED && segment.videoUri ? (
                  <div className="w-full h-full relative overflow-hidden">
                      <img 
                        src={segment.videoUri} 
                        alt="Generated Scene"
                        className="w-full h-full object-cover"
                        style={getAnimationStyles(segment.camera_movement)}
                      />
                      {/* Overlay Refresh Button on Image */}
                      <button 
                        onClick={() => onRegenerateImage(segment.id)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm"
                        title="Regenerate this image"
                      >
                         <RefreshCw className="w-4 h-4" />
                      </button>

                       <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Camera className="w-3 h-3" />
                            {segment.camera_movement}
                       </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-4 text-center z-10">
                    {segment.status === VideoStatus.GENERATING ? (
                      <>
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <span className="text-xs text-indigo-400 animate-pulse">Painting...</span>
                      </>
                    ) : segment.status === VideoStatus.FAILED ? (
                         <>
                            <span className="text-red-500 text-2xl mb-2">⚠</span>
                            <span className="text-xs text-red-400">{t('viewer.failed')}</span>
                            <button onClick={() => onRegenerateImage(segment.id)} className="mt-2 text-xs underline">{t('viewer.retry')}</button>
                         </>
                    ) : (
                      <>
                        <Film className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-xs opacity-50">{t('viewer.waiting')}</span>
                      </>
                    )}
                  </div>
                )}
                
                {segment.status === VideoStatus.COMPLETED && (
                    <a 
                        href={segment.videoUri} 
                        download={`scene-${index+1}.png`}
                        className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        title="Download Image Source"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
