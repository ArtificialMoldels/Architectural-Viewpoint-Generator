export interface Point {
  x: number;
  y: number;
}

// FIX: Added missing Viewpoint interface.
export interface Viewpoint {
  viewer: Point;
  description: string;
  sunPosition: Point;
}

export type TimeOfDay = 'Dawn' | 'Daytime' | 'Dusk' | 'Night';

export interface GeneratedImagePart {
  base64: string;
  mimeType: string;
}

export type Season = 'Winter' | 'Spring' | 'Summer' | 'Autumn';

export interface HistoryItem {
  id: string;
  image: GeneratedImagePart;
  prompt: string;
  isOriginal?: boolean;
}