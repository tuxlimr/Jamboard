export enum ToolType {
  CURSOR = 'CURSOR',
  PEN = 'PEN',
  MARKER = 'MARKER',
  HIGHLIGHTER = 'HIGHLIGHTER',
  STICKY = 'STICKY',
  ERASER = 'ERASER',
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  TEXT = 'TEXT'
}

export interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface Sticky {
  id: string;
  x: number;
  y: number;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'orange';
  authorId: string;
  votes: number;
}

export interface Shape {
  id: string;
  type: 'rect' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface TextObject {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
  fontSize: number;
  fontFamily: 'sans' | 'serif' | 'handwriting';
  authorId: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
  opacity?: number;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
  reactions: string[]; // e.g., ["👍", "🔥"]
}

export interface BoardState {
  id: string;
  name: string;
  stickies: Sticky[];
  shapes: Shape[];
  texts: TextObject[];
  paths: DrawPath[];
  messages: ChatMessage[];
  users: User[];
}