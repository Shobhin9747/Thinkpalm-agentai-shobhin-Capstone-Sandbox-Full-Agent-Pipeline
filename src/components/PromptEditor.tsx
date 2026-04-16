'use client';

import React, { useState, useRef } from 'react';

interface PromptEditorProps {
  prd: string;
  setPrd: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const Icons = {
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-cyan-400">
      <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
};

const PromptEditor: React.FC<PromptEditorProps> = ({
  prd,
  setPrd,
  onGenerate,
  isGenerating
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await readFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await readFile(file);
    }
  };

  const readFile = async (file: File) => {
    try {
      const text = await file.text();
      setPrd(text);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Segment Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <Icons.Sparkles />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Architect Input</h2>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Upload or Paste PRD Document</p>
        </div>
      </div>

      {/* Primary Input Container */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] px-1 italic">PRD Content</label>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/20 transition-all uppercase tracking-widest"
          >
            <Icons.Upload /> Upload File
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept=".txt,.md,.json,.csv"
          />
        </div>
        
        <div 
          className="flex-1 relative group"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            value={prd}
            onChange={(e) => setPrd(e.target.value)}
            placeholder="Drag & Drop a Product Requirements Document (PRD) file here, or paste its contents directly..."
            className={`w-full h-full bg-black/40 border p-8 text-slate-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all duration-500 resize-none font-mono text-xs leading-loose placeholder:text-slate-700 custom-scrollbar shadow-inner ${isDragging ? 'border-cyan-500/80 bg-cyan-500/5' : 'border-white/10 focus:border-cyan-500/30'}`}
          />
          <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-10 transition-opacity pointer-events-none">
            <div className="w-12 h-px bg-white" />
            <div className="w-8 h-px bg-white mt-1.5 ml-4" />
          </div>
          
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm border-2 border-dashed border-cyan-500 rounded-lg pointer-events-none">
              <p className="text-cyan-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <Icons.Upload /> Drop to read document
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Button Hub */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest space-x-3">
          <span>{prd.length} UTF-8</span>
          <span className="opacity-40">{isGenerating ? 'Analyzing PRD' : 'Pipeline Ready'}</span>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !prd.trim()}
          className="relative px-8 py-3 rounded-2xl bg-cyan-600 font-black text-white text-[11px] uppercase tracking-widest shadow-xl shadow-cyan-900/40 active:scale-95 hover:bg-cyan-500 hover:shadow-cyan-500/30 disabled:opacity-30 transition-all duration-500 group shrink-0"
        >
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="group-hover:scale-110 transition-transform">
                <Icons.Zap />
              </div>
            )}
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Component Tree'}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PromptEditor;

