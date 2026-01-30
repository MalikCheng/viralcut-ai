import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle2, Youtube, Instagram, Smartphone, Zap, Globe, FileText, Video, Languages } from 'lucide-react';

export const SeoContent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full mt-24 space-y-24 pb-20 text-gray-300">
      
      {/* Section 1: Introduction & H1 Reinforcement */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            The Ultimate <span className="text-indigo-400">SRT to Video</span> Converter
          </h2>
          <p className="text-lg leading-relaxed text-gray-400">
            <strong>SRT2Video by ViralCut AI</strong> solves the biggest challenge for content creators: turning plain text subtitles into engaging visual stories. 
            Unlike traditional editors where you must manually find stock footage, our tool uses Generative AI to 
            <strong> convert subtitles to video instantly</strong>.
          </p>
          <p className="text-lg leading-relaxed text-gray-400">
            Whether you are a podcaster looking to visualize your audio, or a marketer wanting to 
            <strong> turn scripts into AI video</strong> content for social media, our engine understands the context of your SRT file and paints the perfect scene for every line of dialogue.
          </p>
        </div>
        <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6">Why Choose ViralCut for Subtitle Visualization?</h3>
            <ul className="space-y-4">
                {[
                    "Transform .srt files to MP4 automatically",
                    "No watermarks on generated scenes",
                    "AI understands context, mood, and lighting",
                    "Perfect for TikTok, Reels, and YouTube Shorts",
                    "Support for English, Chinese, Spanish, and more"
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
      </section>

      {/* Section 2: How it Works (Step by Step) - Optimized for 'How to' snippets */}
      <section className="text-center space-y-12">
        <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold text-white">How to Convert SRT to Video with AI?</h2>
            <p className="text-gray-400">Create viral content in 3 simple steps without any video editing skills.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/20 p-8 rounded-2xl border border-gray-800 hover:border-indigo-500/30 transition-colors">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. Upload SRT File</h3>
                <p className="text-sm text-gray-400">
                    Simply drag and drop your .srt subtitle file. Our system parses the timestamps and text content instantly.
                </p>
            </div>
            <div className="bg-gray-800/20 p-8 rounded-2xl border border-gray-800 hover:border-indigo-500/30 transition-colors">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. AI Analysis & Style</h3>
                <p className="text-sm text-gray-400">
                    Select a visual aesthetic (Cinematic, Anime, Minimalist). Our AI analyzes the script to generate context-aware visuals.
                </p>
            </div>
            <div className="bg-gray-800/20 p-8 rounded-2xl border border-gray-800 hover:border-indigo-500/30 transition-colors">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Video className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. Download Video</h3>
                <p className="text-sm text-gray-400">
                    Review generated scenes, regenerate if needed, and export your final MP4 video with subtitles burned in.
                </p>
            </div>
        </div>
      </section>

      {/* Section 3: Use Cases / Keyword Targeting */}
      <section className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl p-8 md:p-12 border border-white/5">
        <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Scale Your Content Production</h2>
                <div className="grid gap-6">
                    <div className="flex gap-4">
                        <Smartphone className="w-8 h-8 text-pink-500 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Convert Subtitles to TikTok Video</h3>
                            <p className="text-sm text-gray-400">
                                Stop searching for generic stock footage. Generate original, eye-catching backgrounds that keep retention high on TikTok and Reels.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Youtube className="w-8 h-8 text-red-500 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Turn Script into AI Video</h3>
                            <p className="text-sm text-gray-400">
                                Have a video essay script? Convert it to SRT, upload it here, and get a full storyboard visualizer for your YouTube channel.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Globe className="w-8 h-8 text-blue-500 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Global Reach</h3>
                            <p className="text-sm text-gray-400">
                                We support multi-language SRT files. Create videos for global audiences by simply uploading translated subtitle files.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
             <div className="flex flex-col justify-center">
                 <div className="bg-black/40 p-6 rounded-xl border border-gray-700">
                    <h4 className="text-sm font-mono text-gray-500 mb-4">TRANSFORMATION EXAMPLE</h4>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-center opacity-50">
                            <FileText className="w-5 h-5" />
                            <code className="text-xs">1<br/>00:00:01,000 --&gt; 00:00:04,000<br/>The ancient city slept under the stars.</code>
                        </div>
                        <div className="h-8 w-px bg-gray-600 mx-auto"></div>
                        <div className="bg-indigo-500/20 p-4 rounded-lg border border-indigo-500/50 text-center">
                            <span className="text-indigo-300 font-bold text-sm">Generated Video Scene</span>
                            <p className="text-xs text-indigo-200 mt-1">"Wide shot of ancient stone architecture, starry night sky, cinematic lighting"</p>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
      </section>
      
      {/* Section 4: Supported Languages - Long tail keyword targeting */}
      <section className="bg-gray-800/30 border border-gray-800 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Languages className="w-6 h-6 text-gray-400" />
            Supported Languages for SRT to Video
        </h2>
        <p className="text-gray-400 mb-6">
            ViralCut AI supports subtitle files in all major languages. Whether your script is in English, Spanish, or Chinese, our generative AI understands the nuances of the text to create culturally relevant visuals.
        </p>
        <div className="flex flex-wrap gap-3">
            {[
                "English (US/UK)", "Chinese (Simplified/Traditional)", "Spanish (Español)", 
                "French (Français)", "German (Deutsch)", "Japanese (日本語)", 
                "Korean (한국어)", "Portuguese", "Italian", "Russian"
            ].map(lang => (
                <span key={lang} className="px-3 py-1 bg-gray-900 rounded-full text-xs text-gray-500 border border-gray-700">
                    {lang}
                </span>
            ))}
        </div>
      </section>

      {/* Section 5: FAQ (Rich Snippet Optimized) */}
      <section className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
        <div className="grid gap-4">
            {[
                {
                    q: "How to add background video to SRT file?",
                    a: "Traditionally, you use video editors like Premiere Pro. With SRT2Video, you just upload the SRT, and our AI automatically creates and adds the background video that matches your text context."
                },
                {
                    q: "Is SRT2Video free to use?",
                    a: "Yes, we provide daily free credits for all users. You can convert subtitles to video for free every day. For high-volume professional use, we offer premium API keys."
                },
                {
                    q: "What video formats do you support?",
                    a: "You can export your final video in .mp4 or .webm formats. We support both vertical (9:16) aspect ratios for mobile viewing and horizontal (16:9) for desktop."
                },
                {
                    q: "Does it work with non-English subtitles?",
                    a: "Absolutely. Our underlying Gemini AI models are multilingual. You can upload SRT files in Chinese, Spanish, French, Japanese, German, and many other languages."
                }
            ].map((faq, i) => (
                <div key={i} className="bg-gray-800/30 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
            ))}
        </div>
      </section>

    </div>
  );
};