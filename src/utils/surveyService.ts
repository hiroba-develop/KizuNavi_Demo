import { apiClient } from './api';
import type { PaginatedResponse } from './api';
import type { 
  Survey, 
  Question, 
  SurveyResponse, 
  Answer 
} from '../types';

export interface SurveyDistributionSettings {
  surveyId: string;
  targetEmployeeIds: string[];
  deadline: string;
  message?: string;
}

export interface QuestionWithNote extends Question {
  note?: string;
}

export class SurveyService {
  // Survey management
  static async getSurveys(companyId: string): Promise<Survey[]> {
    const response = await apiClient.get<Survey[]>(`/surveys?companyId=${companyId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'サーベイ一覧の取得に失敗しました');
  }

  static async getSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.get<Survey>(`/surveys/${surveyId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'サーベイの取得に失敗しました');
  }

  static async createSurvey(survey: Omit<Survey, 'id' | 'createdAt'>): Promise<Survey> {
    const response = await apiClient.post<Survey>('/surveys', survey);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'サーベイの作成に失敗しました');
  }

  static async updateSurvey(surveyId: string, survey: Partial<Survey>): Promise<Survey> {
    const response = await apiClient.put<Survey>(`/surveys/${surveyId}`, survey);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'サーベイの更新に失敗しました');
  }

  static async deleteSurvey(surveyId: string): Promise<void> {
    const response = await apiClient.delete(`/surveys/${surveyId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'サーベイの削除に失敗しました');
    }
  }

  // Question management
  static async getQuestions(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<QuestionWithNote>> {
    const response = await apiClient.get<PaginatedResponse<QuestionWithNote>>(
      `/questions?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || '質問一覧の取得に失敗しました');
  }

  static async getQuestion(questionId: string): Promise<QuestionWithNote> {
    const response = await apiClient.get<QuestionWithNote>(`/questions/${questionId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || '質問の取得に失敗しました');
  }

  static async updateQuestionNote(questionId: string, note: string): Promise<QuestionWithNote> {
    const response = await apiClient.patch<QuestionWithNote>(
      `/questions/${questionId}/note`, 
      { note }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || '注釈の更新に失敗しました');
  }

  static async deleteQuestionNote(questionId: string): Promise<void> {
    const response = await apiClient.delete(`/questions/${questionId}/note`);
    
    if (!response.success) {
      throw new Error(response.message || '注釈の削除に失敗しました');
    }
  }

  // Survey distribution
  static async distributeSurvey(settings: SurveyDistributionSettings): Promise<void> {
    const response = await apiClient.post('/surveys/distribute', settings);
    
    if (!response.success) {
      throw new Error(response.message || 'サーベイの配信に失敗しました');
    }
  }

  // Survey response
  static async submitSurveyResponse(
    surveyId: string,
    answers: Answer[]
  ): Promise<SurveyResponse> {
    const response = await apiClient.post<SurveyResponse>(
      `/surveys/${surveyId}/responses`,
      { answers }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'サーベイ回答の送信に失敗しました');
  }

  static async getSurveyResponse(
    surveyId: string,
    employeeId: string
  ): Promise<SurveyResponse | null> {
    try {
      const response = await apiClient.get<SurveyResponse>(
        `/surveys/${surveyId}/responses/${employeeId}`
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      // If response doesn't exist, return null instead of throwing
      return null;
    }
  }

  // Survey access by token (for employees accessing via email link)
  static async getSurveyByToken(token: string): Promise<Survey> {
    const response = await apiClient.get<Survey>(`/surveys/token/${token}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'サーベイアクセストークンが無効です');
  }

  static async submitResponseByToken(
    token: string,
    answers: Answer[]
  ): Promise<SurveyResponse> {
    const response = await apiClient.post<SurveyResponse>(
      `/surveys/token/${token}/responses`,
      { answers }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'サーベイ回答の送信に失敗しました');
  }
}

export default SurveyService; 