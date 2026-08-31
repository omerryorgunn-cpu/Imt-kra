import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, UserCheck, UserX, Trash2, Pencil, Sparkles, Loader as Loader2, Clock, CircleCheck as CheckCircle, Circle as XCircle, Download, ChartBar as BarChart3, Info, User as UserIcon, ShieldCheck, FileText, ChevronRight, X, LayoutList, ExternalLink, Eye, EyeOff, Type as TypeIcon, Upload, Image as ImageIcon, Calendar, TriangleAlert as AlertTriangle, CreditCard, Tag, Palette, Send, FileSpreadsheet, Settings as SettingsIcon, Monitor, Sun, Moon, Image as ImgIcon, Globe, RefreshCcw, Check, Video, Paperclip, FileUp } from 'lucide-react';
import { User, Exam, Question, ReadingText, ExamResult, SubscriptionPlan, PlanConfig, SubscriptionRequest, VideoResource, Attachment } from '../types';
import { mockDb } from '../services/mockDb';
import { analyzeArabicText, generatePerformanceReport } from '../services/geminiService';

const READING_CATEGORIES = [
  "Sağlık", "Teknoloji", "Sosyal Hayat", "Şahsiyetler", "Mekanlar", 
  "Tarih", "Ekonomi", "Siyaset", "Eğitim", "Bilim", "Kültür & Art", "Diğer"
];

const ARABIC_FONTS = [
  { id: 'font-serif', name: 'Varsayılan Serif' },
  { id: 'font-amiri', name: 'Amiri (Klasik)' },
  { id: 'font-scheherazade', name: 'Scheherazade (Kurumsal)' },
  { id: 'font-lateef', name: 'Lateef (El Yazısı)' }
];

// Expanded Font List with Categories
const SYSTEM_FONTS = [
  { category: "Modern Sans-Serif", options: [
    { id: 'Inter, sans-serif', name: 'Inter (Standart)' },
    { id: 'Roboto, sans-serif', name: 'Roboto' },
    { id: '"Readex Pro", sans-serif', name: 'Readex Pro (Modern)' },
    { id: '"Tajawal", sans-serif', name: 'Tajawal (Kurumsal)' },
    { id: '"Almarai", sans-serif', name: 'Almarai (Temiz)' },
    { id: '"Cairo", sans-serif', name: 'Cairo (Popüler)' },
    { id: '"Mada", sans-serif', name: 'Mada (Minimal)' },
    { id: '"IBM Plex Sans Arabic", sans-serif', name: 'IBM Plex Sans' },
  ]},
  { category: "Klasik & Serif", options: [
    { id: '"Playfair Display", serif', name: 'Playfair Display' },
    { id: '"Merriweather", serif', name: 'Merriweather' },
    { id: '"Amiri", serif', name: 'Amiri (Naskh)' },
    { id: '"Scheherazade New", serif', name: 'Scheherazade New' },
    { id: '"Noto Sans Arabic", sans-serif', name: 'Noto Sans Arabic' },
  ]},
  { category: "Dekoratif & Diğer", options: [
    { id: '"El Messiri", sans-serif', name: 'El Messiri (Estetik)' },
    { id: '"Lateef", serif', name: 'Lateef (El Yazısı)' },
  ]}
];

const PLAN_COLORS = [
  { class: 'bg-green-500', name: 'Yeşil (Deneme)' },
  { class: 'bg-blue-500', name: 'Mavi (Standart)' },
  { class: 'bg-purple-500', name: 'Mor (Pro)' },
  { class: 'bg-orange-500', name: 'Turuncu (Premium)' },
  { class: 'bg-[#D4AF37]', name: 'Altın (Yıllık)' },
  { class: 'bg-red-500', name: 'Kırmızı (Kampanya)' },
  { class: 'bg-gray-800', name: 'Siyah (Özel)' },
];

const EDUCATION_LEVELS = ["Lise", "Lisans", "Yüksek Lisans", "Doktora", "Diğer"];

interface AdminDashboardProps {
  exams: Exam[];
  currentUser: User;
  refreshExams: () => void;
  onSettingsChange?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  fontFamily?: string;
  onFontFamilyChange?: (font: string) => void;
}

export default function AdminDashboard({ 
  exams, 
  currentUser, 
  refreshExams, 
  onSettingsChange,
  isDarkMode,
  onToggleDarkMode,
  fontSize = 16,
  onFontSizeChange,
  fontFamily = 'Inter, sans-serif',
  onFontFamilyChange
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'exams' | 'readings' | 'results' | 'pre-reg' | 'users' | 'packages' | 'videos' | 'support'>('exams');
  const [users, setUsers] = useState<User[]>([]);
  const [readingTexts, setReadingTexts] = useState<ReadingText[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>([]);
  const [videoResources, setVideoResources] = useState<VideoResource[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [replyingToTicketId, setReplyingToTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Modals
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showAddReadingModal, setShowAddReadingModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  
  const [editingReadingId, setEditingReadingId] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Custom confirmation dialog state to bypass iframe confirm limitations
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const safeConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ message, onConfirm });
  };

  // Settings State
  const [tempLogoUrl, setTempLogoUrl] = useState('');
  const [settingsTab, setSettingsTab] = useState<'branding' | 'appearance'>('branding');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // File Input Refs
  const readingImageRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const attachmentFileRef = useRef<HTMLInputElement>(null);

  // Forms
  const [newReading, setNewReading] = useState<Partial<ReadingText>>({ 
    title: '', content: '', category: 'Sosyal Hayat', level: 'Orta', coverImage: '', sourceUrl: '', arabicFont: 'font-serif' 
  });
  const [newExam, setNewExam] = useState<Partial<Exam>>({ title: '', category: 'YDS', duration: 180, questions: [], startDate: '', startTime: '', endDate: '', endTime: '' });
  
  // Updated User Form State with Subscription
  const [newUser, setNewUser] = useState<Partial<User>>({
    fullName: '', email: '', password: '', phone: '', gender: 'Erkek', 
    educationLevel: 'Lisans', role: 'student', status: 'active', isBanned: false,
    subscriptionPlan: '1_month'
  });
  const [customEndDate, setCustomEndDate] = useState('');

  const [newPlan, setNewPlan] = useState<Partial<PlanConfig>>({
    title: '', price: '', days: 30, color: 'bg-blue-500', isPopular: false,
    allowAiTutor: true, allowExams: true, allowReadingRoom: true, allowVocabulary: true, allowVideos: true
  });

  const [newVideo, setNewVideo] = useState<{
    title: string;
    description: string;
    videoUrl: string;
    attachments: Attachment[];
  }>({
    title: '', description: '', videoUrl: '', attachments: []
  });
  const [newAttachment, setNewAttachment] = useState<Partial<Attachment>>({ name: '', type: 'pdf', url: '' });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({ 
    text: '', options: { a: '', b: '', c: '', d: '', e: '' }, correctOption: 'a', points: 1.25, topic: '' 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setUsers(mockDb.getUsers());
    setReadingTexts(mockDb.getReadingTexts());
    setExamResults(mockDb.getResults());
    setPlans(mockDb.getPlans());
    setSubscriptionRequests(mockDb.getSubscriptionRequests());
    setVideoResources(mockDb.getVideoResources());
    setSupportTickets(mockDb.getSupportTickets());
    setTempLogoUrl(mockDb.getSettings().logoUrl);
    refreshExams();
  };

  const handleSaveSettings = () => {
    mockDb.updateSettings({ logoUrl: tempLogoUrl });
    if (onSettingsChange) onSettingsChange();
    setShowSettingsModal(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo boyutu 2MB'den küçük olmalıdır.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReadingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Dosya boyutu 5MB'den küçük olmalıdır.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReading(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteExam = (id: string) => {
    safeConfirm("Sınav silinsin mi? Tüm öğrenci sonuçları etkilenebilir.", () => {
      mockDb.deleteExam(id);
      loadData();
    });
  };

  const handleUpdateStatus = (id: string, status: 'active' | 'rejected') => {
    mockDb.updateUser(id, { status });
    loadData();
  };

  const handleApproveSubscription = (requestId: string) => {
    safeConfirm("Kullanıcının abonelik süresi uzatılacak. Onaylıyor musunuz?", () => {
      mockDb.approveSubscriptionRequest(requestId);
      loadData();
    });
  };

  const handleRejectSubscription = (requestId: string) => {
    safeConfirm("Talep reddedilsin mi?", () => {
      mockDb.rejectSubscriptionRequest(requestId);
      loadData();
    });
  };

  const handleAnalyzeAndSendReport = async (result: ExamResult) => {
    if (isGeneratingReport) return;
    
    // Find exam details to get topics
    const exam = exams.find(e => e.id === result.examId);
    if (!exam) {
      alert("Bu sınav artık sistemde mevcut değil, analiz yapılamaz.");
      return;
    }

    if (!result.answers) {
      alert("Bu sonuç için detaylı cevap verisi bulunamadı. (Eski sınav kaydı olabilir)");
      return;
    }

    safeConfirm(`${result.studentName} için yapay zeka destekli analiz raporu oluşturulup gönderilsin mi?`, async () => {
      setIsGeneratingReport(result.id);
      try {
        const feedback = await generatePerformanceReport(result.studentName, exam, result.answers);
        mockDb.updateResult(result.id, { feedback, isShared: true });
        loadData();
        alert("Analiz raporu başarıyla oluşturuldu ve öğrenciye gönderildi.");
      } catch (error) {
        alert("Rapor oluşturulurken bir hata meydana geldi.");
      } finally {
        setIsGeneratingReport(null);
      }
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check duplicates first
    if (newUser.email && newUser.phone) {
      const errorMsg = mockDb.checkUserExists(newUser.email, newUser.phone);
      if (errorMsg) {
        alert(errorMsg);
        return;
      }
    }

    // Calculate dates
    const now = new Date();
    const startDate = { seconds: now.getTime() / 1000 };
    let endDate;

    if (newUser.subscriptionPlan === 'custom' && customEndDate) {
       endDate = { seconds: new Date(customEndDate).getTime() / 1000 };
    } else {
       const plan = plans.find(p => p.id === newUser.subscriptionPlan);
       const days = plan ? plan.days : 30;
       endDate = { seconds: (now.getTime() + (days * 24 * 60 * 60 * 1000)) / 1000 };
    }

    mockDb.addUser({ 
      ...newUser, 
      createdAt: startDate, 
      registrationChannel: 'Admin Manuel',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate
    });
    
    setShowAddUserModal(false);
    setNewUser({
      fullName: '', email: '', password: '', phone: '', gender: 'Erkek', 
      educationLevel: 'Lisans', role: 'student', status: 'active', isBanned: false,
      subscriptionPlan: '1_month'
    });
    setCustomEndDate('');
    loadData();
  };

  const handleSaveReading = async () => {
    if (!newReading.title || !newReading.content) {
      alert("Lütfen başlık ve içerik giriniz.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeArabicText(String(newReading.content));
      if (editingReadingId) {
        mockDb.updateReadingText(editingReadingId, { ...newReading, analysis });
      } else {
        mockDb.addReadingText({ ...newReading, analysis });
      }
      loadData();
      setShowAddReadingModal(false);
      setEditingReadingId(null);
      setIsPreviewMode(false);
      setNewReading({ 
        title: '', content: '', category: 'Sosyal Hayat', level: 'Orta', coverImage: '', sourceUrl: '', arabicFont: 'font-serif' 
      });
    } catch (e) { 
      alert("AI Analizi sırasında hata oluştu. Lütfen tekrar deneyin."); 
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  const downloadAnalysis = (reading: ReadingText) => {
    const analysis = reading.analysis;
    if (!analysis) return;

    let content = `OKUMA METNİ ANALİZİ: ${reading.title}\n`;
    content += `Kategori: ${reading.category} | Seviye: ${reading.level}\n`;
    content += `--------------------------------------------------\n\n`;
    content += `METİN:\n${reading.content}\n\n`;
    content += `TÜRKÇE TERCÜME:\n${analysis.fullTranslation || 'Bulunamadı.'}\n\n`;
    content += `ÖNEMLİ KELİMELER:\n`;
    analysis.vocabulary.forEach(v => content += `- ${v.word}: ${v.meaning}\n`);
    content += `\nHARF-İ CERLİ FİİLLER:\n`;
    analysis.prepositions.forEach(p => content += `- ${p.phrase}: ${p.meaning}\n`);
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reading.title}_Analiz.doc`;
    a.click();
  };

  const handleSaveExam = () => {
    if (!newExam.title || (newExam.questions?.length || 0) === 0) {
      alert("Lütfen sınav başlığı girin ve en az bir soru ekleyin.");
      return;
    }
    if (editingExamId) mockDb.updateExam(editingExamId, newExam);
    else mockDb.addExam(newExam);
    loadData();
    setShowAddExamModal(false);
    setEditingExamId(null);
    setNewExam({ title: '', category: 'YDS', duration: 180, questions: [], startDate: '', startTime: '', endDate: '', endTime: '' });
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.options.a) {
      alert("Soru metni ve en az A şıkkı dolu olmalıdır.");
      return;
    }
    setNewExam(prev => ({ ...prev, questions: [...(prev.questions || []), currentQuestion] }));
    setCurrentQuestion({ text: '', options: { a: '', b: '', c: '', d: '', e: '' }, correctOption: 'a', points: 1.25, topic: '' 
  });
  };

  const handleSavePlan = () => {
    if (!newPlan.title || !newPlan.price || !newPlan.days) {
      alert("Lütfen başlık, fiyat ve gün sayısını girin.");
      return;
    }
    if (editingPlanId) {
      mockDb.updatePlan(editingPlanId, newPlan);
    } else {
      mockDb.addPlan(newPlan);
    }
    loadData();
    setShowPlanModal(false);
    setEditingPlanId(null);
    setNewPlan({ title: '', price: '', days: 30, color: 'bg-blue-500', isPopular: false, allowAiTutor: true, allowExams: true, allowReadingRoom: true, allowVocabulary: true, allowVideos: true });
  };

  const handleDeletePlan = (id: string) => {
    safeConfirm("Bu paketi silmek istediğinize emin misiniz?", () => {
      mockDb.deletePlan(id);
      loadData();
    });
  };

  // Video Methods with File Upload Logic
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server.
      // For this mock/demo, we read as DataURL to display immediately.
      // Note: Large videos will likely crash the browser due to memory limits with this method.
      // We'll proceed as it's a requested feature for the panel.
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVideo(prev => ({ ...prev, videoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAttachment(prev => ({ 
          ...prev, 
          url: reader.result as string,
          name: file.name // Auto-fill name from file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAttachment = () => {
    if (!newAttachment.name || !newAttachment.url) {
      alert("Lütfen dosya adı ve URL/Dosya giriniz.");
      return;
    }
    setNewVideo(prev => ({
      ...prev,
      attachments: [...prev.attachments, { ...newAttachment, id: Math.random().toString() } as Attachment]
    }));
    setNewAttachment({ name: '', type: 'pdf', url: '' });
    // Reset file input if needed
    if(attachmentFileRef.current) attachmentFileRef.current.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setNewVideo(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== id)
    }));
  };

  const handleSaveVideo = () => {
    if (!newVideo.title || !newVideo.videoUrl) {
      alert("Video başlığı ve video kaynağı (URL veya Dosya) gereklidir.");
      return;
    }
    mockDb.addVideoResource(newVideo);
    loadData();
    setShowAddVideoModal(false);
    setNewVideo({ title: '', description: '', videoUrl: '', attachments: [] });
  };

    const handleDeleteSupportTicket = (id: string) => {
    safeConfirm("Bu destek talebini silmek istediğinize emin misiniz?", () => {
      mockDb.deleteSupportTicket(id);
      loadData();
    });
  };

  const handleReplyTicket = (id: string) => {
    if (!replyText.trim()) return;
    mockDb.updateSupportTicket(id, {
      reply: replyText,
      repliedAt: { seconds: Date.now() / 1000 },
      status: 'closed'
    });
    setReplyingToTicketId(null);
    setReplyText('');
    loadData();
  };

  const handleToggleTicketStatus = (id: string, currentStatus: string) => {
    safeConfirm(currentStatus === 'open' ? "Bu destek talebini kapatmak istediğinize emin misiniz?" : "Bu destek talebini tekrar açmak istediğinize emin misiniz?", () => {
      mockDb.updateSupportTicket(id, { status: currentStatus === 'open' ? 'closed' : 'open' });
      loadData();
    });
  };

  const handleDeleteVideo = (id: string) => {
    safeConfirm("Bu videoyu silmek istediğinize emin misiniz?", () => {
      mockDb.deleteVideoResource(id);
      loadData();
    });
  };

  const handleExportExcel = () => {
    if (filteredResults.length === 0) {
      alert("İndirilecek sonuç bulunamadı.");
      return;
    }

    const headers = ["Öğrenci Adı", "Sınav Başlığı", "Puan", "Doğru Sayısı", "Yanlış Sayısı", "Boş Sayısı", "Toplam Soru", "Tarih"];
    const rows = filteredResults.map(res => [
      `"${res.studentName}"`,
      `"${res.examTitle}"`,
      res.score.toString().replace('.', ','),
      res.correctCount,
      res.wrongCount,
      res.emptyCount,
      res.totalQuestions,
      res.date?.seconds ? new Date(res.date.seconds * 1000).toLocaleDateString() : ''
    ]);

    const BOM = "\uFEFF";
    const csvContent = BOM + [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Imtikra_Sinav_Sonuclari_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDaysLeft = (user: User) => {
    if (!user.subscriptionEndDate || typeof user.subscriptionEndDate.seconds !== 'number') return 0;
    const now = Date.now() / 1000;
    const diff = user.subscriptionEndDate.seconds - now;
    return Math.ceil(diff / (24 * 60 * 60));
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const pendingRequests = subscriptionRequests.filter(r => r.status === 'pending');
  const activeStudents = users.filter(u => u.role === 'student' && u.status === 'active');
  const filteredResults = examResults.filter(r => r.studentName.toLowerCase().includes(searchText.toLowerCase()) || r.examTitle.toLowerCase().includes(searchText.toLowerCase()));
  const filteredUsers = activeStudents.filter(u => u.fullName.toLowerCase().includes(searchText.toLowerCase()));

  const totalPending = pendingUsers.length + pendingRequests.length;

  return (
    <div className="space-y-6 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Lateef:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap');
        .font-amiri { font-family: 'Amiri', serif; }
        .font-scheherazade { font-family: 'Scheherazade New', serif; }
        .font-lateef { font-family: 'Lateef', cursive; }
      `}</style>
      
      {/* Settings Trigger Button - Fixed Gear Icon */}
      <div className="flex justify-end mb-4">
         <button 
           onClick={() => setShowSettingsModal(true)} 
           className="bg-[#1a1a1a] text-white p-3 rounded-full shadow-lg hover:rotate-90 transition-transform hover:bg-black border-2 border-[#D4AF37]"
           title="Panel Ayarları"
         >
            <SettingsIcon size={24}/>
         </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-white/5 overflow-x-auto bg-white dark:bg-[#1a1a1a] rounded-t-3xl shadow-sm px-2 scrollbar-hide">
        {[
          { id: 'exams', label: 'Sınavlar' },
          { id: 'readings', label: 'Metinler' },
          { id: 'videos', label: 'Video Galeri' }, // New Tab
          { id: 'results', label: 'Sonuçlar' },
          { id: 'pre-reg', label: `Başvurular (${totalPending})` },
          { id: 'users', label: 'Öğrenciler' },
          { id: 'packages', label: 'Paketler' },
          { id: 'support', label: 'Destek Talepleri' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-6 py-4 font-bold text-xs whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-[#4A3728] dark:border-[#D4AF37] text-[#4A3728] dark:text-[#D4AF37]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEARCH BAR (Hidden on Packages Tab to keep it clean) */}
      {activeTab !== 'packages' && activeTab !== 'support' && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            placeholder="İsim, başlık veya kategori ile ara..." 
            className="w-full pl-12 p-4 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all dark:text-white"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      )}

      {/* ... (Keep existing Tabs Content: packages, exams, readings, results, pre-reg, users) ... */}
      {/* SUPPORT TAB */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Destek Talepleri & Sorun Bildirimleri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportTickets.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">Bekleyen destek talebi bulunmuyor.</div>
            ) : (
              supportTickets.map(ticket => (
                <div key={ticket.id} className={`bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 border shadow-sm flex flex-col gap-4 transition-all ${ticket.status === 'closed' ? 'opacity-60 border-gray-100 dark:border-white/5' : 'border-amber-200 dark:border-amber-900/50'}`}>
                   <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${ticket.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-600'}`}>
                          {ticket.status === 'closed' ? 'Kapalı' : 'Açık'}
                        </span>
                        <div className="text-xs text-gray-400 mt-2 font-mono">ID: {ticket.id}</div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleToggleTicketStatus(ticket.id, ticket.status)} className={`p-2 rounded-xl transition-all ${ticket.status === 'closed' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'}`}>
                           <CheckCircle size={16} />
                        </button>
                        <button type="button" onClick={() => handleDeleteSupportTicket(ticket.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                           <Trash2 size={16} />
                        </button>
                      </div>
                   </div>
                   
                   <div>
                     <h4 className="font-bold text-gray-800 dark:text-white text-lg">{ticket.senderName}</h4>
                     <p className="text-xs text-[#D4AF37] font-semibold">{ticket.senderContact}</p>
                   </div>
                   
                   <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl text-sm text-gray-600 dark:text-gray-300 min-h-[100px] whitespace-pre-wrap">
                     {ticket.content}
                   </div>
                   
                   {ticket.imageUrl && (
                     <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 bg-black">
                       <a href={ticket.imageUrl} target="_blank" rel="noreferrer">
                         <img src={ticket.imageUrl} className="w-full h-48 object-contain hover:scale-105 transition-transform cursor-pointer" alt="Support Attachment" />
                       </a>
                     </div>
                   )}
                   
                                      {ticket.reply && (
                     <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl">
                       <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2">Yönetici Yanıtı:</h5>
                       <p className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap">{ticket.reply}</p>
                     </div>
                   )}

                   {!ticket.reply && replyingToTicketId === ticket.id && (
                     <div className="mt-4 space-y-2">
                       <textarea
                         value={replyText}
                         onChange={e => setReplyText(e.target.value)}
                         placeholder="Yanıtlama mesajınız..."
                         className="w-full p-3 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none resize-none dark:text-white"
                         rows={3}
                       />
                       <div className="flex justify-end gap-2">
                         <button onClick={() => { setReplyingToTicketId(null); setReplyText(''); }} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all">İptal</button>
                         <button onClick={() => handleReplyTicket(ticket.id)} className="px-3 py-1.5 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] text-xs font-bold rounded-lg transition-all">Gönder & Kapat</button>
                       </div>
                     </div>
                   )}

                   {!ticket.reply && replyingToTicketId !== ticket.id && (
                     <div className="mt-2">
                       <button onClick={() => setReplyingToTicketId(ticket.id)} className="text-xs font-bold text-[#D4AF37] hover:underline">Yanıtla</button>
                     </div>
                   )}

                   <div className="text-right text-[10px] text-gray-400 font-bold mt-auto pt-2">
                      {new Date(ticket.createdAt.seconds * 1000).toLocaleString('tr-TR')}
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PACKAGES TAB */}
      {activeTab === 'packages' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Abonelik Paketleri</h3>
            <button 
              onClick={() => { setEditingPlanId(null); setNewPlan({ title: '', price: '', days: 30, color: 'bg-blue-500', isPopular: false, allowAiTutor: true, allowExams: true, allowReadingRoom: true, allowVocabulary: true, allowVideos: true }); setShowPlanModal(true); }}
              className="px-6 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-xl font-bold flex items-center gap-2 shadow-lg"
            >
              <Plus size={20}/> Yeni Paket Ekle
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
               <div key={plan.id} className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${plan.color} opacity-10 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-150`}></div>
                  {plan.isPopular && (
                    <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#4A3728] text-[8px] font-black px-2 py-1 rounded shadow-sm uppercase">Popüler</div>
                  )}
                  <div className="space-y-4 relative z-10">
                     <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center text-white shadow-lg`}>
                        <CreditCard size={24}/>
                     </div>
                     <div>
                        <h4 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">{plan.title}</h4>
                        <p className="text-2xl font-bold text-[#D4AF37] mt-1">{plan.price}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={12}/> {plan.days} Gün Erişim</p>
                        
                        <div className="text-[10px] space-y-1 mt-3 pt-3 border-t border-gray-50 dark:border-white/5 font-medium text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className={plan.allowAiTutor !== false ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 line-through"}>
                              {plan.allowAiTutor !== false ? "●" : "○"} Yapay Zeka Arapça Asistanı
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={plan.allowExams !== false ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 line-through"}>
                              {plan.allowExams !== false ? "●" : "○"} Hazırlık Sınavları & Analizler
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={plan.allowReadingRoom !== false ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 line-through"}>
                              {plan.allowReadingRoom !== false ? "●" : "○"} Okuma Odası (Gramer Analizi)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={plan.allowVocabulary !== false ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 line-through"}>
                              {plan.allowVocabulary !== false ? "●" : "○"} Kelime Odası & Sözlük
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={plan.allowVideos !== false ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 line-through"}>
                              {plan.allowVideos !== false ? "●" : "○"} Video Ders Galerisi
                            </span>
                          </div>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex gap-2">
                        <button onClick={() => { setEditingPlanId(plan.id); setNewPlan(plan); setShowPlanModal(true); }} className="flex-1 py-2 bg-gray-50 dark:bg-[#252525] hover:bg-[#D4AF37] hover:text-white rounded-lg text-xs font-bold transition-all text-gray-500 flex items-center justify-center gap-2">
                           <Pencil size={14}/> Düzenle
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeletePlan(plan.id); }} className="py-2 px-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-500 hover:text-white rounded-lg text-red-400 transition-all">
                           <Trash2 size={16}/>
                        </button>
                     </div>
                  </div>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Sınav Yönetimi</h3>
            <button 
              onClick={() => { setEditingExamId(null); setNewExam({ title: '', category: 'YDS', duration: 180, questions: [], startDate: '', startTime: '', endDate: '', endTime: '' }); setShowAddExamModal(true); }}
              className="px-6 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
            >
              <Plus size={20}/> Yeni Sınav Oluştur
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.filter(e => e.title.toLowerCase().includes(searchText.toLowerCase())).map(exam => (
              <div key={exam.id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase bg-[#FFFBF0] dark:bg-[#2d2d2d] px-2 py-1 rounded-lg">{exam.category}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingExamId(exam.id); setNewExam(exam); setShowAddExamModal(true); }} className="p-2 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"><Pencil size={16}/></button>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteExam(exam.id); }} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
                <h4 className="font-bold text-[#4A3728] dark:text-white font-serif mb-2">{exam.title}</h4>
                <div className="space-y-1 mb-2">
                   {exam.startDate && (
                     <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                       <Calendar size={12}/> Başlangıç: {exam.startDate} {exam.startTime}
                     </div>
                   )}
                   {exam.endDate && (
                     <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                       <Clock size={12}/> Bitiş: {exam.endDate} {exam.endTime}
                     </div>
                   )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 border-t dark:border-white/5 pt-2">
                  <span className="flex items-center gap-1"><Clock size={14}/> {exam.duration} dk</span>
                  <span className="flex items-center gap-1"><LayoutList size={14}/> {exam.questions.length} Soru</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* READINGS TAB */}
      {activeTab === 'readings' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Okuma Metinleri</h3>
            <button 
              onClick={() => { setEditingReadingId(null); setNewReading({ title: '', content: '', category: 'Sosyal Hayat', level: 'Orta', coverImage: '', sourceUrl: '', arabicFont: 'font-serif' }); setShowAddReadingModal(true); }}
              className="px-6 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-xl font-bold flex items-center gap-2 shadow-lg"
            >
              <Plus size={20}/> Yeni Metin Ekle
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {readingTexts.filter(t => t.title.toLowerCase().includes(searchText.toLowerCase())).map(text => (
              <div key={text.id} className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm group overflow-hidden flex flex-col">
                <div className="h-32 bg-gray-100 dark:bg-[#252525] relative">
                   {text.coverImage ? (
                     <img src={text.coverImage} className="w-full h-full object-cover" alt="Kapak" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-[#D4AF37] opacity-20"><FileText size={48}/></div>
                   )}
                   <div className="absolute top-0 right-0 p-2 flex gap-1">
                      <button onClick={() => downloadAnalysis(text)} className="p-2 bg-white/90 dark:bg-[#2d2d2d]/90 rounded-lg shadow-md text-emerald-500 hover:scale-110 transition-transform"><Download size={14}/></button>
                      <button onClick={() => { setEditingReadingId(text.id); setNewReading(text); setShowAddReadingModal(true); }} className="p-2 bg-white/90 dark:bg-[#2d2d2d]/90 rounded-lg shadow-md text-blue-500 hover:scale-110 transition-transform"><Pencil size={14}/></button>
                      <button onClick={() => { safeConfirm("Silinsin mi?", () => { mockDb.deleteReadingText(text.id); loadData(); }); }} className="p-2 bg-white/90 dark:bg-[#2d2d2d]/90 rounded-lg shadow-md text-red-500 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
                   </div>
                </div>
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase bg-[#FFFBF0] dark:bg-[#2d2d2d] px-2 py-1 rounded-lg">{text.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${text.level === 'İleri' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{text.level}</span>
                  </div>
                  <h4 className="font-bold text-[#4A3728] dark:text-white font-serif line-clamp-2">{text.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold"><Sparkles size={12}/> AI ANALİZLİ</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIDEOS TAB (NEW) */}
      {activeTab === 'videos' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Video Galeri</h3>
            <button 
              onClick={() => { setNewVideo({ title: '', description: '', videoUrl: '', attachments: [] }); setShowAddVideoModal(true); }}
              className="px-6 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-xl font-bold flex items-center gap-2 shadow-lg"
            >
              <Plus size={20}/> Yeni Video Ekle
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoResources.filter(v => v.title.toLowerCase().includes(searchText.toLowerCase())).map(video => (
              <div key={video.id} className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm group overflow-hidden">
                <div className="h-40 bg-black relative flex items-center justify-center">
                   <Video size={48} className="text-white/20"/>
                   <div className="absolute top-0 right-0 p-2">
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteVideo(video.id); }} className="p-2 bg-white/90 dark:bg-[#2d2d2d]/90 rounded-lg shadow-md text-red-500 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
                   </div>
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="font-bold text-[#4A3728] dark:text-white font-serif line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{video.description}</p>
                  
                  {video.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mt-2">
                       <Paperclip size={12}/> {video.attachments.length} Dosya Eklendi
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Sınav Sonuçları</h3>
            <button 
              onClick={handleExportExcel}
              className="px-4 py-2 text-xs font-bold text-gray-500 flex items-center gap-2 hover:text-[#4A3728] dark:hover:text-[#D4AF37] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-lg"
            >
              <FileSpreadsheet size={16}/> Excel Olarak İndir
            </button>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#252525] text-gray-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Öğrenci</th>
                  <th className="px-6 py-4">Sınav</th>
                  <th className="px-6 py-4">Puan</th>
                  <th className="px-6 py-4">D/Y/B</th>
                  <th className="px-6 py-4">Tarih</th>
                  <th className="px-6 py-4 text-center">Analiz</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {filteredResults.map(res => (
                  <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#4A3728] dark:text-white">{res.studentName}</td>
                    <td className="px-6 py-4 text-gray-500">{res.examTitle}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${res.score >= 70 ? 'text-green-500' : 'text-amber-500'}`}>{res.score}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{res.correctCount}/{res.wrongCount}/{res.emptyCount}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{res.date?.seconds ? new Date(res.date.seconds * 1000).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-center">
                       <button 
                        onClick={() => handleAnalyzeAndSendReport(res)}
                        disabled={isGeneratingReport === res.id || res.isShared}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 mx-auto transition-all ${res.isShared ? 'bg-green-50 text-green-600 cursor-default' : 'bg-[#D4AF37] text-[#4A3728] hover:bg-[#b59022] hover:text-white shadow-md'}`}
                       >
                          {isGeneratingReport === res.id ? <Loader2 size={12} className="animate-spin"/> : res.isShared ? <CheckCircle size={12}/> : <Sparkles size={12}/>}
                          {isGeneratingReport === res.id ? 'Analiz Ediliyor...' : res.isShared ? 'Gönderildi' : 'Analiz Et ve Gönder'}
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { safeConfirm("Silinsin mi?", () => { mockDb.updateResult(res.id, { id: 'DELETE' }); loadData(); }); }} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRE-REGISTRATION TAB */}
      {activeTab === 'pre-reg' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-[#4A3728] dark:text-white border-b dark:border-white/5 pb-2">Yeni Üyelik Başvuruları ({pendingUsers.length})</h3>
            <div className="grid gap-4">
              {pendingUsers.map(user => (
                <div key={user.id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600"><UserIcon size={24}/></div>
                    <div>
                      <h4 className="font-bold text-[#4A3728] dark:text-white">{user.fullName}</h4>
                      <p className="text-xs text-gray-400">{user.educationLevel} • {user.email}</p>
                      {user.subscriptionPlan && (
                          <p className="text-[10px] text-[#D4AF37] font-bold uppercase mt-1">Seçilen Paket: {plans.find(p => p.id === user.subscriptionPlan)?.title || user.subscriptionPlan}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(user.id, 'active')} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="Onayla"><UserCheck size={20}/></button>
                    <button onClick={() => handleUpdateStatus(user.id, 'rejected')} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all" title="Reddet"><UserX size={20}/></button>
                  </div>
                </div>
              ))}
              {pendingUsers.length === 0 && (
                <div className="text-center py-10 bg-gray-50 dark:bg-[#1a1a1a] rounded-[2rem] border border-dashed border-gray-200 dark:border-white/5">
                  <p className="text-gray-400 text-sm">Bekleyen yeni üye başvurusu bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-[#4A3728] dark:text-white border-b dark:border-white/5 pb-2">Paket Yükseltme Talepleri ({pendingRequests.length})</h3>
            <div className="grid gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-purple-600"><CreditCard size={24}/></div>
                    <div>
                      <h4 className="font-bold text-[#4A3728] dark:text-white">{req.userName}</h4>
                      <p className="text-xs text-gray-400">Talep Edilen: <span className="text-[#D4AF37] font-bold">{req.planName}</span></p>
                      <p className="text-[10px] text-gray-400 mt-1">{req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleString() : '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveSubscription(req.id)} className="px-4 py-2 bg-green-50 text-green-600 font-bold text-xs rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center gap-1">
                       <CheckCircle size={16}/> Onayla
                    </button>
                    <button onClick={() => handleRejectSubscription(req.id)} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-1">
                       <XCircle size={16}/> Reddet
                    </button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <div className="text-center py-10 bg-gray-50 dark:bg-[#1a1a1a] rounded-[2rem] border border-dashed border-gray-200 dark:border-white/5">
                  <p className="text-gray-400 text-sm">Bekleyen paket yükseltme talebi bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in">
           <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Kayıtlı Öğrenciler</h3>
             <button onClick={() => setShowAddUserModal(true)} className="px-6 py-2 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={18}/> Manuel Ekle</button>
           </div>
           <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 dark:bg-[#252525] text-gray-400 uppercase text-[10px] font-bold">
                 <tr>
                    <th className="px-6 py-4">Öğrenci</th>
                    <th className="px-6 py-4">Seviye</th>
                    <th className="px-6 py-4">Abonelik Kalan</th>
                    <th className="px-6 py-4">Durum</th>
                    <th className="px-6 py-4"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                 {filteredUsers.map(user => {
                   const daysLeft = getDaysLeft(user);
                   return (
                   <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2d2d2d] flex items-center justify-center text-gray-400"><UserIcon size={16}/></div>
                           <span className="font-bold text-[#4A3728] dark:text-white">{user.fullName}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-gray-500">{user.educationLevel}</td>
                     <td className="px-6 py-4">
                        {daysLeft > 0 ? (
                           <span className={`text-xs font-bold ${daysLeft < 7 ? 'text-red-500' : 'text-green-500'}`}>{daysLeft} Gün</span>
                        ) : (
                           <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><AlertTriangle size={12}/> Süresi Doldu</span>
                        )}
                     </td>
                     <td className="px-6 py-4"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg uppercase">Aktif</span></td>
                     <td className="px-6 py-4 text-right">
                        <button onClick={() => { safeConfirm("Kullanıcı silinsin mi?", () => { mockDb.deleteUser(user.id); loadData(); }) }} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                     </td>
                   </tr>
                 )})}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* EXAM MODAL */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in">
            <div className="p-6 bg-[#4A3728] dark:bg-[#252525] text-white flex justify-between items-center">
               <h3 className="font-bold">{editingExamId ? 'Sınavı Düzenle' : 'Yeni Sınav Oluştur'}</h3>
               <button onClick={() => setShowAddExamModal(false)}><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Sınav Bilgileri</label>
                      <input className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white" placeholder="Sınav Başlığı" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})}/>
                   </div>
                   <select className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl border-none outline-none dark:text-white" value={newExam.category} onChange={e => setNewExam({...newExam, category: e.target.value})}>
                      <option>YDS</option><option>YÖKDİL</option><option>YDT</option><option>Deneme</option>
                   </select>
                </div>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Zamanlama</label>
                      <div className="grid grid-cols-2 gap-2">
                         <input type="date" className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl outline-none dark:text-white text-xs" value={newExam.startDate} onChange={e => setNewExam({...newExam, startDate: e.target.value})} placeholder="Başlangıç Tarihi"/>
                         <input type="time" className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl outline-none dark:text-white text-xs" value={newExam.startTime} onChange={e => setNewExam({...newExam, startTime: e.target.value})} placeholder="Başlangıç Saati"/>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                         <input type="date" className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl outline-none dark:text-white text-xs" value={newExam.endDate} onChange={e => setNewExam({...newExam, endDate: e.target.value})} placeholder="Bitiş Tarihi"/>
                         <input type="time" className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl outline-none dark:text-white text-xs" value={newExam.endTime} onChange={e => setNewExam({...newExam, endTime: e.target.value})} placeholder="Bitiş Saati"/>
                      </div>
                   </div>
                </div>
              </div>

              {/* Question Form */}
              <div className="bg-gray-50 dark:bg-[#222] p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                   <h4 className="font-bold text-sm text-[#4A3728] dark:text-[#D4AF37] uppercase">Soru Ekle</h4>
                   <input className="p-2 bg-white dark:bg-[#2a2a2a] rounded-lg text-xs outline-none dark:text-white w-48" placeholder="Konu/Kazanım (Örn: Edatlar)" value={currentQuestion.topic} onChange={e => setCurrentQuestion({...currentQuestion, topic: e.target.value})}/>
                </div>
                <textarea className="w-full p-4 bg-white dark:bg-[#2a2a2a] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white" placeholder="Soru Metni..." value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})}/>
                <div className="grid grid-cols-2 gap-3">
                  {['a','b','c','d','e'].map(opt => (
                    <input key={opt} className="p-3 bg-white dark:bg-[#2a2a2a] rounded-xl border-none outline-none dark:text-white text-sm" placeholder={`Şık ${opt.toUpperCase()}`} value={currentQuestion.options[opt as keyof typeof currentQuestion.options]} onChange={e => setCurrentQuestion({...currentQuestion, options: {...currentQuestion.options, [opt]: e.target.value}})}/>
                  ))}
                  <select className="p-3 bg-white dark:bg-[#2a2a2a] rounded-xl border-none outline-none dark:text-white text-sm font-bold" value={currentQuestion.correctOption} onChange={e => setCurrentQuestion({...currentQuestion, correctOption: e.target.value})}>
                    {['a','b','c','d','e'].map(opt => <option key={opt} value={opt}>Doğru Şık: {opt.toUpperCase()}</option>)}
                  </select>
                </div>
                <button onClick={handleAddQuestion} className="w-full py-3 bg-[#D4AF37] text-[#4A3728] font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"><Plus size={18}/> Listeye Soru Ekle</button>
              </div>

              {/* Question List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Eklenen Sorular ({newExam.questions?.length || 0})</h4>
                {newExam.questions?.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-[#222] border dark:border-white/5 rounded-2xl flex justify-between items-center group">
                    <div className="flex-1">
                       <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mr-2">{q.topic || 'Genel'}</span>
                       <span className="text-sm font-medium dark:text-gray-300 line-clamp-1">{idx+1}. {q.text}</span>
                    </div>
                    <button onClick={() => setNewExam({...newExam, questions: newExam.questions?.filter((_, i) => i !== idx)})} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-[#1c1c1c] border-t dark:border-white/5 flex justify-end gap-3">
               <button onClick={() => setShowAddExamModal(false)} className="px-6 py-3 font-bold text-gray-400">Vazgeç</button>
               <button onClick={handleSaveExam} className="px-10 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl shadow-lg">Sınavı Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in">
              <div className="p-6 bg-[#4A3728] dark:bg-[#252525] text-white flex justify-between items-center">
                 <h3 className="font-bold flex items-center gap-2"><Video size={20}/> Yeni Video Ekle</h3>
                 <button onClick={() => setShowAddVideoModal(false)}><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Video Başlığı</label>
                       <input className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} placeholder="Örn: YDS Gramer Konu Anlatımı 1"/>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Video Açıklaması</label>
                       <textarea className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all h-24" value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})} placeholder="Videonun içeriği hakkında kısa bilgi..."/>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Video Bağlantısı (URL veya Dosya)</label>
                       <div className="flex gap-2">
                         <input className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" value={newVideo.videoUrl} onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})} placeholder="https://... veya dosya yükleyin"/>
                         <input ref={videoFileRef} type="file" hidden accept="video/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if(file) {
                               const reader = new FileReader();
                               reader.onloadend = () => setNewVideo(prev => ({...prev, videoUrl: reader.result as string}));
                               reader.readAsDataURL(file);
                            }
                         }}/>
                         <button onClick={() => videoFileRef.current?.click()} className="px-4 bg-gray-100 dark:bg-[#333] hover:bg-[#D4AF37] hover:text-white text-gray-600 dark:text-gray-300 rounded-xl transition-colors flex items-center justify-center" title="Video Dosyası Yükle">
                            <Upload size={20}/>
                         </button>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 bg-gray-50 dark:bg-[#222] rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                    <h4 className="font-bold text-sm text-[#4A3728] dark:text-[#D4AF37] flex items-center gap-2"><Paperclip size={16}/> Döküman Ekle</h4>
                    <div className="flex gap-2">
                       <input className="flex-1 p-3 bg-white dark:bg-[#2a2a2a] rounded-xl text-xs outline-none dark:text-white" placeholder="Dosya Adı" value={newAttachment.name} onChange={e => setNewAttachment({...newAttachment, name: e.target.value})}/>
                       <select className="p-3 bg-white dark:bg-[#2a2a2a] rounded-xl text-xs outline-none dark:text-white" value={newAttachment.type} onChange={e => setNewAttachment({...newAttachment, type: e.target.value as any})}>
                          <option value="pdf">PDF</option>
                          <option value="word">Word</option>
                          <option value="excel">Excel</option>
                       </select>
                    </div>
                    <div className="flex gap-2">
                       <input className="flex-1 p-3 bg-white dark:bg-[#2a2a2a] rounded-xl text-xs outline-none dark:text-white" placeholder="Dosya URL veya Yükle" value={newAttachment.url} onChange={e => setNewAttachment({...newAttachment, url: e.target.value})}/>
                       <input ref={attachmentFileRef} type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={e => {
                          const file = e.target.files?.[0];
                          if(file) {
                             const reader = new FileReader();
                             reader.onloadend = () => setNewAttachment(prev => ({...prev, url: reader.result as string, name: file.name}));
                             reader.readAsDataURL(file);
                          }
                       }}/>
                       <button onClick={() => attachmentFileRef.current?.click()} className="px-3 bg-gray-200 dark:bg-[#333] hover:bg-[#D4AF37] hover:text-white text-gray-600 dark:text-gray-300 rounded-xl transition-colors flex items-center justify-center" title="Dosya Seç">
                          <FileUp size={16}/>
                       </button>
                       <button onClick={handleAddAttachment} className="px-4 bg-[#D4AF37] text-[#4A3728] font-bold rounded-xl text-xs hover:scale-105 transition-all">Ekle</button>
                    </div>

                    {newVideo.attachments.length > 0 && (
                       <div className="space-y-2 mt-4">
                          {newVideo.attachments.map((att, idx) => (
                             <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-[#2a2a2a] rounded-xl">
                                <div className="flex items-center gap-2">
                                   <FileText size={14} className="text-gray-400"/>
                                   <span className="text-xs font-bold dark:text-white">{att.name}</span>
                                   <span className="text-[9px] uppercase bg-gray-100 dark:bg-[#333] px-1.5 rounded text-gray-500">{att.type}</span>
                                </div>
                                <button onClick={() => handleRemoveAttachment(att.id)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-[#1c1c1c] border-t dark:border-white/5 flex justify-end gap-3">
                 <button onClick={() => setShowAddVideoModal(false)} className="px-6 py-3 font-bold text-gray-400">İptal</button>
                 <button onClick={handleSaveVideo} className="px-10 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl shadow-lg">Videoyu Kaydet</button>
              </div>
           </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-lg overflow-hidden animate-in zoom-in shadow-2xl flex flex-col max-h-[85vh]">
             {/* Header */}
             <div className="p-6 bg-[#4A3728] dark:bg-[#252525] text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold flex items-center gap-2 text-lg"><SettingsIcon size={20}/> Yönetim Paneli Ayarları</h3>
                  <p className="text-[10px] text-white/50 mt-1 uppercase tracking-widest font-bold">Sistem Yapılandırması</p>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24}/></button>
             </div>
             
             {/* Navigation Tabs */}
             <div className="flex border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#1e1e1e] shrink-0">
                <button onClick={() => setSettingsTab('branding')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${settingsTab === 'branding' ? 'text-[#4A3728] dark:text-[#D4AF37] border-b-2 border-[#4A3728] dark:border-[#D4AF37] bg-white dark:bg-[#1a1a1a]' : 'text-gray-400'}`}>
                   <ImageIcon size={16}/> Marka Kimliği
                </button>
                <button onClick={() => setSettingsTab('appearance')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${settingsTab === 'appearance' ? 'text-[#4A3728] dark:text-[#D4AF37] border-b-2 border-[#4A3728] dark:border-[#D4AF37] bg-white dark:bg-[#1a1a1a]' : 'text-gray-400'}`}>
                   <Palette size={16}/> Sistem Görünümü
                </button>
             </div>

             {/* Content Area */}
             <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-white dark:bg-[#1a1a1a]">
                {settingsTab === 'branding' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-[#252525] p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Logo Yükleme</label>
                       
                       <div className="flex flex-col md:flex-row gap-6 items-start">
                          <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/20 overflow-hidden flex items-center justify-center shrink-0 bg-white dark:bg-[#1a1a1a] shadow-sm relative group">
                             {tempLogoUrl ? (
                               <>
                                 <img src={tempLogoUrl} className="w-full h-full object-cover p-2" alt="Preview"/>
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => setTempLogoUrl('')}>
                                    <Trash2 className="text-white" size={24}/>
                                 </div>
                               </>
                             ) : (
                               <ImageIcon size={32} className="text-gray-300"/>
                             )}
                          </div>
                          <div className="flex-1 space-y-4 w-full">
                             <input 
                              ref={logoInputRef}
                              type="file" 
                              hidden 
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              onChange={handleLogoUpload}
                             />
                             <div className="grid gap-3">
                               <button 
                                onClick={() => logoInputRef.current?.click()}
                                className="w-full py-3 px-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                               >
                                  <Upload size={16}/> Cihazdan Yükle (PNG/JPG)
                               </button>
                               <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ExternalLink size={14} className="text-gray-400"/>
                                 </div>
                                 <input 
                                  className="w-full pl-10 p-3 bg-white dark:bg-[#1a1a1a] rounded-xl outline-none dark:text-white border border-gray-200 dark:border-white/10 focus:border-[#D4AF37] transition-all text-xs"
                                  placeholder="veya görsel bağlantısı (URL) yapıştırın..."
                                  value={tempLogoUrl}
                                  onChange={e => setTempLogoUrl(e.target.value)}
                                 />
                               </div>
                             </div>
                             <p className="text-[10px] text-gray-400">Önerilen boyut: 512x512px. Şeffaf arkaplanlı PNG tercih edilir.</p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'appearance' && (
                  <div className="space-y-8 animate-in fade-in">
                     {/* Theme Toggle */}
                     <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-[#252525] rounded-3xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-amber-100 text-amber-500'}`}>
                              {isDarkMode ? <Moon size={24}/> : <Sun size={24}/>}
                           </div>
                           <div>
                              <p className="font-bold text-[#4A3728] dark:text-white">Karanlık Mod</p>
                              <p className="text-xs text-gray-400 mt-0.5">Sistem genelinde koyu tema kullan.</p>
                           </div>
                        </div>
                        <button 
                          onClick={onToggleDarkMode} 
                          className={`w-14 h-8 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}
                        >
                           <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                     </div>

                     <div className="space-y-6">
                       {/* Font Family Selection - Converted to Select Dropdown */}
                       <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <TypeIcon size={14}/> Yazı Tipi Ailesi
                          </label>
                          <div className="relative">
                            <select 
                              className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl appearance-none outline-none border border-gray-200 dark:border-white/10 focus:border-[#D4AF37] dark:text-white transition-all cursor-pointer font-medium"
                              value={fontFamily}
                              onChange={(e) => onFontFamilyChange?.(e.target.value)}
                            >
                              {SYSTEM_FONTS.map(cat => (
                                <optgroup key={cat.category} label={cat.category}>
                                  {cat.options.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <ChevronRight className="rotate-90" size={18}/>
                            </div>
                          </div>
                       </div>

                       {/* Font Size & Preview */}
                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Monitor size={14}/> Okuma Boyutu
                             </label>
                             <span className="text-xs font-bold bg-gray-100 dark:bg-[#252525] px-2 py-1 rounded-md text-[#4A3728] dark:text-white">{fontSize}px</span>
                          </div>
                          <div className="bg-gray-50 dark:bg-[#252525] p-4 rounded-2xl flex items-center gap-4">
                             <span className="text-xs font-bold text-gray-400">A-</span>
                             <input 
                               type="range" 
                               min="12" 
                               max="24" 
                               step="1"
                               value={fontSize} 
                               onChange={e => onFontSizeChange?.(parseInt(e.target.value))}
                               className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                             />
                             <span className="text-lg font-bold text-[#4A3728] dark:text-[#D4AF37]">A+</span>
                          </div>
                          
                          {/* Live Preview Box */}
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Canlı Önizleme</label>
                             <div 
                                className="p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm bg-[#FDFCF8] dark:bg-[#121212] transition-all overflow-hidden"
                                style={{ 
                                  fontFamily: fontFamily?.replace(/"/g, ''),
                                  fontSize: `${fontSize}px` // Explicitly use fontSize prop for preview
                                }}
                             >
                                <h4 className="font-bold text-[#4A3728] dark:text-[#D4AF37] mb-2" style={{ fontSize: '1.2em' }}>Merhaba Dünya!</h4>
                                <p className="text-[#4A3728] dark:text-gray-300 leading-relaxed">
                                  Bu bir önizleme metnidir. Arapça karakter desteği: <br/>
                                  <span dir="rtl" className="mt-1 block">مرحباً بكم في منصة إمتحرا</span>
                                </p>
                             </div>
                          </div>
                       </div>
                     </div>
                  </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="p-6 bg-gray-50 dark:bg-[#1e1e1e] border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 shrink-0">
               <button onClick={() => setShowSettingsModal(false)} className="px-6 py-3 font-bold text-gray-400 text-xs hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Vazgeç</button>
               <button onClick={handleSaveSettings} className="px-8 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-2">
                  <CheckCircle size={16}/> Ayarları Kaydet
               </button>
             </div>
          </div>
        </div>
      )}

      {/* PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">{editingPlanId ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}</h3>
                <button onClick={() => setShowPlanModal(false)}><X size={20}/></button>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Paket Adı</label>
                   <input className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" 
                    placeholder="Örn: 3 Aylık Kampanya"
                    value={newPlan.title}
                    onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Fiyat Etiketi</label>
                   <input className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" 
                    placeholder="Örn: 750 TL"
                    value={newPlan.price}
                    onChange={e => setNewPlan({...newPlan, price: e.target.value})}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Gün Sayısı</label>
                   <input type="number" className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" 
                    placeholder="30"
                    value={newPlan.days}
                    onChange={e => setNewPlan({...newPlan, days: parseInt(e.target.value) || 0})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Kart Rengi</label>
                   <div className="grid grid-cols-4 gap-2">
                      {PLAN_COLORS.map(c => (
                         <button 
                           key={c.class}
                           onClick={() => setNewPlan({...newPlan, color: c.class})}
                           className={`h-10 rounded-lg ${c.class} border-2 ${newPlan.color === c.class ? 'border-white ring-2 ring-[#4A3728] dark:ring-white scale-110' : 'border-transparent opacity-70'} transition-all`}
                           title={c.name}
                         />
                      ))}
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl">
                   <input type="checkbox" className="w-5 h-5 accent-[#D4AF37]" checked={newPlan.isPopular} onChange={e => setNewPlan({...newPlan, isPopular: e.target.checked})}/>
                   <span className="text-sm font-bold text-gray-500">Bu paketi "Popüler" olarak işaretle</span>
                </div>

                {/* Subscription Feature Limits Section */}
                <div className="p-4 bg-[#FFFBF0] dark:bg-[#202020] rounded-2xl border border-[#D4AF37]/20 space-y-3">
                   <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">Öğrenci Panel Yetkileri / Sınırlandırmalar</span>
                   <div className="space-y-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                         <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" checked={newPlan.allowAiTutor !== false} onChange={e => setNewPlan({...newPlan, allowAiTutor: e.target.checked})}/>
                         <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Yapay Zeka Arapça Asistanı (Gemini)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                         <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" checked={newPlan.allowExams !== false} onChange={e => setNewPlan({...newPlan, allowExams: e.target.checked})}/>
                         <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Hazırlık Sınavları & Sınav Odası</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                         <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" checked={newPlan.allowReadingRoom !== false} onChange={e => setNewPlan({...newPlan, allowReadingRoom: e.target.checked})}/>
                         <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Okuma Odası & Gramer Analiz Modülü</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                         <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" checked={newPlan.allowVocabulary !== false} onChange={e => setNewPlan({...newPlan, allowVocabulary: e.target.checked})}/>
                         <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Kelime Odası (Kartlar & Sözlük)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                         <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" checked={newPlan.allowVideos !== false} onChange={e => setNewPlan({...newPlan, allowVideos: e.target.checked})}/>
                         <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Video Ders Galerisi</span>
                      </label>
                   </div>
                </div>
                
                <button onClick={handleSavePlan} className="w-full py-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl shadow-lg mt-4 hover:scale-105 active:scale-95 transition-all">
                   {editingPlanId ? 'Değişiklikleri Kaydet' : 'Paketi Oluştur'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Manual User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Manuel Öğrenci Kaydı</h3>
                 <button onClick={() => setShowAddUserModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleSaveUser} className="space-y-4">
                 <input 
                  required 
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" 
                  placeholder="Ad Soyad" 
                  value={newUser.fullName}
                  onChange={e => setNewUser(prev => ({...prev, fullName: e.target.value}))}
                 />
                 <input 
                  required 
                  type="email" 
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" 
                  placeholder="E-posta" 
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({...prev, email: e.target.value}))}
                 />
                 <input 
                  required 
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" 
                  placeholder="Telefon" 
                  value={newUser.phone}
                  onChange={e => setNewUser(prev => ({...prev, phone: e.target.value}))}
                 />
                 <input 
                  required 
                  type="password" 
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" 
                  placeholder="Şifre" 
                  value={newUser.password}
                  onChange={e => setNewUser(prev => ({...prev, password: e.target.value}))}
                 />
                 
                 <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Abonelik Paketi</label>
                    <select 
                      className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all"
                      value={newUser.subscriptionPlan}
                      onChange={e => setNewUser(prev => ({...prev, subscriptionPlan: e.target.value as SubscriptionPlan}))}
                    >
                       {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                       <option value="custom">Özel Tarih Seç</option>
                    </select>

                    {newUser.subscriptionPlan === 'custom' && (
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Özel Bitiş Tarihi</label>
                          <input 
                            type="date"
                            required
                            className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all"
                            value={customEndDate}
                            onChange={e => setCustomEndDate(e.target.value)}
                          />
                       </div>
                    )}
                 </div>

                 <select 
                  className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-[#D4AF37] transition-all" 
                  value={newUser.educationLevel} 
                  onChange={e => setNewUser(prev => ({...prev, educationLevel: e.target.value}))}
                 >
                    {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>

                 <button type="submit" className="w-full py-4 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl shadow-lg mt-4 hover:scale-105 active:scale-95 transition-all">Kayıt Oluştur</button>
              </form>
           </div>
        </div>
      )}

      {/* Reading Modal */}
      {showAddReadingModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in">
              <div className="p-6 bg-[#4A3728] dark:bg-[#252525] text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <h3 className="font-bold">{editingReadingId ? 'Metni Düzenle' : 'Yeni Metin Ekle'}</h3>
                 <button 
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${isPreviewMode ? 'bg-white text-[#4A3728]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                 >
                   {isPreviewMode ? <><EyeOff size={12}/> Düzenleme Modu</> : <><Eye size={12}/> Ön İzleme</>}
                 </button>
               </div>
               <button onClick={() => setShowAddReadingModal(false)}><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {isPreviewMode ? (
                 <div className="space-y-8 animate-in fade-in">
                   <div className="max-w-3xl mx-auto space-y-6">
                     <div className="w-full h-64 bg-gray-100 dark:bg-[#252525] rounded-[2rem] overflow-hidden">
                        {newReading.coverImage && <img src={newReading.coverImage} className="w-full h-full object-cover" alt="Preview" />}
                     </div>
                     <div className="space-y-2 text-center">
                        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">{newReading.category} • {newReading.level}</span>
                        <h1 className="text-4xl font-bold font-serif text-[#4A3728] dark:text-white">{newReading.title || 'Başlıksız Metin'}</h1>
                     </div>
                     <div className={`p-8 bg-[#FDFCF8] dark:bg-[#121212] rounded-[2.5rem] border border-gray-100 dark:border-white/5 text-right text-3xl leading-[4.5rem] text-[#4A3728] dark:text-gray-200 ${newReading.arabicFont || 'font-serif'}`} dir="rtl">
                        {newReading.content || 'Metin içeriği girilmedi.'}
                     </div>
                     {newReading.sourceUrl && (
                       <div className="text-center">
                         <a href={newReading.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#D4AF37] font-bold hover:underline">
                           <ExternalLink size={16}/> Orijinal Kaynağı Görüntüle
                         </a>
                       </div>
                     )}
                   </div>
                 </div>
               ) : (
                 <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Temel Bilgiler</label>
                       <input className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white" placeholder="Metin Başlığı" value={newReading.title} onChange={e => setNewReading({...newReading, title: e.target.value})}/>
                       <div className="grid grid-cols-2 gap-4">
                          <select className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl dark:text-white outline-none" value={newReading.category} onChange={e => setNewReading({...newReading, category: e.target.value})}>
                             {READING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <select className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl dark:text-white outline-none" value={newReading.level} onChange={e => setNewReading({...newReading, level: e.target.value as any})}><option>Başlangıç</option><option>Orta</option><option>İleri</option></select>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Görünüm ve Kaynak</label>
                       <div className="space-y-3">
                         <div className="relative">
                            <input 
                              type="file" 
                              ref={readingImageRef} 
                              hidden 
                              accept="image/*" 
                              onChange={handleReadingImageUpload} 
                            />
                            <button 
                              onClick={() => readingImageRef.current?.click()}
                              className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-[#D4AF37] transition-all flex items-center justify-center gap-3 text-gray-400 hover:text-[#D4AF37]"
                            >
                               {newReading.coverImage ? (
                                 <div className="flex items-center gap-2">
                                   <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#D4AF37]">
                                      <img src={newReading.coverImage} className="w-full h-full object-cover" alt="Kapak" />
                                   </div>
                                   <span className="text-xs font-bold">Resmi Değiştir</span>
                                 </div>
                               ) : (
                                 <><Upload size={18}/> <span className="text-xs font-bold">Kapak Resmi Yükle (Dosya Seç)</span></>
                               )}
                            </button>
                         </div>
                         <div className="relative">
                            <ExternalLink size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                            <input className="w-full pl-12 p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white text-sm" placeholder="Kaynak URL (https://...)" value={newReading.sourceUrl} onChange={e => setNewReading({...newReading, sourceUrl: e.target.value})}/>
                         </div>
                         <div className="relative">
                            <TypeIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                            <select className="w-full pl-12 p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white text-sm" value={newReading.arabicFont} onChange={e => setNewReading({...newReading, arabicFont: e.target.value})}>
                               {ARABIC_FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-2 flex flex-col">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Arapça İçerik</label>
                      <textarea className={`w-full flex-1 p-6 bg-gray-50 dark:bg-[#252525] rounded-3xl text-right text-2xl border-none outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white min-h-[300px] ${newReading.arabicFont || 'font-serif'}`} dir="rtl" placeholder="Metni buraya yapıştırın..." value={newReading.content} onChange={e => setNewReading({...newReading, content: e.target.value})}/>
                   </div>
                 </div>
               )}
            </div>
            <div className="p-6 bg-gray-50 dark:bg-[#1c1c1c] border-t dark:border-white/5 flex justify-end gap-3">
               <button onClick={() => setShowAddReadingModal(false)} className="px-6 py-3 font-bold text-gray-400">İptal</button>
               <button onClick={handleSaveReading} disabled={isAnalyzing} className="px-10 py-3 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20">
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} 
                  {isAnalyzing ? 'AI Analiz Ediyor...' : 'Kaydet ve Analiz Et'}
               </button>
            </div>
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
                 type="button"
                 onClick={() => setConfirmDialog(null)} 
                 className="flex-1 py-3 bg-gray-100 dark:bg-[#252525] hover:bg-gray-200 dark:hover:bg-[#303030] rounded-xl text-xs font-bold transition-all text-gray-600 dark:text-gray-300"
               >
                 Vazgeç
               </button>
               <button 
                 type="button"
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