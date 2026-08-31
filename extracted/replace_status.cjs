const fs = require('fs');
let code = fs.readFileSync('components/AuthScreen.tsx', 'utf8');

const statusBlockStart = `          {authMode === 'status' && (`;
const statusBlockEnd = `          )}

          {authMode === 'forgot-password' && (`

const supportBlock = `          {authMode === 'support' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
              <button onClick={() => { setAuthMode('login'); setSupportResult(null); }} className="flex items-center gap-2 text-[#6C5C50] hover:text-[#4A3728] transition-colors font-semibold text-sm mb-4 group">
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Giriş Ekranına Dön
              </button>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-[#4A3728] font-serif tracking-tight">Sorun Çöz</h3>
                <p className="text-[#6C5C50] text-sm">Karşılaştığınız bir sorunu bildirin veya destek ekibiyle iletişime geçin.</p>
              </div>
              <form onSubmit={submitSupportTicket} className="space-y-6">
                <div className="space-y-4">
                  <input 
                    required 
                    placeholder="Ad Soyad" 
                    className="w-full p-4 bg-white/80 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm"
                    value={supportName}
                    onChange={e => setSupportName(e.target.value)}
                  />
                  <input 
                    required 
                    placeholder="İletişim Bilgisi (E-posta veya Telefon)" 
                    className="w-full p-4 bg-white/80 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm"
                    value={supportContact}
                    onChange={e => setSupportContact(e.target.value)}
                  />
                  <textarea 
                    required 
                    rows={4}
                    placeholder="Mesajınız..." 
                    className="w-full p-4 bg-white/80 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm resize-none"
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
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 hover:text-[#4A3728] font-medium"
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
                </div>
                
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#4A3728] text-white font-bold rounded-2xl hover:bg-[#36251b] transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(74,55,40,0.3)] transform active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" size={20}/> : <Send size={18}/>}
                  {loading ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                </button>
              </form>
              
              {supportResult && (
                <div className={\`p-6 rounded-2xl border bg-white shadow-sm animate-in zoom-in \${supportResult.type === 'success' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'}\`}>
                  <div className="flex items-center gap-3 mb-3">
                     <div className={\`p-2 rounded-xl \${supportResult.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}\`}>
                       {supportResult.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                     </div>
                     <h4 className="font-bold text-gray-800">{supportResult.type === 'success' ? 'Başarılı' : 'Hata'}</h4>
                  </div>
                  <p className="text-sm leading-relaxed font-medium text-gray-700 ml-1">{supportResult.msg}</p>
                </div>
              )}
            </div>
          )}

          {authMode === 'forgot-password' && (`;

let replaced = false;

if (code.includes(statusBlockStart) && code.includes(statusBlockEnd)) {
    const startIndex = code.indexOf(statusBlockStart);
    const endIndex = code.indexOf(statusBlockEnd) + statusBlockEnd.length;
    code = code.substring(0, startIndex) + supportBlock + code.substring(endIndex);
    fs.writeFileSync('components/AuthScreen.tsx', code);
    console.log("Replaced using substring");
    replaced = true;
} else {
    console.log("Could not find blocks");
}
