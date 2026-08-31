import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Sparkles, Bot, Bell, Clock, X, ChevronRight, Newspaper, MessageCircle, LayoutGrid, ChevronLeft, Settings as SettingsIcon, User as UserIcon, Camera, Shield, GraduationCap, Save, Moon, Sun, Upload, Book as BookIcon, Brain, Award, Megaphone, Lock, BellRing, CreditCard, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Copy, Type, Palette, Eye, Smartphone, Globe, Monitor, Video } from 'lucide-react';
import { User, Exam, Message, ReadingText, PlanConfig } from '../types';
import { mockDb } from '../services/mockDb';
import ReadingRoom from './ReadingRoom';
import AITutorView from './AITutorView';
import ChatPopup from './ChatPopup';
import DictionaryView from './DictionaryView';
import VocabularyView from './VocabularyView';
import StudentResultsView from './StudentResultsView';
import StudentAnnouncementsView from './StudentAnnouncementsView';
import StudentVideoGallery from './StudentVideoGallery';
import StudentSupportView from './StudentSupportView';

interface StudentDashboardProps {
  exams: Exam[];
  currentUser: User;
  onStartExam: (exam: Exam) => void;
  onUpdateUser: (user: User) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  appLanguage: string;
  onAppLanguageChange: (lang: string) => void;
  outputLanguage: string;
  onOutputLanguageChange: (lang: string) => void;
}

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'Arapça', flag: '🇸🇦' },
  { code: 'en', name: 'İngilizce', flag: '🇺🇸' },
  { code: 'ru', name: 'Rusça', flag: '🇷🇺' },
  { code: 'fr', name: 'Fransızca', flag: '🇫🇷' },
  { code: 'de', name: 'Almanca', flag: '🇩🇪' },
  { code: 'fa', name: 'Farsça', flag: '🇮🇷' },
  { code: 'id', name: 'Endonezce', flag: '🇮🇩' },
];

const FONTS = [
  { id: 'Inter, sans-serif', name: 'Modern (Inter)' },
  { id: 'Roboto, sans-serif', name: 'Roboto' },
  { id: '"Playfair Display", serif', name: 'Klasik (Playfair)' },
  { id: '"Noto Sans Arabic", sans-serif', name: 'Noto Sans Arabic' },
  { id: 'Tajawal, sans-serif', name: 'Tajawal' },
  { id: 'Amiri, serif', name: 'Amiri (Naskh)' },
  { id: '"Scheherazade New", serif', name: 'Scheherazade New' },
];

export default function StudentDashboard({ 
  exams, 
  currentUser, 
  onStartExam, 
  onUpdateUser,
  isDarkMode,
  onToggleDarkMode,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  appLanguage,
  onAppLanguageChange,
  outputLanguage,
  onOutputLanguageChange
}: StudentDashboardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [readingTexts, setReadingTexts] = useState<ReadingText[]>([]);
  const [activeReading, setActiveReading] = useState<ReadingText | null>(null);
  const [subView, setSubView] = useState<'menu' | 'readings' | 'exams' | 'results' | 'settings' | 'dictionary' | 'vocabulary' | 'announcements' | 'membership' | 'videos' | 'support'>('menu');
  const [showAITutor, setShowAITutor] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  
  // Membership Upgrade State
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    fullName: currentUser.fullName,
    profilePic: currentUser.profilePic || '',
    educationLevel: currentUser.educationLevel,
    password: currentUser.password || '',
    newPassword: '',
    confirmPassword: '',
    notificationsEnabled: currentUser.notificationsEnabled ?? true
  });

  useEffect(() => {
    setMessages(mockDb.getMessages(currentUser.id));
    setReadingTexts(mockDb.getReadingTexts());
    setPlans(mockDb.getPlans());
    
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [currentUser.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Dosya boyutu 2MB'den küçük olmalıdır.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm(prev => ({ ...prev, profilePic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    let finalPassword = settingsForm.password;
    
    if (settingsForm.newPassword) {
      if (settingsForm.newPassword !== settingsForm.confirmPassword) {
        alert("Yeni şifreler eşleşmiyor!");
        return;
      }
      finalPassword = settingsForm.newPassword;
    }

    const updatedUser: User = {
      ...currentUser,
      fullName: settingsForm.fullName,
      profilePic: settingsForm.profilePic,
      educationLevel: settingsForm.educationLevel,
      password: finalPassword,
      notificationsEnabled: settingsForm.notificationsEnabled
    };

    mockDb.updateUser(currentUser.id, updatedUser);
    onUpdateUser(updatedUser);
    alert("Profil başarıyla güncellendi!");
    setSubView('menu');
  };

  const handlePaymentNotification = () => {
    if (!selectedPlan) return;

    mockDb.addSubscriptionRequest({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      planId: selectedPlan.id,
      planName: selectedPlan.title
    });

    alert("Ödeme bildiriminiz sisteme kaydedilmiştir. Yöneticilerimiz kontrol ettikten sonra paketiniz hesabınıza tanımlanacaktır.");
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const getDaysLeft = () => {
    if (!currentUser.subscriptionEndDate || !currentUser.subscriptionEndDate.seconds) return 0;
    const now = Date.now() / 1000;
    const diff = currentUser.subscriptionEndDate.seconds - now;
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60)));
  };

  const daysLeft = getDaysLeft();
  const currentPlanConfig = plans.find(p => p.id === currentUser.subscriptionPlan);

  const checkFeaturePermission = (featureId: string): boolean => {
    if (!currentPlanConfig) return true;
    
    switch (featureId) {
      case 'readings':
        return currentPlanConfig.allowReadingRoom !== false;
      case 'videos':
        return currentPlanConfig.allowVideos !== false;
      case 'exams':
        return currentPlanConfig.allowExams !== false;
      case 'vocabulary':
      case 'dictionary':
        return currentPlanConfig.allowVocabulary !== false;
      default:
        return true;
    }
  };

  const allowAiTutor = currentPlanConfig ? currentPlanConfig.allowAiTutor !== false : true;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const dateObj = typeof timestamp.seconds === 'number' 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);
    
    if (isNaN(dateObj.getTime())) return '-';

    return dateObj.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (activeReading) {
    return <ReadingRoom reading={activeReading} onBack={() => setActiveReading(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Temporary Header Section */}
      {showGreeting && subView === 'menu' && (
        <div className="bg-gradient-to-r from-[#4A3728] to-[#2B1F16] p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(74,55,40,0.2)] border border-[#D4AF37]/20 flex justify-between items-center overflow-hidden relative transition-all animate-out fade-out slide-out-to-top duration-1000 delay-[7000ms]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-[80px] opacity-20"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-10"></div>
           
           <div className="relative z-10">
             <h2 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-wide mb-2">Merhaba, {currentUser.fullName.split(' ')[0]} 👋</h2>
             <p className="text-white/70 text-sm">Platform özelliklerine aşağıdaki menüden erişebilirsin.</p>
           </div>
           <div className="hidden md:flex flex-col items-end relative z-10 bg-black/20 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
              <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest mb-1">Kalan Abonelik</div>
              <div className={`text-3xl font-bold font-serif ${daysLeft < 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{daysLeft} Gün</div>
           </div>
        </div>
      )}

      {/* VIEW: Menu */}
      {subView === 'menu' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {[
              {id: 'announcements', label: 'Duyurular', sub: 'Haberler & Bildirimler', icon: Megaphone, bg: 'bg-amber-50', text: 'text-amber-600', ring: 'group-hover:ring-amber-200'},
              {id: 'results', label: 'Sonuçlarım', sub: 'Başarı ve Analiz', icon: Award, bg: 'bg-blue-50', text: 'text-blue-600', ring: 'group-hover:ring-blue-200'},
              {id: 'vocabulary', label: 'Kelime Kartları', sub: 'Hafıza Pratiği', icon: Brain, bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'group-hover:ring-emerald-200'},
              {id: 'dictionary', label: 'AI Sözlük', sub: 'Kelime Analizi', icon: BookIcon, bg: 'bg-[#FFFBF0]', text: 'text-[#D4AF37]', ring: 'group-hover:ring-[#D4AF37]/30'},
              {id: 'readings', label: 'Metin Okumaları', sub: 'Analizli Okuma', icon: Newspaper, bg: 'bg-[#FFFBF0]', text: 'text-[#D4AF37]', ring: 'group-hover:ring-[#D4AF37]/30'},
              {id: 'videos', label: 'Video Galeri', sub: 'Ders & Kaynaklar', icon: Video, bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'group-hover:ring-indigo-200'},
              {id: 'exams', label: 'Aktif Sınavlar', sub: 'Hazırlık Sınavları', icon: BookOpen, bg: 'bg-gray-50', text: 'text-[#4A3728]', ring: 'group-hover:ring-gray-300'},
              {id: 'membership', label: 'Üyelik İşlemleri', sub: 'Paket & Süre', icon: CreditCard, bg: 'bg-teal-50', text: 'text-teal-600', ring: 'group-hover:ring-teal-200'},
              {id: 'settings', label: 'Ayarlar', sub: 'Profil & Görünüm', icon: SettingsIcon, bg: 'bg-purple-50', text: 'text-purple-600', ring: 'group-hover:ring-purple-200'},
              {id: 'support', label: 'Sorun Çöz', sub: 'Destek & İletişim', icon: MessageCircle, bg: 'bg-rose-50', text: 'text-rose-600', ring: 'group-hover:ring-rose-200'}
            ].map(item => {
              const isAllowed = checkFeaturePermission(item.id);
              return (
                <button 
                  key={item.id}
                  onClick={() => {
                    if (!isAllowed) {
                      alert(`"${item.label}" özelliğine erişmek için mevcut paketiniz yetersizdir. Lütfen paketinizi "Üyelik İşlemleri" kısmından yükseltin.`);
                      setSubView('membership');
                      return;
                    }
                    setSubView(item.id as any);
                  }}
                  className={`group p-6 bg-white dark:bg-[#1a1a1a] rounded-[2rem] shadow-sm transition-all duration-300 flex flex-col items-center text-center gap-4 active:scale-[0.98] border ${
                    isAllowed 
                      ? 'border-gray-100 dark:border-white/5 hover:shadow-xl hover:border-gray-300 dark:hover:border-white/20' 
                      : 'border-red-50 dark:border-red-950/20 opacity-90 hover:opacity-100 hover:border-red-200 bg-red-50/20'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-16 h-16 ${item.bg} dark:bg-opacity-10 rounded-[1.25rem] flex items-center justify-center ${item.text} dark:text-opacity-80 group-hover:scale-110 transition-transform duration-300 shadow-sm ring-4 ring-transparent ${isAllowed ? item.ring : ''}`}>
                      <item.icon size={28} strokeWidth={1.5} />
                    </div>
                    {!isAllowed && (
                      <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1.5 rounded-full shadow-md">
                        <Lock size={12} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold font-serif text-[15px] flex items-center justify-center gap-1.5 ${!isAllowed ? 'text-red-900/60 dark:text-red-400' : 'text-[#4A3728] dark:text-white'}`}>
                      {item.label}
                    </h3>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${!isAllowed ? 'text-red-400/60' : 'text-gray-400 dark:text-gray-500'}`}>{item.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8">
            <button 
              onClick={() => {
                if (!allowAiTutor) {
                  alert("Yapay Zeka Arapça Asistanı özelliğine erişmek için mevcut paketiniz yetersizdir. Lütfen paketinizi \"Üyelik İşlemleri\" kısmından yükseltin.");
                  setSubView('membership');
                  return;
                }
                setShowAITutor(true);
              }}
              className={`w-full group p-8 bg-gradient-to-br text-white rounded-3xl shadow-xl transition-all flex items-center justify-between text-left active:scale-[0.98] relative overflow-hidden ${
                allowAiTutor 
                  ? 'from-[#4A3728] to-[#2b2016] dark:from-[#2d2d2d] dark:to-[#121212] hover:shadow-2xl' 
                  : 'from-gray-700 to-gray-800 dark:from-neutral-800 dark:to-neutral-900 opacity-90'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-bl-full"></div>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border ${
                  allowAiTutor 
                    ? 'bg-white/10 text-[#D4AF37] border-white/10' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {allowAiTutor ? <Bot size={32} /> : <Lock size={32} />}
                </div>
                <div>
                  <h3 className="font-bold font-serif text-xl flex items-center gap-2">
                    Yapay Zeka Arapça Asistanı
                    {!allowAiTutor && (
                      <span className="text-xs font-sans font-bold bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Lock size={10} /> Kilitli
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-white/60 mt-1">Gramer, kelime ve çeviri hakkında her şeyi sorabilirsin.</p>
                </div>
              </div>
              <div className={`p-3 rounded-full group-hover:translate-x-1 transition-transform ${
                allowAiTutor 
                  ? 'bg-[#D4AF37] text-[#4A3728]' 
                  : 'bg-red-500 text-white'
              }`}>
                {allowAiTutor ? <ChevronRight size={24}/> : <Lock size={24} />}
              </div>
            </button>
          </div>
        </>
      )}

      {/* VIEW: Settings */}
      {subView === 'settings' && (
        <div className="space-y-8 animate-in fade-in">
           <button onClick={() => setSubView('menu')} className="flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-sm transition-colors">
              <ChevronLeft size={20} /> Ana Menü
           </button>
           <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
              
              {/* Account Settings */}
              <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-6 h-fit">
                <h3 className="text-2xl font-bold font-serif text-[#4A3728] dark:text-white flex items-center gap-2">
                  <UserIcon size={24} className="text-[#D4AF37]"/> Hesap Bilgileri
                </h3>
                <form onSubmit={handleUpdateSettings} className="space-y-5">
                   <div className="flex justify-center mb-6">
                      <div className="relative group">
                         <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#2d2d2d] overflow-hidden border-4 border-white dark:border-[#333] shadow-lg group-hover:border-[#D4AF37] transition-all">
                            {settingsForm.profilePic ? (
                              <img src={settingsForm.profilePic} className="w-full h-full object-cover" alt="Profil" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><UserIcon size={40}/></div>
                            )}
                         </div>
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-full shadow-lg hover:scale-110 transition-transform">
                            <Camera size={14}/>
                         </button>
                         {/* Explicit acceptance for images */}
                         <input ref={fileInputRef} type="file" hidden accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Ad Soyad</label>
                      <input className="w-full p-4 bg-gray-50 dark:bg-[#252525] dark:text-white rounded-xl outline-none border-2 border-transparent focus:border-[#D4AF37] transition-all" value={settingsForm.fullName} onChange={e => setSettingsForm({...settingsForm, fullName: e.target.value})} />
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Mevcut Şifre</label>
                      <input type="password" required className="w-full p-4 bg-gray-50 dark:bg-[#252525] dark:text-white rounded-xl outline-none border-2 border-transparent focus:border-[#D4AF37] transition-all" value={settingsForm.password} onChange={e => setSettingsForm({...settingsForm, password: e.target.value})} />
                   </div>

                   <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Yeni Şifre</label>
                      <input type="password" className="w-full p-4 bg-gray-50 dark:bg-[#252525] dark:text-white rounded-xl outline-none border-2 border-transparent focus:border-[#D4AF37] transition-all" placeholder="Değiştirmek istemiyorsanız boş bırakın" value={settingsForm.newPassword} onChange={e => setSettingsForm({...settingsForm, newPassword: e.target.value})} />
                   </div>

                   <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-xl">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Bildirimleri Aç</span>
                      <input type="checkbox" className="w-5 h-5 accent-[#D4AF37]" checked={settingsForm.notificationsEnabled} onChange={e => setSettingsForm({...settingsForm, notificationsEnabled: e.target.checked})} />
                   </div>

                   <button type="submit" className="w-full py-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                      Değişiklikleri Kaydet
                   </button>
                </form>
              </div>

              {/* Appearance Settings */}
              <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-6 h-fit">
                <h3 className="text-2xl font-bold font-serif text-[#4A3728] dark:text-white flex items-center gap-2">
                  <Palette size={24} className="text-[#D4AF37]"/> Görünüm & Deneyim
                </h3>
                
                <div className="space-y-6">
                   {/* Dark Mode */}
                   <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-amber-100 text-amber-500'}`}>
                            {isDarkMode ? <Moon size={20}/> : <Sun size={20}/>}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-[#4A3728] dark:text-white">Karanlık Mod</p>
                            <p className="text-[10px] text-gray-400">Göz yormayan tema</p>
                         </div>
                      </div>
                      <button 
                        onClick={onToggleDarkMode} 
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                   </div>

                   {/* Languages */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-2"><Globe size={12}/> Uygulama Dili</label>
                         <select 
                           className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none border border-transparent focus:border-[#D4AF37] dark:text-white text-sm"
                           value={appLanguage}
                           onChange={e => onAppLanguageChange(e.target.value)}
                         >
                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-2"><Monitor size={12}/> Çıktı Dili</label>
                         <select 
                           className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none border border-transparent focus:border-[#D4AF37] dark:text-white text-sm"
                           value={outputLanguage}
                           onChange={e => onOutputLanguageChange(e.target.value)}
                         >
                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                         </select>
                      </div>
                   </div>

                   {/* Font Size Slider */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                            <Type size={12}/> Yazı Boyutu: {fontSize}px
                         </label>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#252525] p-3 rounded-xl">
                         <span className="text-xs font-bold">A</span>
                         <input 
                           type="range" 
                           min="1" 
                           max="36" 
                           value={fontSize} 
                           onChange={e => onFontSizeChange(parseInt(e.target.value))}
                           className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                         />
                         <span className="text-xl font-bold">A</span>
                      </div>
                   </div>

                   {/* Font Style */}
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                         <Type size={12}/> Yazı Tipi (Font)
                      </label>
                      <select 
                        className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none border border-transparent focus:border-[#D4AF37] dark:text-white text-sm"
                        value={fontFamily}
                        onChange={e => onFontFamilyChange(e.target.value)}
                      >
                         {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                   </div>
                </div>
              </div>

           </div>
        </div>
      )}

      {subView === 'membership' && (
        <div className="animate-in fade-in space-y-8">
          <button onClick={() => setSubView('menu')} className="flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-sm transition-colors">
            <ChevronLeft size={20} /> Ana Menü
          </button>
          
          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
            <h3 className="text-2xl font-bold font-serif text-[#4A3728] dark:text-white flex items-center gap-2">
              <CreditCard size={24} className="text-[#D4AF37]"/> Abonelik ve Paket Bilgileri
            </h3>
            
            {/* Current subscription summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#FFFBF0] dark:bg-[#1e1e1e] rounded-3xl border border-[#D4AF37]/20">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mevcut Paketiniz</span>
                <p className="text-lg font-bold text-[#4A3728] dark:text-[#D4AF37] font-serif">
                  {currentPlanConfig?.title || 'Özel Abonelik'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kalan Kullanım Süresi</span>
                <p className={`text-lg font-bold font-serif ${daysLeft < 5 ? 'text-red-500' : 'text-[#4A3728] dark:text-white'}`}>
                  {daysLeft} Gün
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Son Geçerlilik Tarihi</span>
                <p className="text-lg font-bold text-[#4A3728] dark:text-white font-mono">
                  {formatDate(currentUser.subscriptionEndDate)}
                </p>
              </div>
            </div>
            
            {/* Usage Time Visual Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Başlangıç: {formatDate(currentUser.subscriptionStartDate)}</span>
                <span>Bitiş: {formatDate(currentUser.subscriptionEndDate)}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-[#2d2d2d] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, (daysLeft / 365) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Package Extension Options */}
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h4 className="text-2xl font-bold font-serif text-[#4A3728] dark:text-white">Süreyi Uzat veya Paketini Değiştir</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dilediğiniz paketi seçerek üyeliğinizi anında uzatabilirsiniz. Ödemeniz onaylandıktan sonra yeni süreniz mevcut sürenizin üzerine eklenecektir.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => {
                const isCurrent = currentUser.subscriptionPlan === plan.id;
                return (
                  <div 
                    key={plan.id}
                    className={`relative p-6 bg-white dark:bg-[#1a1a1a] rounded-[2rem] shadow-sm border-2 flex flex-col justify-between gap-6 transition-all hover:shadow-lg ${plan.isPopular ? 'border-[#D4AF37] scale-[1.02]' : 'border-gray-100 dark:border-white/5'}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 right-6 bg-[#D4AF37] text-[#4A3728] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                        En Popüler
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold font-serif text-[#4A3728] dark:text-white">{plan.title}</h4>
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{plan.days} Günlük Erişim</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${plan.color || 'bg-[#D4AF37]'}`}></div>
                      </div>
                      
                      <div className="pt-2">
                        <span className="text-3xl font-extrabold text-[#4A3728] dark:text-white font-serif">{plan.price}</span>
                      </div>
                      
                      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-2 pt-2 border-t border-gray-50 dark:border-white/5">
                        <li className="flex items-center gap-2">
                          {plan.allowAiTutor !== false ? (
                            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <X size={14} className="text-gray-400 shrink-0" />
                          )}
                          <span className={plan.allowAiTutor !== false ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400 line-through"}>Yapay Zeka Arapça Asistanı</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {plan.allowExams !== false ? (
                            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <X size={14} className="text-gray-400 shrink-0" />
                          )}
                          <span className={plan.allowExams !== false ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400 line-through"}>Hazırlık Sınavları & Analizler</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {plan.allowVocabulary !== false ? (
                            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <X size={14} className="text-gray-400 shrink-0" />
                          )}
                          <span className={plan.allowVocabulary !== false ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400 line-through"}>Kelime Odası & Akıllı Sözlük</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {plan.allowReadingRoom !== false ? (
                            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <X size={14} className="text-gray-400 shrink-0" />
                          )}
                          <span className={plan.allowReadingRoom !== false ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400 line-through"}>Okuma Odası & Gramer Çözümlemesi</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {plan.allowVideos !== false ? (
                            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <X size={14} className="text-gray-400 shrink-0" />
                          )}
                          <span className={plan.allowVideos !== false ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400 line-through"}>Video Ders Galerisi</span>
                        </li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowPaymentModal(true);
                      }}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md ${
                        isCurrent 
                          ? 'bg-amber-100 dark:bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-white'
                          : 'bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] hover:scale-[1.02]'
                      }`}
                    >
                      {isCurrent ? 'Mevcut Paket (Süreyi Uzat)' : 'Satın Al / Süreyi Uzat'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subView === 'exams' && (
        <div className="animate-in fade-in space-y-6">
          <button onClick={() => setSubView('menu')} className="flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-sm transition-colors">
            <ChevronLeft size={20} /> Ana Menü
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold font-serif text-[#4A3728] dark:text-white">Aktif Hazırlık Sınavları</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kendinizi denemek için aşağıdaki sınavları başlatabilirsiniz.</p>
            </div>
          </div>
          
          {exams.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5">
              <p className="text-gray-400 font-bold">Şu anda aktif bir sınav bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map(exam => {
                const results = mockDb.getResults().filter(r => r.studentId === currentUser.id && r.examId === exam.id);
                const isCompleted = results.length > 0;
                const bestResult = isCompleted ? Math.max(...results.map(r => r.score)) : null;

                return (
                  <div key={exam.id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#D4AF37]/20">
                          {exam.category}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                          <Clock size={14}/> {exam.duration} Dk
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-bold font-serif text-[#4A3728] dark:text-white">{exam.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{exam.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                      <div>
                        {isCompleted ? (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle size={14}/> Tamamlandı ({bestResult} Puan)
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {exam.questions.length} Soru
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => onStartExam(exam)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                          isCompleted
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#D4AF37] hover:text-white'
                            : 'bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] shadow-md hover:scale-[1.03]'
                        }`}
                      >
                        {isCompleted ? 'Tekrar Çöz' : 'Sınava Başla'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {subView === 'readings' && (
        <div className="animate-in fade-in space-y-6">
          <button onClick={() => setSubView('menu')} className="flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-sm transition-colors">
            <ChevronLeft size={20} /> Ana Menü
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold font-serif text-[#4A3728] dark:text-white">Metin Okumaları</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Harf-i cer analizi, kelime sözlüğü ve kalıp ifadelerle desteklenmiş Arapça okuma metinleri.</p>
            </div>
          </div>
          
          {readingTexts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5">
              <p className="text-gray-400 font-bold">Henüz yüklenmiş bir okuma metni bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {readingTexts.map(text => (
                <div key={text.id} className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  {text.coverImage ? (
                    <img src={text.coverImage} alt={text.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-[#FFFBF0] to-amber-50/50 flex items-center justify-center border-b border-gray-50 dark:border-white/5">
                      <BookOpen size={48} className="text-[#D4AF37] opacity-65" />
                    </div>
                  )}
                  
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{text.category}</span>
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full ${
                          text.level === 'Başlangıç' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                          text.level === 'Orta' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' :
                          'bg-purple-50 text-purple-600 dark:bg-purple-950/20'
                        }`}>
                          {text.level}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-bold font-serif text-[#4A3728] dark:text-white line-clamp-1">{text.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed" dir="rtl">
                        {text.content}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setActiveReading(text)}
                      className="w-full mt-4 py-3 bg-[#4A3728]/5 hover:bg-[#4A3728] dark:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37] text-[#4A3728] hover:text-white dark:text-[#D4AF37] dark:hover:text-[#4A3728] font-bold text-xs rounded-xl transition-all active:scale-95"
                    >
                      Metni Oku ve Analiz Et
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {subView === 'results' && (
        <div className="animate-in fade-in">
           <button onClick={() => setSubView('menu')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-sm transition-colors">
              <ChevronLeft size={20} /> Ana Menü
           </button>
           <StudentResultsView currentUser={currentUser} />
        </div>
      )}

      {subView === 'announcements' && (
        <div className="animate-in fade-in">
           <button onClick={() => setSubView('menu')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-sm transition-colors">
              <ChevronLeft size={20} /> Ana Menü
           </button>
           <StudentAnnouncementsView />
        </div>
      )}

      {subView === 'vocabulary' && (
        <div className="animate-in fade-in">
           <button onClick={() => setSubView('menu')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-sm transition-colors">
              <ChevronLeft size={20} /> Ana Menü
           </button>
           <VocabularyView currentUser={currentUser} />
        </div>
      )}

      {subView === 'dictionary' && (
        <div className="animate-in fade-in">
           <button onClick={() => setSubView('menu')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#4A3728] dark:hover:text-white font-bold text-sm transition-colors">
              <ChevronLeft size={20} /> Ana Menü
           </button>
           <DictionaryView />
        </div>
      )}

      {/* VIDEO GALLERY SUBVIEW (NEW) */}
      {subView === 'videos' && (
        <div className="animate-in fade-in">
           <StudentVideoGallery onBack={() => setSubView('menu')} />
        </div>
      )}

      {/* AI Tutor Overlay */}
      {subView === 'support' && (
        <StudentSupportView user={currentUser} onBack={() => setSubView('menu')} />
      )}

      {showAITutor && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <AITutorView onBack={() => setShowAITutor(false)} />
        </div>
      )}

      {/* Chat Popup */}
      <ChatPopup currentUser={currentUser} />

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-lg overflow-hidden animate-in zoom-in shadow-2xl">
               <div className="p-8 bg-[#4A3728] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                  <div className="relative z-10">
                     <h3 className="text-2xl font-bold font-serif">Ödeme Talimatı</h3>
                     <p className="text-white/70 text-sm mt-1">{selectedPlan.title} - {selectedPlan.price}</p>
                  </div>
                  <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex gap-3">
                     <AlertTriangle className="text-amber-600 shrink-0" size={20}/>
                     <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
                        Lütfen aşağıda belirtilen IBAN numarasına paket ücretini gönderiniz. Açıklama kısmına <strong>Ad Soyad</strong> yazmayı unutmayınız.
                     </p>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Alıcı Adı</label>
                     <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-xl text-sm font-bold text-[#4A3728] dark:text-white flex justify-between items-center">
                        <span>İMTİKRA Eğitim Hizmetleri</span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">IBAN Numarası</label>
                     <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-xl text-sm font-bold text-[#4A3728] dark:text-white flex justify-between items-center group cursor-pointer" onClick={() => navigator.clipboard.writeText("TR12 0006 1000 0000 0000 1234 56")}>
                        <span className="font-mono tracking-wider">TR12 0006 1000 0000 0000 1234 56</span>
                        <Copy size={16} className="text-gray-400 group-hover:text-[#D4AF37]"/>
                     </div>
                  </div>

                  <button 
                     onClick={handlePaymentNotification}
                     className="w-full py-4 bg-[#D4AF37] text-[#4A3728] font-bold rounded-xl shadow-lg hover:bg-[#b59022] hover:text-white transition-all transform active:scale-95"
                  >
                     Ödemeyi Gönderdim, Bildir
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}