import React, { useState, useEffect } from 'react';
import { MessageSquare, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, ChevronLeft, Loader as Loader2, Send, ImagePlus, Trash2 } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { User } from '../types';

interface StudentSupportViewProps {
  user: User;
  onBack: () => void;
}

export default function StudentSupportView({ user, onBack }: StudentSupportViewProps) {
  const [supportContent, setSupportContent] = useState('');
  const [supportImage, setSupportImage] = useState<string | null>(null);
  const [supportResult, setSupportResult] = useState<{type:string, msg:string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const allTickets = mockDb.getSupportTickets() || [];
    // Filter tickets for this user using senderContact or senderName
    const myTickets = allTickets.filter(t => t.senderContact === user.email || t.senderName === user.fullName);
    setTickets(myTickets);
  };

  const handleSupportImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupportImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportContent.trim()) return;
    setLoading(true);
    
    setTimeout(() => {
      mockDb.addSupportTicket({
        senderName: user.fullName,
        senderContact: user.email,
        content: supportContent,
        imageUrl: supportImage || undefined
      });
      setSupportResult({ type: 'success', msg: 'Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapılacaktır.' });
      setSupportContent('');
      setSupportImage(null);
      setLoading(false);
      loadTickets();
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
          <ChevronLeft size={24} className="text-[#4A3728] dark:text-white" />
        </button>
        <div>
          <h2 className="text-3xl font-bold font-serif text-[#4A3728] dark:text-white">Sorun Çöz & Destek</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Karşılaştığınız bir sorunu bildirin veya önceki taleplerinizi takip edin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-[50px] opacity-10"></div>
             
             <h3 className="text-xl font-bold text-[#4A3728] dark:text-white mb-6">Yeni Talep Oluştur</h3>
             
             <form onSubmit={submitSupportTicket} className="space-y-6 relative z-10">
                <textarea 
                  required 
                  rows={4}
                  placeholder="Mesajınız veya karşılaştığınız sorun..." 
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm resize-none dark:text-white"
                  value={supportContent}
                  onChange={e => setSupportContent(e.target.value)}
                />
                
                <div className="relative">
                  <input 
                    type="file"
                    accept="image/*"
                    id="supportImage"
                    className="hidden"
                    onChange={handleSupportImageUpload}
                  />
                  <label 
                    htmlFor="supportImage"
                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-500 hover:text-[#4A3728] dark:hover:text-[#D4AF37] font-medium"
                  >
                    <ImagePlus size={20} />
                    {supportImage ? 'Fotoğraf Seçildi (Değiştir)' : 'Sorunla İlgili Fotoğraf Yükle (İsteğe Bağlı)'}
                  </label>
                  {supportImage && (
                    <div className="mt-4 relative rounded-xl overflow-hidden shadow-sm inline-block">
                      <img src={supportImage} alt="Preview" className="h-32 w-auto object-cover" />
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setSupportImage(null); }} 
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500 transition-colors backdrop-blur-md"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-2xl hover:bg-[#36251b] dark:hover:bg-[#c39b2b] transition-all flex items-center justify-center gap-2 shadow-sm transform active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" size={20}/> : <Send size={18}/>}
                  {loading ? 'Gönderiliyor...' : 'Talebi İlet'}
                </button>
             </form>
             
             {supportResult && (
                <div className={`mt-6 p-4 rounded-2xl border bg-white dark:bg-black/20 shadow-sm animate-in zoom-in \${supportResult.type === 'success' ? 'border-green-200 text-green-700 dark:border-green-900/50 dark:text-green-400' : 'border-red-200 text-red-700 dark:border-red-900/50 dark:text-red-400'}`}>
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-xl \${supportResult.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                       {supportResult.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                     </div>
                     <p className="text-sm leading-relaxed font-medium">{supportResult.msg}</p>
                  </div>
                </div>
             )}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-[#4A3728] dark:text-white mb-6 flex items-center gap-2">
            <Clock size={20} className="text-gray-400"/> Geçmiş Taleplerim
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {tickets.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl text-gray-400 font-medium">
                Henüz bir destek talebi oluşturmadınız.
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className={`bg-white dark:bg-[#1a1a1a] rounded-3xl p-5 border shadow-sm flex flex-col gap-3 transition-all \${ticket.status === 'closed' ? 'opacity-70 border-gray-100 dark:border-white/5' : 'border-amber-200 dark:border-amber-900/50'}`}>
                   <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg \${ticket.status === 'closed' ? 'bg-gray-100 dark:bg-white/5 text-gray-500' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                        {ticket.status === 'closed' ? 'Çözüldü / Kapatıldı' : 'İnceleniyor'}
                      </span>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {new Date(ticket.createdAt.seconds * 1000).toLocaleString('tr-TR')}
                      </div>
                   </div>
                   <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                     {ticket.content}
                   </div>
                   {ticket.imageUrl && (
                     <a href={ticket.imageUrl} target="_blank" rel="noreferrer" className="block w-full max-w-[200px] mt-2 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5">
                       <img src={ticket.imageUrl} className="w-full h-auto object-cover" alt="Attachment" />
                     </a>
                   )}
                   {ticket.reply && (
                     <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl">
                       <h5 className="text-xs font-bold text-green-800 dark:text-green-300 mb-1 flex items-center gap-1"><CheckCircle size={14}/> Yönetici Yanıtı:</h5>
                       <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">{ticket.reply}</p>
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
