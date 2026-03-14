"use client";

import { useState } from "react";
import { FileText, Sparkles, Loader2 } from "lucide-react";

export default function SummaryViewer() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/summarize", { method: "POST" });
      if (!response.ok) throw new Error("Failed to generate summary");
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setSummary("Error generating summary.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!summary && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl text-center">
        <div className="bg-indigo-500/20 p-4 rounded-full mb-6">
          <FileText className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Generate Intelligent Summary</h3>
        <p className="text-slate-400 mb-8 max-w-md">Extract the most important facts, key arguments, and an overview of your entire document with a single click.</p>
        <button 
          onClick={handleGenerate}
          className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors shadow-xl shadow-white/5 hover:scale-105"
        >
          <Sparkles className="w-5 h-5" /> Generate Summary
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
          <p className="text-lg font-medium text-white tracking-wide animate-pulse">Synthesizing document...</p>
        </div>
      )}
      
      <div className="p-6 border-b border-white/5 bg-slate-800/30 flex items-center gap-3">
        <div className="bg-indigo-500/20 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Document Summary</h2>
      </div>
      
      <div className="p-8 prose prose-invert prose-indigo max-w-none">
         {/* Simple rendering for MVP, normally use React Markdown */}
         {summary ? (
           <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
             {summary}
           </div>
         ) : null}
      </div>
    </div>
  );
}
