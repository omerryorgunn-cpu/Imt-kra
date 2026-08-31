
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Brain, Sparkles, X, Save, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { User, PersonalWord, ReadingText } from '../types';
import { mockDb } from '../services/mockDb';
import Flashcard from './Flashcard';

interface VocabularyViewProps {
  currentUser: User;
}

export default function VocabularyView({ currentUser }: VocabularyViewProps) {
  const [personalWords, setPersonalWords] = useState<PersonalWord[]>([]);
  const [readingTexts, setReadingTexts] = useState<ReadingText[]>([]);
  const [activeTab, setActiveTab] = useState<'notebook' | 'flashcards'>('notebook');
  const [filter, setFilter] = useState<'all' | 'personal' | 'readings'>('all');
  
  // Flashcard states
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isStudyMode, setIsStudyMode] = useState(false);

  // Custom confirmation dialog state to bypass iframe confirm limitations
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const safeConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ message, onConfirm });
  };

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState({ arabic: '', turkish: '', example: '' });

  useEffect(() => {
    setPersonalWords(mockDb.getPersonalWords(currentUser.id));
    setReadingTexts(mockDb.getReadingTexts());
  }, [currentUser.id]);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.arabic || !newWord.turkish) return;

    const added = mockDb.addPersonalWord({
      ...newWord,
      userId: currentUser.id
    });
    setPersonalWords([added, ...personalWords]);
    setNewWord({ arabic: '', turkish: '', example: '' });
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    safeConfirm("Bu kelime defterinizden silinsin mi?", () => {
      mockDb.deletePersonalWord(id);
      setPersonalWords(personalWords.filter(w => w.id !== id));
    });
  };

  // Metinlerden otomatik kelime kartlarını derle
  // Added 'example' property to ensure type compatibility with personalWords in the flashcard list
  const readingWords = readingTexts.flatMap(text => 
    (text.analysis?.vocabulary || []).map(v => ({
      id: `reading-${text.id}-${v.word}`,
      arabic: v.word,
      turkish: v.meaning,
      source: text.title,
      type: 'reading' as const,
      example: undefined as string | undefined
    }))
  );

  const allFlashcards = [
    ...personalWords.map(w => ({ ...w, source: 'Defterim', type: 'personal' as const })),
    ...readingWords
  ];

  const filteredFlashcards = allFlashcards.filter(c => {
    if (filter === 'personal') return c.type === 'personal';
    if (filter === 'readings') return c.type === 'reading';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFBF0] dark:bg-[#2d2d2d] rounded-full border border-[#D4AF37]/20">
          <Brain className="text-[#D4AF37]" size={16} />
          <span className="text-xs font-bold text-[#4A3728] dark:text-[#D4AF37] uppercase tracking-widest">Öğrenme Merkezi</span>
        </div>
        <h2 className="text-4xl font-bold font-serif text-[#4A3728] dark:text-white">Kelime Defteri & Kartlar</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Kendi kelimelerinizi kaydedin ve okuma metinlerinden derlenen kartlarla pratik yapın.</p>
      </div>

      <div className="flex justify-center border-b border-gray-200 dark:border-white/5">
        <button 
          onClick={() => { setActiveTab('notebook'); setIsStudyMode(false); }}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'notebook' ? 'border-[#4A3728] dark:border-[#D4AF37] text-[#4A3728] dark:text-[#D4AF37]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center gap-2"><List size={18}/> Kelime Listem</div>
        </button>
        <button 
          onClick={() => setActiveTab('flashcards')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'flashcards' ? 'border-[#4A3728] dark:border-[#D4AF37] text-[#4A3728] dark:text-[#D4AF37]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center gap-2"><LayoutGrid size={18}/> Flashcard Pratiği</div>
        </button>
      </div>

      {activeTab === 'notebook' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#4A3728] dark:text-white font-serif">Kendi Kelimelerim</h3>
              <p className="text-xs text-gray-400">Defterinizde kayıtlı {personalWords.length} kelime var.</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus size={20}/> Yeni Kelime Ekle
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalWords.map(word => (
              <div key={word.id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 hover:border-[#D4AF37] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/2 rounded-bl-full -mr-12 -mt-12"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-2xl font-bold font-serif text-[#4A3728] dark:text-white" dir="rtl">{word.arabic}</h4>
                    <button 
                      onClick={() => handleDelete(word.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-[#D4AF37]">{word.turkish}</p>
                    {word.example && <p className="text-xs text-gray-400 italic leading-relaxed line-clamp-2">"{word.example}"</p>}
                  </div>
                  <div className="mt-auto pt-4 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
                    {word?.createdAt?.seconds ? new Date(word.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            ))}
            {personalWords.length === 0 && (
              <div className="col-span-full py-20 bg-white dark:bg-[#1a1a1a] rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-4 text-center">
                 <div className="w-16 h-16 bg-gray-50 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center text-gray-300">
                    <Plus size={32}/>
                 </div>
                 <div className="space-y-1">
                   <h4 className="font-bold text-[#4A3728] dark:text-white">Henüz kelime eklemediniz</h4>
                   <p className="text-xs text-gray-400">Çalışmak istediğiniz kelimeleri defterinize ekleyerek başlayın.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {!isStudyMode ? (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 text-center space-y-6">
                <div className="w-20 h-20 bg-[#FFFBF0] dark:bg-[#2d2d2d] rounded-3xl flex items-center justify-center text-[#D4AF37] mx-auto shadow-inner">
                  <LayoutGrid size={40}/>
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-bold text-[#4A3728] dark:text-white font-serif">Çalışma Moduna Hazır mısınız?</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Kelime kartları ile interaktif çalışma yapın. Hem kendi kelimeleriniz hem de okuduğunuz metinlerden seçilen akademik kelimelerle pratik yapabilirsiniz.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-[#252525] rounded-2xl">
                  {(['all', 'personal', 'readings'] as const).map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-white dark:bg-[#4A3728] text-[#4A3728] dark:text-white shadow-md' : 'text-gray-400'}`}
                    >
                      {f === 'all' ? 'Hepsi' : f === 'personal' ? 'Sadece Defterim' : 'Sadece Okumalar'}
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <button 
                    disabled={filteredFlashcards.length === 0}
                    onClick={() => { setIsStudyMode(true); setCurrentCardIdx(0); }}
                    className="w-full py-5 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-2xl shadow-xl shadow-[#4A3728]/20 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <Sparkles size={24}/> {filteredFlashcards.length} Kartı Çalışmaya Başla
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in duration-300">
               <div className="flex items-center justify-between max-w-xl mx-auto">
                 <button onClick={() => setIsStudyMode(false)} className="flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-xs transition-colors">
                   <X size={16}/> Modu Kapat
                 </button>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-[#252525] px-3 py-1 rounded-full border border-gray-100 dark:border-white/5">
                   Kart {currentCardIdx + 1} / {filteredFlashcards.length}
                 </div>
               </div>

               <div className="max-w-xl mx-auto">
                 <Flashcard 
                   front={filteredFlashcards[currentCardIdx].arabic}
                   back={filteredFlashcards[currentCardIdx].turkish}
                   example={filteredFlashcards[currentCardIdx].example || `Kaynak: ${filteredFlashcards[currentCardIdx].source}`}
                 />
               </div>

               <div className="flex justify-center gap-6">
                 <button 
                  disabled={currentCardIdx === 0}
                  onClick={() => setCurrentCardIdx(prev => prev - 1)}
                  className="w-14 h-14 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all disabled:opacity-30 shadow-lg"
                 >
                   <ChevronLeft size={32}/>
                 </button>
                 <button 
                  disabled={currentCardIdx === filteredFlashcards.length - 1}
                  onClick={() => setCurrentCardIdx(prev => prev + 1)}
                  className="w-14 h-14 bg-[#4A3728] dark:bg-[#D4AF37] rounded-full flex items-center justify-center text-white dark:text-[#4A3728] hover:scale-110 active:scale-90 transition-all shadow-xl shadow-[#4A3728]/30 disabled:opacity-30"
                 >
                   <ChevronRight size={32}/>
                 </button>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 bg-[#4A3728] dark:bg-[#252525] text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Sparkles className="text-[#D4AF37]" size={18}/> Deftere Kelime Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddWord} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Arapça Kelime</label>
                <input 
                  required
                  placeholder="Arapça kelimeyi yazın..."
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] dark:text-white border-2 border-transparent focus:border-[#D4AF37] rounded-2xl outline-none font-serif text-2xl text-right transition-all"
                  dir="rtl"
                  value={newWord.arabic}
                  onChange={e => setNewWord({...newWord, arabic: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Türkçe Anlamı</label>
                <input 
                  required
                  placeholder="Türkçe karşılığını yazın..."
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] dark:text-white border-2 border-transparent focus:border-[#D4AF37] rounded-2xl outline-none text-sm transition-all"
                  value={newWord.turkish}
                  onChange={e => setNewWord({...newWord, turkish: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Örnek Cümle (Opsiyonel)</label>
                <textarea 
                  placeholder="Kullanım örneği..."
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] dark:text-white border-2 border-transparent focus:border-[#D4AF37] rounded-2xl outline-none text-sm h-24 transition-all"
                  value={newWord.example}
                  onChange={e => setNewWord({...newWord, example: e.target.value})}
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-2xl shadow-xl hover:bg-[#36251b] dark:hover:bg-[#b59022] transition-colors flex items-center justify-center gap-2">
                  <Save size={18}/> Deftere Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       {/* CUSTOM CONFIRMATION DIALOG */}
       {confirmDialog && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] w-full max-w-sm p-6 shadow-2xl border border-gray-100 dark:border-white/5 text-center animate-in zoom-in">
             <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
               <Trash2 size={32} />
             </div>
             <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Onaylıyor musunuz?</h4>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{confirmDialog.message}</p>
             <div className="flex gap-3 justify-center">
               <button 
                 onClick={() => setConfirmDialog(null)} 
                 className="flex-1 py-3 bg-gray-100 dark:bg-[#252525] hover:bg-gray-200 dark:hover:bg-[#303030] rounded-xl text-xs font-bold transition-all text-gray-600 dark:text-gray-300"
               >
                 Vazgeç
               </button>
               <button 
                 onClick={() => {
                   confirmDialog.onConfirm();
                   setConfirmDialog(null);
                 }} 
                 className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20"
               >
                 Evet, Onayla
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
