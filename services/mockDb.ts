
import { User, Exam, Message, DirectMessage, ExamResult, Announcement, SiteSettings, Notification, ReadingText, PersonalWord, PlanConfig, SubscriptionRequest, VideoResource, SupportTicket } from '../types';

const STORAGE_KEY = 'imtikra_mock_db';

interface DB {
  users: User[];
  exams: Exam[];
  messages: Message[];
  directMessages: DirectMessage[];
  results: ExamResult[];
  announcements: Announcement[];
  notifications: Notification[];
  readingTexts: ReadingText[];
  personalWords: PersonalWord[];
  settings: SiteSettings;
  plans: PlanConfig[];
  subscriptionRequests: SubscriptionRequest[];
  videoResources: VideoResource[]; // Added
  supportTickets: SupportTicket[];
}

const defaultPlans: PlanConfig[] = [
  { id: 'trial', title: 'Ücretsiz Deneme', price: 'Ücretsiz', days: 7, color: 'bg-green-500', isPopular: false, allowAiTutor: false, allowExams: true, allowReadingRoom: false, allowVocabulary: true, allowVideos: false },
  { id: '1_month', title: 'Aylık Paket', price: '500 TL', days: 30, color: 'bg-blue-500', isPopular: false, allowAiTutor: true, allowExams: true, allowReadingRoom: true, allowVocabulary: true, allowVideos: false },
  { id: '3_months', title: '3 Aylık Paket', price: '750 TL', days: 90, color: 'bg-purple-500', isPopular: true, allowAiTutor: true, allowExams: true, allowReadingRoom: true, allowVocabulary: true, allowVideos: true },
  { id: '6_months', title: '6 Aylık Paket', price: '1.000 TL', days: 180, color: 'bg-orange-500', isPopular: false, allowAiTutor: true, allowExams: true, allowReadingRoom: true, allowVocabulary: true, allowVideos: true },
  { id: '1_year', title: 'Yıllık Paket', price: '1.500 TL', days: 365, color: 'bg-[#D4AF37]', isPopular: false, allowAiTutor: true, allowExams: true, allowReadingRoom: true, allowVocabulary: true, allowVideos: true },
];

const defaultDB: DB = {
  users: [
    {
      id: 'admin-id',
      fullName: 'Sistem Yöneticisi',
      email: 'admin',
      password: 'Ömer.147741',
      role: 'admin',
      status: 'active',
      isBanned: false,
      educationLevel: 'Doktora',
      occupation: 'Yönetici',
      phone: '05000000000',
      gender: 'Erkek',
      createdAt: { seconds: Date.now() / 1000 },
      registrationChannel: 'Sistem',
      subscriptionPlan: 'custom',
      subscriptionStartDate: { seconds: Date.now() / 1000 },
      subscriptionEndDate: { seconds: (Date.now() + 315360000000) / 1000 } // ~10 years
    }
  ],
  exams: [],
  messages: [],
  directMessages: [],
  results: [],
  notifications: [],
  announcements: [],
  readingTexts: [],
  personalWords: [],
  settings: {
    logoUrl: "https://picsum.photos/seed/arap/400/400"
  },
  plans: defaultPlans,
  subscriptionRequests: [],
  videoResources: [], // Added
  supportTickets: []
};

const getDB = (): DB => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return JSON.parse(JSON.stringify(defaultDB));
  try {
    const parsed = JSON.parse(data) || {};
    return { 
      ...defaultDB, 
      ...parsed, 
      users: parsed.users || defaultDB.users,
      exams: parsed.exams || [],
      messages: parsed.messages || [],
      directMessages: parsed.directMessages || [],
      results: parsed.results || [],
      announcements: parsed.announcements || [],
      notifications: parsed.notifications || [],
      readingTexts: parsed.readingTexts || [],
      personalWords: parsed.personalWords || [],
      settings: parsed.settings || defaultDB.settings,
      plans: parsed.plans || defaultPlans,
      subscriptionRequests: parsed.subscriptionRequests || [],
      videoResources: parsed.videoResources || [],
      supportTickets: parsed.supportTickets || []
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultDB));
  }
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// Helper to auto-approve trial users after 1 hour
const processAutoApprovals = (db: DB) => {
  const now = Date.now() / 1000;
  let changed = false;
  
  db.users.forEach(user => {
    // Logic: If status is pending AND plan is trial AND created more than 1 hour (3600s) ago
    if (user.status === 'pending' && user.subscriptionPlan === 'trial') {
      const createdAtSeconds = user.createdAt?.seconds;
      if (typeof createdAtSeconds === 'number' && now - createdAtSeconds >= 3600) {
        user.status = 'active';
        changed = true;
      }
    }
  });

  if (changed) {
    saveDB(db);
  }
  return db;
};

export const mockDb = {
  getUsers: () => {
    let db = getDB();
    // Check for auto-approvals every time users are fetched
    db = processAutoApprovals(db);
    return db.users;
  },
  getExams: () => getDB().exams,
  getMessages: (uid: string) => getDB().messages.filter(m => m.recipientId === uid),
  getDirectMessages: (uid1: string, uid2: string) => {
    return getDB().directMessages.filter(m => 
      (m.senderId === uid1 && m.recipientId === uid2) || 
      (m.senderId === uid2 && m.recipientId === uid1)
    ).sort((a, b) => {
      const secondsA = a?.createdAt?.seconds || 0;
      const secondsB = b?.createdAt?.seconds || 0;
      return secondsA - secondsB;
    });
  },
  getAllDirectMessages: () => getDB().directMessages,
  getResults: (uid?: string) => {
    const results = getDB().results;
    return uid ? results.filter(r => r.studentId === uid) : results;
  },
  getAnnouncements: () => getDB().announcements,
  getNotifications: () => getDB().notifications,
  getReadingTexts: () => getDB().readingTexts,
  getPersonalWords: (uid: string) => getDB().personalWords.filter(w => w.userId === uid),
  getSettings: () => getDB().settings,
  getPlans: () => getDB().plans,
  getSubscriptionRequests: () => getDB().subscriptionRequests,
  getVideoResources: () => getDB().videoResources, // Added

  // Video Resource Methods
  addVideoResource: (video: Partial<VideoResource>) => {
    const db = getDB();
    const newVideo = { 
      ...video, 
      id: Math.random().toString(36).substr(2, 9), 
      attachments: video.attachments || [],
      createdAt: { seconds: Date.now() / 1000 } 
    } as VideoResource;
    db.videoResources.push(newVideo);
    saveDB(db);
    return newVideo;
  },

  deleteVideoResource: (id: string) => {
    const db = getDB();
    db.videoResources = db.videoResources.filter(v => v.id !== id);
    saveDB(db);
  },

  // Subscription Request Methods
  addSubscriptionRequest: (req: Partial<SubscriptionRequest>) => {
    const db = getDB();
    const newReq: SubscriptionRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: req.userId!,
      userName: req.userName!,
      userEmail: req.userEmail!,
      planId: req.planId!,
      planName: req.planName!,
      status: 'pending',
      createdAt: { seconds: Date.now() / 1000 }
    };
    db.subscriptionRequests.push(newReq);
    saveDB(db);
    return newReq;
  },

  approveSubscriptionRequest: (requestId: string) => {
    const db = getDB();
    const reqIndex = db.subscriptionRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return;

    const request = db.subscriptionRequests[reqIndex];
    const userIndex = db.users.findIndex(u => u.id === request.userId);
    const plan = db.plans.find(p => p.id === request.planId);

    if (userIndex !== -1 && plan) {
      const user = db.users[userIndex];
      const now = Date.now() / 1000;
      
      // If user has remaining time, add to it. Otherwise start from now.
      const currentEnd = user.subscriptionEndDate?.seconds || 0;
      const baseTime = currentEnd > now ? currentEnd : now;
      const newEnd = baseTime + (plan.days * 24 * 60 * 60);

      user.subscriptionPlan = plan.id;
      // If subscription was expired or didn't exist, reset start date to now
      if (currentEnd < now) {
        user.subscriptionStartDate = { seconds: now };
      }
      user.subscriptionEndDate = { seconds: newEnd };
      user.status = 'active'; // Ensure user is active

      db.subscriptionRequests[reqIndex].status = 'approved';
      saveDB(db);
    }
  },

  rejectSubscriptionRequest: (requestId: string) => {
    const db = getDB();
    const idx = db.subscriptionRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      db.subscriptionRequests[idx].status = 'rejected';
      saveDB(db);
    }
  },

  // New validation function
  checkUserExists: (email: string, phone: string) => {
    const db = getDB();
    const existingEmail = db.users.find(u => u.email && email && u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) return "Bu e-posta adresi zaten kullanımda.";
    
    const cleanPhone = (phone || '').replace(/\s/g, '');
    const existingPhone = db.users.find(u => {
      const uPhone = (u.phone || '').replace(/\s/g, '');
      return uPhone && cleanPhone && uPhone === cleanPhone;
    });
    if (existingPhone) return "Bu telefon numarası zaten kullanımda.";
    
    return null;
  },

  addPersonalWord: (word: Partial<PersonalWord>) => {
    const db = getDB();
    const newWord: PersonalWord = {
      id: Math.random().toString(36).substr(2, 9),
      userId: word.userId || '',
      arabic: word.arabic || '',
      turkish: word.turkish || '',
      example: word.example,
      createdAt: { seconds: Date.now() / 1000 }
    };
    db.personalWords.push(newWord);
    saveDB(db);
    return newWord;
  },

  deletePersonalWord: (id: string) => {
    const db = getDB();
    db.personalWords = db.personalWords.filter(w => w.id !== id);
    saveDB(db);
  },

  sendDirectMessage: (senderId: string, recipientId: string, content: string) => {
    const db = getDB();
    const newMsg: DirectMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId,
      recipientId,
      content,
      createdAt: { seconds: Date.now() / 1000 },
      read: false
    };
    db.directMessages.push(newMsg);
    saveDB(db);
    return newMsg;
  },

  updateSettings: (settings: SiteSettings) => {
    const db = getDB();
    db.settings = settings;
    saveDB(db);
    return db.settings;
  },

  addUser: (user: Partial<User>) => {
    const db = getDB();
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) } as User;
    db.users.push(newUser);
    saveDB(db);
    return newUser;
  },

  deleteUser: (id: string) => {
    const db = getDB();
    db.users = db.users.filter(u => u.id !== id);
    saveDB(db);
  },

  // Plan Methods
  addPlan: (plan: Partial<PlanConfig>) => {
    const db = getDB();
    const newPlan: PlanConfig = {
       id: Math.random().toString(36).substr(2, 9),
       title: plan.title || 'Yeni Paket',
       price: plan.price || '0 TL',
       days: plan.days || 30,
       color: plan.color || 'bg-gray-500',
       isPopular: plan.isPopular || false,
       allowAiTutor: plan.allowAiTutor !== false,
       allowExams: plan.allowExams !== false,
       allowReadingRoom: plan.allowReadingRoom !== false,
       allowVocabulary: plan.allowVocabulary !== false,
       allowVideos: plan.allowVideos !== false
    };
    db.plans.push(newPlan);
    saveDB(db);
    return newPlan;
  },

  updatePlan: (id: string, updates: Partial<PlanConfig>) => {
    const db = getDB();
    const idx = db.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.plans[idx] = { ...db.plans[idx], ...updates };
      saveDB(db);
      return db.plans[idx];
    }
    return null;
  },

  deletePlan: (id: string) => {
    const db = getDB();
    db.plans = db.plans.filter(p => p.id !== id);
    saveDB(db);
  },

  getSupportTickets: () => {
    const db = getDB();
    return (db.supportTickets || []).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  },

  addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    const db = getDB();
    const newTicket: SupportTicket = {
      ...ticket,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: { seconds: Date.now() / 1000 },
      status: 'open'
    };
    db.supportTickets = [...(db.supportTickets || []), newTicket];
    saveDB(db);
    return newTicket;
  },

  updateSupportTicket: (id: string, updates: Partial<SupportTicket>) => {
    const db = getDB();
    db.supportTickets = (db.supportTickets || []).map(t => t.id === id ? { ...t, ...updates } : t);
    saveDB(db);
  },

  deleteSupportTicket: (id: string) => {
    const db = getDB();
    db.supportTickets = (db.supportTickets || []).filter(t => t.id !== id);
    saveDB(db);
  },
  
  addAnnouncement: (ann: Partial<Announcement>) => {
    const db = getDB();
    const newAnn = { 
      ...ann, 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: { seconds: Date.now() / 1000 } 
    } as Announcement;
    db.announcements.push(newAnn);
    saveDB(db);
    return newAnn;
  },

  updateAnnouncement: (id: string, updates: Partial<Announcement>) => {
    const db = getDB();
    const idx = db.announcements.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.announcements[idx] = { ...db.announcements[idx], ...updates };
      saveDB(db);
      return db.announcements[idx];
    }
    return null;
  },

  deleteAnnouncement: (id: string) => {
    const db = getDB();
    db.announcements = db.announcements.filter(a => a.id !== id);
    saveDB(db);
  },

  addReadingText: (text: Partial<ReadingText>) => {
    const db = getDB();
    const newText = { 
      ...text, 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: { seconds: Date.now() / 1000 } 
    } as ReadingText;
    db.readingTexts.push(newText);
    saveDB(db);
    return newText;
  },

  updateReadingText: (id: string, updates: Partial<ReadingText>) => {
    const db = getDB();
    const idx = db.readingTexts.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.readingTexts[idx] = { ...db.readingTexts[idx], ...updates };
      saveDB(db);
      return db.readingTexts[idx];
    }
    return null;
  },

  deleteReadingText: (id: string) => {
    const db = getDB();
    db.readingTexts = db.readingTexts.filter(t => t.id !== id);
    saveDB(db);
  },

  addExam: (exam: Partial<Exam>) => {
    const db = getDB();
    const newExam = { ...exam, id: Math.random().toString(36).substr(2, 9), createdAt: { seconds: Date.now() / 1000 } } as Exam;
    db.exams.push(newExam);
    saveDB(db);
    return newExam;
  },

  updateExam: (id: string, updates: Partial<Exam>) => {
    const db = getDB();
    const idx = db.exams.findIndex(e => e.id === id);
    if (idx !== -1) {
      db.exams[idx] = { ...db.exams[idx], ...updates };
      saveDB(db);
      return db.exams[idx];
    }
    return null;
  },

  deleteExam: (id: string) => {
    const db = getDB();
    db.exams = db.exams.filter(e => e.id !== id);
    saveDB(db);
  },

  addMessage: (msg: Partial<Message>) => {
    const db = getDB();
    const newMsg = { ...msg, id: Math.random().toString(36).substr(2, 9) } as Message;
    db.messages.push(newMsg);
    saveDB(db);
    return newMsg;
  },

  deleteMessage: (id: string) => {
    const db = getDB();
    db.messages = db.messages.filter(m => m.id !== id);
    saveDB(db);
  },

  addResult: (result: Partial<ExamResult>) => {
    const db = getDB();
    const newResult = { 
      ...result, 
      id: Math.random().toString(36).substr(2, 9),
      isShared: false 
    } as ExamResult;
    db.results.push(newResult);
    saveDB(db);
    return newResult;
  },

  updateResult: (id: string, updates: Partial<ExamResult>) => {
    const db = getDB();
    const idx = db.results.findIndex(r => r.id === id);
    if (idx !== -1) {
      db.results[idx] = { ...db.results[idx], ...updates };
      saveDB(db);
      return db.results[idx];
    }
    return null;
  },

  updateUser: (id: string, updates: Partial<User>) => {
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updates };
      saveDB(db);
    }
  },

  addNotification: (title: string, body: string, type: any = 'info') => {
    const db = getDB();
    const n: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title, body, type, createdAt: { seconds: Date.now() / 1000 }, read: false
    };
    db.notifications.push(n);
    saveDB(db);
  }
};
