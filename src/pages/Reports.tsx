import React, { useState } from "react";
import { THEME_COLORS } from "../types";

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-04-01");

  const [selectedView, setSelectedView] = useState<
    "summary" | "category" | "trend"
  >("summary");

  // Mock data for analysis
  const mockData = {
    summaryMetrics: {
      kizunaScore: 5.1,
      engagementScore: 4.3,
      satisfactionScore: 5.5,
      humanCapitalScore: 4.8,
      responseRate: 88.5,
      participantCount: 142,
      totalEmployees: 160,
    },
    departmentData: [
      { name: "営業部", score: 4.8, count: 25, responseRate: 92 },
      { name: "人事部", score: 4.2, count: 12, responseRate: 85 },
      { name: "総務部", score: 3.9, count: 15, responseRate: 87 },
      { name: "広報部", score: 4.5, count: 8, responseRate: 100 },
      { name: "経理部", score: 4.1, count: 18, responseRate: 90 },
      { name: "開発部", score: 5.2, count: 35, responseRate: 94 },
      { name: "法務部", score: 4.7, count: 10, responseRate: 80 },
      { name: "管理部", score: 4.3, count: 19, responseRate: 84 },
    ],
    categoryAnalysis: [
      {
        category: "経営幹部への信頼",
        score: 4.8,
        trend: "+0.3",
        color: THEME_COLORS.charts.line,
      },
      {
        category: "企業風土",
        score: 4.2,
        trend: "-0.1",
        color: THEME_COLORS.charts.pie,
      },
      {
        category: "人間関係",
        score: 5.1,
        trend: "+0.5",
        color: THEME_COLORS.charts.radar,
      },
      {
        category: "仕事のやりがい",
        score: 4.7,
        trend: "+0.2",
        color: THEME_COLORS.main,
      },
      {
        category: "事業運営",
        score: 4.5,
        trend: "0.0",
        color: THEME_COLORS.accent,
      },
      {
        category: "人事制度",
        score: 4.0,
        trend: "-0.3",
        color: THEME_COLORS.status.warning,
      },
      {
        category: "ワークライフバランス",
        score: 4.9,
        trend: "+0.4",
        color: THEME_COLORS.status.success,
      },
      {
        category: "改革の息吹",
        score: 4.3,
        trend: "+0.1",
        color: THEME_COLORS.status.info,
      },
    ],
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    trend,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: string;
  }) => (
    <div
      className="bg-white rounded-lg shadow-sm border p-4 sm:p-6"
      style={{ borderColor: THEME_COLORS.border }}
    >
      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
        {title}
      </h3>
      <div className="flex items-baseline">
        <span
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: THEME_COLORS.accent }}
        >
          {value}
        </span>
        {trend && (
          <span
            className={`ml-2 text-sm font-medium ${
              trend.startsWith("+")
                ? "text-green-600"
                : trend.startsWith("-")
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const DepartmentTable = () => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div
        className="px-4 sm:px-6 xl:px-8 py-4 bg-gray-50 border-b"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <h3 className="text-lg xl:text-xl font-semibold text-gray-900">
          部署別分析
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 xl:px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                部署
              </th>
              <th className="px-4 sm:px-6 xl:px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kizuna スコア
              </th>
              <th className="px-4 sm:px-6 xl:px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                回答者数
              </th>
              <th className="px-4 sm:px-6 xl:px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                回答率
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockData.departmentData.map((dept, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 xl:px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {dept.name}
                </td>
                <td className="px-4 sm:px-6 xl:px-8 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-12 xl:w-16 h-2 rounded-full mr-3"
                      style={{
                        backgroundColor: THEME_COLORS.charts.bar,
                        width: `${
                          (dept.score / 6) *
                          (window.innerWidth >= 1280 ? 64 : 48)
                        }px`,
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {dept.score.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 xl:px-8 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dept.count}人
                </td>
                <td className="px-4 sm:px-6 xl:px-8 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      dept.responseRate >= 90
                        ? "bg-green-100 text-green-800"
                        : dept.responseRate >= 85
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {dept.responseRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CategoryAnalysis = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div
        className="px-4 sm:px-6 xl:px-8 py-4 bg-gray-50 border-b"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <h3 className="text-lg xl:text-xl font-semibold text-gray-900">
          カテゴリ別分析
        </h3>
      </div>
      <div className="p-4 sm:p-6 xl:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {mockData.categoryAnalysis.map((category, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border"
              style={{ borderColor: THEME_COLORS.border }}
            >
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {category.category}
              </h4>
              <div className="flex items-center justify-between">
                <span
                  className="text-xl xl:text-2xl font-bold"
                  style={{ color: THEME_COLORS.accent }}
                >
                  {category.score.toFixed(1)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    category.trend.startsWith("+")
                      ? "text-green-600"
                      : category.trend.startsWith("-")
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {category.trend}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(category.score / 6) * 100}%`,
                      backgroundColor: THEME_COLORS.charts.bar,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
            分析レポート
          </h1>
          <p className="text-sm sm:text-base xl:text-lg text-gray-600">
            従業員エンゲージメント調査の詳細な分析結果を表示します
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 xl:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 xl:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                調査期間
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024-04-01">2024年4月度</option>
                <option value="2024-03-01">2024年3月度</option>
                <option value="2024-02-01">2024年2月度</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示形式
              </label>
              <select
                value={selectedView}
                onChange={(e) =>
                  setSelectedView(
                    e.target.value as "summary" | "category" | "trend"
                  )
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="summary">サマリー</option>
                <option value="category">カテゴリ別</option>
                <option value="trend">トレンド</option>
              </select>
            </div>

            <div className="ml-auto">
              <button
                className="px-4 py-2 text-white rounded-md text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: THEME_COLORS.main }}
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                エクスポート
              </button>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Kizuna スコア"
            value={mockData.summaryMetrics.kizunaScore.toFixed(1)}
            trend="+0.2"
          />
          <MetricCard
            title="エンゲージメント"
            value={mockData.summaryMetrics.engagementScore.toFixed(1)}
            trend="+0.1"
          />
          <MetricCard
            title="満足度"
            value={mockData.summaryMetrics.satisfactionScore.toFixed(1)}
            trend="+0.4"
          />
          <MetricCard
            title="回答率"
            value={`${mockData.summaryMetrics.responseRate}%`}
            subtitle={`${mockData.summaryMetrics.participantCount}/${mockData.summaryMetrics.totalEmployees}人`}
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          <DepartmentTable />
          <CategoryAnalysis />
        </div>

        {/* Additional Charts Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 xl:p-8">
            <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4">
              詳細分析
            </h3>
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p>より詳細なチャートと分析機能は今後実装予定です</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
