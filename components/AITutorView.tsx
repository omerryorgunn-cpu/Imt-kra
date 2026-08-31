
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { getAITutorResponse } from '../services/geminiService';

interface AITutorViewProps {
  onBack: () => void;
}

export default function AITutorView({ onBack }: AITutorViewProps) {
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: "Selam! Ben İMTİKRA AI asistanın. Sana gramer, kelime kökleri veya sınav soruları hakkında nasıl yardımcı olabilirim?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const response = await getAITutorResponse(userMsg, messages);
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[75vh] w-full bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-[#D4AF37]/20 flex flex-col overflow-hidden transition-colors">
      <div className="bg-[#4A3728] dark:bg-[#252525] p-5 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <Bot className="text-[#D4AF37]" size={24} />
          </div>
          <div>
            <h3 className="font-bold flex items-center gap-2">AI Arapça Asistanı <Sparkles size={14} className="text-[#D4AF37]"/></h3>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Çevrimiçi • Uzman</span>
          </div>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
      </div>

      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto bg-[#FDFCF8] dark:bg-[#121212] space-y-6 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-[#D4AF37] text-white' : 'bg-[#4A3728] dark:bg-[#2d2d2d] text-[#D4AF37]'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${m.role === 'user' ? 'bg-[#4A3728] text-white border-white/10 rounded-tr-none' : 'bg-white dark:bg-[#1a1a1a] text-[#4A3728] dark:text-gray-200 border-gray-100 dark:border-white/5 rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2d2d2d]"></div>
              <div className="bg-white dark:bg-[#1a1a1a] border dark:border-white/5 p-4 rounded-2xl text-xs text-gray-400">Yapay zeka düşünüyor...</div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-white/5 flex gap-3 items-center sticky bottom-0">
        <input 
          placeholder="Arapça sorunu buraya yaz..." 
          className="flex-1 p-4 bg-gray-50 dark:bg-[#252525] dark:text-white rounded-2xl text-sm border-2 border-transparent focus:border-[#D4AF37] outline-none transition-all"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button disabled={loading} className="w-12 h-12 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-full flex items-center justify-center shadow-lg hover:bg-[#36251b] dark:hover:bg-[#b59022] disabled:opacity-50 transition-transform active:scale-95">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
