'use client';

import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeExporterProps {
  code: string;
}

const Icons = {
  FileCode: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-400">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-400">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  ),
  Terminal: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 opacity-20">
      <polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>
    </svg>
  )
};

const CodeExporter: React.FC<CodeExporterProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      setTimeout(() => Prism.highlightAll(), 100);
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'GeneratedUI.tsx';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-[#010204]">
      {/* Toolrail Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Icons.FileCode />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Source Payload</span>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
              copied 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {copied ? <Icons.Check /> : <Icons.Copy />}
            {copied ? 'COMPLETED' : 'COPY'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-purple-500 shadow-lg shadow-purple-900/40"
          >
            <Icons.Download /> EXPORT
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-hidden relative custom-scrollbar">
        <div className="absolute top-8 right-8 pointer-events-none">
          <Icons.Terminal />
        </div>
        
        <div className="h-full overflow-auto p-8 font-mono">
          {code ? (
            <pre className="m-0 !bg-transparent !p-0">
              <code className="language-tsx text-[12px] leading-relaxed tracking-tight !bg-transparent">
                {code}
              </code>
            </pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
               <div className="w-12 h-12 border-2 border-dashed border-slate-700 mb-4 rounded-xl flex items-center justify-center">
                 <div className="w-6 h-1 bg-slate-700 rounded-full" />
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Wait for synthesis to view architecture</p>
            </div>
          )}
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default CodeExporter;
