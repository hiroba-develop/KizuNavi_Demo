import { apiClient } from './api';
import type { 
  Report, 
  DashboardMetrics, 
  ChartData, 
  CategoryScore 
} from '../types';

export interface ReportFilters {
  companyId: string;
  implementationDate?: string;
  departmentIds?: string[];
  generationIds?: string[];
}

export interface DetailedCategoryReport {
  implementationDate: string;
  categories: {
    executiveTrust: CategoryScore; // 経営幹部への信頼
    corporateCulture: CategoryScore; // 企業風土
    humanRelations: CategoryScore; // 人間関係
    jobSatisfaction: CategoryScore; // 仕事のやりがい
    businessOperations: CategoryScore; // 事業運営
    hrSystem: CategoryScore; // 人事制度
    workLifeBalance: CategoryScore; // ワークライフバランス
    reformSpirit: CategoryScore; // 改革の息吹
  };
}

export interface SummaryReport {
  implementationDate: string;
  scores: {
    kizunaScore: number;
    engagementScore: number;
    satisfactionScore: number;
    humanCapitalScore: number;
  };
  positiveRates: {
    kizunaRate: number;
    engagementRate: number;
    satisfactionRate: number;
    humanCapitalRate: number;
  };
}

export class ReportService {
  // Dashboard data
  static async getDashboardMetrics(companyId: string): Promise<DashboardMetrics> {
    const response = await apiClient.get<DashboardMetrics>(
      `/reports/dashboard?companyId=${companyId}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'ダッシュボードデータの取得に失敗しました');
  }

  static async getDashboardChartData(companyId: string): Promise<ChartData> {
    const response = await apiClient.get<ChartData>(
      `/reports/dashboard/charts?companyId=${companyId}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'チャートデータの取得に失敗しました');
  }

  // Summary reports
  static async getSummaryReport(filters: ReportFilters): Promise<SummaryReport> {
    const params = new URLSearchParams({
      companyId: filters.companyId,
    });
    
    if (filters.implementationDate) {
      params.append('implementationDate', filters.implementationDate);
    }
    
    const response = await apiClient.get<SummaryReport>(
      `/reports/summary?${params.toString()}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'サマリレポートの取得に失敗しました');
  }

  // Category reports
  static async getCategoryReport(filters: ReportFilters): Promise<DetailedCategoryReport> {
    const params = new URLSearchParams({
      companyId: filters.companyId,
    });
    
    if (filters.implementationDate) {
      params.append('implementationDate', filters.implementationDate);
    }
    
    const response = await apiClient.get<DetailedCategoryReport>(
      `/reports/category?${params.toString()}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'カテゴリレポートの取得に失敗しました');
  }

  // Implementation dates for dropdown
  static async getImplementationDates(companyId: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      `/reports/implementation-dates?companyId=${companyId}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || '実施日一覧の取得に失敗しました');
  }

  // Generate new report
  static async generateReport(companyId: string, surveyId: string): Promise<Report> {
    const response = await apiClient.post<Report>('/reports/generate', {
      companyId,
      surveyId
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'レポート生成に失敗しました');
  }

  // Get all reports for a company
  static async getReports(companyId: string): Promise<Report[]> {
    const response = await apiClient.get<Report[]>(
      `/reports?companyId=${companyId}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'レポート一覧の取得に失敗しました');
  }

  // Get specific report
  static async getReport(reportId: string): Promise<Report> {
    const response = await apiClient.get<Report>(`/reports/${reportId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'レポートの取得に失敗しました');
  }

  // Delete report
  static async deleteReport(reportId: string): Promise<void> {
    const response = await apiClient.delete(`/reports/${reportId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'レポートの削除に失敗しました');
    }
  }
}

export default ReportService; 