
import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, CircleCheck as CheckCircle, CircleAlert as AlertCircle, X, Loader as Loader2 } from 'lucide-react';
import { User, Exam } from '../types';

interface ExamRoomProps {
  exam: Exam;
  userProfile: User;
  onFinish: (result: { score: number, correct: number, wrong: number, empty: number, total: number, answers: Record<number, string> }) => void;
  onCancel: () => void;
}

export default function ExamRoom({ exam, userProfile, onFinish, onCancel }: ExamRoomProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const answersRef = useRef(answers);
  const isSubmittingRef = useRef(isSubmitting);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const handleSubmit = (forced: boolean = false) => {
    if (isSubmittingRef.current) return;
    
    if (!forced && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      let correct = 0;
      let wrong = 0;
      let empty = 0;
      let totalScore = 0;
      const currentAnswers = answersRef.current;
      
      exam.questions.forEach((q, idx) => {
        if (!currentAnswers[idx]) {
          empty++;
        } else if (currentAnswers[idx] === q.correctOption) {
          correct++;
          totalScore += (q.points || 0);
        } else {
          wrong++;
        }
      });

      const totalQuestions = exam.questions.length || 1;
      // Küsüratlı puanları koruyup virgülden sonra en fazla 2 basamak alıyoruz
      const finalScore = Number(totalScore.toFixed(2));
      
      onFinish({
        score: finalScore,
        correct,
        wrong,
        empty,
        total: totalQuestions,
        answers: currentAnswers
      });
    }, 800);
  };

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (opt: string) => {
    if (isSubmitting) return;
    setAnswers(prev => ({ ...prev, [currentIdx]: opt }));
  };

  const currentQ = exam.questions[currentIdx];

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
        <h2 className="text-xl font-bold text-[#4A3728] dark:text-white">Sınav Sonuçları Hesaplanıyor...</h2>
        <p className="text-gray-500">Lütfen bekleyin, bu işlem çok kısa sürecek.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#4A3728] dark:text-white">Emin misiniz?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sınavı bitirdiğinizde cevaplarınız kaydedilecek ve geri dönemeyeceksiniz.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleSubmit(false)}
                className="w-full py-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl hover:bg-[#36251b] dark:hover:bg-[#b59022] transition-colors"
              >
                Evet, Sınavı Bitir
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full py-3 text-gray-400 font-bold hover:text-[#4A3728] dark:hover:text-white transition-colors"
              >
                Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex justify-between items-center sticky top-20 z-40">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-lg text-gray-400" title="Sınavdan Çık"><X size={20}/></button>
          <h2 className="font-bold text-[#4A3728] dark:text-white hidden sm:block">{exam.title}</h2>
        </div>
        <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 animate-pulse' : 'bg-[#FFFBF0] dark:bg-[#2d2d2d] text-[#D4AF37]'}`}>
          <Clock size={18}/> {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#1a1a1a] p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Soru {currentIdx + 1} / {exam.questions.length}</div>
              {answers[currentIdx] && <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">İşaretlendi</span>}
            </div>
            <p className="text-lg sm:text-xl text-[#4A3728] dark:text-white font-medium leading-relaxed mb-8">{currentQ?.text || "Soru yüklenemedi."}</p>
            <div className="space-y-3">
              {currentQ && Object.entries(currentQ.options).map(([key, val]) => (
                <button 
                  key={key} 
                  onClick={() => handleSelect(key)}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center gap-4 ${answers[currentIdx] === key ? 'border-[#4A3728] dark:border-[#D4AF37] bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] shadow-lg' : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-[#D4AF37]/30 hover:bg-gray-50 dark:hover:bg-[#252525] text-gray-700 dark:text-gray-300'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${answers[currentIdx] === key ? 'bg-white text-[#4A3728]' : 'bg-gray-100 dark:bg-[#333] text-gray-500'}`}>
                    {key.toUpperCase()}
                  </span>
                  <span className="text-sm sm:text-base">{val}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-white dark:bg-[#1a1a1a] border dark:border-white/5 text-gray-400 disabled:opacity-30 hover:border-gray-300 transition-colors">
              <ChevronLeft size={20}/> <span className="hidden sm:inline">Önceki</span>
            </button>
            
            {currentIdx < exam.questions.length - 1 ? (
              <button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] hover:bg-[#36251b] dark:hover:bg-[#b59022] transition-all">
                <span className="hidden sm:inline">Sonraki</span> Soru <ChevronRight size={20}/>
              </button>
            ) : (
              <button 
                onClick={() => handleSubmit(false)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-[#D4AF37] text-white dark:text-[#4A3728] shadow-lg shadow-[#D4AF37]/30 hover:bg-[#b59022] transition-all transform hover:scale-105">
                Sınavı Bitir <CheckCircle size={20}/>
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-1 bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/5 h-fit space-y-4 shadow-sm">
          <h4 className="font-bold text-sm text-gray-400 uppercase tracking-tighter">Soru Navigasyonu</h4>
          <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
            {exam.questions.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentIdx(i)}
                className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${currentIdx === i ? 'ring-2 ring-offset-2 ring-[#4A3728] dark:ring-[#D4AF37] bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728]' : answers[i] ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-500' : 'bg-gray-100 dark:bg-[#2d2d2d] text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
