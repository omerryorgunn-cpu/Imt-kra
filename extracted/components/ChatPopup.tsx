
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User as UserIcon, Bot, Info } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { User, DirectMessage } from '../types';

interface ChatPopupProps {
  currentUser: User;
  onClose?: () => void;
}

export default function ChatPopup({ currentUser, onClose }: ChatPopupProps) {
  const [isOpen, setIsOpen] = useState(true); // Default to true when triggered from dashboard
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = () => {
      const msgs = mockDb.getDirectMessages(currentUser.id, 'admin-id');
      setMessages(msgs);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [isOpen, currentUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    mockDb.sendDirectMessage(currentUser.id, 'admin-id', input);
    setInput('');
    setMessages(mockDb.getDirectMessages(currentUser.id, 'admin-id'));
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-[210] font-sans flex items-center justify-center md:block p-4 md:p-0 bg-black/40 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
      <div className="w-full max-w-sm h-[500px] md:w-80 md:h-[450px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-[#4A3728] p-4 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#4A3728] shadow-sm">
              <Bot size={18} />
            </div>
            <div>
              <h4 className="font-bold text-xs">Canlı Destek</h4>
              <p className="text-[9px] text-[#D4AF37] uppercase font-bold tracking-tighter">Yönetici ile Çevrimiçi</p>
            </div>
          </div>
          <button onClick={handleClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
          <div className="text-center p-2">
            <p className="text-[10px] text-gray-400 font-bold bg-gray-100 rounded-lg py-1 px-2 inline-block">Sohbet Başlatıldı</p>
          </div>
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-gray-200 shadow-sm">
                <Info size={24} />
              </div>
              <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Yöneticiye sormak istediğiniz soruları buradan sorabilirsiniz.</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm border ${m.senderId === currentUser.id ? 'bg-[#4A3728] text-white border-[#4A3728] rounded-tr-none' : 'bg-white text-[#4A3728] border-gray-100 rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Mesajınızı yazın..." 
            className="flex-1 text-xs p-3 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-[#D4AF37] transition-all"
          />
          <button type="submit" className="bg-[#4A3728] text-[#D4AF37] p-3 rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
