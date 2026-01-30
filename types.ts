
export type AspectRatio = '9:16' | '16:9';

export interface SrtSubtitle {
  id: string;
  startTime: string; // 00:00:01,000
  endTime: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
}

export enum VideoStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ViralTactic {
  HOOK = 'Visual Hook (0-3s)',
  PACING = 'Fast Paced Cut',
  B_ROLL = 'Contextual B-Roll',
  CLIMAX = 'Visual Climax',
  TEXT_EMPHASIS = 'Text Focus',
  ATMOSPHERE = 'Healing Atmosphere'
}

export interface StoryboardSegment {
  id: string;
  text: string; // Combined text from multiple SRT lines if needed
  duration: number; // Duration in seconds
  visual_prompt: string; // The raw prompt for Veo/Imagen
  camera_movement: string; // Used for Ken Burns effect on images
  viral_reasoning: string; // Why this works for a short video
  tactic: ViralTactic;
  status: VideoStatus;
  videoUri?: string; // Contains Data URI for images or URL for videos
  error?: string;
  reference_image_index?: number; // -1 or undefined means no reference. 0, 1, 2... maps to uploaded images.
}

export interface VideoStyle {
  id: string;
  name: string;
  promptModifier: string; // Appended to the prompt
  negativePrompt?: string; // Things to avoid
  description: string;
}

export const QUOTA_LIMITS = {
  MAX_DAILY_IMAGES: 10000,
  MAX_SCRIPT_DURATION: 36000, // 10 hours
};

export const VIDEO_STYLES: VideoStyle[] = [
  {
    id: 'oil_painting',
    name: 'Healing Impasto',
    promptModifier: 'authentic oil painting on canvas, (visible thick brushstrokes:1.4), palette knife texture, impasto style, dreamy atmosphere, Tyndall effect, dappled sunlight, soft focus. Subject Constraint: Back view of a solitary figure in rustic linen clothes, or close-up of nature details. Claude Monet style, fine art, traditional medium, no digital smooth finish.',
    description: 'Warm, emotional, and textured. Focus on nature, light, and solitude.',
    negativePrompt: 'photorealistic, cgi, 3d render, smooth, shiny, digital art, vector, flat, low quality'
  },
  {
    id: 'hyperreal',
    name: 'Analog Photography',
    promptModifier: 'Shot on Kodak Portra 400, 35mm film grain, slight motion blur, raw photo, f/1.8 aperture, natural lighting, organic texture, imperfect composition, cinematic documentary style, highly detailed texture, no skin smoothing.',
    description: 'Authentic film look, grainy, raw, and emotional.'
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    promptModifier: 'Cyberpunk aesthetic, neon lights, rainy streets, optical aberration, chromatic aberration, high iso noise, cinematic lighting, gritty texture, shot on Arri Alexa',
    description: 'High energy, futuristic, dark with bright neon accents.'
  },
  {
    id: 'minimalist',
    name: 'Clean Minimalist',
    promptModifier: 'Minimalist photography, soft natural lighting, pastel colors, clean lines, high key, studio quality, unoccluded, matte finish, architectural digest style',
    description: 'Clean, modern, focus on subject matter with zero clutter.'
  },
  {
    id: 'anime',
    name: 'Vintage Anime',
    promptModifier: '1990s anime style, hand drawn cel shading, grain, retro aesthetic, detailed clouds, Makoto Shinkai atmosphere, watercolour background',
    description: 'Vibrant, emotional, high-quality animation style.'
  },
  {
    id: 'dark_fantasy',
    name: 'Dark Fantasy',
    promptModifier: 'Dark fantasy oil painting, gloomy atmosphere, fog, gothic architecture, dramatic chiaroscuro lighting, mysterious, ethereal, Frank Frazetta style, traditional art',
    description: 'Moody, dramatic, and intense.'
  },
  {
    id: 'sketch',
    name: 'Charcoal Sketch',
    promptModifier: 'Charcoal sketch on textured paper, smudge marks, graphite pencil, rough lines, hand drawn, unfinished look, artistic',
    description: 'Playful, clean, black and white hand-drawn look.'
  }
];
