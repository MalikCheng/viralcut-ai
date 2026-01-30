// This is your website's "Official" Domain (Canonical URL).
// Currently set to your Cloud Run URL.
// When you buy a custom domain (e.g. 'https://viralcut.ai'), update this value.
export const APP_DOMAIN = 'https://srt2video.com';

// Helper to construct full URLs
export const getFullUrl = (path: string = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${APP_DOMAIN}${cleanPath}`;
};
