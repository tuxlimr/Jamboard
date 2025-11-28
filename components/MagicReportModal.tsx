import React from 'react';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming we'd usually use this, but for zero-dep we will just use whitespace-pre-wrap

interface MagicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  reportContent: string | null;
}

export const MagicReportModal: React.FC<MagicReportModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  reportContent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              ✨ Magic Report
            </h2>
            <p className="text-purple-100 text-sm mt-1 opacity-90">Auto-generated session summary</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-gray-500">
              <Loader2 size={48} className="animate-spin text-purple-600" />
              <p className="text-lg font-medium animate-pulse">Consulting the AI wizards...</p>
              <p className="text-sm">Analyzing sticky notes, scribbles, and votes.</p>
            </div>
          ) : (
            <div className="prose prose-purple max-w-none">
              <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                {reportContent}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
            <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Share2 size={18} />
              Share
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium flex items-center gap-2 shadow-md transition-colors"
             onClick={() => alert("Simulated PDF Download Started!")}>
              <Download size={18} />
              Export PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};