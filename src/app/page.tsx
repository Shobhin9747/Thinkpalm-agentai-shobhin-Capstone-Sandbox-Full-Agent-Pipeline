'use client';

import React, { useState, useEffect } from 'react';
import PromptEditor from '@/components/PromptEditor';
import ComponentPreview from '@/components/ComponentPreview';
import CodeExporter from '@/components/CodeExporter';

interface HistoryItem {
  id: string;
  code: string;
  prd: string;
  timestamp: number;
  title: string;
}

interface TraceItem {
  agent: 'orchestrator' | 'architect' | 'developer';
  action: string;
  ts: number;
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
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [trace, setTrace] = useState<TraceItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const latestTrace = trace.length ? trace[trace.length - 1] : null;

  const displayStatus = (() => {
    if (errorMessage) return `ERROR: ${errorMessage}`;
    if (isGenerating) return latestTrace ? `${latestTrace.agent.toUpperCase()}: ${latestTrace.action}` : 'ORCHESTRATOR: Starting tool loop...';
    if (latestTrace) return `${latestTrace.agent.toUpperCase()}: ${latestTrace.action}`;
    return 'System Operational';
  })();

  const formatTraceLabel = (item: TraceItem) =>
    `${item.agent.toUpperCase()} / ${item.action.replaceAll('_', ' ')}`;

  const toggleTrace = () => setIsTraceOpen((v) => !v);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('ai_ui_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const nextSessionId = crypto.randomUUID();
      localStorage.setItem('ai_ui_session_id', nextSessionId);
      setSessionId(nextSessionId);
    }

    const saved = localStorage.getItem('ai_ui_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_ui_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prd.trim() || !sessionId) return;

    setIsGenerating(true);
    setTrace([]);
    setErrorMessage('');
    setIsTraceOpen(true);
    setStatusMessage('');

    const currentPrd = prd;

    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ prd: currentPrd, sessionId }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Pipeline request failed');
      }

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let doneReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const normalized = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '');
        const parts = normalized.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n').map((l) => l.trim());
          let eventType = 'message';
          const dataLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice('event:'.length).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.slice('data:'.length).trim());
            }
          }

          const dataStr = dataLines.join('\n');
          if (!dataStr) continue;

          let payload: unknown = null;
          try {
            payload = JSON.parse(dataStr) as unknown;
          } catch {
            continue;
          }

          const payloadObj =
            payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;

          if (eventType === 'trace') {
            const item = payload as TraceItem;
            if (item && item.agent && item.action) {
              setTrace((prev) => [...prev, item]);
            }
          }

          if (eventType === 'done') {
            doneReceived = true;
            const code = payloadObj?.code;
            if (typeof code === 'string') {
              setGeneratedCode(code);
              setActiveTab('preview');

              const newItem: HistoryItem = {
                id: Math.random().toString(36).substring(7),
                code,
                prd: currentPrd,
                timestamp: Date.now(),
                title: currentPrd.slice(0, 30) + (currentPrd.length > 30 ? '...' : '')
              };
              setHistory((prev) => [newItem, ...prev]);
              setSelectedHistoryId(newItem.id);
            }
          }

          if (eventType === 'error') {
            const message = typeof payloadObj?.message === 'string' ? payloadObj.message : 'Synthesis failed';
            setErrorMessage(message);
            setIsGenerating(false);
            setStatusMessage('');
          }
        }
      }

      if (!doneReceived) {
        setErrorMessage('Pipeline ended without final code');
      }

      setIsGenerating(false);
      setStatusMessage('');
    } catch (error) {
      console.error('Generation failed:', error);
      const message = error instanceof Error ? error.message : 'Pipeline interrupted.';
      setErrorMessage(message);
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPrd(item.prd);
    setGeneratedCode(item.code);
    setSelectedHistoryId(item.id);
    setActiveTab('preview');
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
                {statusMessage || displayStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 glass-morphism rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Icons.Cpu /> ENGINE_V2.0
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
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 shrink-0">
              <div className="flex p-1 bg-[#10141d] rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview'
                    ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <Icons.Eye /> Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'code'
                    ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <Icons.Terminal /> Code
                </button>
              </div>

              <div className="relative hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTrace}
                  className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <Icons.Sparkles /> {latestTrace ? formatTraceLabel(latestTrace) : 'Synthesis v2.1'}
                </button>

                {isTraceOpen && trace.length > 0 ? (
                  <div className="absolute right-0 top-full mt-2 w-[280px] max-h-[260px] overflow-y-auto custom-scrollbar rounded-xl border border-white/10 bg-[#0b0f18] shadow-[0_0_30px_rgba(0,0,0,0.6)] p-3 z-50">
                    <div className="px-1 py-1">
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">Trace Actions</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {trace.map((item) => (
                        <div
                          key={`${item.agent}-${item.action}-${item.ts}`}
                          className="px-2 py-2 rounded-lg bg-white/5 border border-white/10"
                        >
                          <p className="text-[9px] text-cyan-300 font-black uppercase tracking-wide">{item.agent}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wide">
                            {item.action.replaceAll('_', ' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 relative overflow-hidden">
              {activeTab === 'preview' ? (
                <div className="h-full animate-in fade-in duration-500">
                  <ComponentPreview code={generatedCode} isGenerating={isGenerating} />
                </div>
              ) : (
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
