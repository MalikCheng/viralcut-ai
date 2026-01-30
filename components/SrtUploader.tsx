import React from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SrtUploaderProps {
  onFileLoaded: (content: string) => void;
}

export const SrtUploader: React.FC<SrtUploaderProps> = ({ onFileLoaded }) => {
  const { t } = useLanguage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          onFileLoaded(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-700 border-dashed rounded-2xl cursor-pointer bg-gray-800/50 hover:bg-gray-800 transition-colors group">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="p-4 bg-indigo-500/10 rounded-full mb-4 group-hover:bg-indigo-500/20 transition-colors">
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="mb-2 text-sm text-gray-300">
            <span className="font-semibold text-indigo-400">{t('upload.drop_label')}</span> {t('upload.drop_sub')}
          </p>
          <p className="text-xs text-gray-500">{t('upload.limit')}</p>
        </div>
        <input 
            type="file" 
            accept=".srt" 
            className="hidden" 
            onChange={handleFileChange} 
        />
      </label>
    </div>
  );
};