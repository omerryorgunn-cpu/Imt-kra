
import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Clock, ChevronRight, X, Sparkles, CircleAlert as AlertCircle } from 'lucide-react';
import { Announcement } from '../types';
import { mockDb } from '../services/mockDb';

export default function StudentAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  useEffect(() => {
    const all = mockDb.getAnnouncements();
    const now = new Date();
    
    // Sadece aktif (tarihi gelmiş ve bitmemiş) duyuruları göster
    const active = all.filter(ann => {
      if (!ann.startDate) return true;
      const startStr = `${ann.startDate}T${ann.startTime || '00:00'}`;
      const start = new Date(startStr);
      if (ann.endDate) {
        const endStr = `${ann.endDate}T${ann.endTime || '23:59'}`;
        const end = new Date(endStr);
        return now >= start && now <= end;
      }
      return now >= start;
    });

    // Kayan bant duyurularını başa al
    const sorted = active.sort((a, b) => (b.isTicker ? 1 : 0) - (a.isTicker ? 1 : 0));
    setAnnouncements(sorted);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFBF0] dark:bg-[#2d2d2d] rounded-full border border-[#D4AF37]/20">
          <Megaphone className="text-[#D4AF37]" size={16} />
          <span className="text-xs font-bold text-[#4A3728] dark:text-[#D4AF37] uppercase tracking-widest">Haberler ve Duyurular</span>
        </div>
        <h2 className="text-4xl font-bold font-serif text-[#4A3728] dark:text-white">Platform Gelişmeleri</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Sınav takvimleri, yeni eğitim materyalleri ve güncel bildirimleri buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid gap-6">
        {announcements.map(ann => (
          <div 
            key={ann.id} 
            onClick={() => setSelectedAnn(ann)}
            className={`bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-[#D4AF37] transition-all cursor-pointer group flex flex-col md:flex-row gap-6 relative overflow-hidden ${ann.isTicker ? 'ring-2 ring-[#D4AF37]/30' : ''}`}
          >
            {ann.isTicker && (
              <div className="absolute top-0 right-0">
                <div className="bg-[#D4AF37] text-[#4A3728] text-[8px] font-black px-4 py-1 rotate-45 translate-x-3 translate-y-1 shadow-sm uppercase tracking-tighter">Önemli</div>
              </div>
            )}

            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-50 dark:bg-[#252525]">
              {ann.imageUrl ? (
                <img src={ann.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={ann.title} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#D4AF37] opacity-20">
                   <Megaphone size={48} />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Calendar size={12}/> {ann.startDate || 'Süresiz'}</span>
                {ann.isTicker && <span className="text-[#D4AF37] flex items-center gap-1"><Sparkles size={12}/> FLAŞ HABER</span>}
              </div>
              <h3 className="text-xl font-bold text-[#4A3728] dark:text-white font-serif group-hover:text-[#D4AF37] transition-colors line-clamp-1">{ann.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{ann.content}</p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                Devamını Oku <ChevronRight size={14}/>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-[#1a1a1a] rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 space-y-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto text-gray-300">
              <AlertCircle size={40}/>
            </div>
            <p className="text-gray-400 italic font-medium">Şu an aktif bir duyuru bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Duyuru Detay Modalı */}
      {selectedAnn && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in">
            <div className="relative h-64 shrink-0">
               {selectedAnn.imageUrl ? (
                 <img src={selectedAnn.imageUrl} className="w-full h-full object-cover" alt={selectedAnn.title} />
               ) : (
                 <div className="w-full h-full bg-[#4A3728] flex items-center justify-center">
                    <Megaphone size={64} className="text-[#D4AF37] opacity-20" />
                 </div>
               )}
               <button onClick={() => setSelectedAnn(null)} className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all">
                  <X size={20}/>
               </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div className="flex items-center gap-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                <span className="flex items-center gap-1"><Calendar size={14}/> {selectedAnn.startDate || 'Belirtilmedi'}</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {selectedAnn.startTime || '00:00'}</span>
              </div>
              <h3 className="text-3xl font-bold font-serif text-[#4A3728] dark:text-white leading-tight">{selectedAnn.title}</h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 text-base leading-[1.8] whitespace-pre-wrap">{selectedAnn.content}</p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-[#1c1c1c] border-t dark:border-white/5 flex justify-end">
              <button onClick={() => setSelectedAnn(null)} className="px-10 py-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-2xl shadow-xl transition-transform active:scale-95">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
