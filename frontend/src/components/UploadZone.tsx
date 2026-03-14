"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileText, CheckCircle, Loader2 } from "lucide-react";

export default function UploadZone({ onUploadSuccess }: { onUploadSuccess: (filename: string) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successFile, setSuccessFile] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process PDF.");
      }

      const data = await response.json();
      setSuccessFile(data.filename);
      onUploadSuccess(data.filename);
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out ${
          isDragOver 
            ? "border-indigo-400 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)] scale-[1.02]" 
            : successFile 
              ? "border-emerald-500/50 bg-emerald-500/5" 
              : "border-slate-700 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-800/50"
        } backdrop-blur-xl shrink-0 overflow-hidden`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileInput} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50 rounded-full"></div>
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative z-10" />
            </div>
            <p className="text-lg font-medium text-slate-300">Processing Knowledge Base...</p>
            <p className="text-sm text-slate-500">Extracting text & generating vector embeddings</p>
          </div>
        ) : successFile ? (
          <div className="flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-500 delay-100">
            <div className="bg-emerald-500/20 p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">Ready for Chat!</h3>
            <p className="text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full font-mono text-sm">
              <FileText className="w-4 h-4" /> {successFile}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 pointer-events-none transition-transform duration-300 group-hover:-translate-y-2">
            <div className="p-5 rounded-full bg-slate-800/80 shadow-lg shadow-black/50 ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all duration-300">
              <UploadCloud className={`w-12 h-12 ${isDragOver ? "text-indigo-400 animate-bounce" : "text-slate-400 group-hover:text-indigo-300"} transition-colors`} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-slate-200">
                Drag & drop your PDF here
              </p>
              <p className="text-slate-500">
                or click to browse from your computer
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-in slide-in-from-top-2 duration-300">
          {error}
        </div>
      )}
    </div>
  );
}
