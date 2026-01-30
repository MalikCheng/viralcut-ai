import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Database, Key, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { getSupabaseConfig } from '../services/supabase';

interface SupabaseConfigSelectorProps {
  onCancel: () => void;
}

export const SupabaseConfigSelector: React.FC<SupabaseConfigSelectorProps> = ({ onCancel }) => {
  const { configureSupabase } = useAuth();
  const defaultConfig = getSupabaseConfig();
  
  const [url, setUrl] = useState(defaultConfig.url);
  const [key, setKey] = useState(defaultConfig.key);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!url.startsWith('http')) {
        setError('URL must start with http:// or https://');
        return;
    }
    if (!key) {
        setError('Anon Key is required');
        return;
    }

    const success = configureSupabase(url, key);
    if (success) {
        onCancel();
    } else {
        setError('Failed to initialize Supabase client');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-900 border border-indigo-500/50 p-8 rounded-2xl max-w-md w-full shadow-2xl shadow-indigo-500/20">
        <div className="flex items-center justify-between mb-4">
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-indigo-400" />
                Connect Supabase
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
            </button>
        </div>
       
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-6 text-sm text-yellow-200 flex gap-3">
             <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-400" />
             <div>
                <p className="font-bold mb-1">Configuration Required:</p>
                <ol className="list-decimal ml-4 space-y-1 text-xs text-yellow-100/80">
                    <li>Go to Supabase Dashboard &rarr; Authentication &rarr; Providers.</li>
                    <li>Enable <strong>Google</strong>.</li>
                    <li>Add <code>{window.location.origin}</code> to <strong>Redirect URLs</strong> (Auth &rarr; URL Configuration).</li>
                </ol>
             </div>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Project URL</label>
                <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
            </div>
            
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Anon Key</label>
                <div className="relative">
                    <Key className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                        type="password" 
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="your-anon-key"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {error && (
                <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/20">
                    {error}
                </p>
            )}

            <div className="pt-4 flex gap-3">
                <button
                    onClick={handleSave}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    Connect & Login
                </button>
            </div>
        </div>
        
        <div className="mt-6 text-center">
            <a 
                href="https://supabase.com/dashboard/project/_/settings/api" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-gray-500 hover:text-indigo-400 underline"
            >
                Find your credentials here
            </a>
        </div>
      </div>
    </div>
  );
};
