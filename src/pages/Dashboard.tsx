import React, { useState, useEffect } from "react";
import { THEME_COLORS, type DashboardMetrics, type ChartData } from "../types";
import { useAuth } from "../context/AuthContext";
import { useCustomer } from "../context/CustomerContext";
import ReportService from "../utils/reportService";
import CustomerSelector from "../components/CustomerSelector";

// TODO: Use SimpleChartItem interface when needed
// interface SimpleChartItem {
//   name?: string;
//   category?: string;
//   age?: string;
//   tenure?: string;
//   score: number;
// }

// TODO: Use DashboardChartData interface when needed
// interface DashboardChartData {
//   departmentKizuna: SimpleChartItem[];
//   categoryKizuna: SimpleChartItem[];
//   generationKizuna: SimpleChartItem[];
//   tenureKizuna: SimpleChartItem[];
// }

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { selectedCustomerId, selectedPeriod } = useCustomer();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  // モバイルデバイスの検出
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.companyId) return;

      try {
        setIsLoading(true);
        setError("");

        const [metricsData, chartsData] = await Promise.all([
          ReportService.getDashboardMetrics(user.companyId),
          ReportService.getDashboardChartData(user.companyId),
        ]);

        setMetrics(metricsData);
        setChartData(chartsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました"
        );
        console.error("Dashboard data fetch error:", err);

        // Fallback to mock data
        setMetrics({
          kizunaScore: 5.1,
          engagementScore: 4.3,
          satisfactionScore: 5.5,
          humanCapitalScore: 4.8,
          implementationRate: 88.5,
          positiveRate: 74.2,
          lastSurveyDate: "2024年4月1日",
        });

        setChartData({
          departmentKizuna: [
            { name: "営業部", score: 4.8 },
            { name: "人事部", score: 4.2 },
            { name: "総務部", score: 3.9 },
            { name: "広報部", score: 4.5 },
            { name: "経理部", score: 4.1 },
            { name: "開発部", score: 5.2 },
            { name: "法務部", score: 4.7 },
            { name: "管理部", score: 4.3 },
          ],
          categoryKizuna: [
            {
              category: "経営幹部への信頼",
              score: 4.8,
              positiveRate: 75.0,
              breakdown: {},
            },
            {
              category: "企業風土",
              score: 4.2,
              positiveRate: 68.0,
              breakdown: {},
            },
            {
              category: "人間関係",
              score: 5.1,
              positiveRate: 82.0,
              breakdown: {},
            },
            {
              category: "仕事のやりがい",
              score: 4.7,
              positiveRate: 73.0,
              breakdown: {},
            },
            {
              category: "事業運営",
              score: 4.5,
              positiveRate: 70.0,
              breakdown: {},
            },
            {
              category: "人事制度",
              score: 4.0,
              positiveRate: 65.0,
              breakdown: {},
            },
            {
              category: "ワークライフバランス",
              score: 4.9,
              positiveRate: 78.0,
              breakdown: {},
            },
            {
              category: "改革の息吹",
              score: 4.3,
              positiveRate: 69.0,
              breakdown: {},
            },
          ],
          generationKizuna: [
            { age: "10代", score: 4.5 },
            { age: "20代", score: 4.8 },
            { age: "30代", score: 5.1 },
            { age: "40代", score: 5.3 },
            { age: "50代", score: 5.6 },
            { age: "60代", score: 5.4 },
            { age: "70代～", score: 5.2 },
          ],
          tenureKizuna: [
            { tenure: "3年未満", score: 4.6 },
            { tenure: "3-7年", score: 4.9 },
            { tenure: "8-13年", score: 5.2 },
            { tenure: "14-20年", score: 5.4 },
            { tenure: "20年以上", score: 5.6 },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.companyId, selectedPeriod, selectedCustomerId]);

  const CircularProgress = ({
    percentage,
    size = 140,
    strokeWidth = 24,
    showLabel = true,
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    // エンゲージメント向上を促す色（統一されたテーマカラー）
    const getColor = () => {
      return THEME_COLORS.accent; // 統一されたアクセントカラー
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-800">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    );
  };

  const BarChart = ({ data, title }: { data: any[]; title: string }) => {
    const width = isMobile ? 400 : 500;
    const height = isMobile ? 240 : 280;
    const padding = isMobile ? 40 : 60;
    const maxValue = 6;
    const chartHeight = height - 2 * padding;

    return (
      <div className="space-y-4 sm:space-y-6">
        <h4 className="text-base sm:text-lg font-medium text-gray-700">
          {title}
        </h4>
        <div className="flex justify-center w-full overflow-x-auto">
          <div className="w-full max-w-lg min-w-[320px] sm:min-w-[400px]">
            <svg
              width="100%"
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4, 5, 6].map((level) => {
                const y = height - padding - (level / maxValue) * chartHeight;
                return (
                  <g key={level}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke={THEME_COLORS.border}
                      strokeWidth="0.5"
                    />
                    <text
                      x={padding - 25}
                      y={y + 4}
                      textAnchor="end"
                      className="text-sm fill-gray-500"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {data.map((item, index) => {
                const barWidth =
                  title === "部門別キズナ度"
                    ? (width - padding - 20) / data.length - 20
                    : (width - padding - 20) / data.length - 8;
                const x =
                  title === "部門別キズナ度"
                    ? padding +
                      (index * (width - padding - 20)) / data.length +
                      10
                    : padding +
                      (index * (width - padding - 20)) / data.length +
                      4;
                const barHeight = (item.score / maxValue) * chartHeight;
                const y = chartHeight - barHeight + padding;

                return (
                  <g key={index}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={
                        title === "部門別キズナ度"
                          ? "#2C9AEF"
                          : THEME_COLORS.charts.bar
                      }
                      rx="2"
                      className="hover:opacity-80 cursor-pointer"
                    >
                      <title>{`${
                        item.name || item.category || item.age || item.tenure
                      }: ${item.score.toFixed(1)}`}</title>
                    </rect>
                    {/* Value label on top of bar */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                    >
                      {item.score.toFixed(1)}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={height - 10}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                      style={{ fontSize: "10px" }}
                    >
                      <tspan>
                        {(item.name || item.category || item.age || item.tenure)
                          ?.length > (title === "部門別キズナ度" ? 4 : 6)
                          ? (
                              item.name ||
                              item.category ||
                              item.age ||
                              item.tenure
                            )?.substring(
                              0,
                              title === "部門別キズナ度" ? 3 : 5
                            ) + "..."
                          : item.name ||
                            item.category ||
                            item.age ||
                            item.tenure}
                      </tspan>
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const RadarChart = ({ data, title }: { data: any[]; title: string }) => {
    const size = isMobile ? 280 : 360;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = isMobile ? 100 : 130;
    const maxValue = 6;

    const angleStep = (2 * Math.PI) / data.length;

    const points = data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const value = item.score / maxValue;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      return { x, y, angle, label: item.category, score: item.score };
    });

    const pathData =
      points
        .map(
          (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        )
        .join(" ") + " Z";

    return (
      <div className="space-y-4 sm:space-y-6">
        <h4 className="text-base sm:text-lg font-medium text-gray-700">
          {title}
        </h4>
        <div className="flex justify-center w-full overflow-x-auto">
          <div className="w-full max-w-sm min-w-[280px] sm:min-w-[320px]">
            <svg
              width="100%"
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background grid */}
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <circle
                  key={level}
                  cx={centerX}
                  cy={centerY}
                  r={(radius * level) / 6}
                  fill="none"
                  stroke={THEME_COLORS.border}
                  strokeWidth="1"
                />
              ))}

              {/* Axis lines */}
              {data.map((_, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const x2 = centerX + Math.cos(angle) * radius;
                const y2 = centerY + Math.sin(angle) * radius;
                return (
                  <line
                    key={index}
                    x1={centerX}
                    y1={centerY}
                    x2={x2}
                    y2={y2}
                    stroke={THEME_COLORS.border}
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data area */}
              <path
                d={pathData}
                fill="#71D3D8"
                fillOpacity="0.3"
                stroke="#71D3D8"
                strokeWidth="2"
              />

              {/* Data points with values */}
              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#71D3D8"
                    className="hover:r-6 cursor-pointer"
                  >
                    <title>{`${point.label}: ${point.score.toFixed(1)}`}</title>
                  </circle>
                  {/* Value label near the point */}
                  <text
                    x={point.x}
                    y={point.y - 12}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-700"
                    style={{ fontSize: "11px" }}
                  >
                    {point.score.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Labels */}
              {points.map((point, index) => {
                const labelRadius = radius + (isMobile ? 35 : 45);
                const angle = index * angleStep - Math.PI / 2;
                const labelX = centerX + Math.cos(angle) * labelRadius;
                const labelY = centerY + Math.sin(angle) * labelRadius;

                // Adjust text anchor based on position to prevent overlap
                let textAnchor = "middle";
                if (labelX < centerX - (isMobile ? 20 : 30)) textAnchor = "end";
                else if (labelX > centerX + (isMobile ? 20 : 30))
                  textAnchor = "start";

                return (
                  <text
                    key={index}
                    x={labelX}
                    y={labelY}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    className="text-xs sm:text-sm font-medium fill-gray-600"
                    style={{ fontSize: isMobile ? "9px" : "11px" }}
                  >
                    <tspan>
                      {point.label.length > (isMobile ? 6 : 8)
                        ? point.label.substring(0, isMobile ? 5 : 7) + "..."
                        : point.label}
                    </tspan>
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const LineChart = ({ data, title }: { data: any[]; title: string }) => {
    const width = isMobile ? 400 : 500;
    const height = isMobile ? 280 : 320;
    const padding = isMobile ? 40 : 60;
    const maxValue = 6;

    const points = data.map((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
      const y =
        height - padding - (item.score / maxValue) * (height - 2 * padding);
      return { x, y, label: item.age || item.tenure, score: item.score };
    });

    const pathData = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    return (
      <div className="space-y-4 sm:space-y-6">
        <h4 className="text-base sm:text-lg font-medium text-gray-700">
          {title}
        </h4>
        <div className="flex justify-center w-full overflow-x-auto">
          <div className="w-full max-w-lg min-w-[320px] sm:min-w-[400px]">
            <svg
              width="100%"
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4, 5, 6].map((level) => {
                const y =
                  height -
                  padding -
                  (level / maxValue) * (height - 2 * padding);
                return (
                  <g key={level}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke={THEME_COLORS.border}
                      strokeWidth="0.5"
                    />
                    <text
                      x={padding - 25}
                      y={y + 4}
                      textAnchor="end"
                      className="text-sm fill-gray-500"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {points.map((point, index) => (
                <text
                  key={index}
                  x={point.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                  style={{ fontSize: "11px" }}
                >
                  <tspan>
                    {point.label.length > 6
                      ? point.label.substring(0, 5) + "..."
                      : point.label}
                  </tspan>
                </text>
              ))}

              {/* Line */}
              <path
                d={pathData}
                fill="none"
                stroke={THEME_COLORS.charts.line}
                strokeWidth="3"
              />

              {/* Points with values */}
              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={THEME_COLORS.charts.line}
                    className="hover:r-6 cursor-pointer"
                  >
                    <title>{`${point.label}: ${point.score.toFixed(1)}`}</title>
                  </circle>
                  {/* Value label */}
                  <text
                    x={point.x}
                    y={point.y - 12}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {point.score.toFixed(1)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-600 font-medium">データの取得に失敗しました</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // Ensure data is available
  if (!metrics || !chartData) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with customer selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          ダッシュボード
        </h1>
        <CustomerSelector showPeriod={true} />
      </div>

      {/* Top Row: Metrics and Circular Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Main Metrics and Kizuna Score */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  キズナ度
                </h3>
                <div
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: THEME_COLORS.accent }}
                >
                  {metrics.kizunaScore}
                  <span className="text-sm sm:text-lg text-gray-400">/6</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  エンゲージメント
                </h3>
                <div
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: THEME_COLORS.main }}
                >
                  {metrics.engagementScore}
                  <span className="text-sm sm:text-lg text-gray-400">/6</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  従業員満足度
                </h3>
                <div
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: THEME_COLORS.status.success }}
                >
                  {metrics.satisfactionScore}
                  <span className="text-sm sm:text-lg text-gray-400">/6</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  人的資本スコア
                </h3>
                <div
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: THEME_COLORS.status.warning }}
                >
                  {metrics.humanCapitalScore}
                  <span className="text-sm sm:text-lg text-gray-400">/6</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Circular Charts */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-6 h-full">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-4 text-center">
                実施率
              </h3>
              <CircularProgress
                percentage={metrics.implementationRate}
                size={isMobile ? 100 : 140}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-4 text-center">
                ポジティブ割合
              </h3>
              <CircularProgress
                percentage={metrics.positiveRate}
                size={isMobile ? 100 : 140}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Department and Generation Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Department Bar Chart */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <BarChart data={chartData.departmentKizuna} title="部門別キズナ度" />
        </div>

        {/* Generation Line Chart */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <LineChart data={chartData.generationKizuna} title="世代別キズナ度" />
        </div>
      </div>

      {/* Third Row: Category and Tenure Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Radar Chart */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <RadarChart
            data={chartData.categoryKizuna}
            title="カテゴリ別キズナ度"
          />
        </div>

        {/* Tenure Line Chart */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <LineChart data={chartData.tenureKizuna} title="勤続年数別キズナ度" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
