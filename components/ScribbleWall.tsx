import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';

interface ScribbleWallProps {
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (text: string) => void;
  users: User[];
}

export const ScribbleWall: React.FC<ScribbleWallProps> = ({
  messages,
  currentUser,
  onSendMessage,
  users,
}) => {
  const [inputText, setInputText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUser = (id: string) => users.find((u) => u.id === id) || { name: 'Unknown', color: 'bg-gray-400' };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-80">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <MessageSquare size={20} className="text-purple-600" />
        <h2 className="font-bold text-gray-800">Scribble Wall</h2>
        <span className="text-xs font-medium px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            <p>No scribbles yet.</p>
            <p>Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const author = getUser(msg.authorId);
          const isMe = msg.authorId === currentUser.id;

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1 mb-1">
                {!isMe && (
                  <div className={`w-4 h-4 rounded-full ${author.color} flex items-center justify-center text-[8px] text-white font-bold`}>
                    {author.name[0]}
                  </div>
                )}
                <span className="text-xs text-gray-500">{isMe ? 'You' : author.name}</span>
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a scribble..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};