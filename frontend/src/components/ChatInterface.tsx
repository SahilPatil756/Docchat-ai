"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  sources?: any[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I've analyzed your document. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("https://docchat-ai-1.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: data.answer,
        sources: data.sources
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error answering your question." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-500/10">
      
      {/* Header */}
      <div className="px-6 py-4 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 rounded-full"></div>
            <div className="bg-indigo-500 p-2 rounded-xl relative z-10">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">DocChat AI Assistant</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Context Loaded
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center mr-3 mt-1 shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === "user" 
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20" 
                : "bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5 shadow-xl"
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Citations
                  </p>
                  <div className="space-y-2">
                    {msg.sources.map((src: any, i: number) => (
                      <div key={i} className="bg-slate-900/50 rounded-lg p-2 text-xs text-slate-400 border border-white/5">
                        <span className="text-indigo-400 font-mono mb-1 block">Page {src.page}</span>
                        <p className="italic line-clamp-2">"{src.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center ml-3 mt-1 shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center mr-3 shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-slate-800/80 rounded-2xl rounded-tl-none p-4 border border-white/5 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-800/50 border-t border-white/5">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question about the document..."
            className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 px-6 py-4 rounded-full pr-14 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-slate-500"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 translate-x-[1px] translate-y-[1px]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
