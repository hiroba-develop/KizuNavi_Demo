import { apiClient } from './api';
import type { Company } from '../types';

// Company registration types
export interface CompanyRegistrationData {
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
  employeeCount: number;
  employees: {
    email: string;
    name: string;
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
  }[];
}

// Company service class
class CompanyService {
  async createCompany(data: CompanyRegistrationData): Promise<Company> {
    try {
      const response = await apiClient.post<Company>('/companies', data);
      if (!response.success) {
        throw new Error(response.message || '企業登録に失敗しました');
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('企業登録中にエラーが発生しました');
    }
  }

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await apiClient.get<Company[]>('/companies');
      if (!response.success) {
        throw new Error(response.message || '企業情報の取得に失敗しました');
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('企業情報の取得中にエラーが発生しました');
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      const response = await apiClient.get<Company>(`/companies/${id}`);
      if (!response.success) {
        throw new Error(response.message || '企業情報の取得に失敗しました');
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('企業情報の取得中にエラーが発生しました');
    }
  }

  async updateCompany(id: string, data: Partial<CompanyRegistrationData>): Promise<Company> {
    try {
      const response = await apiClient.put<Company>(`/companies/${id}`, data);
      if (!response.success) {
        throw new Error(response.message || '企業情報の更新に失敗しました');
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('企業情報の更新中にエラーが発生しました');
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<void>(`/companies/${id}`);
      if (!response.success) {
        throw new Error(response.message || '企業の削除に失敗しました');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('企業の削除中にエラーが発生しました');
    }
  }
}

// Export singleton instance
const companyService = new CompanyService();
export default companyService; 