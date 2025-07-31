import React, { createContext, useContext, useState, useEffect } from "react";
import { useCustomer } from "./CustomerContext";

// LocalStorageのキー
const DEPARTMENTS_STORAGE_KEY = "kizu_navi_departments_by_customer";

// 部門情報の型定義
export interface Department {
  id: string;
  name: string;
  description?: string;
}

interface DepartmentContextType {
  departments: Department[];
  addDepartment: (department: Omit<Department, "id">) => void;
  updateDepartment: (department: Department) => void;
  deleteDepartment: (id: string) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(
  undefined
);

// デフォルトの部門データ
const defaultDepartmentsByCustomer = {
  "1": [
    // 株式会社サンプル
    { id: "D001", name: "開発部" },
    { id: "D002", name: "営業部" },
    { id: "D003", name: "人事部" },
    { id: "D004", name: "総務部" },
  ],
  "2": [
    // 株式会社テスト
    { id: "D001", name: "営業部" },
    { id: "D002", name: "人事部" },
  ],
  "3": [
    // qqq
    { id: "D001", name: "人事部" },
    { id: "D002", name: "総務部" },
  ],
};

// LocalStorageから部門データを読み込む関数
const loadDepartmentsFromStorage = () => {
  try {
    const stored = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load departments from localStorage:", error);
    return null;
  }
};

// LocalStorageに部門データを保存する関数
const saveDepartmentsToStorage = (departmentsData: {
  [key: string]: Department[];
}) => {
  try {
    localStorage.setItem(
      DEPARTMENTS_STORAGE_KEY,
      JSON.stringify(departmentsData)
    );
  } catch (error) {
    console.error("Failed to save departments to localStorage:", error);
  }
};

// 永続化された部門データの管理
let persistentDepartmentsByCustomer = (() => {
  const stored = loadDepartmentsFromStorage();
  return stored || { ...defaultDepartmentsByCustomer };
})();

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { selectedCustomerId } = useCustomer();
  const [departments, setDepartments] = useState<Department[]>([]);

  // 選択された顧客に応じた部門データを取得
  useEffect(() => {
    const customerDepartments =
      persistentDepartmentsByCustomer[selectedCustomerId] || [];
    setDepartments(customerDepartments);
  }, [selectedCustomerId]);

  const addDepartment = (departmentData: Omit<Department, "id">) => {
    const newId = `D${String(departments.length + 1).padStart(3, "0")}`;
    const newDepartment: Department = {
      id: newId,
      ...departmentData,
    };

    const updatedDepartments = [...departments, newDepartment];
    setDepartments(updatedDepartments);

    // LocalStorageの更新
    persistentDepartmentsByCustomer[selectedCustomerId] = updatedDepartments;
    saveDepartmentsToStorage(persistentDepartmentsByCustomer);
  };

  const updateDepartment = (department: Department) => {
    const updatedDepartments = departments.map((dept) =>
      dept.id === department.id ? department : dept
    );
    setDepartments(updatedDepartments);

    // LocalStorageの更新
    persistentDepartmentsByCustomer[selectedCustomerId] = updatedDepartments;
    saveDepartmentsToStorage(persistentDepartmentsByCustomer);
  };

  const deleteDepartment = (id: string) => {
    const updatedDepartments = departments.filter((dept) => dept.id !== id);
    setDepartments(updatedDepartments);

    // LocalStorageの更新
    persistentDepartmentsByCustomer[selectedCustomerId] = updatedDepartments;
    saveDepartmentsToStorage(persistentDepartmentsByCustomer);
  };

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error("useDepartment must be used within a DepartmentProvider");
  }
  return context;
};
