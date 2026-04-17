'use client';

import React, { useState } from 'react';

const Icons = {
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-cyan-400">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Monitor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  ),
  Tablet: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect width="16" height="20" x="4" y="2" rx="2" /><line x1="12" x2="12" y1="18" y2="18" />
    </svg>
  ),
  Smartphone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect width="10" height="18" x="7" y="3" rx="2" /><line x1="12" x2="12" y1="18" y2="18" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
};

interface ComponentPreviewProps {
  code: string;
  isGenerating: boolean;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ code, isGenerating }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px'
  };

  const wrapCode = (rawCode: string) => {
    if (!rawCode) return `
      <!DOCTYPE html><html><body style="background:#030408;color:#475569;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;margin:0;">
        Architect: System Awaiting Payload...
      </body></html>
    `;

    // 1. Remove imports entirely
    let scriptCode = rawCode.replace(/import\s+.*?[\w{}*]+.*?from\s+['"].*?['"];?/g, '');
    scriptCode = scriptCode.replace(/import\s+['"].*?['"];?/g, '');
    
    // 2. Find the default export target and strip the "export default" syntax
    let renderTarget = "App"; // default guess
    const exportFunctionMatch = scriptCode.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
    
    if (exportFunctionMatch) {
      renderTarget = exportFunctionMatch[1];
      scriptCode = scriptCode.replace(/export\s+default\s+function/, 'function');
    } else {
      const exportVarMatch = scriptCode.match(/export\s+default\s+([A-Za-z0-9_]+)/);
      if (exportVarMatch) {
         renderTarget = exportVarMatch[1];
         scriptCode = scriptCode.replace(new RegExp(`export\\s+default\\s+${exportVarMatch[1]};?`, 'g'), '');
      }
    }

    const shim = `
      const { useState, useEffect, useRef, useMemo, useCallback } = React;
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              background: #030408; 
              margin: 0; 
              color: white; 
              overflow-x: hidden;
            }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          </style>
          
          <!-- React + Babel Standalone -->
          <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head>
        <body class="p-0 m-0">
          <div id="app-root" class="animate-in fade-in h-screen w-screen"></div>
          
          <script type="text/babel">
            try {
              ${shim}
              ${scriptCode}
              
              const CustomComponent = ${renderTarget};
              const root = ReactDOM.createRoot(document.getElementById('app-root'));
              root.render(<CustomComponent />);
            } catch (err) {
              console.error("Pipeline render error", err);
              document.getElementById('app-root').innerHTML = 
                '<div style="color:#ef4444; padding: 20px; font-family: monospace; font-size: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); margin: 20px; border-radius: 8px;">' + 
                '<strong>UI Synthesis Evaluation Error:</strong><br><br>' + err.toString() + 
                '</div>';
            }
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div className="flex flex-col h-full bg-[#030408]/50 overflow-hidden">
      {/* Toolrail Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              title="Desktop View"
            >
              <Icons.Monitor />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'tablet' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              title="Tablet View"
            >
              <Icons.Tablet />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              title="Mobile View"
            >
              <Icons.Smartphone />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">
            <Icons.Refresh /> RE-RENDER
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${isGenerating ? 'border-orange-500/30 text-orange-400 bg-orange-500/5' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'}`}>
            <Icons.Activity /> {isGenerating ? 'Synthesizing' : 'Live Render'}
          </div>
        </div>
      </div>

      {/* Main Preview Container with 'Device Bracket' */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-black/20 custom-scrollbar relative">
        {!code && !isGenerating ? (
          <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-98 duration-700">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center shimmer">
              <Icons.Eye />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-[0.3em]">Architect Node Ready</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Awaiting PRD to generate UI tree</p>
            </div>
          </div>
        ) : (
          <div
            className="relative glass border-[12px] border-[#141822] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-700 ease-in-out"
            style={{ width: viewportWidths[viewMode], height: 'fit-content', minHeight: '600px' }}
          >
            {/* Device Status Bar Mockup */}
            <div className="h-8 bg-[#141822] flex items-center justify-between px-8 border-b border-white/5">
              <div className="text-[9px] font-mono text-slate-500 tracking-widest">UI_SYNTHESIS_V1.0</div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-700" />
              </div>
            </div>

            {/* Loader Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 z-50 bg-[#030408]/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] animate-pulse">Building Surface...</p>
              </div>
            )}

            <iframe
              key={code}
              srcDoc={wrapCode(code)}
              className="w-full h-full border-none min-h-[570px]"
              title="Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentPreview;
