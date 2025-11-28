import React from 'react';
import { ToolType } from '../types';
import { MousePointer2, Pen, PenTool, Highlighter, StickyNote as StickyIcon, Eraser, Sparkles, Square, Circle, Type } from 'lucide-react';

interface ToolbarProps {
  currentTool: ToolType;
  setTool: (t: ToolType) => void;
  onMagicReport: () => void;
  onIcebreaker: () => void;
  defaultFontSize: number;
  setDefaultFontSize: (size: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  currentTool, 
  setTool, 
  onMagicReport, 
  onIcebreaker,
  defaultFontSize,
  setDefaultFontSize
}) => {
  const tools = [
    { type: ToolType.CURSOR, icon: MousePointer2, label: 'Select' },
    { type: ToolType.STICKY, icon: StickyIcon, label: 'Sticky' },
    { type: ToolType.TEXT, icon: Type, label: 'Text' },
    { type: ToolType.PEN, icon: Pen, label: 'Pen' },
    { type: ToolType.MARKER, icon: PenTool, label: 'Marker' },
    { type: ToolType.HIGHLIGHTER, icon: Highlighter, label: 'Highlight' },
    { type: ToolType.RECTANGLE, icon: Square, label: 'Rectangle' },
    { type: ToolType.CIRCLE, icon: Circle, label: 'Circle' },
    { type: ToolType.ERASER, icon: Eraser, label: 'Clear' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 px-2 py-2 flex items-center gap-2 z-50">
      {tools.map((item) => (
        <button
          key={item.type}
          onClick={() => setTool(item.type)}
          className={`p-3 rounded-xl transition-all duration-200 group relative flex flex-col items-center justify-center w-12 h-12 ${
            currentTool === item.type
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title={item.label}
        >
          <item.icon size={20} />
          {/* Label Tooltip */}
          <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {item.label}
          </span>
        </button>
      ))}

      {/* Contextual Options: Text Size */}
      {currentTool === ToolType.TEXT && (
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 animate-in fade-in slide-in-from-left-2 duration-200">
           <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size</span>
             <input
               type="number"
               value={defaultFontSize}
               onChange={(e) => setDefaultFontSize(Number(e.target.value))}
               className="w-12 p-0.5 text-center text-sm font-bold border border-gray-200 bg-gray-50 rounded focus:ring-2 focus:ring-blue-500 outline-none"
               min={12}
               max={96}
             />
           </div>
        </div>
      )}

      <div className="w-px h-8 bg-gray-200 mx-1"></div>

      <button
        onClick={onIcebreaker}
        className="p-3 rounded-xl text-yellow-600 hover:bg-yellow-50 transition-colors relative group w-12 h-12 flex items-center justify-center"
      >
        <span className="text-xl">🧊</span>
         <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Icebreaker
          </span>
      </button>

      <button
        onClick={onMagicReport}
        className="ml-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
      >
        <Sparkles size={18} />
        <span className="hidden md:inline">Magic Report</span>
      </button>
    </div>
  );
};