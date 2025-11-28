export enum ToolType {
  CURSOR = 'CURSOR',
  PEN = 'PEN',
  MARKER = 'MARKER',
  HIGHLIGHTER = 'HIGHLIGHTER',
  STICKY = 'STICKY',
  ERASER = 'ERASER'
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
  paths: DrawPath[];
  messages: ChatMessage[];
  users: User[];
}