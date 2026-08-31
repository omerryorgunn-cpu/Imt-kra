
export type Role = 'admin' | 'student';
export type Status = 'pending' | 'active' | 'rejected';

// Changed from strict union to string to support dynamic plans created by admin
export type SubscriptionPlan = string; 

export interface PlanConfig {
  id: string;
  title: string;
  price: string;
  days: number;
  color: string; // Tailwind class like 'bg-blue-500'
  isPopular?: boolean;
  allowAiTutor?: boolean;
  allowExams?: boolean;
  allowReadingRoom?: boolean;
  allowVocabulary?: boolean;
  allowVideos?: boolean;
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: Status;
  profilePic?: string;
  gender: string;
  birthDate?: string;
  educationLevel: string;
  educationField?: string;
  occupation: string;
  password?: string;
  address?: string;
  isBanned: boolean;
  createdAt: any;
  registrationChannel?: string;
  notificationsEnabled?: boolean;
  
  // Subscription Fields
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStartDate?: any;
  subscriptionEndDate?: any;
}

export interface Question {
  text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
  };
  correctOption: string;
  points: number;
  topic?: string; // New: Subject matter for analysis (e.g., "Prepositions")
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  questions: Question[];
  startDate?: string;
  startTime?: string; // New
  endDate?: string;
  endTime?: string; // New
  createdAt: any;
}

export interface TextAnalysis {
  prepositions: { phrase: string; meaning: string }[];
  patterns: { phrase: string; meaning: string }[];
  conjunctions: { word: string; meaning: string }[];
  vocabulary: { word: string; meaning: string }[];
  wordMap: Record<string, string>;
  fullTranslation?: string;
}

export interface ReadingText {
  id: string;
  title: string;
  content: string;
  category: string;
  level: 'Başlangıç' | 'Orta' | 'İleri';
  topic?: string;
  sourceUrl?: string;
  coverImage?: string;
  videoUrl?: string;
  arabicFont?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold';
  galleryImages?: string[];
  analysis?: TextAnalysis;
  createdAt: any;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentEdu: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  totalQuestions: number;
  answers?: Record<number, string>; // New: Store student answers for AI analysis
  feedback?: string;
  isShared: boolean;
  date: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  isTicker?: boolean;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  createdAt: any;
}

export interface Message {
  id: string;
  recipientId: string;
  senderId: string;
  content: string;
  createdAt: any;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: any;
  read: boolean;
  imageUrl?: string;
}

export interface SupportTicket {
  id: string;
  senderName: string;
  senderContact: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
  status: 'open' | 'closed';
  reply?: string;
  repliedAt?: any;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: any;
  read: boolean;
}

export interface PersonalWord {
  id: string;
  userId: string;
  arabic: string;
  turkish: string;
  example?: string;
  createdAt: any;
}

export interface SiteSettings {
  logoUrl: string;
}

// --- New Video Module Interfaces ---
export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'excel';
  url: string;
}

export interface VideoResource {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  attachments: Attachment[];
  createdAt: any;
}