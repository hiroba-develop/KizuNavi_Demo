import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface CustomerContextType {
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  customers: { id: string; name: string }[];
  addCustomer: (customer: { id: string; name: string }) => void;
  periods: { value: string; label: string }[];
  isMaster: boolean;
}

const defaultCustomerContext: CustomerContextType = {
  selectedCustomerId: "3",
  setSelectedCustomerId: () => {},
  selectedPeriod: "2024-04-01",
  setSelectedPeriod: () => {},
  customers: [],
  addCustomer: () => {},
  periods: [],
  isMaster: false,
};

const CustomerContext = createContext<CustomerContextType>(
  defaultCustomerContext
);

export const useCustomer = () => useContext(CustomerContext);

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const isMaster = user?.role === "master";
  const [selectedCustomerId, setSelectedCustomerIdState] = useState("3");
  const [selectedPeriod, setSelectedPeriod] = useState("2024-04-01");

  // 顧客リストを状態として管理
  const [customers, setCustomers] = useState([
    { id: "1", name: "株式会社サンプル" },
    { id: "2", name: "株式会社テスト" },
    { id: "3", name: "qqq" },
  ]);

  // マスタ権限を持つユーザーのみが顧客選択を変更できる
  const setSelectedCustomerId = (id: string) => {
    if (isMaster) {
      setSelectedCustomerIdState(id);
    } else {
      console.warn("顧客選択の変更はマスタ権限を持つユーザーのみが行えます");
    }
  };

  // 新しい顧客を追加する関数
  const addCustomer = (customer: { id: string; name: string }) => {
    setCustomers((prevCustomers) => {
      // 既存の顧客IDと重複しないかチェック
      const existingCustomer = prevCustomers.find((c) => c.id === customer.id);
      if (existingCustomer) {
        // 既存の顧客の名前を更新
        return prevCustomers.map((c) =>
          c.id === customer.id ? { ...c, name: customer.name } : c
        );
      } else {
        // 新しい顧客を追加
        return [...prevCustomers, customer];
      }
    });
  };

  // 実施日のデータ
  const periods = [
    { value: "2024-04-01", label: "2024年4月1日" },
    { value: "2024-03-01", label: "2024年3月1日" },
    { value: "2024-02-01", label: "2024年2月1日" },
    { value: "2024-01-01", label: "2024年1月1日" },
    { value: "2023-10-01", label: "2023年10月1日" },
  ];

  return (
    <CustomerContext.Provider
      value={{
        selectedCustomerId,
        setSelectedCustomerId,
        selectedPeriod,
        setSelectedPeriod,
        customers,
        addCustomer,
        periods,
        isMaster,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerContext;
