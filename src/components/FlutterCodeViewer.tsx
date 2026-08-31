import React, { useState } from 'react';
import { FLUTTER_STEP1_FILES, FlutterFile } from '../data/flutterSourceCode';
import { Code, Copy, Check, FileCode, Folder, ChevronRight, Download, Sparkles } from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_STEP1_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'database', label: 'SQLite DB' },
    { id: 'models', label: 'Models' },
    { id: 'services', label: 'Calculations' },
    { id: 'repositories', label: 'Repositories' },
  ];

  const filteredFiles =
    activeCategory === 'all'
      ? FLUTTER_STEP1_FILES
      : FLUTTER_STEP1_FILES.filter((f) => f.category === activeCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-950 text-slate-100 pb-20">
      {/* Code Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
            <Code className="w-3.5 h-3.5" />
            <span>Pure Flutter & Dart Codebase — Step 1</span>
          </div>
          <h2 className="text-xs font-bold text-slate-200 mt-0.5">{selectedFile.path}</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownloadAll}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            title="Download this file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* File Selector Ribbon */}
      <div className="flex gap-1 px-3 py-1.5 bg-slate-900/30 border-b border-slate-800/50 overflow-x-auto scrollbar-none text-xs">
        {filteredFiles.map((file) => (
          <button
            key={file.path}
            onClick={() => setSelectedFile(file)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all ${
              selectedFile.path === file.path
                ? 'bg-slate-800 text-blue-300 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3 h-3 text-blue-400" />
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* Code Area with Syntax View */}
      <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed bg-[#0d1117] text-slate-300 select-text">
        <pre className="whitespace-pre">
          <code>{selectedFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
