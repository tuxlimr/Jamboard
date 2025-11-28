import React, { useState, useRef, useEffect } from 'react';
import { Sticky, ToolType } from '../types';
import { ThumbsUp, Trash2 } from 'lucide-react';

interface StickyNoteProps {
  data: Sticky;
  currentTool: ToolType;
  onUpdate: (id: string, updates: Partial<Sticky>) => void;
  onDelete: (id: string) => void;
  onVote: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
}

const COLORS = {
  yellow: 'bg-yellow-200 border-yellow-300 shadow-yellow-100',
  blue: 'bg-blue-200 border-blue-300 shadow-blue-100',
  green: 'bg-green-200 border-green-300 shadow-green-100',
  pink: 'bg-pink-200 border-pink-300 shadow-pink-100',
  orange: 'bg-orange-200 border-orange-300 shadow-orange-100',
};

export const StickyNote: React.FC<StickyNoteProps> = ({
  data,
  currentTool,
  onUpdate,
  onDelete,
  onVote,
  onMouseDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTool === ToolType.CURSOR) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div
      className={`absolute w-48 h-48 p-4 shadow-lg rounded-sm transform transition-transform duration-75 flex flex-col group ${COLORS[data.color]} ${currentTool === ToolType.CURSOR ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      style={{
        left: data.x,
        top: data.y,
        transform: 'rotate(-1deg)', // Slight organic tilt
        zIndex: isEditing ? 50 : 10,
      }}
      onMouseDown={(e) => {
        if (!isEditing) onMouseDown(e, data.id);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Vote Badge */}
      {data.votes > 0 && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-sm z-20 border-2 border-white animate-bounce-short">
          {data.votes}
        </div>
      )}

      {/* Content */}
      <div className="flex-grow overflow-hidden font-handwriting text-lg leading-snug text-gray-800">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent resize-none outline-none placeholder-gray-500"
            value={data.content}
            onChange={(e) => onUpdate(data.id, { content: e.target.value })}
            onBlur={handleBlur}
            placeholder="Type your idea..."
          />
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {data.content || <span className="text-gray-400 italic">Empty note...</span>}
          </div>
        )}
      </div>

      {/* Action Bar (Visible on hover/focus) */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
          className="p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
        
        <div className="flex space-x-1">
           {/* Color Picker Mini */}
           {(['yellow', 'blue', 'pink'] as const).map(c => (
             <button
                key={c}
                onClick={(e) => { e.stopPropagation(); onUpdate(data.id, { color: c }); }}
                className={`w-4 h-4 rounded-full border border-gray-300 ${COLORS[c].split(' ')[0]}`}
             />
           ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onVote(data.id); }}
          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors relative"
          title="Vote"
        >
          <ThumbsUp size={16} />
        </button>
      </div>
    </div>
  );
};