
import React, { useState } from 'react';
import { Search, Loader as Loader2, Book, Sparkles, Languages, ChevronRight, Hash, Link as LinkIcon, ArrowRightLeft, Info, Trash2 } from 'lucide-react';
import { getDictionaryLookup } from '../services/geminiService';

interface DictionaryResult {
  word: string;
  translation: string;
  root?: string;
  type: string;
  examples: { sentence: string; translation: string }[];
  synonyms: string[];
  antonyms: string[];
  notes?: string;
}

export default function DictionaryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(JSON.parse(localStorage.getItem('imtikra_dict_history') || '[]'));

  const handleSearch = async (e?: React.FormEvent, term?: string) => {
    if (e) e.preventDefault();
    const query = term || searchTerm;
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await getDictionaryLookup(query);
      setResult(data);
      
      // Update history
      const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('imtikra_dict_history', JSON.stringify(newHistory));
    } catch (error) {
      alert("Kelime aranırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('imtikra_dict_history');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFBF0] dark:bg-[#2d2d2d] rounded-full border border-[#D4AF37]/20">
          <Sparkles className="text-[#D4AF37]" size={16} />
          <span className="text-xs font-bold text-[#4A3728] dark:text-[#D4AF37] uppercase tracking-widest">Yapay Zeka Destekli Sözlük</span>
        </div>
        <h2 className="text-4xl font-bold font-serif text-[#4A3728] dark:text-white">Kelimenin Gücünü Keşfet</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Gemini ile zenginleştirilmiş Arapça-Türkçe sözlük. Örnek cümleler, eş ve zıt anlamlılar tek bir aramada.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#D4AF37] rounded-3xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
          <input
            type="text"
            placeholder="Kelime veya ifade ara..."
            className="w-full pl-14 pr-32 py-6 bg-white dark:bg-[#1a1a1a] text-xl dark:text-white rounded-3xl border-2 border-transparent focus:border-[#D4AF37] outline-none shadow-2xl transition-all relative z-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Languages className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37] z-20" size={24} />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-2xl flex items-center gap-2 z-20 hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Search size={20} /> Ara</>}
          </button>
        </div>
      </form>

      {/* Quick History */}
      {history.length > 0 && !result && !loading && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Son Aramalar</h4>
             <button onClick={clearHistory} className="text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1"><Trash2 size={10}/> Temizle</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((term, i) => (
              <button
                key={i}
                onClick={() => handleSearch(undefined, term)}
                className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-xl text-sm dark:text-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all shadow-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-6 animate-in zoom-in duration-300">
          {/* Main Meaning Card */}
          <div className="bg-white dark:bg-[#1a1a1a] p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/2 rounded-bl-full -mr-12 -mt-12"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#FFFBF0] dark:bg-[#2d2d2d] px-3 py-1 rounded-full">{result.type}</span>
                <h3 className="text-5xl font-bold font-serif text-[#4A3728] dark:text-white" dir="auto">{result.word}</h3>
                {result.root && <p className="text-sm text-gray-400 font-serif">Kök: <span dir="rtl" className="text-lg text-[#D4AF37]">{result.root}</span></p>}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Türkçe Anlamı</div>
                <div className="text-3xl font-bold text-[#4A3728] dark:text-[#D4AF37] font-serif">{result.translation}</div>
              </div>
            </div>

            {result.notes && (
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-start gap-3">
                <Info size={18} className="text-blue-500 shrink-0 mt-1" />
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed italic">{result.notes}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Example Sentences */}
            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
              <h4 className="font-bold text-[#4A3728] dark:text-white flex items-center gap-2">
                <Book className="text-[#D4AF37]" size={20} /> Örnek Kullanımlar
              </h4>
              <div className="space-y-6">
                {result.examples.map((ex, i) => (
                  <div key={i} className="space-y-2 group">
                    <p className="text-xl font-serif text-[#4A3728] dark:text-gray-200 text-right leading-relaxed" dir="rtl">{ex.sentence}</p>
                    <div className="flex items-center gap-2">
                       <ChevronRight size={14} className="text-[#D4AF37]" />
                       <p className="text-sm text-gray-500 dark:text-gray-400">{ex.translation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synonyms & Antonyms */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                <h4 className="font-bold text-[#4A3728] dark:text-white flex items-center gap-2">
                  <ArrowRightLeft className="text-[#D4AF37]" size={20} /> Kelime İlişkileri
                </h4>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Eş Anlamlılar (Mürâdif)</span>
                    <div className="flex flex-wrap gap-2">
                      {result.synonyms.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-xl text-sm font-serif border border-green-100 dark:border-green-900/20" dir="rtl">{s}</span>
                      ))}
                      {result.synonyms.length === 0 && <span className="text-xs text-gray-400 italic">Bulunamadı</span>}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Zıt Anlamlılar (Zıddı)</span>
                    <div className="flex flex-wrap gap-2">
                      {result.antonyms.map((a, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-xl text-sm font-serif border border-red-100 dark:border-red-900/20" dir="rtl">{a}</span>
                      ))}
                      {result.antonyms.length === 0 && <span className="text-xs text-gray-400 italic">Bulunamadı</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Useful Info */}
              <div className="bg-[#4A3728] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-tl-full transition-all group-hover:scale-110"></div>
                 <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mb-2">YDS/YÖKDİL İpucu</p>
                 <p className="text-sm text-white/80 leading-relaxed italic">"Bu kelime genellikle akademik metinlerde {result.type.toLowerCase()} olarak tercih edilir. Bağlama göre anlam kayması yaşayabilir."</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && !result && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
             <Sparkles className="absolute inset-0 m-auto text-[#D4AF37] animate-pulse" size={24}/>
           </div>
           <div className="text-center">
             <h4 className="font-bold text-[#4A3728] dark:text-white">Gemini Veritabanı Taranıyor</h4>
             <p className="text-xs text-gray-400">Anlamlar, kökler ve örnekler derleniyor...</p>
           </div>
        </div>
      )}
    </div>
  );
}
