
import React, { useState } from 'react';

interface FlashcardProps {
  front: string;
  back: string;
  example?: string;
  isArabicFront?: boolean;
}

export default function Flashcard({ front, back, example, isArabicFront = true }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="perspective-1000 w-full aspect-[4/3] cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d shadow-xl rounded-[2.5rem] ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="absolute top-6 left-6 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#FFFBF0] dark:bg-[#2d2d2d] px-3 py-1 rounded-full">Okunuş</div>
          <h3 className={`text-4xl font-bold font-serif text-[#4A3728] dark:text-white leading-tight ${isArabicFront ? 'text-right' : ''}`} dir={isArabicFront ? 'rtl' : 'ltr'}>
            {front}
          </h3>
          <p className="text-xs text-gray-400 mt-2">Çevirmek için dokun</p>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden bg-[#4A3728] dark:bg-[#252525] rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center gap-6 rotate-y-180">
          <div className="absolute top-6 left-6 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Karşılık</div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold font-serif text-white">{back}</h3>
            {example && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mb-1">Örnek Cümle</p>
                <p className="text-sm text-white/70 italic leading-relaxed">{example}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-[#D4AF37]/50 mt-2">Geri dönmek için dokun</p>
        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
