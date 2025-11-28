import React, { useState, useEffect, useRef } from 'react';
import { User, Sticky, ToolType, DrawPath, ChatMessage, Point, Shape, TextObject } from './types';
import { generateIcebreaker, generateMagicReport } from './services/geminiService';
import { StickyNote } from './components/StickyNote';
import { TextElement } from './components/TextElement';
import { ScribbleWall } from './components/ScribbleWall';
import { Toolbar } from './components/Toolbar';
import { MagicReportModal } from './components/MagicReportModal';
import { Clock, Users, Menu } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Initial Data
const INITIAL_USERS: User[] = [
  { id: 'me', name: 'Me', color: 'bg-indigo-600' },
  { id: 'u1', name: 'Guest Panda', color: 'bg-emerald-500', avatar: 'https://picsum.photos/32/32?random=1' },
  { id: 'u2', name: 'Guest Llama', color: 'bg-orange-500', avatar: 'https://picsum.photos/32/32?random=2' },
];

export default function App() {
  // --- State ---
  const [currentUser] = useState<User>(INITIAL_USERS[0]);
  const [stickies, setStickies] = useState<Sticky[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [texts, setTexts] = useState<TextObject[]>([]);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.CURSOR);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [showScribbleWall, setShowScribbleWall] = useState(true);
  const [timer, setTimer] = useState<number | null>(null);
  const [defaultFontSize, setDefaultFontSize] = useState<number>(24);

  // --- Interaction Refs ---
  const isDragging = useRef(false);
  const draggedItemId = useRef<string | null>(null);
  const draggedItemType = useRef<'sticky' | 'text' | null>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });
  
  const isDrawing = useRef(false);
  const currentPathId = useRef<string | null>(null);
  const currentShapeId = useRef<string | null>(null);
  const startPoint = useRef<Point>({ x: 0, y: 0 });

  // --- Effects ---
  useEffect(() => {
    // Simulate some initial content
    setStickies([
      { id: '1', x: 100, y: 100, content: 'Welcome to JamBoard AI!', color: 'yellow', authorId: 'system', votes: 5 },
      { id: '2', x: 350, y: 150, content: 'Try dragging me around', color: 'blue', authorId: 'system', votes: 2 },
    ]);
  }, []);

  useEffect(() => {
    let interval: number;
    if (timer && timer > 0) {
      interval = window.setInterval(() => setTimer(t => (t ? t - 1 : 0)), 1000);
    } else if (timer === 0) {
      // Timer finished - Simulate confetti or alert
      alert("Time's up! ⏰");
      setTimer(null);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Handlers ---

  // Generic Drag Start
  const handleItemMouseDown = (e: React.MouseEvent, id: string, type: 'sticky' | 'text') => {
    if (currentTool !== ToolType.CURSOR) return;
    e.stopPropagation();
    isDragging.current = true;
    draggedItemId.current = id;
    draggedItemType.current = type;

    let itemX = 0;
    let itemY = 0;

    if (type === 'sticky') {
      const item = stickies.find(s => s.id === id);
      if (item) { itemX = item.x; itemY = item.y; }
    } else if (type === 'text') {
      const item = texts.find(t => t.id === id);
      if (item) { itemX = item.x; itemY = item.y; }
    }

    dragOffset.current = {
      x: e.clientX - itemX,
      y: e.clientY - itemY,
    };
  };

  // Sticky Specific Wrappers
  const updateSticky = (id: string, updates: Partial<Sticky>) => {
    setStickies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteSticky = (id: string) => setStickies(prev => prev.filter(s => s.id !== id));
  const voteSticky = (id: string) => setStickies(prev => prev.map(s => s.id === id ? { ...s, votes: s.votes + 1 } : s));

  // Text Specific Wrappers
  const updateText = (id: string, updates: Partial<TextObject>) => {
    setTexts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const deleteText = (id: string) => setTexts(prev => prev.filter(t => t.id !== id));

  // Canvas/Board Interaction
  const handleBoardMouseDown = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    startPoint.current = { x: clientX, y: clientY };

    if (currentTool === ToolType.STICKY) {
      const newSticky: Sticky = {
        id: generateId(),
        x: clientX - 100,
        y: clientY - 100,
        content: '',
        color: 'yellow',
        authorId: currentUser.id,
        votes: 0,
      };
      setStickies(prev => [...prev, newSticky]);
      setCurrentTool(ToolType.CURSOR);
    } 
    else if (currentTool === ToolType.TEXT) {
      const newText: TextObject = {
        id: generateId(),
        x: clientX,
        y: clientY,
        content: '', // Start empty to trigger placeholder
        color: '#1f2937',
        fontSize: defaultFontSize,
        fontFamily: 'handwriting', // Default to handwriting for jams
        authorId: currentUser.id,
      };
      setTexts(prev => [...prev, newText]);
      setCurrentTool(ToolType.CURSOR);
      // Logic to auto-edit would go here, handled by auto-focus in TextElement
    }
    else if ([ToolType.RECTANGLE, ToolType.CIRCLE].includes(currentTool)) {
      isDrawing.current = true;
      const id = generateId();
      currentShapeId.current = id;
      
      const newShape: Shape = {
        id,
        type: currentTool === ToolType.RECTANGLE ? 'rect' : 'circle',
        x: clientX,
        y: clientY,
        width: 0,
        height: 0,
        color: 'transparent', // Wireframe style by default
      };
      setShapes(prev => [...prev, newShape]);
    }
    else if ([ToolType.PEN, ToolType.MARKER, ToolType.HIGHLIGHTER].includes(currentTool)) {
      isDrawing.current = true;
      const id = generateId();
      currentPathId.current = id;

      // Define pen styles
      let width = 3;
      let color = '#1e293b'; 
      let opacity = 1.0;

      if (currentTool === ToolType.MARKER) {
        width = 8;
        color = '#334155';
      } else if (currentTool === ToolType.HIGHLIGHTER) {
        width = 24;
        color = '#facc15';
        opacity = 0.4;
      }

      const newPath: DrawPath = {
        id,
        points: [{ x: clientX, y: clientY }],
        color,
        width,
        opacity,
      };
      setPaths(prev => [...prev, newPath]);
    }
  };

  const handleBoardMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;

    // Dragging Items
    if (isDragging.current && draggedItemId.current) {
      const newX = clientX - dragOffset.current.x;
      const newY = clientY - dragOffset.current.y;

      if (draggedItemType.current === 'sticky') {
        setStickies(prev => prev.map(s => s.id === draggedItemId.current ? { ...s, x: newX, y: newY } : s));
      } else if (draggedItemType.current === 'text') {
        setTexts(prev => prev.map(t => t.id === draggedItemId.current ? { ...t, x: newX, y: newY } : t));
      }
    } 
    // Drawing Paths
    else if (isDrawing.current && currentPathId.current) {
      setPaths(prev => prev.map(p => {
        if (p.id === currentPathId.current) {
          return { ...p, points: [...p.points, { x: clientX, y: clientY }] };
        }
        return p;
      }));
    }
    // Drawing Shapes
    else if (isDrawing.current && currentShapeId.current) {
      setShapes(prev => prev.map(s => {
        if (s.id === currentShapeId.current) {
          const startX = startPoint.current.x;
          const startY = startPoint.current.y;
          const width = Math.abs(clientX - startX);
          const height = Math.abs(clientY - startY);
          const x = Math.min(clientX, startX);
          const y = Math.min(clientY, startY);
          return { ...s, x, y, width, height };
        }
        return s;
      }));
    }
  };

  const handleBoardMouseUp = () => {
    isDragging.current = false;
    draggedItemId.current = null;
    draggedItemType.current = null;
    isDrawing.current = false;
    currentPathId.current = null;
    currentShapeId.current = null;
  };

  // Chat/Scribble Wall
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: generateId(),
      authorId: currentUser.id,
      content: text,
      timestamp: Date.now(),
      reactions: []
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // AI Features
  const handleGenerateReport = async () => {
    setIsReportOpen(true);
    if (!reportContent) {
      setIsGeneratingReport(true);
      const report = await generateMagicReport("Design Sprint Q1", stickies, messages);
      setReportContent(report);
      setIsGeneratingReport(false);
    }
  };

  const handleIcebreaker = async () => {
    const loadingId = generateId();
    setMessages(prev => [...prev, {
      id: loadingId, authorId: 'system', content: '🧊 Breaking the ice...', timestamp: Date.now(), reactions: []
    }]);

    const question = await generateIcebreaker();
    setMessages(prev => prev.map(m => m.id === loadingId ? {
      ...m, content: `🧊 Icebreaker: ${question}`
    } : m));
  };

  const toggleTimer = () => {
    if (timer) {
      setTimer(null);
    } else {
      setTimer(60 * 5); // 5 minutes
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-dot-pattern relative text-gray-900 select-none">
      
      {/* --- Top Bar --- */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            JB
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Q1 Design Sprint</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Session
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${timer ? 'bg-red-50 border-red-200 text-red-600 font-mono font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Clock size={16} />
            {timer ? formatTime(timer) : 'Start Timer'}
          </button>

          <div className="flex -space-x-2">
            {INITIAL_USERS.map((u, i) => (
              <div key={u.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold ${u.color} shadow-sm z-[${10-i}]`} title={u.name}>
                 {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full" /> : u.name[0]}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400 text-xs hover:border-gray-400 cursor-pointer">
              +
            </div>
          </div>

          <button 
            onClick={() => setShowScribbleWall(!showScribbleWall)}
            className={`p-2 rounded-lg transition-colors ${showScribbleWall ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex overflow-hidden pt-16 relative">
        
        {/* Board Canvas */}
        <div 
          className="flex-1 relative overflow-hidden touch-none"
          onMouseDown={handleBoardMouseDown}
          onMouseMove={handleBoardMouseMove}
          onMouseUp={handleBoardMouseUp}
          onMouseLeave={handleBoardMouseUp}
          style={{ 
            cursor: [ToolType.PEN, ToolType.MARKER, ToolType.HIGHLIGHTER, ToolType.RECTANGLE, ToolType.CIRCLE, ToolType.TEXT].includes(currentTool) ? 'crosshair' : 'default' 
          }}
        >
          {/* SVG Drawing Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
             {/* Paths */}
             {paths.map(path => (
               <polyline
                 key={path.id}
                 points={path.points.map(p => `${p.x},${p.y}`).join(' ')}
                 stroke={path.color}
                 strokeWidth={path.width}
                 strokeOpacity={path.opacity ?? 0.9}
                 fill="none"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               />
             ))}

             {/* Shapes */}
             {shapes.map(shape => {
               if (shape.type === 'rect') {
                 return (
                   <rect
                     key={shape.id}
                     x={shape.x}
                     y={shape.y}
                     width={shape.width}
                     height={shape.height}
                     fill="transparent"
                     stroke="#334155" // Slate 700
                     strokeWidth="3"
                     strokeLinecap="round"
                     rx="4" // Rounded corners for whiteboard feel
                   />
                 );
               } else {
                 return (
                   <ellipse
                     key={shape.id}
                     cx={shape.x + shape.width / 2}
                     cy={shape.y + shape.height / 2}
                     rx={shape.width / 2}
                     ry={shape.height / 2}
                     fill="transparent"
                     stroke="#334155"
                     strokeWidth="3"
                   />
                 );
               }
             })}
          </svg>

          {/* Stickies */}
          {stickies.map(sticky => (
            <StickyNote
              key={sticky.id}
              data={sticky}
              currentTool={currentTool}
              onUpdate={updateSticky}
              onDelete={deleteSticky}
              onVote={voteSticky}
              onMouseDown={(e, id) => handleItemMouseDown(e, id, 'sticky')}
            />
          ))}

          {/* Text Elements */}
          {texts.map(text => (
            <TextElement
              key={text.id}
              data={text}
              currentTool={currentTool}
              onUpdate={updateText}
              onDelete={deleteText}
              onMouseDown={(e, id) => handleItemMouseDown(e, id, 'text')}
            />
          ))}

          {/* Hint Overlay if Empty */}
          {stickies.length === 0 && paths.length === 0 && shapes.length === 0 && texts.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-300">Start jamming!</h3>
                  <p className="text-gray-400">Select a tool below to begin.</p>
                </div>
             </div>
          )}
        </div>

        {/* Scribble Wall Sidebar */}
        {showScribbleWall && (
           <div className="w-80 h-full flex-shrink-0 animate-in slide-in-from-right duration-300 z-30">
             <ScribbleWall
               messages={messages}
               currentUser={currentUser}
               onSendMessage={handleSendMessage}
               users={INITIAL_USERS}
             />
           </div>
        )}
      </div>

      {/* --- Floating Toolbar --- */}
      <Toolbar 
        currentTool={currentTool} 
        setTool={setCurrentTool} 
        onMagicReport={handleGenerateReport}
        onIcebreaker={handleIcebreaker}
        defaultFontSize={defaultFontSize}
        setDefaultFontSize={setDefaultFontSize}
      />

      {/* --- Modals --- */}
      <MagicReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        isLoading={isGeneratingReport}
        reportContent={reportContent}
      />

    </div>
  );
}