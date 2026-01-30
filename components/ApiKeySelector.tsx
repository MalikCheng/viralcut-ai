import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
  onCancel: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected, onCancel }) => {
  const { t } = useLanguage();

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      onKeySelected();
    } else {
        alert("AI Studio environment not detected.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gray-900 border border-red-500/50 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl shadow-red-500/20">
        <h2 className="text-3xl font-bold text-red-400 mb-4">
          {t('error.auth_failed')}
        </h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          {t('error.auth_desc')}
        </p>
        
        <div className="flex flex-col gap-3">
            <button
            onClick={handleSelectKey}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
            {t('error.select_key')}
            </button>
            <button
            onClick={onCancel}
            className="w-full py-2 px-6 text-gray-500 hover:text-gray-300 text-sm font-semibold"
            >
            {t('error.cancel')}
            </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-indigo-400">
                {t('error.billing_doc')}
            </a>
        </div>
      </div>
    </div>
  );
};