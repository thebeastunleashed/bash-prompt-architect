import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Terminal, 
  Copy, 
  Download, 
  Trash2, 
  Plus, 
  GripVertical, 
  Palette, 
  Type, 
  Hash, 
  Clock, 
  Folder, 
  User, 
  Monitor,
  Check,
  ChevronRight,
  Smile,
  Sparkles,
  Undo,
  Redo,
  Sun,
  Moon,
  Save,
  Bookmark,
  History
} from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PromptPart, ColorOption, TerminalTheme, SavedConfig } from './types';
import { ESCAPE_SEQUENCES, COLORS, BG_COLORS, FORMATTING, SPECIAL_CHARS, INITIAL_PROMPT, EMOJIS, PROMPT_EXAMPLES, TERMINAL_THEMES, COLORS_256, get256ColorHex } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

interface SortableItemProps {
  part: PromptPart;
  onRemove: (id: string) => void;
  key?: string;
}

const SortableItem = ({ part, onRemove }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const getIcon = () => {
    switch (part.type) {
      case 'escape':
        if (part.label.includes('User')) return <User size={14} />;
        if (part.label.includes('Host')) return <Monitor size={14} />;
        if (part.label.includes('Dir')) return <Folder size={14} />;
        if (part.label.includes('Time')) return <Clock size={14} />;
        return <Hash size={14} />;
      case 'color':
        return <Palette size={14} />;
      case 'text':
        return <Type size={14} />;
      default:
        return <Hash size={14} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 mb-2 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg shadow-sm group transition-all",
        isDragging && "opacity-50 scale-105 shadow-md border-blue-400 ring-2 ring-blue-100 dark:ring-zinc-900/50",
        !isDragging && "hover:border-blue-200 dark:hover:border-zinc-800 hover:shadow-md"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 p-1"
      >
        <GripVertical size={16} />
      </button>
      
      <div className={cn(
        "flex items-center justify-center w-6 h-6 rounded text-white",
        part.type === 'escape' ? "bg-blue-500" : 
        part.type === 'color' ? "bg-purple-500" : 
        part.type === 'text' ? "bg-emerald-500" : "bg-slate-500"
      )}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-700 dark:text-zinc-200 truncate">{part.label}</div>
        <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate">{part.value}</div>
      </div>

      <button
        onClick={() => onRemove(part.id)}
        className="p-1.5 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [promptParts, setPromptParts] = useState<PromptPart[]>(INITIAL_PROMPT);
  const [history, setHistory] = useState<PromptPart[][]>([INITIAL_PROMPT]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'escapes' | '256-colors' | 'formatting' | 'special' | 'emojis' | 'themes' | 'examples' | 'custom' | 'saved'>('escapes');
  const [selectedTheme, setSelectedTheme] = useState<TerminalTheme>(TERMINAL_THEMES[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saved_configs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('saved_configs', JSON.stringify(savedConfigs));
  }, [savedConfigs]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updatePromptParts = useCallback((newParts: PromptPart[] | ((prev: PromptPart[]) => PromptPart[])) => {
    setPromptParts((prev) => {
      const next = typeof newParts === 'function' ? newParts(prev) : newParts;
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(next);
      
      // Limit history size to 50
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      setHistory(newHistory);
      return next;
    });
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setPromptParts(history[prevIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setPromptParts(history[nextIndex]);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      updatePromptParts((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addPart = (part: Omit<PromptPart, 'id'>) => {
    const newPart = {
      ...part,
      id: Math.random().toString(36).substr(2, 9),
    };
    updatePromptParts([...promptParts, newPart]);
  };

  const addExample = (parts: Omit<PromptPart, 'id'>[]) => {
    const newParts = parts.map(p => ({
      ...p,
      id: Math.random().toString(36).substr(2, 9),
    }));
    updatePromptParts(newParts);
  };

  const removePart = (id: string) => {
    updatePromptParts(promptParts.filter((p) => p.id !== id));
  };

  const clearPrompt = () => {
    updatePromptParts([]);
  };

  const saveCurrentConfig = () => {
    const name = prompt("Enter a name for this configuration:", `Prompt ${savedConfigs.length + 1}`);
    if (name === null) return; // Cancelled

    const newConfig: SavedConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || `Prompt ${savedConfigs.length + 1}`,
      parts: [...promptParts],
      timestamp: Date.now(),
    };

    setSavedConfigs(prev => [newConfig, ...prev]);
  };

  const deleteConfig = (id: string) => {
    setSavedConfigs(prev => prev.filter(c => c.id !== id));
  };

  const loadConfig = (config: SavedConfig) => {
    updatePromptParts([...config.parts]);
  };

  const fullPS1 = useMemo(() => {
    let ps1 = '';

    promptParts.forEach((part) => {
      if (part.type === 'color' || part.type === 'bg-color' || part.type === 'formatting') {
        // Bash escape format: \[\033[CODEm\]
        ps1 += `\\[\\033[${part.value}m\\]`;
      } else {
        ps1 += part.value;
      }
    });

    // Always reset at the end to be safe
    ps1 += '\\[\\033[0m\\]';

    return ps1;
  }, [promptParts]);

  const previewContent = useMemo(() => {
    let elements: React.ReactNode[] = [];
    let currentColorHex = '';
    let currentBgColorHex = '';
    let isBold = false;
    let isDim = false;
    let isItalic = false;
    let isUnderline = false;
    let isHidden = false;
    let isStrikethrough = false;
    let isBlink = false;
    let isInverted = false;

    promptParts.forEach((part, index) => {
      if (part.type === 'color') {
        if (part.value.startsWith('38;5;')) {
          const n = parseInt(part.value.split(';')[2]);
          currentColorHex = get256ColorHex(n);
        } else {
          const color = COLORS.find(c => c.code === part.value);
          if (color) currentColorHex = color.hex;
        }
      } else if (part.type === 'bg-color') {
        if (part.value.startsWith('48;5;')) {
          const n = parseInt(part.value.split(';')[2]);
          currentBgColorHex = get256ColorHex(n);
        } else {
          const color = BG_COLORS.find(c => c.code === part.value);
          if (color) currentBgColorHex = color.hex;
        }
      } else if (part.type === 'formatting') {
        if (part.value === '0') {
          currentColorHex = '';
          currentBgColorHex = '';
          isBold = false;
          isDim = false;
          isItalic = false;
          isUnderline = false;
          isStrikethrough = false;
          isBlink = false;
          isInverted = false;
          isHidden = false;
        } else if (part.value === '1') isBold = true;
        else if (part.value === '2') isDim = true;
        else if (part.value === '3') isItalic = true;
        else if (part.value === '4') isUnderline = true;
        else if (part.value === '5') isBlink = true;
        else if (part.value === '7') isInverted = true;
        else if (part.value === '8') isHidden = true;
        else if (part.value === '9') isStrikethrough = true;
        else if (part.value === '39') currentColorHex = '';
        else if (part.value === '49') currentBgColorHex = '';
      } else {
        const style: React.CSSProperties = {
          color: isInverted ? (currentBgColorHex || selectedTheme.bg) : (currentColorHex || selectedTheme.text),
          backgroundColor: isInverted ? (currentColorHex || selectedTheme.text) : (currentBgColorHex || 'transparent'),
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          opacity: isDim ? 0.6 : 1,
          textDecoration: [
            isUnderline ? 'underline' : '',
            isStrikethrough ? 'line-through' : ''
          ].filter(Boolean).join(' ') || 'none',
          visibility: isHidden ? 'hidden' : 'visible',
        };

        elements.push(
          <span 
            key={index} 
            style={style}
            className={cn(isBlink && "animate-pulse")}
          >
            {part.preview}
          </span>
        );
      }
    });

    return elements;
  }, [promptParts, selectedTheme]);

  const copyToClipboard = () => {
    const text = `PS1="${fullPS1}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const content = `#!/bin/bash\n# Generated by Bash Prompt Architect\n\nexport PS1="${fullPS1}"\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'set_prompt.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 selection:bg-blue-100 dark:selection:bg-zinc-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-zinc-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 dark:shadow-none">
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight dark:text-white">Bash Prompt Architect</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Visual PS1 Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={copyToClipboard}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                copied 
                  ? "bg-emerald-500 text-white shadow-emerald-100" 
                  : "bg-slate-900 dark:bg-zinc-800 text-white hover:bg-slate-800 dark:hover:bg-zinc-700 shadow-slate-200 dark:shadow-none shadow-lg"
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy PS1"}
            </button>
            <button
              onClick={downloadScript}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <Download size={16} />
              Download .sh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Builder */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-4 border-b dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-zinc-400">Prompt Structure</h2>
                <div className="flex items-center gap-1 border-l pl-4 border-slate-200 dark:border-zinc-700">
                  <button
                    onClick={undo}
                    disabled={historyIndex === 0}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo size={14} />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex === history.length - 1}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={saveCurrentConfig}
                  disabled={promptParts.length === 0}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-emerald-400 hover:text-blue-700 dark:hover:text-emerald-300 uppercase tracking-widest px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Save size={12} />
                  Save
                </button>
                <button 
                  onClick={clearPrompt}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={promptParts.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence initial={false}>
                    {promptParts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 text-center p-8">
                        <Plus size={32} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium dark:text-zinc-500">Your prompt is empty.</p>
                        <p className="text-xs dark:text-zinc-600">Add elements from the library to get started.</p>
                      </div>
                    ) : (
                      promptParts.map((part: PromptPart) => (
                        <SortableItem
                          key={part.id}
                          part={part}
                          onRemove={removePart}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>
            </div>
          </section>
        </div>

        {/* Right Column: Library & Preview */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Terminal Preview */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-zinc-400">Live Preview</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-slate-400 dark:text-zinc-500" />
                  <select 
                    value={selectedTheme.id}
                    onChange={(e) => {
                      const theme = TERMINAL_THEMES.find(t => t.id === e.target.value);
                      if (theme) setSelectedTheme(theme);
                    }}
                    className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest bg-transparent border-none focus:ring-0 cursor-pointer hover:text-blue-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {TERMINAL_THEMES.map(theme => (
                      <option key={theme.id} value={theme.id}>{theme.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Interactive Terminal</span>
                </div>
              </div>
            </div>
            <div 
              className="rounded-xl shadow-2xl overflow-hidden border ring-1 ring-white/5 transition-all duration-300"
              style={{ backgroundColor: selectedTheme.bg, borderColor: selectedTheme.border }}
            >
              <div className="flex flex-col" style={{ backgroundColor: selectedTheme.tabBar }}>
                {/* Konsole Title Bar */}
                <div 
                  className="px-3 py-1.5 flex items-center justify-between border-b border-white/5 transition-colors duration-300"
                  style={{ backgroundColor: selectedTheme.titleBar }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center">
                      <Terminal size={8} className="text-white" />
                    </div>
                    <span className="text-[10px] font-sans font-medium" style={{ color: selectedTheme.text + '99' }}>
                      Session 1 — Konsole
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-3">
                      <div className="w-2.5 h-0.5 self-center" style={{ backgroundColor: selectedTheme.text + '66' }} />
                      <div className="w-2.5 h-2.5 border rounded-sm" style={{ borderColor: selectedTheme.text + '66' }} />
                      <div className="w-2.5 h-2.5 flex items-center justify-center" style={{ color: selectedTheme.text + '66' }}>×</div>
                    </div>
                  </div>
                </div>
                {/* Konsole Tab Bar */}
                <div className="flex items-end px-2 pt-1 transition-colors duration-300" style={{ backgroundColor: selectedTheme.tabBar }}>
                  <div 
                    className="px-4 py-1.5 rounded-t-lg border-t border-x border-white/10 flex items-center gap-2 transition-colors duration-300"
                    style={{ backgroundColor: selectedTheme.bg }}
                  >
                    <span className="text-[10px] font-sans font-medium" style={{ color: selectedTheme.text }}>bash</span>
                    <div className="w-2.5 h-2.5 flex items-center justify-center hover:text-white cursor-pointer opacity-50" style={{ color: selectedTheme.text }}>×</div>
                  </div>
                  <div className="px-3 py-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" style={{ color: selectedTheme.text }}>
                    <Plus size={12} />
                  </div>
                </div>
              </div>
              <div className="p-6 font-mono text-sm min-h-[160px] leading-relaxed transition-colors duration-300" style={{ color: selectedTheme.text }}>
                <div className="flex flex-wrap items-center gap-x-0.5">
                  {previewContent}
                  <motion.div 
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-5 ml-1"
                    style={{ backgroundColor: selectedTheme.text + '80' }}
                  />
                </div>
                <div className="mt-4 italic opacity-50 select-none" style={{ color: selectedTheme.text }}>
                  # Try building your prompt below...
                </div>
              </div>
            </div>
          </section>

          {/* Library Tabs */}
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="flex border-b dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 overflow-x-auto no-scrollbar">
                {[
                  { id: 'escapes', label: 'Escapes', icon: <Hash size={14} /> },
                  { id: '256-colors', label: '256 Colors', icon: <Palette size={14} /> },
                  { id: 'formatting', label: 'Format', icon: <Type size={14} /> },
                  { id: 'special', label: 'Symbols', icon: <Plus size={14} /> },
                  { id: 'emojis', label: 'Emojis', icon: <Smile size={14} /> },
                  { id: 'themes', label: 'Themes', icon: <Palette size={14} /> },
                  { id: 'examples', label: 'Examples', icon: <Sparkles size={14} /> },
                  { id: 'saved', label: 'Saved', icon: <Bookmark size={14} /> },
                  { id: 'custom', label: 'Custom', icon: <Type size={14} /> },
                ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 px-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                    activeTab === tab.id 
                      ? "text-blue-600 dark:text-emerald-400 border-blue-600 dark:border-emerald-400 bg-white dark:bg-zinc-900" 
                      : "text-slate-400 dark:text-zinc-500 border-transparent hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'escapes' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ESCAPE_SEQUENCES.map((seq, i) => (
                    <button
                      key={i}
                      onClick={() => addPart(seq)}
                      className="flex flex-col items-start p-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl hover:border-blue-400 dark:hover:border-emerald-500 hover:bg-blue-50 dark:hover:bg-emerald-900/10 transition-all group text-left"
                    >
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-blue-500 dark:group-hover:text-emerald-400">{seq.label}</span>
                      <code className="text-sm font-mono font-bold text-slate-700 dark:text-zinc-200">{seq.value}</code>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === '256-colors' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Foreground</h4>
                    <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">
                      {COLORS_256.map((color) => (
                        <button
                          key={`fg-${color.n}`}
                          onClick={() => addPart({ type: 'color', label: `Color ${color.n}`, value: `38;5;${color.n}`, preview: color.hex })}
                          className="w-full aspect-square rounded-sm border border-slate-200 dark:border-zinc-700 hover:scale-110 transition-transform shadow-sm"
                          style={{ backgroundColor: color.hex }}
                          title={`Color ${color.n} (38;5;${color.n})`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Background</h4>
                    <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">
                      {COLORS_256.map((color) => (
                        <button
                          key={`bg-${color.n}`}
                          onClick={() => addPart({ type: 'bg-color', label: `BG ${color.n}`, value: `48;5;${color.n}`, preview: color.hex })}
                          className="w-full aspect-square rounded-sm border border-slate-200 dark:border-zinc-700 hover:scale-110 transition-transform shadow-sm"
                          style={{ backgroundColor: color.hex }}
                          title={`BG ${color.n} (48;5;${color.n})`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'formatting' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FORMATTING.map((fmt, i) => (
                    <button
                      key={i}
                      onClick={() => addPart(fmt)}
                      className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl hover:border-blue-400 dark:hover:border-emerald-500 hover:bg-blue-50 dark:hover:bg-emerald-900/10 transition-all group text-center"
                    >
                      <span 
                        className="text-sm font-bold text-slate-700 dark:text-zinc-200 mb-2"
                        style={{
                          fontWeight: fmt.value === '1' ? 'bold' : 'normal',
                          opacity: fmt.value === '2' ? 0.6 : 1,
                          fontStyle: fmt.value === '3' ? 'italic' : 'normal',
                          textDecoration: fmt.value === '4' ? 'underline' : fmt.value === '9' ? 'line-through' : 'none',
                          backgroundColor: fmt.value === '7' ? (theme === 'dark' ? '#fff' : '#000') : 'transparent',
                          color: fmt.value === '7' ? (theme === 'dark' ? '#000' : '#fff') : 'inherit',
                          visibility: fmt.value === '8' ? 'hidden' : 'visible',
                        }}
                      >
                        {fmt.label}
                      </span>
                      <code className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-emerald-400 transition-colors">
                        {fmt.value}
                      </code>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'special' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SPECIAL_CHARS.map((char, i) => (
                    <button
                      key={i}
                      onClick={() => addPart(char)}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl hover:border-blue-400 dark:hover:border-emerald-500 hover:bg-blue-50 dark:hover:bg-emerald-900/10 transition-all group"
                    >
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{char.label}</span>
                      <code className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">{char.value === ' ' ? '␣' : char.value}</code>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'emojis' && (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => addPart(emoji)}
                      className="flex items-center justify-center p-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl hover:border-blue-400 dark:hover:border-emerald-500 hover:bg-blue-50 dark:hover:bg-emerald-900/10 transition-all text-xl"
                      title={emoji.label}
                    >
                      {emoji.value}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'themes' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TERMINAL_THEMES.map((themeOption, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTheme(themeOption)}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-xl border transition-all group",
                        selectedTheme.id === themeOption.id 
                          ? "border-blue-500 bg-blue-50/50 dark:bg-emerald-900/20 shadow-sm" 
                          : "bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-emerald-500 hover:bg-blue-50 dark:hover:bg-emerald-900/10"
                      )}
                    >
                      <div 
                        className="w-full h-12 rounded-lg border border-white/10 mb-2 flex flex-col overflow-hidden shadow-sm"
                        style={{ backgroundColor: themeOption.bg }}
                      >
                        <div className="h-3 w-full" style={{ backgroundColor: themeOption.titleBar }} />
                        <div className="flex-1 p-1 flex flex-col gap-0.5">
                          <div className="h-0.5 w-2/3 rounded-full" style={{ backgroundColor: themeOption.text + '40' }} />
                          <div className="h-0.5 w-1/2 rounded-full" style={{ backgroundColor: themeOption.text + '40' }} />
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        selectedTheme.id === themeOption.id ? "text-blue-600 dark:text-emerald-400" : "text-slate-500 dark:text-zinc-400"
                      )}>
                        {themeOption.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PROMPT_EXAMPLES.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => addExample(example.parts)}
                      className="flex flex-col items-start p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl hover:border-blue-400 dark:hover:border-emerald-500 hover:bg-blue-50 dark:hover:bg-emerald-900/10 transition-all group text-left"
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{example.name}</span>
                        <Plus size={14} className="text-slate-400 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-emerald-400" />
                      </div>
                      <div className="w-full bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-300 truncate">
                        {example.parts.map(p => p.preview || p.value).join('')}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="space-y-4">
                  {savedConfigs.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-zinc-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
                      <Bookmark size={32} className="mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
                      <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">No saved configurations yet.</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Click the "Save" button in the builder to store your current prompt.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedConfigs.map((config) => (
                        <div
                          key={config.id}
                          className="group relative flex flex-col p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl hover:border-blue-400 dark:hover:border-emerald-500 hover:bg-blue-50 dark:hover:bg-emerald-900/10 transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{config.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                {new Date(config.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => loadConfig(config)}
                                className="p-1.5 text-blue-600 dark:text-emerald-400 hover:bg-blue-100 dark:hover:bg-emerald-900/30 rounded-md transition-colors"
                                title="Load this configuration"
                              >
                                <History size={14} />
                              </button>
                              <button
                                onClick={() => deleteConfig(config.id)}
                                className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="w-full bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-300 truncate">
                            {config.parts.map(p => p.preview || p.value).join('')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customText.trim()) {
                          addPart({ type: 'text', label: 'Custom Text', value: customText, preview: customText });
                          setCustomText('');
                        }
                      }}
                      placeholder="Type custom text (e.g. >>, |, etc.)"
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm dark:text-white"
                    />
                    <button
                      onClick={() => {
                        if (customText.trim()) {
                          addPart({ type: 'text', label: 'Custom Text', value: customText, preview: customText });
                          setCustomText('');
                        }
                      }}
                      disabled={!customText.trim()}
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100 dark:shadow-none"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium uppercase tracking-widest">
                    Tip: You can add any string, like separators or custom symbols.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Raw Output */}
          <section className="space-y-3">
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-zinc-400">Generated PS1 String</h2>
            <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs text-blue-400 break-all relative group border border-slate-800 dark:border-zinc-800">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={copyToClipboard}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
              </div>
              <span className="text-slate-500 select-none">PS1="</span>
              {fullPS1}
              <span className="text-slate-500 select-none">"</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t dark:border-zinc-800 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-4">How to use</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-slate-900 dark:text-zinc-100 shrink-0">1</div>
                <p>Build your prompt by adding elements from the library.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-slate-900 dark:text-zinc-100 shrink-0">2</div>
                <p>Drag and drop elements to reorder them in the structure list.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-slate-900 dark:text-zinc-100 shrink-0">3</div>
                <p>Copy the generated string or download the shell script.</p>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-4">Installation</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
              To use your new prompt, add the generated line to your <code className="bg-slate-100 dark:bg-zinc-800 px-1 rounded text-slate-900 dark:text-zinc-100">~/.bashrc</code> or <code className="bg-slate-100 dark:bg-zinc-800 px-1 rounded text-slate-900 dark:text-zinc-100">~/.bash_profile</code> file.
            </p>
            <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 font-mono text-[10px] text-slate-600 dark:text-zinc-400">
              # Open your config<br />
              vi ~/.bashrc<br />
              # Paste the PS1 line at the end<br />
              # Reload config<br />
              source ~/.bashrc
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-4">About PS1</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              PS1 is the primary prompt string in Bash. It's displayed before every command you type. 
              By customizing it, you can see useful info like your current branch, time, or system load at a glance.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t dark:border-zinc-800 text-center text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
          Built for terminal enthusiasts &bull; 2026
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? '#3f3f46' : '#e2e8f0'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? '#52525b' : '#cbd5e1'};
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
