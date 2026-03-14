"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import ChatInterface from "@/components/ChatInterface";
import SummaryViewer from "@/components/SummaryViewer";
import QuizViewer from "@/components/QuizViewer";
import { MessageSquare, FileText, BrainCircuit } from "lucide-react";

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "summary" | "quiz">("chat");
  const [filename, setFilename] = useState<string | null>(null);

  const handleUploadSuccess = (file: string) => {
    setFilename(file);
    setTimeout(() => {
      setIsReady(true);
    }, 1500); // Small delay to show success animation before transitioning
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen mix-blend-color-dodge"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen mix-blend-color-dodge"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        <header className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
             <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-bold tracking-wide uppercase">Beta 1.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-purple-400 tracking-tight drop-shadow-sm mb-6">
            DocChat AI
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Transform your static PDFs into interactive, intelligent knowledge bases instantly.
          </p>
        </header>

        <main className="transition-all duration-700">
          {!isReady ? (
            <div className="animate-in zoom-in-95 duration-700">
              <UploadZone onUploadSuccess={handleUploadSuccess} />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out flex flex-col items-center">
              
              <div className="mb-8 flex items-center bg-slate-900/50 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-lg shadow-black/50">
                <button 
                  onClick={() => setActiveTab("chat")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${activeTab === 'chat' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Chat
                </button>
                <button 
                  onClick={() => setActiveTab("summary")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${activeTab === 'summary' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <FileText className="w-4 h-4" /> Summary
                </button>
                <button 
                  onClick={() => setActiveTab("quiz")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${activeTab === 'quiz' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <BrainCircuit className="w-4 h-4" /> Quiz Mode
                </button>
              </div>

              <div className="w-full max-w-5xl transition-all duration-500">
                {activeTab === "chat" && <ChatInterface />}
                {activeTab === "summary" && <SummaryViewer />}
                {activeTab === "quiz" && <QuizViewer />}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
