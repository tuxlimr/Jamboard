import React, { useState, useRef, useEffect } from 'react';
import { TextObject, ToolType } from '../types';
import { Trash2, Minus, Plus } from 'lucide-react';

interface TextElementProps {
  data: TextObject;
  currentTool: ToolType;
  onUpdate: (id: string, updates: Partial<TextObject>) => void;
  onDelete: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  data,
  currentTool,
  onUpdate,
  onDelete,
  onMouseDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on creation or double click
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTool === ToolType.CURSOR) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    // If empty on blur, maybe delete? For now just keep it.
    setIsEditing(false);
    if (!data.content.trim()) {
      onDelete(data.id);
    }
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(128, data.fontSize + delta));
    onUpdate(data.id, { fontSize: newSize });
  };

  const fontClass = {
    sans: 'font-sans',
    serif: 'font-serif',
    handwriting: 'font-handwriting',
  }[data.fontFamily];

  return (
    <div
      className={`absolute flex flex-col group ${currentTool === ToolType.CURSOR ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      style={{
        left: data.x,
        top: data.y,
        zIndex: isEditing ? 50 : 5,
        minWidth: '100px'
      }}
      onMouseDown={(e) => {
        if (!isEditing) onMouseDown(e, data.id);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Editor Controls */}
      {isEditing && (
        <div className="absolute -top-12 left-0 bg-white shadow-xl border border-gray-200 rounded-lg flex items-center p-1.5 gap-2 z-50 animate-in fade-in zoom-in-95 duration-100">
           
           {/* Font Size Controls */}
           <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
             <button 
               onClick={() => adjustFontSize(-4)}
               className="p-1 hover:bg-gray-100 rounded text-gray-600"
             >
               <Minus size={12} />
             </button>
             <input
                type="number"
                value={data.fontSize}
                onChange={(e) => onUpdate(data.id, { fontSize: Number(e.target.value) })}
                className="w-10 text-center text-xs font-medium border-none outline-none bg-gray-50 rounded"
                min={12}
                max={128}
             />
             <button 
               onClick={() => adjustFontSize(4)}
               className="p-1 hover:bg-gray-100 rounded text-gray-600"
             >
               <Plus size={12} />
             </button>
           </div>

           <button 
             onClick={() => onUpdate(data.id, { fontFamily: 'sans' })}
             className={`px-2 py-1 text-xs rounded font-sans ${data.fontFamily === 'sans' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
           >
             Sans
           </button>
           <button 
             onClick={() => onUpdate(data.id, { fontFamily: 'serif' })}
             className={`px-2 py-1 text-xs font-serif rounded ${data.fontFamily === 'serif' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
           >
             Serif
           </button>
           <button 
             onClick={() => onUpdate(data.id, { fontFamily: 'handwriting' })}
             className={`px-2 py-1 text-xs font-handwriting rounded ${data.fontFamily === 'handwriting' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
           >
             Script
           </button>
           
           <div className="w-px h-4 bg-gray-200 mx-1"></div>
           
           <button 
             onClick={() => onDelete(data.id)}
             className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
           >
             <Trash2 size={14} />
           </button>
        </div>
      )}

      {/* Text Area / Display */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className={`bg-transparent outline-none resize text-gray-800 ${fontClass} overflow-hidden`}
          style={{ 
            fontSize: `${data.fontSize}px`,
            lineHeight: '1.2',
            minHeight: '1.5em',
            width: `${Math.max(200, data.content.length * (data.fontSize * 0.6))}px`,
            maxWidth: '600px'
          }}
          value={data.content}
          onChange={(e) => onUpdate(data.id, { content: e.target.value })}
          onBlur={handleBlur}
          placeholder="Type something..."
        />
      ) : (
        <div 
          className={`whitespace-pre-wrap text-gray-800 border border-transparent hover:border-blue-300 hover:border-dashed p-1 rounded ${fontClass}`}
          style={{ 
             fontSize: `${data.fontSize}px`, 
             lineHeight: '1.2' 
          }}
        >
          {data.content || <span className="opacity-50 italic">Text</span>}
        </div>
      )}
    </div>
  );
};