import { useState, useEffect } from "react";
import { useCustomer } from "../context/CustomerContext";
import { useAuth } from "../context/AuthContext";
import CustomerSelector from "../components/CustomerSelector";

// LocalStorageのキー
const EMPLOYEES_STORAGE_KEY = "kizu_navi_employees_by_customer";

// LocalStorageから従業員データを読み込む関数
const loadEmployeesFromStorage = () => {
  try {
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load employees from localStorage:", error);
    return null;
  }
};

// LocalStorageに従業員データを保存する関数
const saveEmployeesToStorage = (employeesData: {
  [key: string]: Employee[];
}) => {
  try {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employeesData));
  } catch (error) {
    console.error("Failed to save employees to localStorage:", error);
  }
};

// デフォルト従業員データ
const defaultEmployeesByCustomer = {
  "1": [
    // 株式会社サンプル
    {
      employee_id: "E001",
      employee_name: "山田太郎",
      mail: "yamada@sample.com",
      department: "開発部",
      sex: 1,
      nationality: "日本",
      generation: 3,
      length_service: 2,
      occupation: "エンジニア",
      position: "チームリーダー",
      grade: "3級",
      personnel_evaluation: "B",
      place: "東京",
      employment_type: 1,
      recruitment_kbn: 2,
      academic_background: 5,
      role: 3,
    },
    {
      employee_id: "E004",
      employee_name: "高橋一郎",
      mail: "takahashi@sample.com",
      department: "営業部",
      sex: 1,
      nationality: "日本",
      generation: 4,
      length_service: 5,
      occupation: "営業",
      position: "課長",
      grade: "4級",
      personnel_evaluation: "A",
      place: "東京",
      employment_type: 1,
      recruitment_kbn: 1,
      academic_background: 5,
      role: 3,
    },
  ],
  "2": [
    // 株式会社テスト
    {
      employee_id: "E002",
      employee_name: "佐藤花子",
      mail: "sato@test.com",
      department: "営業部",
      sex: 2,
      nationality: "日本",
      generation: 2,
      length_service: 1,
      occupation: "営業",
      position: "主任",
      grade: "2級",
      personnel_evaluation: "A",
      place: "大阪",
      employment_type: 1,
      recruitment_kbn: 1,
      academic_background: 5,
      role: 3,
    },
    {
      employee_id: "E005",
      employee_name: "鈴木三郎",
      mail: "suzuki@test.com",
      department: "人事部",
      sex: 1,
      nationality: "日本",
      generation: 3,
      length_service: 3,
      occupation: "人事",
      position: "係長",
      grade: "3級",
      personnel_evaluation: "B",
      place: "大阪",
      employment_type: 1,
      recruitment_kbn: 2,
      academic_background: 5,
      role: 2,
    },
  ],
  "3": [
    // qqq
    {
      employee_id: "E003",
      employee_name: "田中次郎",
      mail: "tanaka@qqq.com",
      department: "人事部",
      sex: 1,
      nationality: "日本",
      generation: 4,
      length_service: 4,
      occupation: "人事",
      position: "課長",
      grade: "4級",
      personnel_evaluation: "A",
      place: "東京",
      employment_type: 1,
      recruitment_kbn: 2,
      academic_background: 5,
      role: 2,
    },
    {
      employee_id: "E006",
      employee_name: "渡辺美子",
      mail: "watanabe@qqq.com",
      department: "総務部",
      sex: 2,
      nationality: "日本",
      generation: 2,
      length_service: 2,
      occupation: "事務",
      position: "主任",
      grade: "2級",
      personnel_evaluation: "A",
      place: "東京",
      employment_type: 1,
      recruitment_kbn: 1,
      academic_background: 4,
      role: 3,
    },
  ],
};

// 永続化された従業員データの管理
let persistentEmployeesByCustomer = (() => {
  const stored = loadEmployeesFromStorage();
  return stored || { ...defaultEmployeesByCustomer };
})();

const THEME_COLORS = {
  border: "#e5e7eb",
};

interface Employee {
  employee_id?: string;
  employee_name?: string;
  mail?: string;
  department?: string;
  sex?: number;
  nationality?: string;
  generation?: number;
  length_service?: number;
  occupation?: string;
  position?: string;
  grade?: string;
  personnel_evaluation?: string;
  place?: string;
  employment_type?: number;
  recruitment_kbn?: number;
  academic_background?: number;
  role?: number;
}

const EmployeeMaster = () => {
  const { user } = useAuth(); // AuthContextからユーザー情報を取得
  const { selectedCustomerId } = useCustomer();

  // 選択された顧客に応じた従業員データを取得
  const getEmployeesForCustomer = (customerId: string): Employee[] => {
    return (
      persistentEmployeesByCustomer[
        customerId as keyof typeof persistentEmployeesByCustomer
      ] || []
    );
  };

  const [employees, setEmployees] = useState<Employee[]>(() =>
    getEmployeesForCustomer(selectedCustomerId)
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [newEmployee, setNewEmployee] = useState({
    employee_id: "",
    employee_name: "",
    mail: "",
    department: "",
    sex: 0,
    nationality: "",
    generation: 0,
    length_service: 0,
    occupation: "",
    position: "",
    grade: "",
    personnel_evaluation: "",
    place: "",
    employment_type: 0,
    recruitment_kbn: 0,
    academic_background: 0,
    role: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState({
    employee_id: "",
    employee_name: "",
    mail: "",
    department: "",
    sex: 0,
    nationality: "",
    generation: 0,
    length_service: 0,
    occupation: "",
    position: "",
    grade: "",
    personnel_evaluation: "",
    place: "",
    employment_type: 0,
    recruitment_kbn: 0,
    academic_background: 0,
    role: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const userRole = 2; // 2: HR user, 3: Sales user

  // ユーザーロールの判定
  const isHRUser = () => userRole === 2;
  const isMasterUser = () => user?.role === "master"; // マスター権限かどうかを判定

  // 顧客IDが変更されたときの処理
  useEffect(() => {
    console.log(`Selected customer: ${selectedCustomerId}`);
    const customerEmployees = getEmployeesForCustomer(selectedCustomerId);
    setEmployees(customerEmployees);
  }, [selectedCustomerId]);

  const handleInputChange = (field: string, value: string | number) => {
    setNewEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddEmployee = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 必須項目のバリデーション
      if (
        !newEmployee.mail ||
        !newEmployee.employee_name ||
        !newEmployee.department
      ) {
        throw new Error("メールアドレス、氏名、部署は必須項目です");
      }

      // メールアドレスの重複チェック
      const emailExists = employees.some(
        (emp) => emp.mail === newEmployee.mail
      );
      if (emailExists) {
        throw new Error(
          "このメールアドレスは既に登録されています。別のメールアドレスを使用してください。"
        );
      }

      // 新しい従業員IDを生成
      const newId = `E${String(employees.length + 1).padStart(3, "0")}`;
      const employeeData = {
        ...newEmployee,
        employee_id: newId,
      };

      // 従業員リストに追加
      setEmployees((prev) => [...prev, employeeData]);

      // 顧客別データも更新（実際のアプリではAPIで処理）
      persistentEmployeesByCustomer[
        selectedCustomerId as keyof typeof persistentEmployeesByCustomer
      ] = [
        ...(persistentEmployeesByCustomer[
          selectedCustomerId as keyof typeof persistentEmployeesByCustomer
        ] || []),
        employeeData,
      ];
      saveEmployeesToStorage(persistentEmployeesByCustomer);

      // フォームをリセット
      setNewEmployee({
        employee_id: "",
        employee_name: "",
        mail: "",
        department: "",
        sex: 0,
        nationality: "",
        generation: 0,
        length_service: 0,
        occupation: "",
        position: "",
        grade: "",
        personnel_evaluation: "",
        place: "",
        employment_type: 0,
        recruitment_kbn: 0,
        academic_background: 0,
        role: 0,
      });

      setShowAddModal(false);
      setSuccess("従業員が正常に追加されました。");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "従業員の追加に失敗しました";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm("この従業員を削除しますか？")) {
      setIsLoading(true);
      setError("");

      try {
        // 従業員を削除
        setEmployees((prev) => prev.filter((emp) => emp.employee_id !== id));

        // 顧客別データも更新（実際のアプリではAPIで処理）
        const currentCustomerEmployees =
          persistentEmployeesByCustomer[
            selectedCustomerId as keyof typeof persistentEmployeesByCustomer
          ] || [];
        persistentEmployeesByCustomer[
          selectedCustomerId as keyof typeof persistentEmployeesByCustomer
        ] = currentCustomerEmployees.filter(
          (emp: Employee) => emp.employee_id !== id
        );
        saveEmployeesToStorage(persistentEmployeesByCustomer);

        setSuccess("従業員が削除されました。");
        setTimeout(() => setSuccess(""), 3000);
      } catch {
        setError("従業員の削除に失敗しました");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleEditClick = () => {
    if (selectedEmployee) {
      setEditEmployee({
        employee_id: selectedEmployee.employee_id || "",
        employee_name: selectedEmployee.employee_name || "",
        mail: selectedEmployee.mail || "",
        department: selectedEmployee.department || "",
        sex: selectedEmployee.sex || 0,
        nationality: selectedEmployee.nationality || "",
        generation: selectedEmployee.generation || 0,
        length_service: selectedEmployee.length_service || 0,
        occupation: selectedEmployee.occupation || "",
        position: selectedEmployee.position || "",
        grade: selectedEmployee.grade || "",
        personnel_evaluation: selectedEmployee.personnel_evaluation || "",
        place: selectedEmployee.place || "",
        employment_type: selectedEmployee.employment_type || 0,
        recruitment_kbn: selectedEmployee.recruitment_kbn || 0,
        academic_background: selectedEmployee.academic_background || 0,
        role: selectedEmployee.role || 0,
      });
      setShowDetailModal(false);
      setShowEditModal(true);
    }
  };

  const handleUpdateEmployee = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 必須項目のバリデーション
      if (
        !editEmployee.mail ||
        !editEmployee.employee_name ||
        !editEmployee.department
      ) {
        throw new Error("メールアドレス、氏名、部署は必須項目です");
      }

      // メールアドレスの重複チェック（自分以外）
      const emailExists = employees.some(
        (emp) =>
          emp.mail === editEmployee.mail &&
          emp.employee_id !== editEmployee.employee_id
      );
      if (emailExists) {
        throw new Error(
          "このメールアドレスは既に登録されています。別のメールアドレスを使用してください。"
        );
      }

      // 従業員情報を更新
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_id === editEmployee.employee_id ? editEmployee : emp
        )
      );

      // 顧客別データも更新（実際のアプリではAPIで処理）
      const currentCustomerEmployees =
        persistentEmployeesByCustomer[
          selectedCustomerId as keyof typeof persistentEmployeesByCustomer
        ] || [];
      persistentEmployeesByCustomer[
        selectedCustomerId as keyof typeof persistentEmployeesByCustomer
      ] = currentCustomerEmployees.map((emp: Employee) =>
        emp.employee_id === editEmployee.employee_id ? editEmployee : emp
      );
      saveEmployeesToStorage(persistentEmployeesByCustomer);

      setShowEditModal(false);
      setSuccess("従業員情報が正常に更新されました。");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "従業員の更新に失敗しました";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">ログインが必要です</div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Header with customer selector */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900">
          従業員マスタ
        </h1>
        <CustomerSelector />
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-lg border-l-4 border-red-500 bg-red-50"
          role="alert"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div
          className="mb-6 p-4 rounded-lg border-l-4 border-green-500 bg-green-50"
          role="alert"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* メンバー一覧カード */}
      <div
        className="bg-white rounded-xl shadow-lg border"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <div
          className="px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl"
          style={{ borderColor: THEME_COLORS.border }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">メンバー一覧</h2>
              <p className="text-sm text-gray-600">
                {employees.filter((employee) => employee.role !== 1).length}
                人のメンバーが登録されています
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* 人事IDの場合のみ追加ボタンを表示 */}
              {isHRUser() && !isMasterUser() && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center space-x-1"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>新規登録</span>
                </button>
              )}
              <span className="text-2xl font-bold text-blue-600">
                {employees.filter((employee) => employee.role !== 1).length}
              </span>
              <span className="text-sm text-gray-500">名</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {employees
              .filter((employee) => employee.role !== 1)
              .map((employee) => (
                <div
                  key={employee.employee_id}
                  onClick={() => handleEmployeeClick(employee)}
                  className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <div className="px-2 py-3 sm:px-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                      {/* 左側：アバターと基本情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-x-4 items-center">
                          <div className="flex items-center space-x-2 truncate">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {employee.employee_name || "名前未設定"}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2 truncate">
                            <svg
                              className="w-4 h-4 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-sm text-gray-600 truncate">
                              {employee.mail}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 min-w-0">
                              {employee.department}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 右側：権限と削除ボタン */}
                      <div className="flex items-center space-x-4 relative z-10">
                        {/* 人事IDの場合のみ削除ボタンを表示 */}
                        {isHRUser() && !isMasterUser() && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteEmployee(employee.employee_id || "");
                            }}
                            disabled={isLoading}
                            className="relative z-20 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ホバー効果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none"></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* メンバー詳細表示モーダル */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedEmployee.employee_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedEmployee.employee_name || "名前未設定"}
                    </h2>
                    <p className="text-gray-600">{selectedEmployee.mail}</p>
                    {isMasterUser() && (
                      <p className="text-amber-600 text-sm font-medium mt-1">
                        ※マスター権限では従業員情報の編集はできません
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 詳細情報 */}
              <div className="space-y-6">
                {/* 基本情報セクション */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    基本情報
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">
                        部署
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedEmployee.department}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">
                        権限
                      </label>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedEmployee.role === 1
                            ? "bg-purple-100 text-purple-800"
                            : selectedEmployee.role === 2
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {selectedEmployee.role === 1
                          ? "マスタ権限"
                          : selectedEmployee.role === 2
                          ? "アドミン権限"
                          : "メンバー権限"}
                      </span>
                    </div>
                    {selectedEmployee.sex && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">
                          性別
                        </label>
                        <p className="text-gray-900">
                          {selectedEmployee.sex === 1 ? "男性" : "女性"}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.nationality && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">
                          国籍
                        </label>
                        <p className="text-gray-900">
                          {selectedEmployee.nationality}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.generation && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">
                          世代
                        </label>
                        <p className="text-gray-900">
                          {selectedEmployee.generation === 1
                            ? "10代"
                            : selectedEmployee.generation === 2
                            ? "20代"
                            : selectedEmployee.generation === 3
                            ? "30代"
                            : selectedEmployee.generation === 4
                            ? "40代"
                            : selectedEmployee.generation === 5
                            ? "50代"
                            : selectedEmployee.generation === 6
                            ? "60代"
                            : selectedEmployee.generation === 7
                            ? "70代～"
                            : "未設定"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex justify-center space-x-4 pt-6">
                  {/* 人事IDの場合のみ編集ボタンを表示 */}
                  {isHRUser() && !isMasterUser() && (
                    <button
                      onClick={handleEditClick}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg flex items-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>編集</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>閉じる</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メンバー追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 bg-black bg-opacity-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    新しいメンバーを追加
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    新しい従業員を登録します
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmployee.mail}
                    onChange={(e) => handleInputChange("mail", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEmployee.employee_name}
                    onChange={(e) =>
                      handleInputChange("employee_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    部署 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEmployee.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性別
                  </label>
                  <select
                    value={newEmployee.sex}
                    onChange={(e) =>
                      handleInputChange("sex", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">選択してください</option>
                    <option value="1">男性</option>
                    <option value="2">女性</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    国籍
                  </label>
                  <input
                    type="text"
                    value={newEmployee.nationality}
                    onChange={(e) =>
                      handleInputChange("nationality", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    世代
                  </label>
                  <select
                    value={newEmployee.generation}
                    onChange={(e) =>
                      handleInputChange("generation", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">選択してください</option>
                    <option value="1">10代</option>
                    <option value="2">20代</option>
                    <option value="3">30代</option>
                    <option value="4">40代</option>
                    <option value="5">50代</option>
                    <option value="6">60代</option>
                    <option value="7">70代～</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    職種
                  </label>
                  <input
                    type="text"
                    value={newEmployee.occupation}
                    onChange={(e) =>
                      handleInputChange("occupation", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    役職
                  </label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID種別
                  </label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) =>
                      handleInputChange("role", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">選択してください</option>
                    <option value="2">人事ID (アドミン権限)</option>
                    <option value="3">従業員ID (メンバー権限)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  戻る
                </button>
                <button
                  onClick={handleAddEmployee}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "登録中..." : "登録"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メンバー編集モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 bg-black bg-opacity-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    従業員情報を編集
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    従業員ID: {editEmployee.employee_id}
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editEmployee.mail}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        mail: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editEmployee.employee_name}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        employee_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    部署 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editEmployee.department}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性別
                  </label>
                  <select
                    value={editEmployee.sex}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        sex: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">選択してください</option>
                    <option value="1">男性</option>
                    <option value="2">女性</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    国籍
                  </label>
                  <input
                    type="text"
                    value={editEmployee.nationality}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        nationality: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    世代
                  </label>
                  <select
                    value={editEmployee.generation}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        generation: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">選択してください</option>
                    <option value="1">10代</option>
                    <option value="2">20代</option>
                    <option value="3">30代</option>
                    <option value="4">40代</option>
                    <option value="5">50代</option>
                    <option value="6">60代</option>
                    <option value="7">70代～</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    職種
                  </label>
                  <input
                    type="text"
                    value={editEmployee.occupation}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        occupation: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    役職
                  </label>
                  <input
                    type="text"
                    value={editEmployee.position}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID種別
                  </label>
                  <select
                    value={editEmployee.role}
                    onChange={(e) =>
                      setEditEmployee((prev) => ({
                        ...prev,
                        role: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">選択してください</option>
                    <option value="2">人事ID (アドミン権限)</option>
                    <option value="3">従業員ID (メンバー権限)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleUpdateEmployee}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "更新中..." : "更新"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMaster;
