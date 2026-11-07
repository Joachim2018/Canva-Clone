export type ElementType = 'text' | 'shape' | 'image' | 'drawing' | 'icon';

export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'diamond'
  | 'hexagon'
  | 'arrow'
  | 'speech-bubble'
  | 'line';

export type TextEffectType = 'none' | 'shadow' | 'lift' | 'hollow' | 'neon' | 'glitch';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  opacity: number; // 0 to 1
  isLocked: boolean;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | '500' | '600' | 'bold' | '700' | '800';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number;
  lineHeight: number;
  effect: TextEffectType;
  effectColor?: string;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  borderRadius: number;
}

export interface ImageFilters {
  brightness: number; // 50 to 150 (100 = normal)
  contrast: number; // 50 to 150
  saturation: number; // 0 to 200
  blur: number; // 0 to 20px
  grayscale: number; // 0 to 100%
  sepia: number; // 0 to 100%
  preset?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  filters: ImageFilters;
  flipH: boolean;
  flipV: boolean;
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: number;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingElement extends BaseElement {
  type: 'drawing';
  points: DrawingPoint[];
  strokeColor: string;
  strokeWidth: number;
  tool: 'pen' | 'highlighter';
}

export interface IconElement extends BaseElement {
  type: 'icon';
  iconName: string;
  color: string;
}

export type CanvasElement =
  | TextElement
  | ShapeElement
  | ImageElement
  | DrawingElement
  | IconElement;

export interface CanvasPage {
  id: string;
  name: string;
  backgroundColor: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  elements: CanvasElement[];
}

export type DocumentFormat =
  | 'instagram-post'
  | 'presentation'
  | 'flyer'
  | 'story'
  | 'youtube-thumb'
  | 'custom';

export interface FormatPreset {
  id: DocumentFormat;
  label: string;
  width: number;
  height: number;
  icon: string;
  description: string;
}

export interface CanvasDocument {
  id: string;
  title: string;
  format: DocumentFormat;
  width: number;
  height: number;
  pages: CanvasPage[];
  currentPageIndex: number;
}
