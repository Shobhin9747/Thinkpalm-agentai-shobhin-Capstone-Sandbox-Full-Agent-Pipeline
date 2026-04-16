'use client';

import React from 'react';

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
  )
};

const PromptEditor: React.FC<PromptEditorProps> = ({
  prd,
  setPrd,
  onGenerate,
  isGenerating
}) => {
  return (
    <div className="flex flex-col h-full p-6 space-y-8">
      {/* Segment Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Icons.Sparkles />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">Architect Input</h2>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Define Structure & Requirements</p>
        </div>
      </div>

      {/* Primary Input Container */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] px-1 italic">PRD & Feature Tree</label>
        <div className="flex-1 relative group">
          <textarea
            value={prd}
            onChange={(e) => setPrd(e.target.value)}
            placeholder="Describe the application, page structure, or specific feature components..."
            className="w-full h-full bg-black/40 border border-white/10 focus:border-cyan-500/30 p-8 text-slate-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all duration-500 resize-none font-mono text-xs leading-loose placeholder:text-slate-700 custom-scrollbar shadow-inner"
          />
          <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-10 transition-opacity pointer-events-none">
            <div className="w-12 h-px bg-white" />
            <div className="w-8 h-px bg-white mt-1.5 ml-4" />
          </div>
        </div>
      </div>

      {/* Action Button Hub */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest space-x-3">
          <span>{prd.length} UTF-8</span>
          <span className="opacity-40">{isGenerating ? 'Synthesizing' : 'Pipeline Ready'}</span>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !prd.trim()}
          className="relative px-8 py-3 rounded-2xl bg-cyan-600 font-black text-white text-[11px] uppercase tracking-widest shadow-xl shadow-cyan-900/40 active:scale-95 hover:bg-cyan-500 hover:shadow-cyan-500/30 disabled:opacity-30 transition-all duration-500 group"
        >
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="group-hover:scale-110 transition-transform">
                <Icons.Zap />
              </div>
            )}
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Design'}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PromptEditor;
