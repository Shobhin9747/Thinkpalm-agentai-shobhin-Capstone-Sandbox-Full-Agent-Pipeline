'use client';

import React, { useState, useEffect } from 'react';
import PromptEditor from '@/components/PromptEditor';
import ComponentPreview from '@/components/ComponentPreview';
import CodeExporter from '@/components/CodeExporter';

interface HistoryItem {
  id: string;
  code: string;
  prd: string;
  structuredJson?: any;
  timestamp: number;
  title: string;
}

const Icons = {
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-cyan-400">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
    </svg>
  ),
  Cpu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M20 15h2" /><path d="M9 2v2" /><path d="M9 20v2" /><path d="M2 9h2" /><path d="M20 9h2" />
    </svg>
  ),
  Database: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Layers: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m2.6 11.23 8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9" /><path d="m2.6 16.23 8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Terminal: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-cyan-400">
      <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-red-400">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
};

export default function Home() {
  const [prd, setPrd] = useState('');
  const [structuredJson, setStructuredJson] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'analyzer' | 'preview' | 'code'>('preview');
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let sid = localStorage.getItem('ai_agent_session_id');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(7);
      localStorage.setItem('ai_agent_session_id', sid);
    }
    setSessionId(sid);

    // Load Server Memory
    fetch('/api/memory')
      .then(r => r.json())
      .then(d => {
        if (d.history) setHistory(d.history);
      })
      .catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!prd.trim()) return;

    setIsGenerating(true);
    setStatusMessage('AGENT 1 [PRD Analyzer]: Extracting Requirements...');
    setActiveTab('analyzer');
    setStructuredJson('');
    setGeneratedCode('');

    try {
      // Step 1: Analyzer Agent Call
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd, sessionId }),
      });
      const analyzeData = await analyzeRes.json();
      
      if (!analyzeRes.ok) throw new Error(analyzeData.error);
      
      setStructuredJson(JSON.stringify(analyzeData.data, null, 2));

      setStatusMessage('AGENT 2 [UI Generator]: Synthesizing Components...');
      
      // Step 2: Generator Agent Call
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prd, 
          structuredJson: analyzeData.data,
          sessionId 
        }),
      });
      const generateData = await generateRes.json();
      
      if (!generateRes.ok) throw new Error(generateData.error);

      if (generateData.code) {
        setStatusMessage('TOOLS: Preview & Export Functions Executed...');
        await new Promise(r => setTimeout(r, 800));

        setGeneratedCode(generateData.code);
        setActiveTab('preview');

        const newItem: HistoryItem = {
          id: Math.random().toString(36).substring(7),
          code: generateData.code,
          structuredJson: analyzeData.data,
          prd: prd,
          timestamp: Date.now(),
          title: prd.slice(0, 30) + (prd.length > 30 ? '...' : '')
        };
        
        // Save Server Memory
        await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: newItem })
        });

        setHistory(prev => [newItem, ...prev]);
        setSelectedHistoryId(newItem.id);
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      setStatusMessage(error.message || 'ERROR: Pipeline interrupted.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPrd(item.prd);
    if (item.structuredJson) setStructuredJson(JSON.stringify(item.structuredJson, null, 2));
    setGeneratedCode(item.code);
    setSelectedHistoryId(item.id);
    setActiveTab('preview');
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Delete from Server Memory
    await fetch('/api/memory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    
    setHistory(prev => prev.filter(item => item.id !== id));
    if (selectedHistoryId === id) setSelectedHistoryId(null);
  };

  return (
    <main className="relative h-screen flex flex-col overflow-hidden bg-[#030408] font-sans selection:bg-cyan-500/30">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* FIXED TOP HEADER */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Icons.Logo />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tighter text-white uppercase">
              Agentic <span className="text-cyan-400">Pipeline</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                {statusMessage || 'System Operational'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 glass-morphism rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Icons.Cpu /> AGENT_SWARM_V1.0
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT BODY */}
      <div className="flex-1 flex overflow-hidden">

        {/* SIDEBAR: HISTORY */}
        <aside className="w-16 md:w-20 bg-black/40 border-r border-white/5 flex flex-col items-center py-6 gap-6 shrink-0 z-40 relative">
          <div className="flex-1 w-full flex flex-col items-center gap-4 overflow-y-auto custom-scrollbar px-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                title={item.title}
                className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${selectedHistoryId === item.id
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                  }`}
              >
                <Icons.History />
                <div
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500/90 p-0.5 rounded-full hover:scale-110 transition-all"
                >
                  <Icons.Trash />
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENT AREA: EDITOR + PREVIEW */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* EDITOR PANEL (Left) */}
          <section className="w-full md:w-[400px] border-r border-white/5 flex flex-col shrink-0 bg-[#030408]/40">
            <PromptEditor
              prd={prd}
              setPrd={setPrd}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </section>

          {/* PREVIEW/CODE PANEL (Right) */}
          <section className="flex-1 flex flex-col min-w-0 bg-black/20">
            {/* Nav Tabs */}
            <div className="h-14 overflow-x-auto custom-scrollbar flex items-center justify-between px-6 border-b border-white/5 bg-black/40 shrink-0">
              <div className="flex p-1 bg-[#10141d] rounded-xl border border-white/10 shrink-0">
                <button
                  onClick={() => setActiveTab('analyzer')}
                  className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analyzer'
                    ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <Icons.Database /> Analyzer JSON
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview'
                    ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <Icons.Eye /> Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'code'
                    ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <Icons.Terminal /> Export
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap ml-4">
                <Icons.Sparkles /> Pipeline Active
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 relative overflow-hidden">
              {activeTab === 'analyzer' && (
                <div className="h-full w-full p-6 overflow-y-auto custom-scrollbar animate-in fade-in duration-500 bg-[#0a0a0f]">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Agent 1 Output (Structured Memory)
                  </h2>
                  <pre className="text-sm text-cyan-300 font-mono whitespace-pre-wrap">
                    {structuredJson ? structuredJson : "// Waiting for Analyzer Agent output..."}
                  </pre>
                </div>
              )}
              {activeTab === 'preview' && (
                <div className="h-full animate-in fade-in duration-500">
                  <ComponentPreview code={generatedCode} isGenerating={isGenerating} />
                </div>
              )}
              {activeTab === 'code' && (
                <div className="h-full animate-in scale-in duration-500">
                  <CodeExporter code={generatedCode} />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
