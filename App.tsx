import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  LogOut,
  Sparkles,
  Search,
  ChevronRight,
  Clock,
  BellRing,
  X,
  Moon,
  Sun,
  Languages
} from 'lucide-react';
import { User, Exam, Notification } from './types';
import { mockDb } from './services/mockDb';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import ExamRoom from './components/ExamRoom';

const LoadingSpinner = ({ logoUrl }: { logoUrl: string }) => (
  <div className="flex items-center justify-center h-screen bg-[#FDFCF8] dark:bg-[#121212] transition-colors">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur-xl opacity-20 animate-pulse"></div>
        <img 
          src={logoUrl} 
          alt="Yükleniyor" 
          className="w-24 h-24 rounded-full object-cover border-4 border-[#D4AF37] shadow-2xl relative z-10 animate-bounce"
        />
      </div>
      <div className="text-[#4A3728] dark:text-[#D4AF37] font-bold text-lg tracking-widest animate-pulse font-serif">İMTİKRA</div>
    </div>
  </div>
);

const NotificationToast = ({ notification, onClose }: { notification: Notification, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 md:right-8 z-[200] max-w-sm w-full bg-white/80 dark:bg-[#2d2d2d]/90 backdrop-blur-xl border-l-4 border-[#D4AF37] shadow-2xl rounded-2xl p-4 flex gap-4 animate-in slide-in-from-right duration-500 cursor-pointer hover:bg-white dark:hover:bg-[#333] transition-all group" onClick={onClose}>
      <div className="w-12 h-12 rounded-full bg-[#FFFBF0] dark:bg-[#3d3d3d] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
        <BellRing className="text-[#D4AF37]" size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#4A3728] dark:text-white text-sm truncate">{notification.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">{notification.body}</p>
        <div className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Şimdi</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-300 hover:text-gray-600 transition-colors p-1">
        <X size={16} />
      </button>
    </div>
  );
};

// --- Translation Dictionary ---
export const TRANSLATIONS: any = {
  tr: { welcome: "Merhaba", logout: "Çıkış Yap", student: "ÖĞRENCİ", admin: "YÖNETİCİ", dark: "Karanlık", light: "Aydınlık" },
  en: { welcome: "Hello", logout: "Logout", student: "STUDENT", admin: "ADMIN", dark: "Dark", light: "Light" },
  ar: { welcome: "مرحباً", logout: "تسجيل خروج", student: "طالب", admin: "مدير", dark: "داكن", light: "فاتح" },
  ru: { welcome: "Привет", logout: "Выйти", student: "СТУДЕНТ", admin: "АДМИН", dark: "Темный", light: "Светлый" },
  fr: { welcome: "Bonjour", logout: "Déconnexion", student: "ÉTUDIANT", admin: "ADMIN", dark: "Sombre", light: "Clair" },
  de: { welcome: "Hallo", logout: "Abmelden", student: "STUDENT", admin: "ADMIN", dark: "Dunkel", light: "Hell" },
  fa: { welcome: "سلام", logout: "خروج", student: "دانشجو", admin: "مدیر", dark: "تاریک", light: "روشن" },
  id: { welcome: "Halo", logout: "Keluar", student: "MAHASISWA", admin: "ADMIN", dark: "Gelap", light: "Terang" },
};

export default function App() {
  const [userData, setUserData] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('login');
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState(mockDb.getSettings()?.logoUrl || "https://picsum.photos/seed/arap/400/400");
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  
  // Appearance State
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  // Changed fontSize to number for granular control (1-36)
  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = localStorage.getItem('numericFontSize');
    if (!stored) return 16;
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 16 : parsed;
  });
  const [fontFamily, setFontFamily] = useState<string>(localStorage.getItem('fontFamily') || 'Inter');
  const [appLanguage, setAppLanguage] = useState<string>(localStorage.getItem('appLanguage') || 'tr');
  const [outputLanguage, setOutputLanguage] = useState<string>(localStorage.getItem('outputLanguage') || 'tr');

  // Apply Dark Mode Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Apply Font Size (Specific Logic to prevent widget resizing)
  useEffect(() => {
    // We fix the root font size to 16px to ensure 'rem' units (used for layout width/height/padding) remain constant.
    if (document && document.documentElement) {
      document.documentElement.style.fontSize = '16px';
    }
    
    // We apply the user's preferred font size to the body. 
    // This allows text to scale via inheritance without breaking the grid/layout structure.
    if (document && document.body) {
      document.body.style.fontSize = `${fontSize}px`;
    }
    
    localStorage.setItem('numericFontSize', fontSize.toString());
  }, [fontSize]);

  // Apply Font Family
  useEffect(() => {
    if (document && document.body) {
      document.body.style.fontFamily = fontFamily;
    }
    localStorage.setItem('fontFamily', fontFamily);
  }, [fontFamily]);

  // Save Languages
  useEffect(() => {
    localStorage.setItem('appLanguage', appLanguage);
    localStorage.setItem('outputLanguage', outputLanguage);
  }, [appLanguage, outputLanguage]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    setExams(mockDb.getExams());

    const lastNotifId = { current: '' };
    const interval = setInterval(() => {
      const notifs = mockDb.getNotifications();
      if (notifs.length > 0) {
        const latest = notifs[notifs.length - 1];
        if (latest.id !== lastNotifId.current) {
          lastNotifId.current = latest.id;
          if (localStorage.getItem('imtikra_mock_db')) {
             if (userData?.role === 'admin' || userData?.notificationsEnabled !== false) {
               setActiveNotification(latest);
             }
          }
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userData]);

  const refreshBranding = () => {
    setLogoUrl(mockDb.getSettings()?.logoUrl || "https://picsum.photos/seed/arap/400/400");
  };

  const handleLoginSuccess = (profileData: User) => {
    setUserData(profileData);
    setCurrentView(profileData.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentView('login');
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Translation Helper
  const t = (key: string) => TRANSLATIONS[appLanguage]?.[key] || TRANSLATIONS['tr'][key] || key;

  if (loading) return <LoadingSpinner logoUrl={logoUrl} />;

  if (!userData || currentView === 'login') {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} logoUrl={logoUrl} />;
  }

  return (
    <div className={`min-h-screen bg-[#FDFCF8] dark:bg-[#121212] text-[#4A3728] dark:text-gray-200 transition-colors duration-300 relative`} dir={appLanguage === 'ar' || appLanguage === 'fa' ? 'rtl' : 'ltr'}>
      {/* Soft background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {activeNotification && (
        <NotificationToast 
          notification={activeNotification} 
          onClose={() => setActiveNotification(null)} 
        />
      )}

      <header className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => setCurrentView(userData.role === 'admin' ? 'admin' : 'dashboard')}
          >
            <div className="relative">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm group-hover:scale-105 transition-transform"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A3728] dark:text-[#D4AF37] font-serif hidden md:block">
              İMTİKRA
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-gray-100/80 dark:bg-[#252525] text-gray-500 dark:text-[#D4AF37] hover:scale-110 transition-all border border-transparent hover:border-[#D4AF37]/30 shadow-sm"
              title={isDarkMode ? t('light') : t('dark')}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700/50">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-[#4A3728] dark:text-white">{userData.fullName}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  {userData.role === 'admin' ? t('admin') : t('student')}
                </span>
              </div>
              <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-[#3d3d3d] border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm">
                {userData.profilePic ? (
                  <img src={userData.profilePic} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-[#2a2a2a]"><Users size={20} /></div>
                )}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2.5 ml-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-[#4A3728] dark:text-gray-400 hover:text-red-500 transition-colors"
              title={t('logout')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {currentView === 'admin' && (
          <AdminDashboard 
            exams={exams} 
            currentUser={userData}
            refreshExams={() => setExams(mockDb.getExams())}
            onSettingsChange={refreshBranding}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            fontFamily={fontFamily}
            onFontFamilyChange={setFontFamily}
          />
        )}

        {currentView === 'dashboard' && (
          <StudentDashboard 
            exams={exams} 
            onStartExam={(exam) => {
              setActiveExam(exam);
              setCurrentView('exam');
            }}
            currentUser={userData}
            onUpdateUser={(updated) => setUserData(updated)}
            // Global App State Props
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            fontFamily={fontFamily}
            onFontFamilyChange={setFontFamily}
            appLanguage={appLanguage}
            onAppLanguageChange={setAppLanguage}
            outputLanguage={outputLanguage}
            onOutputLanguageChange={setOutputLanguage}
          />
        )}

        {currentView === 'exam' && activeExam && (
          <ExamRoom 
            exam={activeExam} 
            userProfile={userData} 
            onFinish={(resData) => {
              if (userData && activeExam) {
                mockDb.addResult({
                  examId: activeExam.id,
                  examTitle: activeExam.title,
                  studentId: userData.id,
                  studentName: userData.fullName,
                  studentEdu: userData.educationLevel,
                  score: resData.score,
                  correctCount: resData.correct,
                  wrongCount: resData.wrong,
                  emptyCount: resData.empty,
                  totalQuestions: resData.total,
                  answers: resData.answers,
                  date: { seconds: Date.now() / 1000 }
                });
              }
              setActiveExam(null);
              setCurrentView('dashboard');
            }}
            onCancel={() => {
              setActiveExam(null);
              setCurrentView('dashboard');
            }}
          />
        )}
      </main>
    </div>
  );
}