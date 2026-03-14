"use client";

import { useState } from "react";
import { Brain, Check, X, Sparkles, Loader2, ArrowRight } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export default function QuizViewer() {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/quiz", { method: "POST" });
      if (!response.ok) throw new Error("Failed to generate quiz");
      const data = await response.json();
      
      // Basic validation
      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuestions(data.quiz);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (opt: string) => {
    if (selectedOption) return; // already answered
    setSelectedOption(opt);
    if (questions && opt === questions[currentIndex].answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  if (!questions && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl text-center">
        <div className="bg-purple-500/20 p-4 rounded-full mb-6">
          <Brain className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Test Your Knowledge</h3>
        <p className="text-slate-400 mb-8 max-w-md">Let the AI generate a custom multiple-choice quiz based on the key concepts in your document.</p>
        <button 
          onClick={handleGenerate}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all shadow-xl shadow-purple-500/20 hover:scale-105"
        >
          <Sparkles className="w-5 h-5" /> Generate AI Quiz
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
        <p className="text-lg font-medium text-white animate-pulse">Crafting clever questions...</p>
      </div>
    );
  }

  if (isFinished && questions) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
        <h2 className="text-4xl font-black text-white mb-4">Quiz Complete!</h2>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-400 mb-6 drop-shadow-sm">
          {score} <span className="text-3xl text-slate-500">/ {questions.length}</span>
        </div>
        <p className="text-xl text-slate-300 mb-8">
          {score === questions.length ? "Perfect score! You truly understand the document." : "Great effort! Keep reviewing to master the subject."}
        </p>
        <button 
          onClick={() => { setQuestions(null); setScore(0); setCurrentIndex(0); setIsFinished(false); setSelectedOption(null); }}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-semibold text-white transition-colors"
        >
          Try Another Quiz
        </button>
      </div>
    );
  }

  const q = questions![currentIndex];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 left-0 h-1 bg-purple-500 transition-all duration-500" style={{ width: `${((currentIndex) / questions!.length) * 100}%` }}></div>
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <span className="text-purple-400 font-bold tracking-wider text-sm uppercase">Question {currentIndex + 1} of {questions!.length}</span>
          <span className="text-slate-400 font-medium">Score: {score}</span>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-8 leading-snug">{q.question}</h3>
        
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.answer;
            const isSelected = selectedOption === opt;
            
            let bgClass = "bg-slate-800/50 hover:bg-slate-700/50 border-white/10 text-slate-200 cursor-pointer";
            let icon = null;

            if (selectedOption) {
              if (isCorrect) {
                bgClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 cursor-default";
                icon = <Check className="w-5 h-5 text-emerald-400" />;
              } else if (isSelected) {
                bgClass = "bg-rose-500/20 border-rose-500/50 text-rose-100 cursor-default";
                icon = <X className="w-5 h-5 text-rose-400" />;
              } else {
                bgClass = "bg-slate-800/20 border-white/5 text-slate-500 cursor-default opacity-50";
              }
            }

            return (
              <div 
                key={i} 
                onClick={() => handleSelect(opt)}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-300 font-medium ${bgClass} ${isSelected ? 'scale-[1.02]' : ''}`}
              >
                <span>{opt}</span>
                {icon}
              </div>
            );
          })}
        </div>
        
        {selectedOption && (
          <div className="mt-8 flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-slate-200 transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
