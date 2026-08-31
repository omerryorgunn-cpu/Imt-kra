import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, ChevronRight, UserPlus, X, Megaphone, Feather, Clock, ChevronLeft, ShieldCheck, CircleCheck as CheckCircle, Smartphone, GraduationCap, Search, CircleAlert as AlertCircle, MessageSquare, FileText, CreditCard, TriangleAlert as AlertTriangle, Loader as Loader2, ImagePlus, Send, Trash2 } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { User, Announcement, SubscriptionPlan, PlanConfig } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  logoUrl: string;
}

const EDUCATION_LEVEL_OPTIONS = ["Lise", "Lisans", "Yüksek Lisans", "Doktora", "Diğer"];

export default function AuthScreen({ onLoginSuccess, logoUrl }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'support' | 'forgot-password'>('login'); 
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // KVKK Modal State
  const [showKvkk, setShowKvkk] = useState(false);

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  const [supportName, setSupportName] = useState('');
  const [supportContact, setSupportContact] = useState('');
  const [supportContent, setSupportContent] = useState('');
  const [supportImage, setSupportImage] = useState<string | null>(null);
  const [supportResult, setSupportResult] = useState<{type:string, msg:string} | null>(null);
  
  // Register Form Data
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '', 
    phone: '',
    password: '', 
    educationLevel: 'Lisans',
    customEducation: '',
    kvkkAccepted: false,
    selectedPlan: 'trial' as SubscriptionPlan
  });

  // Validation Error State
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Input Refs for Auto-Focus
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const educationRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    // Load announcements
    const all = mockDb.getAnnouncements();
    const now = new Date();
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
    const sorted = active.sort((a, b) => (b.isTicker ? 1 : 0) - (a.isTicker ? 1 : 0));
    setAnnouncements(sorted);
    
    // Load Plans and Sort (Popular First)
    const dbPlans = mockDb.getPlans();
    if (dbPlans && dbPlans.length > 0) {
        const sortedPlans = dbPlans.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        setPlans(sortedPlans);
        
        // Set default selected plan
        const trialPlan = sortedPlans.find(p => p.id === 'trial');
        if (trialPlan) {
            setFormData(prev => ({...prev, selectedPlan: 'trial'}));
        } else {
            setFormData(prev => ({...prev, selectedPlan: sortedPlans[0].id}));
        }
    }

    setImgError(false);
  }, [logoUrl]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    let firstErrorField = '';

    // Ad Soyad Kontrolü (En az 2 kelime)
    const nameParts = formData.fullName.trim().split(/\s+/);
    if (nameParts.length < 2 || nameParts.some(p => p.length < 2)) {
      errors.fullName = "Lütfen geçerli bir Ad ve Soyad giriniz (En az 2 kelime).";
      if (!firstErrorField) firstErrorField = 'fullName';
    }

    // Telefon Formatı (05...)
    const phoneClean = formData.phone.replace(/\s/g, '');
    const phoneRegex = /^05\d{9}$/;
    if (!phoneClean) {
        errors.phone = "Telefon numarası boş bırakılamaz.";
        if (!firstErrorField) firstErrorField = 'phone';
    } else if (!phoneRegex.test(phoneClean)) {
        errors.phone = "Telefon '05' ile başlamalı ve 11 haneli olmalıdır. (Örn: 05551234567)";
        if (!firstErrorField) firstErrorField = 'phone';
    }

    // Email Formatı
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
        errors.email = "E-posta adresi boş bırakılamaz.";
        if (!firstErrorField) firstErrorField = 'email';
    } else if (!emailRegex.test(formData.email)) {
        errors.email = "Geçerli bir e-posta adresi giriniz. (Örn: ornek@gmail.com)";
        if (!firstErrorField) firstErrorField = 'email';
    }

    // Şifre Gücü
    if (formData.password.length < 6) {
      errors.password = "Şifre en az 6 karakter olmalıdır.";
      if (!firstErrorField) firstErrorField = 'password';
    }

    // Eğitim Durumu Diğer ise dolu olmalı
    if (formData.educationLevel === 'Diğer' && !formData.customEducation.trim()) {
       errors.customEducation = "Lütfen eğitim durumunuzu belirtiniz.";
       // Focus custom input not implemented ref for custom, sticking to basics
    }

    setFormErrors(errors);

    // Auto-focus logic
    if (firstErrorField === 'fullName') fullNameRef.current?.focus();
    else if (firstErrorField === 'email') emailRef.current?.focus();
    else if (firstErrorField === 'phone') phoneRef.current?.focus();
    else if (firstErrorField === 'password') passwordRef.current?.focus();

    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); setLoading(true);
    const users = mockDb.getUsers(); // This will trigger auto-approval logic for trial users
    const user = users.find(u => u.email === loginEmail && u.password === loginPass);
    
    if (!user) { setLoginError("Hatalı e-posta/kullanıcı adı veya şifre."); setLoading(false); return; }
    if (user.isBanned) { setLoginError("Üyeliğiniz yönetici tarafından iptal edilmiştir."); setLoading(false); return; }
    
    // Subscription Expiry Check for non-admin users
    if (user.role !== 'admin' && user.subscriptionEndDate && typeof user.subscriptionEndDate.seconds === 'number') {
      const now = Date.now() / 1000;
      if (now > user.subscriptionEndDate.seconds) {
        setLoginError("Abonelik süreniz dolmuştur. Lütfen yönetici ile iletişime geçin.");
        setLoading(false);
        return;
      }
    }

    if (user.status === 'pending') { 
      // Specific message for trial users trying to login early
      if (user.subscriptionPlan === 'trial') {
        alert("Deneme sürümü kaydınız sistem kontrollerinden geçmektedir. Yaklaşık 1 saat içinde otomatik onaylanacaktır.");
      } else {
        alert("Başvurunuz henüz ödeme onay aşamasındadır."); 
      }
      setLoading(false); 
      return; 
    }
    
    onLoginSuccess(user as User);
    setLoading(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Sistem Doğrulaması (Validation)
    if (!validateForm()) {
      return;
    }

    if (!formData.kvkkAccepted) { alert("Lütfen KVKK metnini onaylayın."); return; }
    
    // 2. Benzersizlik Kontrolü
    const errorMsg = mockDb.checkUserExists(formData.email, formData.phone);
    if (errorMsg) {
      alert(errorMsg);
      // Highlight existing field if known
      if (errorMsg.includes("e-posta")) {
        setFormErrors({ ...formErrors, email: errorMsg });
        emailRef.current?.focus();
      } else if (errorMsg.includes("telefon")) {
        setFormErrors({ ...formErrors, phone: errorMsg });
        phoneRef.current?.focus();
      }
      return;
    }

    // Calculate subscription dates
    const plan = plans.find(p => p.id === formData.selectedPlan);
    const daysToAdd = plan ? plan.days : 7;
    const now = new Date();
    const startDate = { seconds: now.getTime() / 1000 };
    const endDate = { seconds: (now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000)) / 1000 };

    // Final Education Value
    const finalEduLevel = formData.educationLevel === 'Diğer' ? formData.customEducation : formData.educationLevel;

    mockDb.addUser({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      educationLevel: finalEduLevel,
      role: 'student',
      status: 'pending',
      isBanned: false,
      gender: 'Belirtilmedi',
      educationField: '',
      occupation: '',
      address: '',
      createdAt: startDate,
      registrationChannel: 'Web Kaydı',
      subscriptionPlan: formData.selectedPlan,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate
    });

    const successMsg = formData.selectedPlan === 'trial' 
      ? "Deneme sürümü başvurunuz alındı. Sistem kontrollerinin ardından yaklaşık 1 saat içinde üyeliğiniz otomatik aktifleşecektir."
      : "Başvurunuz başarıyla sisteme kaydedildi. Ödeme onayı ardından üyeliğiniz aktifleşecektir.";

    alert(successMsg);
    setAuthMode('login');
    setFormData({ 
      fullName: '', email: '', phone: '', password: '', 
      educationLevel: 'Lisans', customEducation: '', 
      kvkkAccepted: false, selectedPlan: 'trial' 
    });
    setFormErrors({});
  };

  const submitSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName.trim() || !supportContent.trim() || !supportContact.trim()) return;
    setLoading(true);
    
    setTimeout(() => {
      mockDb.addSupportTicket({
        senderName: supportName,
        senderContact: supportContact,
        content: supportContent,
        imageUrl: supportImage || undefined
      });
      setSupportResult({ type: 'success', msg: 'Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapılacaktır.' });
      setSupportName('');
      setSupportContact('');
      setSupportContent('');
      setSupportImage(null);
      setLoading(false);
    }, 1200);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] p-4 relative overflow-hidden font-sans">
      <style>{`
        @keyframes scrollUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .announcement-scroll { animation: scrollUp 30s linear infinite; }
        .announcement-scroll:hover { animation-play-state: paused; }
        .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); }
        .floating-blob { animation: float 10s ease-in-out infinite; }
        @keyframes float { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
      `}</style>

      {/* Modern Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 rounded-full blur-[120px] floating-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#4A3728]/10 rounded-full blur-[140px] floating-blob" style={{ animationDelay: '-5s' }}></div>
      <div className="absolute inset-0 bg-[#FDFCF8]/50 backdrop-blur-[2px]"></div>

      {/* KVKK Modal */}
      {showKvkk && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-[#D4AF37]/20 max-h-[80vh]">
            <div className="p-6 bg-[#4A3728] text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold flex items-center gap-2"><ShieldCheck size={20} className="text-[#D4AF37]"/> KVKK Aydınlatma Metni</h3>
              <button onClick={() => setShowKvkk(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar text-sm text-gray-600 leading-relaxed space-y-4">
              <p><strong>Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</strong></p>
              <p>İMTİKRA olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında işlemekteyiz.</p>
              <p><strong>1. İşlenen Kişisel Verileriniz:</strong><br/>Ad-soyad, iletişim bilgileri (telefon, e-posta), parola bilgileri.</p>
              <p><strong>2. İşleme Amaçları:</strong><br/>Üyelik işlemlerinin gerçekleştirilmesi, sınav sonuçlarının analizi, platform içi iletişimin sağlanması.</p>
              <p><strong>3. Veri Güvenliği:</strong><br/>Verileriniz üçüncü şahıslarla paylaşılmamakta olup, güvenli sunucularda saklanmaktadır.</p>
              <p>Onay vererek bu şartları kabul etmiş sayılırsınız.</p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setShowKvkk(false)} className="px-6 py-2 bg-[#4A3728] text-white font-bold rounded-xl text-sm">Okudum, Anladım</button>
            </div>
          </div>
        </div>
      )}

      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in zoom-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col border border-[#D4AF37]/20">
            <div className="relative">
              {selectedAnnouncement.imageUrl ? (
                <img src={selectedAnnouncement.imageUrl} className="w-full h-56 object-cover" alt="Duyuru" />
              ) : (
                <div className="w-full h-32 bg-[#4A3728] flex items-center justify-center">
                   <Megaphone size={48} className="text-[#D4AF37] opacity-20" />
                </div>
              )}
              <button onClick={() => setSelectedAnnouncement(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all">
                <X size={20}/>
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                <Clock size={12}/> {selectedAnnouncement?.createdAt?.seconds ? new Date(selectedAnnouncement.createdAt.seconds * 1000).toLocaleDateString() : '-'}
              </div>
              <h3 className="text-2xl font-bold text-[#4A3728] font-serif leading-tight">{selectedAnnouncement.title}</h3>
              <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="w-full py-4 bg-[#4A3728] text-white font-bold rounded-xl hover:bg-[#36251b] transition-all">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1040px] w-full rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row border border-white/50 glass-panel">
        
        {/* Left Side: Modern Brand Area */}
        <div className="md:w-[45%] bg-gradient-to-br from-[#4A3728] to-[#2B1F16] p-10 md:p-12 text-center text-white flex flex-col items-center shrink-0 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-[80px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-10"></div>
          
          <div className="mb-8 flex items-center justify-center relative z-10">
            {!imgError && logoUrl ? (
              <img 
                src={logoUrl} 
                className="max-w-[160px] max-h-[120px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
                alt="Logo" 
                onError={() => setImgError(true)} 
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl border border-[#D4AF37]/30 bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent opacity-50 rounded-3xl"></div>
                <div className="flex flex-col items-center justify-center text-[#D4AF37] relative z-10">
                  <Feather size={36} strokeWidth={1.5} /><span className="text-[10px] font-bold mt-1 tracking-widest">عك</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative z-10 mb-10">
            <h2 className="text-4xl font-bold font-serif mb-3 tracking-wide">İMTİKRA</h2>
            <p className="text-[#D4AF37] text-xs tracking-[0.3em] font-medium opacity-90">YDS • YÖKDİL • YDT</p>
          </div>
          
          <div className="w-full mt-auto relative z-10 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-[#D4AF37]/90 bg-[#D4AF37]/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/20">
              <Megaphone size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Güncel Duyurular</span>
            </div>
            <div className="h-48 w-full bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden relative shadow-inner">
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#2B1F16] to-transparent z-10 pointer-events-none opacity-80"></div>
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#2B1F16] to-transparent z-10 pointer-events-none opacity-80"></div>
              
              <div className="announcement-scroll space-y-3 p-4">
                {[...announcements, ...announcements].map((ann, idx) => (
                  <div 
                    key={`${ann.id}-${idx}`} 
                    onClick={() => setSelectedAnnouncement(ann)}
                    className={`p-4 rounded-xl transition-all cursor-pointer group/card text-left ${ann.isTicker ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`text-xs font-semibold line-clamp-1 group-hover/card:text-white transition-colors ${ann.isTicker ? 'text-[#D4AF37]' : 'text-white/80'}`}>{ann.title}</h4>
                      {ann.isTicker && <span className="text-[8px] bg-[#D4AF37] text-[#4A3728] px-1.5 py-0.5 rounded font-black shadow-lg">YENİ</span>}
                    </div>
                    <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <div className="text-xs text-white/30 italic text-center py-10">Henüz duyuru yayınlanmadı.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="md:w-[55%] p-8 md:p-14 max-h-[85vh] overflow-y-auto custom-scrollbar bg-white/50 relative">
          <div className="absolute inset-0 bg-white/40 pointer-events-none"></div>
          <div className="relative z-10">
          {authMode === 'login' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-[#4A3728] font-serif tracking-tight">Hoş Geldiniz</h3>
                <p className="text-[#6C5C50] text-sm">Eğitim serüveninize kaldığınız yerden devam edin.</p>
              </div>
              
              {loginError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <AlertCircle size={18} />
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="group relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A3728] transition-colors" size={20} />
                    <input 
                      required 
                      type="text" 
                      placeholder="E-posta veya Kullanıcı Adı" 
                      className="w-full pl-12 p-4 bg-white/80 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm" 
                      value={loginEmail} 
                      onChange={e => setLoginEmail(e.target.value)} 
                    />
                  </div>
                  <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A3728] transition-colors" size={20} />
                    <input required type="password" placeholder="Şifre" className="w-full pl-12 p-4 bg-white/80 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all shadow-sm" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setAuthMode('forgot-password')} className="text-xs font-semibold text-[#6C5C50] hover:text-[#4A3728] hover:underline transition-all">Şifremi Unuttum</button>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#4A3728] text-white font-bold rounded-2xl hover:bg-[#36251b] transition-all shadow-[0_8px_30px_rgb(74,55,40,0.3)] flex items-center justify-center gap-2 group transform active:scale-[0.98]">
                  {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform opacity-70" />
                </button>
              </form>
              <div className="pt-8 border-t border-gray-200/60 flex flex-col gap-4">
                <button onClick={() => { setAuthMode('register'); setFormErrors({}); }} className="w-full py-4 bg-[#FDFCF8] border border-[#D4AF37]/50 text-[#4A3728] font-bold rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                  <UserPlus size={18} /> Hemen Kayıt Ol
                </button>
                <button onClick={() => setAuthMode('support')} className="w-full py-2 text-gray-400 text-xs font-semibold hover:text-[#4A3728] transition-colors flex items-center justify-center gap-1">
                  <MessageSquare size={14} /> Sorun Çöz
                </button>
              </div>
            </div>
          )}

          {authMode === 'register' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
              <button onClick={() => setAuthMode('login')} className="flex items-center gap-2 text-[#6C5C50] hover:text-[#4A3728] transition-colors font-semibold text-sm mb-2 group">
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Giriş Ekranına Dön
              </button>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-[#4A3728] font-serif tracking-tight">Kayıt & Paket Seçimi</h3>
                <p className="text-sm text-[#6C5C50]">Bilgileriniz sistem tarafından otomatik doğrulanacaktır.</p>
              </div>
              <form onSubmit={handleRegister} className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ml-1 tracking-wider ${formErrors.fullName ? 'text-red-500' : 'text-[#6C5C50]'}`}>Ad Soyad</label>
                  <div className="group relative">
                    <UserPlus className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.fullName ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#4A3728]'}`} size={18}/>
                    <input 
                      ref={fullNameRef}
                      required 
                      placeholder="Ad ve Soyad" 
                      className={`w-full pl-11 p-3.5 bg-white/80 border rounded-xl outline-none focus:ring-2 transition-all shadow-sm ${formErrors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]'}`} 
                      value={formData.fullName} 
                      onChange={e => { setFormData({...formData, fullName: e.target.value}); if(formErrors.fullName) setFormErrors({...formErrors, fullName: ''}) }} 
                    />
                  </div>
                  {formErrors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1 animate-in slide-in-from-left-2">{formErrors.fullName}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ml-1 tracking-wider ${formErrors.email ? 'text-red-500' : 'text-[#6C5C50]'}`}>E-posta (Kullanıcı Adı Olacak)</label>
                  <div className="group relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#4A3728]'}`} size={18}/>
                    <input 
                      ref={emailRef}
                      required 
                      type="email" 
                      placeholder="E-posta" 
                      className={`w-full pl-11 p-3.5 bg-white/80 border rounded-xl outline-none focus:ring-2 transition-all shadow-sm ${formErrors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]'}`} 
                      value={formData.email} 
                      onChange={e => { setFormData({...formData, email: e.target.value}); if(formErrors.email) setFormErrors({...formErrors, email: ''}) }} 
                    />
                  </div>
                  {formErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1 animate-in slide-in-from-left-2">{formErrors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ml-1 tracking-wider ${formErrors.phone ? 'text-red-500' : 'text-[#6C5C50]'}`}>Telefon (05XX...)</label>
                  <div className="group relative">
                    <Smartphone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.phone ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#4A3728]'}`} size={18}/>
                    <input 
                      ref={phoneRef}
                      required 
                      placeholder="05XX XXX XX XX" 
                      className={`w-full pl-11 p-3.5 bg-white/80 border rounded-xl outline-none focus:ring-2 transition-all shadow-sm ${formErrors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]'}`} 
                      value={formData.phone} 
                      onChange={e => { setFormData({...formData, phone: e.target.value}); if(formErrors.phone) setFormErrors({...formErrors, phone: ''}) }} 
                    />
                  </div>
                  {formErrors.phone && <p className="text-[10px] text-red-500 font-bold ml-1 animate-in slide-in-from-left-2">{formErrors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ml-1 tracking-wider ${formErrors.password ? 'text-red-500' : 'text-[#6C5C50]'}`}>Şifre Belirleyin</label>
                  <div className="group relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#4A3728]'}`} size={18}/>
                    <input 
                      ref={passwordRef}
                      required 
                      type="password" 
                      placeholder="Şifre" 
                      className={`w-full pl-11 p-3.5 bg-white/80 border rounded-xl outline-none focus:ring-2 transition-all shadow-sm ${formErrors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]'}`} 
                      value={formData.password} 
                      onChange={e => { setFormData({...formData, password: e.target.value}); if(formErrors.password) setFormErrors({...formErrors, password: ''}) }} 
                    />
                  </div>
                  {formErrors.password && <p className="text-[10px] text-red-500 font-bold ml-1 animate-in slide-in-from-left-2">{formErrors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#6C5C50] uppercase ml-1 tracking-wider">Eğitim Durumu</label>
                  <div className="group relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A3728] transition-colors" size={18}/>
                    <select 
                      ref={educationRef}
                      className="w-full pl-11 p-3.5 bg-white/80 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] appearance-none transition-all shadow-sm"
                      value={formData.educationLevel}
                      onChange={e => setFormData({...formData, educationLevel: e.target.value})}
                    >
                      {EDUCATION_LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  {formData.educationLevel === 'Diğer' && (
                    <input 
                      placeholder="Lütfen eğitim durumunuzu belirtiniz..."
                      className={`w-full mt-3 p-3.5 bg-white/80 border rounded-xl outline-none focus:ring-2 text-sm animate-in fade-in shadow-sm ${formErrors.customEducation ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]'}`}
                      value={formData.customEducation}
                      onChange={e => { setFormData({...formData, customEducation: e.target.value}); if(formErrors.customEducation) setFormErrors({...formErrors, customEducation: ''}) }}
                    />
                  )}
                   {formErrors.customEducation && <p className="text-[10px] text-red-500 font-bold ml-1">{formErrors.customEducation}</p>}
                </div>

                <div className="space-y-4 pt-3 border-t border-gray-200/60 mt-2">
                   <h4 className="text-sm font-bold text-[#4A3728] flex items-center gap-2"><CreditCard size={18} className="text-[#D4AF37]"/> Abonelik Paketi Seçin</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {plans.map(plan => (
                       <div 
                        key={plan.id}
                        onClick={() => setFormData({...formData, selectedPlan: plan.id})}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden bg-white/80 shadow-sm ${formData.selectedPlan === plan.id ? 'border-[#4A3728] bg-[#FDFCF8] scale-[1.02] shadow-md' : 'border-transparent hover:border-[#D4AF37]/30 hover:shadow-md'}`}
                       >
                         {formData.selectedPlan === plan.id && <div className="absolute top-0 right-0 p-1.5 bg-[#4A3728] text-[#D4AF37] rounded-bl-xl shadow-sm"><CheckCircle size={14}/></div>}
                         {plan.isPopular && <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-[9px] font-black px-2.5 py-1 rounded-bl-xl shadow-md z-10 uppercase tracking-widest">Popüler</div>}
                         <div className="flex justify-between items-center mt-1">
                            <span className="font-bold text-[15px] text-[#4A3728] line-clamp-1">{plan.title}</span>
                            <span className={`text-[10px] px-2.5 py-1 rounded-lg text-white font-bold shrink-0 ${plan.color}`}>{plan.price}</span>
                         </div>
                         <p className="text-xs text-[#6C5C50] mt-1.5 font-medium">{plan.days} gün erişim</p>
                       </div>
                     ))}
                   </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 pb-2">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="w-5 h-5 accent-[#4A3728] cursor-pointer rounded opacity-0 absolute z-10" checked={formData.kvkkAccepted} onChange={e => setFormData({...formData, kvkkAccepted: e.target.checked})} />
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${formData.kvkkAccepted ? 'bg-[#4A3728] border-[#4A3728]' : 'bg-white border-gray-300'}`}>
                      {formData.kvkkAccepted && <CheckCircle size={12} className="text-white"/>}
                    </div>
                  </div>
                  <span className="text-xs text-[#6C5C50] leading-relaxed">
                    <button type="button" onClick={() => setShowKvkk(true)} className="text-[#4A3728] font-bold hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1">
                      <FileText size={12}/> KVKK Aydınlatma Metnini
                    </button>
                    {" "}okudum, verilerimin işlenmesini onaylıyorum.
                  </span>
                </div>

                <button type="submit" className="w-full py-4 bg-[#4A3728] text-white font-bold rounded-2xl shadow-[0_8px_30px_rgb(74,55,40,0.3)] hover:bg-[#36251b] hover:shadow-[0_8px_30px_rgb(74,55,40,0.5)] transition-all transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2">
                  Kaydı Tamamla <ChevronRight size={18}/>
                </button>
              </form>
            </div>
          )}

          {authMode === 'support' && (
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
                <div className={`p-6 rounded-2xl border bg-white shadow-sm animate-in zoom-in ${supportResult.type === 'success' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'}`}>
                  <div className="flex items-center gap-3 mb-3">
                     <div className={`p-2 rounded-xl ${supportResult.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {supportResult.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                     </div>
                     <h4 className="font-bold text-gray-800">{supportResult.type === 'success' ? 'Başarılı' : 'Hata'}</h4>
                  </div>
                  <p className="text-sm leading-relaxed font-medium text-gray-700 ml-1">{supportResult.msg}</p>
                </div>
              )}
            </div>
          )}

          {authMode === 'forgot-password' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <button onClick={() => setAuthMode('login')} className="flex items-center gap-2 text-[#6C5C50] hover:text-[#4A3728] transition-colors font-semibold text-sm mb-4 group">
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Giriş Ekranına Dön
              </button>
              <div className="text-center space-y-6 py-10">
                <div className="w-24 h-24 bg-gradient-to-tr from-[#FDFCF8] to-[#FFFBF0] shadow-inner rounded-3xl flex items-center justify-center mx-auto text-[#D4AF37] border border-[#D4AF37]/20 transform rotate-3">
                  <ShieldCheck size={48} className="-rotate-3" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-[#4A3728] font-serif tracking-tight">Şifre İşlemleri</h3>
                  <p className="text-[#6C5C50] text-sm max-w-sm mx-auto leading-relaxed">
                    Güvenliğiniz için şifre sıfırlama işlemleri yalnızca yönetici tarafından yapılmaktadır.
                  </p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 flex items-center justify-center gap-5 shadow-sm max-w-md mx-auto">
                   <div className="p-4 bg-[#FDFCF8] rounded-xl shadow-inner border border-gray-100"><MessageSquare size={24} className="text-[#D4AF37]"/></div>
                   <div className="text-left">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">İletişim Kanalı</p>
                      <p className="text-lg font-bold text-[#4A3728] font-serif">info@imtikra.com</p>
                   </div>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">E-posta adresiniz üzerinden talepte bulunabilirsiniz.</p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}