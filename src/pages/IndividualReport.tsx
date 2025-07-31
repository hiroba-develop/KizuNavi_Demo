import React, { useState, useEffect } from "react";
import { THEME_COLORS } from "../types";
import { useCustomer } from "../context/CustomerContext";
import { useAuth } from "../context/AuthContext";
import { useQuestions } from "../context/QuestionsContext";
import CustomerSelector from "../components/CustomerSelector";

interface Employee {
  employee_id: string;
  employee_name: string;
  mail: string;
  department: string;
  sex: number;
  nationality: string;
  generation: number;
  length_service: number;
  occupation: string;
  position: string;
  grade: string;
  personnel_evaluation: string;
  place: string;
  employment_type: number;
  recruitment_kbn: number;
  academic_background: number;
  role: number;
}

interface QuestionAnswer {
  questionId: string;
  questionText: string;
  category: string;
  note?: string;
  answer: number | string;
  answerText?: string;
}

interface EmployeeAnswer {
  employeeId: string;
  employeeName: string;
  submittedAt: string;
  answers: QuestionAnswer[];
}

const IndividualReport: React.FC = () => {
  const { selectedPeriod, selectedCustomerId, periods } = useCustomer();
  const { user } = useAuth();
  const { getQuestionsForCustomer } = useQuestions();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [employeeAnswers, setEmployeeAnswers] = useState<EmployeeAnswer | null>(
    null
  );
  const [comparisonAnswers, setComparisonAnswers] =
    useState<EmployeeAnswer | null>(null);
  // const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 営業IDでない場合はアクセス拒否
  if (user?.idType !== "hr") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600">
            この画面は営業IDでログインしたユーザーのみアクセス可能です。
          </p>
        </div>
      </div>
    );
  }

  // LocalStorageから従業員データを読み込む関数
  const loadEmployeesFromStorage = () => {
    try {
      const stored = localStorage.getItem("kizu_navi_employees_by_customer");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to load employees from localStorage:", error);
      return null;
    }
  };

  // デフォルト従業員データ（従業員情報登録と同じデータ）
  const defaultEmployeesByCustomer: { [key: string]: Employee[] } = {
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

  // LocalStorageから取得するか、デフォルトデータを使用
  const getEmployeesForCustomer = (customerId: string): Employee[] => {
    const storedData = loadEmployeesFromStorage();
    const employeesByCustomer = storedData || defaultEmployeesByCustomer;
    return employeesByCustomer[customerId] || [];
  };

  // 従業員データを読み込み
  useEffect(() => {
    if (selectedCustomerId) {
      const customerEmployees = getEmployeesForCustomer(selectedCustomerId);
      setEmployees(customerEmployees);
      setSelectedEmployee(null);
      setEmployeeAnswers(null);
      setComparisonAnswers(null);
    }
  }, [selectedCustomerId]);

  // 従業員選択時の処理
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);

    // 実際の質問データを取得
    const customerQuestions = getQuestionsForCustomer(selectedCustomerId);

    // 回答テキストのマッピング
    const getRatingAnswerText = (rating: number): string => {
      const ratingTexts = {
        0: "該当しない",
        1: "全く思わない",
        2: "思わない",
        3: "あまり思わない",
        4: "少し思う",
        5: "そう思う",
        6: "強くそう思う",
      };
      return ratingTexts[rating as keyof typeof ratingTexts] || "未回答";
    };

    // サンプル自由記述回答
    const sampleTextAnswers = [
      "職場の環境はとても良く、同僚との連携もスムーズです。今後もこの環境で成長していきたいと思います。",
      "業務の効率化についてもう少し改善の余地があると感じています。システムの導入により、より効率的に作業できるようになることを期待しています。",
      "チームワークが素晴らしく、お互いをサポートし合える職場だと思います。困った時にはいつでも相談できる環境があります。",
      "新しい技術を学ぶ機会が多く、自己成長につながっていると感じています。研修制度も充実しており、スキルアップできています。",
      "ワークライフバランスが保たれており、満足しています。プライベートの時間も確保できています。",
    ];

    // 回答データを生成（実際の実装では APIから取得）
    const answers: EmployeeAnswer = {
      employeeId: employee.employee_id,
      employeeName: employee.employee_name,
      submittedAt: selectedPeriod
        ? new Date(selectedPeriod).toISOString()
        : new Date().toISOString(),
      answers: customerQuestions.map((q, index) => {
        if (q.type === "rating") {
          // 評定質問の場合
          const baseAnswer = 3 + (index % 3); // 3-5の基本値
          const variation = (employee.employee_id.charCodeAt(3) % 3) - 1; // -1,0,1の変動
          const finalAnswer = Math.max(1, Math.min(6, baseAnswer + variation));

          return {
            questionId: q.id,
            questionText: q.text,
            category: q.category,
            note: q.note,
            answer: finalAnswer,
            answerText: getRatingAnswerText(finalAnswer),
          };
        } else {
          // 自由記述質問の場合
          const textAnswerIndex =
            (employee.employee_id.charCodeAt(3) + index) %
            sampleTextAnswers.length;

          return {
            questionId: q.id,
            questionText: q.text,
            category: q.category,
            note: q.note,
            answer: sampleTextAnswers[textAnswerIndex],
            answerText: sampleTextAnswers[textAnswerIndex],
          };
        }
      }),
    };

    setEmployeeAnswers(answers);

    // 最新の実施日を選択している場合のみ、前回のデータを比較用に取得
    if (selectedPeriod === periods[0].value && periods.length > 1) {
      const previousPeriodMultiplier = 0.95;
      const comparisonAnswers: EmployeeAnswer = {
        employeeId: employee.employee_id,
        employeeName: employee.employee_name,
        submittedAt: periods[1].value,
        answers: customerQuestions.map((q, index) => {
          if (q.type === "rating") {
            // 評定質問の場合
            const baseAnswer = 3 + (index % 3); // 3-5の基本値
            const variation = (employee.employee_id.charCodeAt(3) % 3) - 1; // -1,0,1の変動
            const finalAnswer = Math.max(
              1,
              Math.min(
                6,
                Math.round(
                  (baseAnswer + variation) * previousPeriodMultiplier * 10
                ) / 10
              )
            );

            return {
              questionId: q.id,
              questionText: q.text,
              category: q.category,
              note: q.note,
              answer: finalAnswer,
              answerText: getRatingAnswerText(finalAnswer),
            };
          } else {
            // 自由記述質問の場合
            const textAnswerIndex =
              (employee.employee_id.charCodeAt(3) + index) %
              sampleTextAnswers.length;

            return {
              questionId: q.id,
              questionText: q.text,
              category: q.category,
              note: q.note,
              answer: sampleTextAnswers[textAnswerIndex],
              answerText: sampleTextAnswers[textAnswerIndex],
            };
          }
        }),
      };

      setComparisonAnswers(comparisonAnswers);
    } else {
      setComparisonAnswers(null);
    }
  };

  const getRatingText = (rating: number): string => {
    const ratingTexts = {
      1: "全く思わない",
      2: "思わない",
      3: "あまり思わない",
      4: "少し思う",
      5: "そう思う",
      6: "強くそう思う",
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || "未回答";
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return "text-green-600";
    if (rating === 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with customer selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900">
          個別レポート
        </h1>
        <CustomerSelector showPeriod={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 従業員一覧 */}
        <div
          className="bg-white rounded-lg shadow-sm border"
          style={{ borderColor: THEME_COLORS.border }}
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              従業員一覧
            </h2>
            {employees.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                顧客を選択してください
              </p>
            ) : (
              <div className="space-y-2">
                {employees.map((employee) => (
                  <button
                    key={employee.employee_id}
                    onClick={() => handleEmployeeSelect(employee)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedEmployee?.employee_id === employee.employee_id
                        ? "bg-blue-50 border-blue-200"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {employee.employee_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.department} - {employee.position}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 回答詳細 */}
        <div
          className="lg:col-span-2 bg-white rounded-lg shadow-sm border"
          style={{ borderColor: THEME_COLORS.border }}
        >
          <div className="p-4 sm:p-6">
            {!selectedEmployee ? (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  従業員を選択してください
                </h3>
                <p className="text-gray-500">
                  左側の一覧から従業員を選択すると、その人の回答詳細を確認できます
                </p>
              </div>
            ) : (
              <div>
                {/* 従業員情報ヘッダー */}
                <div
                  className="mb-6 pb-4 border-b"
                  style={{ borderColor: THEME_COLORS.border }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedEmployee.employee_name} の回答詳細
                  </h2>
                  {employeeAnswers && (
                    <div className="mt-2 text-sm text-gray-500">
                      回答日時:{" "}
                      {new Date(employeeAnswers.submittedAt).toLocaleDateString(
                        "ja-JP"
                      )}
                    </div>
                  )}
                </div>

                {/* 回答一覧 */}
                {employeeAnswers && (
                  <div className="space-y-6">
                    {employeeAnswers.answers.map((answer, index) => (
                      <div
                        key={answer.questionId}
                        className="p-4 rounded-lg border"
                        style={{ borderColor: THEME_COLORS.border }}
                      >
                        <div className="mb-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 pr-4">
                              Q{index + 1}. {answer.questionText}
                            </h4>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                              {answer.category}
                            </span>
                          </div>
                          {answer.note && answer.note.trim() !== "" && (
                            <p className="text-sm text-gray-600 italic mb-3">
                              注釈: {answer.note}
                            </p>
                          )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          {typeof answer.answer === "number" ? (
                            // 評定質問の場合
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm text-gray-600">
                                    回答:{" "}
                                  </span>
                                  <span
                                    className={`font-semibold ${getRatingColor(
                                      answer.answer
                                    )}`}
                                  >
                                    {answer.answer} -{" "}
                                    {getRatingText(answer.answer)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5, 6].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= (answer.answer as number)
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              {comparisonAnswers?.answers.find(
                                (a) => a.questionId === answer.questionId
                              ) && (
                                <div
                                  className="flex items-center justify-between pt-2 border-t"
                                  style={{ borderColor: THEME_COLORS.border }}
                                >
                                  <div>
                                    <span className="text-sm text-gray-400">
                                      前回の回答:{" "}
                                    </span>
                                    <span
                                      className={`font-semibold ${getRatingColor(
                                        comparisonAnswers.answers.find(
                                          (a) =>
                                            a.questionId === answer.questionId
                                        )?.answer as number
                                      )}`}
                                    >
                                      {
                                        comparisonAnswers.answers.find(
                                          (a) =>
                                            a.questionId === answer.questionId
                                        )?.answer
                                      }{" "}
                                      -{" "}
                                      {getRatingText(
                                        comparisonAnswers.answers.find(
                                          (a) =>
                                            a.questionId === answer.questionId
                                        )?.answer as number
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5, 6].map((star) => (
                                      <svg
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <=
                                          (comparisonAnswers.answers.find(
                                            (a) =>
                                              a.questionId === answer.questionId
                                          )?.answer as number)
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            // 自由記述質問の場合
                            <div className="space-y-4">
                              <div>
                                <span className="text-sm text-gray-600 block mb-2">
                                  回答:{" "}
                                </span>
                                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                  {answer.answer}
                                </div>
                              </div>
                              {comparisonAnswers?.answers.find(
                                (a) => a.questionId === answer.questionId
                              ) && (
                                <div
                                  className="pt-2 border-t"
                                  style={{ borderColor: THEME_COLORS.border }}
                                >
                                  <span className="text-sm text-gray-400 block mb-2">
                                    前回の回答:{" "}
                                  </span>
                                  <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {
                                      comparisonAnswers.answers.find(
                                        (a) =>
                                          a.questionId === answer.questionId
                                      )?.answer
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualReport;
