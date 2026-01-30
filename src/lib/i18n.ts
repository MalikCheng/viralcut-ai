// Simple i18n utility for Astro
export const languages = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
};

export const defaultLang = 'en';

export const translations = {
  en: {
    'seo.title': 'ViralCut AI - Free SRT to Video Storyboard Generator',
    'seo.description': 'Transform SRT subtitles into professional AI-generated storyboards. Free, fast, and SEO-optimized video creation tool.',
    'hero.badge': '✨ AI-Powered Video Creation',
    'hero.title': 'Turn Subtitles Into',
    'hero.highlight': 'Amazing Videos',
    'hero.description': 'Transform your SRT subtitles into professional storyboards with AI-generated visuals. Fast, free, and incredibly easy to use.',
    'hero.cta.primary': 'Start Creating Free',
    'hero.cta.secondary': 'Learn More',
    'features.title': 'Powerful Features',
    'features.items': [
      { icon: '🎯', title: 'Smart Storyboard', description: 'AI automatically generates visual storyboards from your SRT subtitles.' },
      { icon: '🎨', title: 'Multiple Styles', description: 'Choose from various video styles including anime, realistic, oil painting, and more.' },
      { icon: '📸', title: 'Reference Images', description: 'Upload reference images to guide the AI visual style.' },
      { icon: '⚡', title: 'Fast Generation', description: 'Generate multiple images in parallel with intelligent quota management.' },
      { icon: '🔒', title: 'Privacy First', description: 'Your data stays on your device. No server-side storage of your content.' },
      { icon: '🌐', title: 'Multi-Language', description: 'Support for SRT files in any language with AI translation.' }
    ],
    'howitworks.title': 'How It Works',
    'howitworks.steps': [
      { icon: '📤', title: 'Upload SRT File', description: 'Simply drag and drop your SRT subtitle file. We support all standard SRT formats.' },
      { icon: '✨', title: 'AI Generation', description: 'Our AI analyzes your script and generates unique visual scenes for each subtitle segment.' },
      { icon: '📹', title: 'Export Video', description: 'Download your storyboard or export as video. Share directly to social media.' }
    ],
    'cta.title': 'Ready to Create?',
    'cta.description': 'Start transforming your subtitles into stunning visuals today. No account required.',
    'cta.button': 'Start Creating Now'
  },
  zh: {
    'seo.title': 'ViralCut AI - 免费 SRT 转视频分镜生成器',
    'seo.description': '将 SRT 字幕转换为专业的 AI 生成分镜。免费、快速、SEO 优化的视频创作工具。',
    'hero.badge': '✨ AI 驱动的视频创作',
    'hero.title': '将字幕变成',
    'hero.highlight': '精彩视频',
    'hero.description': '将您的 SRT 字幕转换为专业的 AI 生成分镜。快速、免费且易于使用。',
    'hero.cta.primary': '开始免费创作',
    'hero.cta.secondary': '了解更多',
    'features.title': '强大功能',
    'features.items': [
      { icon: '🎯', title: '智能分镜', description: 'AI 自动从您的 SRT 字幕生成视觉分镜。' },
      { icon: '🎨', title: '多种风格', description: '从各种视频风格中选择，包括动漫、 realistic、油画等。' },
      { icon: '📸', title: '参考图片', description: '上传参考图片指导 AI 视觉风格。' },
      { icon: '⚡', title: '快速生成', description: '并行生成多张图片，智能配额管理。' },
      { icon: '🔒', title: '隐私优先', description: '您的数据保留在设备上，不进行服务器端存储。' },
      { icon: '🌐', title: '多语言支持', description: '支持任何语言的 SRT 文件，带 AI 翻译。' }
    ],
    'howitworks.title': '使用流程',
    'howitworks.steps': [
      { icon: '📤', title: '上传 SRT 文件', description: '简单拖放您的 SRT 字幕文件。我们支持所有标准 SRT 格式。' },
      { icon: '✨', title: 'AI 生成', description: '我们的 AI 分析您的脚本并为每个字幕片段生成独特的视觉场景。' },
      { icon: '📹', title: '导出视频', description: '下载您的分镜或导出为视频。直接分享到社交媒体。' }
    ],
    'cta.title': '准备好创作了吗？',
    'cta.description': '今天就开始将您的字幕转化为令人惊叹的视觉效果。无需注册账户。',
    'cta.button': '立即开始创作'
  }
};

export function getLangFromUrl(url: URL): keyof typeof translations {
  const pathname = url.pathname;
  const langCode = pathname.split('/')[1];
  if (langCode in translations) {
    return langCode as keyof typeof translations;
  }
  return defaultLang;
}

export function useTranslations(lang: keyof typeof translations) {
  return function t(key: string): string {
    return translations[lang]?.[key] || translations[defaultLang]?.[key] || key;
  }
}
