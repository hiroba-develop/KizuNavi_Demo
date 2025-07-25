import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Company } from "../types";
import { THEME_COLORS } from "../types";
import { useCustomer } from "../context/CustomerContext";
import CustomerSelector from "../components/CustomerSelector";
import "../utils/companyService";

// LocalStorageのキー
const COMPANIES_STORAGE_KEY = "kizu_navi_companies_data";

// LocalStorageから会社データを読み込む関数
const loadCompaniesFromStorage = (): { [key: string]: Partial<Company> } => {
  try {
    const stored = localStorage.getItem(COMPANIES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load companies from localStorage:", error);
    return {};
  }
};

// LocalStorageに会社データを保存する関数
const saveCompaniesToStorage = (companiesData: {
  [key: string]: Partial<Company>;
}) => {
  try {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companiesData));
  } catch (error) {
    console.error("Failed to save companies to localStorage:", error);
  }
};

// 永続化された会社データの管理
let persistentCompaniesData = loadCompaniesFromStorage();

const CustomerMaster: React.FC = () => {
  const { user } = useAuth();
  const isMaster = user?.role === "master";
  const { selectedCustomerId, setSelectedCustomerId, customers, addCustomer } =
    useCustomer();
  const [companyData, setCompanyData] = useState<Partial<Company>>({
    name: "",
    nameKana: "",
    address: "",
    postalCode: "",
    industry: "",
    phoneNumber: "",
    email: "",
    contractModel: "",
    contractDate: "",
    paymentCycle: "",
    salesPersonIds: [""],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isNewMode, setIsNewMode] = useState(false);

  // 成功メッセージを3秒後に自動消去
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000); // 3秒後に消去

      return () => clearTimeout(timer); // クリーンアップ
    }
  }, [success]);

  // エラーメッセージを5秒後に自動消去
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000); // 5秒後に消去

      return () => clearTimeout(timer); // クリーンアップ
    }
  }, [error]);

  // 新規作成ボタンのハンドラー
  const handleNewCreate = () => {
    setIsNewMode(true);
    setCompanyData({
      name: "",
      nameKana: "",
      address: "",
      postalCode: "",
      industry: "",
      phoneNumber: "",
      email: "",
      contractModel: "",
      contractDate: "",
      paymentCycle: "",
      salesPersonIds: [""],
    });
    setError("");
    setSuccess("");
  };

  // キャンセルボタンのハンドラー
  const handleCancel = () => {
    setIsNewMode(false);
    setError("");
    setSuccess("");
    // 元の顧客データに戻す
    if (selectedCustomerId) {
      const persistentData = persistentCompaniesData[selectedCustomerId];
      if (persistentData) {
        setCompanyData(persistentData);
      } else {
        const selectedCompany = customers.find(
          (company) => company.id === selectedCustomerId
        );
        if (selectedCompany) {
          const defaultData = {
            name: selectedCompany.name,
            nameKana: "",
            address: "",
            postalCode: "",
            industry: "",
            phoneNumber: "",
            email: "",
            contractModel: "",
            contractDate: "",
            paymentCycle: "",
            salesPersonIds: [""],
          };
          setCompanyData(defaultData);
        }
      }
    }
  };

  // 選択された顧客IDに基づいて会社データを更新
  useEffect(() => {
    if (selectedCustomerId && !isNewMode) {
      // 永続化されたデータを最初に確認
      const persistentData = persistentCompaniesData[selectedCustomerId];

      if (persistentData) {
        // 永続化されたデータがある場合はそれを使用
        setCompanyData(persistentData);
      } else {
        // 永続化されたデータがない場合は顧客名のみ設定
        const selectedCompany = customers.find(
          (company) => company.id === selectedCustomerId
        );
        if (selectedCompany) {
          const defaultData = {
            name: selectedCompany.name,
            nameKana: "",
            address: "",
            postalCode: "",
            industry: "",
            phoneNumber: "",
            email: "",
            contractModel: "",
            contractDate: "",
            paymentCycle: "",
            salesPersonIds: [""],
          };
          setCompanyData(defaultData);
          // デフォルトデータも永続化
          persistentCompaniesData[selectedCustomerId] = defaultData;
          saveCompaniesToStorage(persistentCompaniesData);
        }
      }
    }
  }, [selectedCustomerId, customers, isNewMode]);

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedData = {
      ...companyData,
      [name]: value,
    };

    setCompanyData(updatedData);

    // 新規作成モードでない場合のみLocalStorageに保存
    if (selectedCustomerId && !isNewMode) {
      persistentCompaniesData[selectedCustomerId] = updatedData;
      saveCompaniesToStorage(persistentCompaniesData);
    }
  };

  // TODO: Implement add sales person functionality
  // const addSalesPerson = () => {
  //   if ((companyData.salesPersonIds?.length || 0) < 4) {
  //     setCompanyData((prev) => ({
  //       ...prev,
  //       salesPersonIds: [...(prev.salesPersonIds || []), ""],
  //     }));
  //   }
  // };

  // TODO: Implement remove sales person functionality
  // const removeSalesPerson = (index: number) => {
  //   if ((companyData.salesPersonIds?.length || 0) > 1) {
  //     setCompanyData((prev) => ({
  //       ...prev,
  //       salesPersonIds:
  //         prev.salesPersonIds?.filter((_, i) => i !== index) || [],
  //     }));
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!companyData.name || !companyData.nameKana || !companyData.email) {
        throw new Error("必須項目を入力してください");
      }

      // APIの呼び出しをコメントアウトし、コンソールログのみ出力
      console.log(
        "登録ボタンがクリックされました。APIは呼び出されません。",
        companyData
      );

      if (isNewMode) {
        // 新規登録の場合
        const newCompanyId = `${customers.length + 1}`;

        // 顧客リストに新しい会社を追加
        addCustomer({
          id: newCompanyId,
          name: companyData.name || "",
        });

        // 新規登録した会社データを永続化データに保存
        persistentCompaniesData[newCompanyId] = companyData;
        saveCompaniesToStorage(persistentCompaniesData);

        setSelectedCustomerId(newCompanyId);
        setIsNewMode(false);
      } else {
        // 既存の会社情報を更新（デモ用）
        customers.map((company) => {
          if (company.id === selectedCustomerId) {
            return {
              ...company,
              name: companyData.name || "",
              nameKana: companyData.nameKana || "",
              address: companyData.address || "",
              postalCode: companyData.postalCode || "",
              industry: companyData.industry || "",
              phoneNumber: companyData.phoneNumber || "",
              email: companyData.email || "",
              contractModel: companyData.contractModel || "",
              contractDate: companyData.contractDate || "",
              paymentCycle: companyData.paymentCycle || "",
              salesPersonIds: companyData.salesPersonIds || [""],
            };
          }
          return company;
        });
      }

      // 成功メッセージを表示（APIは呼び出さない）
      const isNewRegistration = isNewMode;
      setSuccess(
        isNewRegistration
          ? "企業情報が正常に新規登録されました。"
          : "企業情報が正常に保存されました。"
      );

      // 永続化データも更新（既存の会社情報を更新する場合）
      if (selectedCustomerId && !isNewMode) {
        persistentCompaniesData[selectedCustomerId] = companyData;
        saveCompaniesToStorage(persistentCompaniesData);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "登録に失敗しました。入力内容を確認してください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Header with customer selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900">
          基本情報登録
        </h1>
        <div className="flex items-center space-x-4">
          {!isNewMode && <CustomerSelector />}
          {isMaster && !isNewMode && (
            <button
              onClick={handleNewCreate}
              className="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: THEME_COLORS.accent }}
            >
              新規登録
            </button>
          )}
        </div>
      </div>

      {/* 基本情報 */}
      <form onSubmit={handleSubmit} className="space-y-6 xl:space-y-8">
        <div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 xl:p-8"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            基本情報
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                会社名{" "}
                <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={companyData.name}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                placeholder="株式会社〇〇"
                required
                disabled={!isMaster}
              />
            </div>

            <div>
              <label
                htmlFor="nameKana"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                会社名（カナ）{" "}
                <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <input
                type="text"
                id="nameKana"
                name="nameKana"
                value={companyData.nameKana}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                placeholder="カブシキガイシャ〇〇"
                required
                disabled={!isMaster}
              />
            </div>

            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                業界 <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <select
                id="industry"
                name="industry"
                value={companyData.industry}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                required
                disabled={!isMaster}
              >
                <option value="">選択してください</option>
                <option value="製造業">製造業</option>
                <option value="情報通信業">情報通信業</option>
                <option value="建設業">建設業</option>
                <option value="小売業">小売業</option>
                <option value="サービス業">サービス業</option>
                <option value="金融・保険業">金融・保険業</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                郵便番号{" "}
                <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={companyData.postalCode}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                placeholder="123-4567"
                required
                disabled={!isMaster}
              />
            </div>

            <div className="sm:col-span-2 xl:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                住所 <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={companyData.address}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                placeholder="東京都渋谷区..."
                required
                disabled={!isMaster}
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                電話番号{" "}
                <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={companyData.phoneNumber}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                placeholder="03-1234-5678"
                required
                disabled={!isMaster}
              />
            </div>

            <div className="xl:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス{" "}
                <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={companyData.email}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                placeholder="info@company.com"
                required
                disabled={!isMaster}
              />
            </div>
          </div>
        </div>

        {/* 契約情報 */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 xl:p-8"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            契約情報
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="contractModel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                契約モデル{" "}
                <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <select
                id="contractModel"
                name="contractModel"
                value={companyData.contractModel}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                required
                disabled={!isMaster}
              >
                <option value="">選択してください</option>
                <option value="ベーシック">ベーシック</option>
                <option value="スタンダード">スタンダード</option>
                <option value="プレミアム">プレミアム</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="contractDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                契約日{" "}
                <span style={{ color: THEME_COLORS.status.error }}>*</span>
              </label>
              <input
                type="date"
                id="contractDate"
                name="contractDate"
                value={companyData.contractDate}
                onChange={handleCompanyChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                required
                disabled={!isMaster}
              />
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: `${THEME_COLORS.status.error}20`,
              borderColor: THEME_COLORS.status.error,
              borderWidth: "1px",
            }}
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                style={{ color: THEME_COLORS.status.error }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p
                className="text-sm"
                style={{ color: THEME_COLORS.status.error }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: `${THEME_COLORS.status.success}20`,
              borderColor: THEME_COLORS.status.success,
              borderWidth: "1px",
            }}
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                style={{ color: THEME_COLORS.status.success }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p
                className="text-sm"
                style={{ color: THEME_COLORS.status.success }}
              >
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button - Only visible for master users */}
        {isMaster && (
          <div className="flex justify-end space-x-4">
            {isNewMode && (
              <button
                type="button"
                onClick={handleCancel}
                className="border font-medium py-3 px-8 rounded-lg transition-colors duration-200 hover:bg-gray-50"
                style={{
                  borderColor: THEME_COLORS.border,
                  color: "#6B7280",
                }}
              >
                キャンセル
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: THEME_COLORS.accent }}
            >
              {isLoading
                ? isNewMode
                  ? "登録中..."
                  : "保存中..."
                : isNewMode
                ? "登録する"
                : "保存する"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CustomerMaster;
