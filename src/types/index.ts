// Auth types
export interface User {
  id: string;
  email: string;
  companyId: string;
  role: 'master' | 'admin' | 'member';
  permissions: UserPermissions;
  profile?: UserProfile;
  idType?: 'hr' | 'employee';
}

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageQuestions: boolean;
  canViewReports: boolean;
  canManageCustomers: boolean;
  canAnswerSurvey: boolean;
}

export interface UserProfile {
  department: string;
  gender: string;
  nationality: string;
  age: string;
  tenure: string;
  jobType: string;
  position: string;
  grade: string;
  evaluation: string;
  location: string;
  employmentType: string;
  recruitmentType: string;
  education: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  companyName?: string;
}

// Password reset types
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

// Company types
export interface Company {
  id: string;
  name: string;
  nameKana: string;
  address: string;
  postalCode: string;
  industry: string;
  phoneNumber: string;
  email: string;
  contractModel: string;
  contractDate: string;
  paymentCycle: string;
  salesPersonIds: string[];
  employees: Employee[];
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  companyId: string;
  department: string;
  gender: string;
  nationality: string;
  age: string;
  tenure: string;
  jobType: string;
  position: string;
  grade: string;
  evaluation: string;
  location: string;
  employmentType: string;
  recruitmentType: string;
  education: string;
  idType: 'hr' | 'employee';
  profile?: UserProfile;
}

// Survey types
export interface Survey {
  id: string;
  title: string;
  companyId: string;
  deadline: string;
  targetEmployeeCount: number;
  createdAt: string;
  publishedAt?: string;
  implementationDate: string;
  status: 'draft' | 'published' | 'completed';
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'rating' | 'text';
  category: string;
  note?: string;
  order: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  employeeId: string;
  answers: Answer[];
  submittedAt: string;
}

export interface Answer {
  questionId: string;
  value: string | number;
}

// Dashboard metrics types
export interface DashboardMetrics {
  kizunaScore: number;
  engagementScore: number;
  satisfactionScore: number;
  humanCapitalScore: number;
  implementationRate: number;
  positiveRate: number;
  lastSurveyDate: string;
}

export interface ChartData {
  departmentKizuna: DepartmentScore[];
  categoryKizuna: CategoryScore[];
  generationKizuna: GenerationScore[];
  tenureKizuna: TenureScore[];
}

export interface DepartmentScore {
  name: string;
  score: number;
}

export interface GenerationScore {
  age: string;
  score: number;
}

export interface TenureScore {
  tenure: string;
  score: number;
}

// Report types
export interface Report {
  id: string;
  surveyId: string;
  companyId: string;
  implementationDate: string;
  kizunaScore: number;
  engagementScore: number;
  satisfactionScore: number;
  humanCapitalScore: number;
  categoryScores: CategoryScore[];
  generatedAt: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  positiveRate: number;
  breakdown: {
    [key: string]: number;
  };
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: string;
  read: boolean;
}

// Chart type definitions
export interface ChartColor {
  primary: string;
  secondary: string;
  gradient: string[];
}

// Theme colors based on requirements
export const THEME_COLORS = {
  main: '#71D3D8',
  accent: '#2C9AEF',
  sub: '#2C9AEF',
  background: '#FFFFFF',
  text: '#000000',
  border: '#E0E0E0',
  status: {
    success: '#4CAF50',
    warning: '#FFA726',
    info: '#2196F3',
    error: '#D32F2F'
  },
  charts: {
    bar: '#71D3D8',
    pie: '#2C9AEF',
    radar: '#2C9AEF',
    line: '#2C9AEF',
    donut: ['#71D3D8', '#2C9AEF']
  }
} as const; 