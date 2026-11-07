export interface FontOption {
  name: string;
  category: 'sans' | 'serif' | 'display' | 'mono';
  preview: string;
}

export const POPULAR_FONTS: FontOption[] = [
  { name: 'Plus Jakarta Sans', category: 'sans', preview: 'Modern & Clean' },
  { name: 'Outfit', category: 'display', preview: 'Geometric Bold' },
  { name: 'Playfair Display', category: 'serif', preview: 'Editorial Luxury' },
  { name: 'Oswald', category: 'display', preview: 'CONDENSED IMPACT' },
  { name: 'DM Sans', category: 'sans', preview: 'Contemporary Design' },
  { name: 'JetBrains Mono', category: 'mono', preview: 'const code = true;' },
];

export const COLOR_PALETTES = [
  {
    name: 'Canva Modern',
    colors: ['#7D2AE8', '#00C4CC', '#FF5757', '#FFBD59', '#00BF63', '#111827', '#FFFFFF'],
  },
  {
    name: 'Earthy Warmth',
    colors: ['#2A2421', '#6F4E37', '#A67B5B', '#ECB176', '#FED8B1', '#FBF9F1', '#D4A373'],
  },
  {
    name: 'Nordic Calm',
    colors: ['#2B2E4A', '#53354A', '#903749', '#E84545', '#334155', '#64748B', '#F8FAFC'],
  },
  {
    name: 'Botanical Sage',
    colors: ['#283618', '#606C38', '#DDA15E', '#BC6C25', '#FEFAE0', '#1F2937', '#84A98C'],
  },
  {
    name: 'Cyber Horizon',
    colors: ['#0F172A', '#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#F8FAFC', '#1E293B'],
  },
];

export const FORMAT_PRESETS = [
  {
    id: 'instagram-post',
    label: 'Instagram Post',
    width: 1080,
    height: 1080,
    icon: 'Instagram',
    description: '1080 × 1080 px · 1:1 Square',
  },
  {
    id: 'presentation',
    label: 'Presentation (16:9)',
    width: 1920,
    height: 1080,
    icon: 'Presentation',
    description: '1920 × 1080 px · Slide Deck',
  },
  {
    id: 'story',
    label: 'Instagram Story / Reel',
    width: 1080,
    height: 1920,
    icon: 'Smartphone',
    description: '1080 × 1920 px · 9:16 Mobile',
  },
  {
    id: 'flyer',
    label: 'Flyer / Document (A4)',
    width: 1240,
    height: 1754,
    icon: 'FileText',
    description: '1240 × 1754 px · Print Ready',
  },
  {
    id: 'youtube-thumb',
    label: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    icon: 'Video',
    description: '1280 × 720 px · High CTR',
  },
];
