import React, { useState } from 'react';
import { ChevronLeft, Sparkles, BookOpen, Hash, Link as LinkIcon, Table, Tag, ExternalLink, X, Brain, Video, Image as ImageIcon, Download, Eye, EyeOff, Type } from 'lucide-react';
import { ReadingText } from '../types';
import Flashcard from './Flashcard';

interface ReadingRoomProps {
  reading: ReadingText;
  onBack: () => void;
}

export default function ReadingRoom({ reading, onBack }: ReadingRoomProps) {
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [showFullTranslation, setShowFullTranslation] = useState(false);
  const [showVowels, setShowVowels] = useState(true);

  // Regex to strip Arabic diacritics (Fatha, Damma, Kasra, Sukun, Shadda, Tanween etc.)
  const removeTashkeel = (text: string) => {
    return text.replace(/[\u064B-\u065F\u0670]/g, "");
  };

  const displayText = showVowels ? reading.content : removeTashkeel(reading.content);

  const downloadStudyGuide = () => {
    const analysis = reading.analysis;
    if (!analysis) return;

    let content = `OKUMA ÇALIŞMA KILAVUZU: ${reading.title}\n`;
    content += `Kategori: ${reading.category} | Seviye: ${reading.level}\n`;
    content += `--------------------------------------------------\n\n`;
    content += `ARAPÇA METİN:\n${reading.content}\n\n`;
    content += `METNİN TÜRKÇE ÇEVİRİSİ:\n${analysis.fullTranslation || 'Bulunamadı.'}\n\n`;
    content += `ÖNEMLİ KELİMELER VE ANLAMLARI:\n`;
    analysis.vocabulary.forEach(v => content += `- ${v.word}: ${v.meaning}\n`);
    content += `\nKALIP İFADELER VE HARF-İ CERLİ FİİLLER:\n`;
    analysis.prepositions.forEach(p => content += `- ${p.phrase}: ${p.meaning}\n`);
    analysis.patterns.forEach(p => content += `- ${p.phrase}: ${p.meaning}\n`);
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reading.title}_Calisma_Notlari.doc`;
    a.click();
  };

  const flashcards = reading.analysis?.vocabulary || [];

  if (showFlashcards) {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-in zoom-in py-10">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowFlashcards(false)} className="flex items-center gap-2 text-gray-400 font-bold text-xs hover:text-[#4A3728] transition-colors"><ChevronLeft size={20}/> Metne Dön</button>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-[#252525] px-3 py-1 rounded-full">Kart {currentCardIdx + 1} / {flashcards.length}</div>
        </div>
        
        <Flashcard front={flashcards[currentCardIdx].word} back={flashcards[currentCardIdx].meaning} example={`Bu kelime "${reading.title}" metninde geçmektedir.`} />
        
        <div className="flex justify-center gap-6">
          <button disabled={currentCardIdx === 0} onClick={() => setCurrentCardIdx(p => p - 1)} className="w-14 h-14 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] transition-all disabled:opacity-30 shadow-lg"><ChevronLeft size={32}/></button>
          <button disabled={currentCardIdx === flashcards.length - 1} onClick={() => setCurrentCardIdx(p => p + 1)} className="w-14 h-14 bg-[#4A3728] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#4A3728]/20 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all"><ChevronLeft className="rotate-180" size={32}/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-[#4A3728] dark:hover:text-white transition-colors"><ChevronLeft size={20}/> Geri Dön</button>
        <div className="flex flex-wrap items-center gap-3">
          {/* Vowel Toggle Button */}
          <button 
            onClick={() => setShowVowels(!showVowels)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-sm ${showVowels ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : 'bg-white dark:bg-[#252525] text-gray-500 border-gray-200 dark:border-white/10'}`}
          >
             <Type size={14}/> {showVowels ? 'Harekeli' : 'Harekesiz'}
          </button>

          <button onClick={downloadStudyGuide} className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/30 text-xs font-bold hover:bg-blue-100 transition-all shadow-sm">
             <Download size={14}/> Not İndir
          </button>
          {flashcards.length > 0 && (
            <button onClick={() => { setShowFlashcards(true); setCurrentCardIdx(0); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold hover:bg-emerald-100 transition-all shadow-sm">
              <Brain size={14}/> Kelime Kartları
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-[3rem] shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
        {reading.coverImage && (
          <div className="w-full h-80 relative">
            <img src={reading.coverImage} className="w-full h-full object-cover" alt="Metin Kapağı" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
               <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2">
                 <span>{reading.category}</span>
                 <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                 <span>{reading.level} SEVİYE</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold font-serif text-white leading-tight">{reading.title}</h1>
            </div>
          </div>
        )}
        
        <div className="p-8 md:p-16 space-y-12">
          {!reading.coverImage && (
            <div className="space-y-4 text-center border-b dark:border-white/5 pb-12">
               <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  <span>{reading.category}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{reading.level} SEVİYE</span>
               </div>
               <h1 className="text-4xl font-bold font-serif text-[#4A3728] dark:text-white leading-tight">{reading.title}</h1>
            </div>
          )}

          <div className={`space-y-6 text-3xl sm:text-4xl text-[#4A3728] dark:text-gray-200 ${reading.arabicFont || 'font-serif'}`} dir="rtl" style={{ textAlign: 'justify', lineHeight: '4.5rem' }}>
            {displayText}
          </div>

          <div className="flex flex-col items-center gap-6 py-8 border-t dark:border-white/5">
             <button 
              onClick={() => setShowFullTranslation(!showFullTranslation)}
              className="flex items-center gap-2 px-8 py-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
             >
                {showFullTranslation ? <><EyeOff size={20}/> Tercümeyi Gizle</> : <><Eye size={20}/> Metin Tercümesini Göster</>}
             </button>
             
             {showFullTranslation && (
               <div className="w-full bg-gray-50 dark:bg-[#252525] p-8 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500 border border-gray-100 dark:border-white/5">
                 <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Türkçe Tercüme</h4>
                 <p className="text-lg text-[#4A3728] dark:text-gray-300 leading-relaxed font-medium">
                   {reading.analysis?.fullTranslation || "Tercüme hazırlanamadı."}
                 </p>
               </div>
             )}

             {reading.sourceUrl && (
                <a href={reading.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-400 font-bold hover:text-[#D4AF37] transition-colors">
                  <ExternalLink size={16}/> Orijinal Kaynağı Görüntüle
                </a>
             )}
          </div>
        </div>
      </div>

      {reading.analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
             <h4 className="font-bold text-[#4A3728] dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest"><LinkIcon size={16} className="text-[#D4AF37]"/> Harf-i Cerli Fiiller</h4>
             <div className="space-y-3">
               {reading.analysis.prepositions.map((p, i) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl border border-transparent hover:border-[#D4AF37]/20 transition-all">
                   <span className={`text-lg text-[#4A3728] dark:text-white ${reading.arabicFont || 'font-serif'}`} dir="rtl">{p.phrase}</span>
                   <span className="text-sm text-gray-400 font-bold">{p.meaning}</span>
                 </div>
               ))}
               {reading.analysis.prepositions.length === 0 && <p className="text-xs text-gray-400 italic">Bulunamadı.</p>}
             </div>
           </div>

           <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
             <h4 className="font-bold text-[#4A3728] dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest"><Hash size={16} className="text-[#D4AF37]"/> Önemli Kalıplar</h4>
             <div className="space-y-3">
               {reading.analysis.patterns.map((p, i) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl border border-transparent hover:border-[#D4AF37]/20 transition-all">
                   <span className={`text-lg text-[#4A3728] dark:text-white ${reading.arabicFont || 'font-serif'}`} dir="rtl">{p.phrase}</span>
                   <span className="text-sm text-gray-400 font-bold">{p.meaning}</span>
                 </div>
               ))}
               {reading.analysis.patterns.length === 0 && <p className="text-xs text-gray-400 italic">Bulunamadı.</p>}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}