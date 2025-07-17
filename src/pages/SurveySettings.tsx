import React, { useState } from "react";
import type { Survey, Question } from "../types";
import { THEME_COLORS } from "../types";

const SurveySettings: React.FC = () => {
  const [surveyData, setSurveyData] = useState<Partial<Survey>>({
    title: "",
    deadline: "",
    targetEmployeeCount: 0,
    status: "draft",
    questions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mock default questions
  const defaultQuestions: Question[] = [
    {
      id: "1",
      text: "現在の職場環境に満足していますか？",
      type: "rating",
      category: "職場環境",
      order: 1,
    },
    {
      id: "2",
      text: "上司とのコミュニケーションは円滑ですか？",
      type: "rating",
      category: "コミュニケーション",
      order: 2,
    },
    {
      id: "3",
      text: "仕事にやりがいを感じていますか？",
      type: "rating",
      category: "やりがい",
      order: 3,
    },
    {
      id: "4",
      text: "チームワークはうまく機能していますか？",
      type: "rating",
      category: "チームワーク",
      order: 4,
    },
    {
      id: "5",
      text: "成長の機会が提供されていますか？",
      type: "rating",
      category: "成長機会",
      order: 5,
    },
  ];

  const handleSaveDraft = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Mock API call
      const savedSurvey = {
        ...surveyData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        questions: defaultQuestions,
        status: "draft" as const,
      };

      console.log("Survey draft saved:", savedSurvey);
      setSurveyData(savedSurvey);
      setSuccess("下書きが保存されました。");
    } catch {
      setError("保存に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (
      !surveyData.title ||
      !surveyData.deadline ||
      !surveyData.targetEmployeeCount
    ) {
      setError("必須項目を入力してください。");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Mock API call
      const publishedSurvey = {
        ...surveyData,
        publishedAt: new Date().toISOString(),
        status: "published" as const,
      };

      console.log("Survey published:", publishedSurvey);
      setSurveyData(publishedSurvey);
      setSuccess("サーベイが公開され、従業員にメールが送信されました。");
    } catch {
      setError("公開に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900">
          アンケート設定
        </h1>
      </div>

      {/* Survey Basic Settings */}
      <div
        className="bg-white rounded-lg shadow-sm p-4 sm:p-6 xl:p-8"
        style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
      >
        <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
          アンケート基本設定
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アンケートタイトル
            </label>
            <input
              type="text"
              value={surveyData.title}
              onChange={(e) =>
                setSurveyData({ ...surveyData, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ borderColor: THEME_COLORS.border }}
              placeholder="従業員エンゲージメント調査"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              回答期限
            </label>
            <input
              type="date"
              value={surveyData.deadline}
              onChange={(e) =>
                setSurveyData({ ...surveyData, deadline: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ borderColor: THEME_COLORS.border }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              対象従業員数
            </label>
            <input
              type="number"
              value={surveyData.targetEmployeeCount}
              onChange={(e) =>
                setSurveyData({
                  ...surveyData,
                  targetEmployeeCount: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ borderColor: THEME_COLORS.border }}
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={surveyData.status}
              onChange={(e) =>
                setSurveyData({
                  ...surveyData,
                  status: e.target.value as "draft" | "published" | "completed",
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ borderColor: THEME_COLORS.border }}
            >
              <option value="draft">下書き</option>
              <option value="published">公開中</option>
              <option value="completed">終了</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Preview */}
      <div
        className="bg-white rounded-lg shadow-sm border p-4 md:p-6"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
            設問項目
          </h2>
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            設問を編集
          </button>
        </div>

        <div
          className="bg-gray-50 rounded-lg p-4"
          style={{ borderColor: THEME_COLORS.border }}
        >
          <p className="text-sm text-gray-600 mb-3">
            デフォルト設問（{defaultQuestions.length}問）
          </p>
          <div className="space-y-2">
            {defaultQuestions.slice(0, 3).map((question, index) => (
              <div key={question.id} className="text-sm text-gray-700">
                {index + 1}. {question.text}
              </div>
            ))}
            {defaultQuestions.length > 3 && (
              <div className="text-sm text-gray-500 italic">
                他 {defaultQuestions.length - 3} 問...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div
          className="bg-red-50 border rounded-lg p-4"
          style={{ borderColor: THEME_COLORS.status.error }}
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
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
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div
          className="bg-green-50 border rounded-lg p-4"
          style={{ borderColor: THEME_COLORS.status.success }}
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
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
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isLoading}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "保存中..." : "下書き保存"}
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isLoading || surveyData.status === "published"}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "公開中..." : "公開する"}
        </button>
      </div>

      {/* Status Information */}
      {surveyData.status === "published" && (
        <div
          className="bg-green-50 border rounded-lg p-4"
          style={{ borderColor: THEME_COLORS.status.success }}
        >
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mr-3 mt-0.5"
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
            <div>
              <h3 className="text-sm font-medium text-green-800">
                アンケートが公開されました
              </h3>
              <p className="text-sm text-green-700 mt-1">
                公開日時:{" "}
                {surveyData.publishedAt &&
                  new Date(surveyData.publishedAt).toLocaleString("ja-JP")}
              </p>
              <p className="text-sm text-green-700">
                対象従業員にメールが送信され、回答を開始できます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveySettings;
