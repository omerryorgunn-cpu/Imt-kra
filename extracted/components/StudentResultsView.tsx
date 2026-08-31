
import React, { useState, useEffect } from 'react';
import { Award, ChevronRight, MessageCircle, ChartBar as BarChart, Calendar, CircleCheck as CheckCircle, Circle as XCircle, CircleMinus as MinusCircle, User, Sparkles, X, ChevronLeft } from 'lucide-react';
import { User as UserType, ExamResult } from '../types';
import { mockDb } from '../services/mockDb';

interface StudentResultsViewProps {
  currentUser: UserType;
  onBack?: () => void;
}

export default function StudentResultsView({ currentUser, onBack }: StudentResultsViewProps) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const rawResults = mockDb.getResults(currentUser.id);
    // Safe sort to prevent crash if date or date.seconds is undefined
    const sorted = rawResults.sort((a, b) => {
      const dateA = a.date?.seconds || 0;
      const dateB = b.date?.seconds || 0;
      return dateB - dateA;
    });
    setResults(sorted);
  }, [currentUser.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-[#4A3728] dark:hover:text-white transition-colors">
          <ChevronLeft size={20}/> Ana Menü
        </button>
      )}
      
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFBF0] dark:bg-[#2d2d2d] rounded-full border border-[#D4AF37]/20">
          <Award className="text-[#D4AF37]" size={16} />
          <span className="text-xs font-bold text-[#4A3728] dark:text-[#D4AF37] uppercase tracking-widest">Başarı Takip Sistemi</span>
        </div>
        <h2 className="text-4xl font-bold font-serif text-[#4A3728] dark:text-white">Sınav Sonuçlarım</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Girdiğiniz sınavların analizlerini ve eğitmen yorumlarını buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid gap-4">
        {results.map(res => (
          <div 
            key={res.id} 
            onClick={() => setSelectedResult(res)}
            className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-[#D4AF37] transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold ${res.score >= 70 ? 'bg-green-50 text-green-600 dark:bg-green-900/10' : res.score >= 50 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/10' : 'bg-red-50 text-red-600 dark:bg-red-900/10'}`}>
                <span className="text-xl">{res.score}</span>
                <span className="text-[10px] uppercase">Puan</span>
              </div>
              <div>
                <h4 className="font-bold text-[#4A3728] dark:text-white group-hover:text-[#D4AF37] transition-colors">{res.examTitle}</h4>
                <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {res.date ? new Date(res.date.seconds * 1000).toLocaleDateString() : 'Tarih Yok'}</span>
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> {res.correctCount} Doğru</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {res.isShared && (
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 dark:border-blue-800/30">ANALİZ HAZIR</span>
              )}
              <ChevronRight className="text-gray-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}

        {results.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-[#1a1a1a] rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 space-y-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto text-gray-300">
              <BarChart size={40}/>
            </div>
            <p className="text-gray-400 italic">Henüz bir sınav sonucunuz bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in">
            <div className="p-8 bg-[#4A3728] dark:bg-[#252525] text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-bold font-serif">{selectedResult.examTitle}</h3>
                <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mt-1">Sınav Analiz Raporu</p>
              </div>
              <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              {/* Score Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-[#252525] p-4 rounded-2xl text-center space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Puan</p>
                   <p className="text-2xl font-bold text-[#4A3728] dark:text-white">{selectedResult.score}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl text-center space-y-1">
                   <p className="text-[10px] font-bold text-green-600 uppercase">Doğru</p>
                   <p className="text-2xl font-bold text-green-600">{selectedResult.correctCount}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl text-center space-y-1">
                   <p className="text-[10px] font-bold text-red-600 uppercase">Yanlış</p>
                   <p className="text-2xl font-bold text-red-600">{selectedResult.wrongCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#252525] p-4 rounded-2xl text-center space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Boş</p>
                   <p className="text-2xl font-bold text-gray-500">{selectedResult.emptyCount}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <h5 className="text-sm font-bold text-[#4A3728] dark:text-white uppercase tracking-widest">Başarı Yüzdesi</h5>
                   <span className="text-lg font-bold text-[#D4AF37]">{selectedResult.score}%</span>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden border border-gray-200 dark:border-white/5">
                  <div 
                    className={`h-full transition-all duration-1000 ${selectedResult.score >= 70 ? 'bg-green-500' : selectedResult.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${selectedResult.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="space-y-4">
                <h5 className="text-sm font-bold text-[#4A3728] dark:text-white flex items-center gap-2 uppercase tracking-widest">
                  <MessageCircle size={18} className="text-[#D4AF37]"/> Eğitmen Analizi
                </h5>
                <div className="bg-[#FFFBF0] dark:bg-[#2d2d2d] p-6 rounded-3xl border border-[#D4AF37]/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={40}/></div>
                   {selectedResult.isShared && selectedResult.feedback ? (
                     <div className="text-sm text-[#4A3728] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                       {selectedResult.feedback}
                     </div>
                   ) : (
                     <div className="text-center py-4 space-y-2">
                        <p className="text-sm text-gray-400">Yönetici henüz bu sınav için detaylı analiz paylaşmadı.</p>
                        <p className="text-[10px] font-bold text-[#D4AF37] uppercase">ANALİZ BEKLENİYOR</p>
                     </div>
                   )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex items-start gap-3 border border-blue-100 dark:border-blue-900/20">
                 <Award className="text-blue-500 shrink-0" size={18}/>
                 <p className="text-xs text-blue-700 dark:text-blue-300">Bu sonuç {currentUser.educationLevel} seviyesindeki genel ortalamanıza katkıda bulunmuştur. Zayıf olduğunuz konular için AI Asistanı'na danışabilirsiniz.</p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-[#1c1c1c] border-t dark:border-white/5 flex justify-end">
              <button onClick={() => setSelectedResult(null)} className="px-8 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl shadow-lg">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
