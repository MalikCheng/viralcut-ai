import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Loader2, HelpCircle, X, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getSupabaseConfig } from '../services/supabase';
import { APP_DOMAIN } from '../config';

export const UserMenu: React.FC = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { t } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);

  if (loading) {
    return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
  }

  if (!user) {
    const config = getSupabaseConfig();
    const projectRef = config.url.split('//')[1]?.split('.')[0] || 'your-project-ref';
    const callbackUrl = `https://${projectRef}.supabase.co/auth/v1/callback`;
    
    // Use the official domain from config, or fallback to current window location if config is generic
    const currentOrigin = APP_DOMAIN || window.location.origin;

    return (
      <div className="flex items-center gap-3 relative">
        <button
            onClick={() => setShowHelp(!showHelp)}
            className={`transition-colors flex items-center gap-1 text-xs ${showHelp ? 'text-indigo-400' : 'text-gray-500 hover:text-indigo-400'}`}
        >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline">Login Help</span>
        </button>

        {showHelp && (
            <div className="absolute top-12 right-0 w-[450px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 z-50 text-left animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-2">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Fixing 403 Access Error
                    </h3>
                    <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 text-sm">
                    
                    {/* Step 1: Test Users */}
                    <div className="bg-yellow-900/10 border border-yellow-500/20 p-3 rounded-lg">
                        <h4 className="font-bold text-yellow-200 mb-1 flex items-center gap-2">
                            1. OAuth Consent Screen (Most Likely Cause)
                        </h4>
                        <p className="text-gray-400 text-xs mb-2">
                            If your app is in <strong>"Testing"</strong> mode, Google blocks anyone not in the list.
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                            <li>Go to Google Cloud Console &rarr; <strong>OAuth consent screen</strong>.</li>
                            <li>Scroll down to <strong>Test users</strong>.</li>
                            <li><strong>Add your email address</strong> (e.g., the one you are trying to login with).</li>
                        </ul>
                    </div>

                    {/* Step 2: JavaScript Origins */}
                    <div>
                        <h4 className="font-bold text-indigo-300 mb-1">2. Authorized JavaScript origins</h4>
                        <p className="text-gray-400 text-xs mb-1">
                            Must match your specific domain exactly (no trailing slash).
                        </p>
                        <div className="bg-black/50 border border-gray-700 rounded p-2 flex justify-between items-center group">
                            <code className="text-xs text-green-400 font-mono break-all">{currentOrigin}</code>
                            <span className="text-[10px] text-gray-500 uppercase font-bold ml-2">Add This</span>
                        </div>
                    </div>

                    {/* Step 3: Redirect URI */}
                    <div>
                        <h4 className="font-bold text-indigo-300 mb-1">3. Authorized redirect URIs</h4>
                        <p className="text-gray-400 text-xs mb-1">
                            Must match the Supabase Callback URL exactly.
                        </p>
                        <div className="bg-black/50 border border-gray-700 rounded p-2">
                            <code className="text-[10px] text-gray-300 break-all font-mono select-all">
                                {callbackUrl}
                            </code>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-800 text-center">
                        <a 
                            href="https://console.cloud.google.com/apis/credentials" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1"
                        >
                            Open Google Cloud Console <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        )}

        <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors shadow-lg shadow-indigo-500/20"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in
        </button>
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0];

  return (
    <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-gray-700">
            {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-600" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-300" />
                </div>
            )}
            <div className="hidden lg:block text-xs">
                <p className="text-gray-200 font-medium">{displayName}</p>
                <p className="text-gray-500 text-[10px]">{user.email}</p>
            </div>
        </div>
        
        <button
            onClick={signOut}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded-lg"
            title="Sign Out"
        >
            <LogOut className="w-4 h-4" />
        </button>
    </div>
  );
};