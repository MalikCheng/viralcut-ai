import React, { useRef } from 'react';
import { VideoStyle, VIDEO_STYLES, AspectRatio } from '../types';
import { Palette, Monitor, ImagePlus, X, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StyleSelectorProps {
  selectedStyle: VideoStyle;
  onSelectStyle: (style: VideoStyle) => void;
  selectedRatio: AspectRatio;
  onSelectRatio: (ratio: AspectRatio) => void;
  referenceImages: string[];
  onSetReferenceImages: (imgs: string[]) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ 
    selectedStyle, 
    onSelectStyle,
    selectedRatio,
    onSelectRatio,
    referenceImages,
    onSetReferenceImages
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const fileArray: File[] = Array.from(files);
    
    // Process files
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    try {
        const promises = validFiles.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (typeof ev.target?.result === 'string') {
                        resolve(ev.target.result);
                    } else {
                        reject(new Error('Failed to read file'));
                    }
                };
                reader.onerror = () => reject(new Error('File reading error'));
                reader.readAsDataURL(file);
            });
        });

        const newImages = await Promise.all(promises);
        onSetReferenceImages([...referenceImages, ...newImages]);
    } catch (error) {
        console.error("Image upload failed", error);
    } finally {
        // Reset the input so the same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const removeImage = (index: number) => {
    const updated = [...referenceImages];
    updated.splice(index, 1);
    onSetReferenceImages(updated);
  };

  return (
    <div className="space-y-8">
        
      {/* Aspect Ratio Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-200 font-semibold text-lg">
            <Monitor className="w-5 h-5 text-purple-400" />
            <h3>{t('style.format_title')}</h3>
        </div>
        <div className="flex gap-4">
            <button
                onClick={() => onSelectRatio('9:16')}
                className={`flex-1 p-4 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-3 ${
                    selectedRatio === '9:16'
                    ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                }`}
            >
                <div className="w-8 h-14 border-2 border-current rounded-md flex items-center justify-center opacity-80">
                    <span className="text-[10px] font-bold">9:16</span>
                </div>
                <div className="text-left">
                    <p className={`font-bold ${selectedRatio === '9:16' ? 'text-purple-400' : 'text-gray-300'}`}>{t('style.vertical')}</p>
                </div>
            </button>

            <button
                onClick={() => onSelectRatio('16:9')}
                className={`flex-1 p-4 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-3 ${
                    selectedRatio === '16:9'
                    ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                }`}
            >
                <div className="w-14 h-8 border-2 border-current rounded-md flex items-center justify-center opacity-80">
                     <span className="text-[10px] font-bold">16:9</span>
                </div>
                <div className="text-left">
                    <p className={`font-bold ${selectedRatio === '16:9' ? 'text-purple-400' : 'text-gray-300'}`}>{t('style.horizontal')}</p>
                </div>
            </button>
        </div>
      </div>

      {/* Style Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-200 font-semibold text-lg">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3>{t('style.aesthetic_title')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIDEO_STYLES.map((style) => {
            // Attempt to get translated name and description
            // Keys in translations.ts are 'styles.id_name' and 'styles.id_desc'
            const nameKey = `styles.${style.id}_name`;
            const descKey = `styles.${style.id}_desc`;
            
            // If translation returns the key itself (meaning missing), fallback to hardcoded style.name
            let displayName = t(nameKey);
            if (displayName === nameKey) displayName = style.name;

            let displayDesc = t(descKey);
            if (displayDesc === descKey) displayDesc = style.description;

            return (
              <button
                key={style.id}
                onClick={() => onSelectStyle(style)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  selectedStyle.id === style.id
                    ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${selectedStyle.id === style.id ? 'text-purple-400' : 'text-gray-300'}`}>
                    {displayName}
                  </span>
                  {selectedStyle.id === style.id && (
                    <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{displayDesc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reference Image Uploader (CONDITIONAL: Only for Analog Photography) */}
      {selectedStyle.id === 'hyperreal' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center gap-2 text-gray-200 font-semibold text-lg">
                <ImagePlus className="w-5 h-5 text-indigo-400" />
                <h3>{t('style.ref_assets_title')}</h3>
             </div>
             <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-4 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-400" />
                    {t('style.ref_assets_desc')}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {/* Add Button */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/50 hover:border-gray-500 transition-all group"
                    >
                        <div className="p-2 bg-gray-800 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <ImagePlus className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-300">{t('style.add_asset')}</span>
                    </div>

                    {/* Image List */}
                    {referenceImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square">
                            <div className="w-full h-full rounded-xl overflow-hidden border border-indigo-500/30">
                                <img 
                                    src={img} 
                                    alt={`Ref ${idx}`} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                                        {t('style.ref_label')} #{idx}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110"
                                title="Remove"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
                
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    multiple
                    className="hidden" 
                    onChange={handleImageUpload}
                />
             </div>
          </div>
      )}

    </div>
  );
};