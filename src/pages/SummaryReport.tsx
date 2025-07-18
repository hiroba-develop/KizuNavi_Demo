import React from "react";
import { THEME_COLORS } from "../types";
import { useCustomer } from "../context/CustomerContext";
import CustomerSelector from "../components/CustomerSelector";

const SummaryReport: React.FC = () => {
  const { selectedPeriod, selectedCustomerId } = useCustomer();

  // ベースデータ（顧客・期間によって調整される）
  const baseData = {
    kizunaScore: { score: 5.1, positiveRate: 74.2 },
    engagementScore: { score: 4.3, positiveRate: 68.5 },
    satisfactionScore: { score: 5.5, positiveRate: 81.3 },
    humanCapitalScore: { score: 4.8, positiveRate: 72.9 },
  };

  // 顧客IDと期間に基づいて数値を調整
  const getMultipliers = () => {
    const customerMultiplier =
      selectedCustomerId === "1" ? 0.9 : selectedCustomerId === "2" ? 1.1 : 1.0;
    const periodMultiplier =
      selectedPeriod === "2024-04-01"
        ? 1.0
        : selectedPeriod === "2024-03-01"
        ? 0.95
        : selectedPeriod === "2024-02-01"
        ? 0.9
        : selectedPeriod === "2024-01-01"
        ? 0.85
        : 0.8; // 2023-10-01

    return { customerMultiplier, periodMultiplier };
  };

  // 動的にデータを生成
  const getCurrentData = () => {
    const { customerMultiplier, periodMultiplier } = getMultipliers();

    return {
      kizunaScore: {
        score:
          Math.round(
            baseData.kizunaScore.score *
              customerMultiplier *
              periodMultiplier *
              10
          ) / 10,
        positiveRate:
          Math.round(
            baseData.kizunaScore.positiveRate *
              customerMultiplier *
              periodMultiplier *
              10
          ) / 10,
      },
      engagementScore: {
        score:
          Math.round(
            baseData.engagementScore.score *
              customerMultiplier *
              periodMultiplier *
              10
          ) / 10,
        positiveRate:
          Math.round(
            baseData.engagementScore.positiveRate *
              customerMultiplier *
              periodMultiplier *
              10
          ) / 10,
      },
      satisfactionScore: {
        score:
          Math.round(
            baseData.satisfactionScore.score *
              customerMultiplier *
              periodMultiplier *
              10
          ) / 10,
        positiveRate:
          Math.round(
            baseData.satisfactionScore.positiveRate *
              customerMultiplier *
              periodMultiplier *
              10
          ) / 10,
      },
      humanCapitalScore: {
        score:
          Math.round(
            baseData.humanCapitalScore.score *
              customerMultiplier *
              periodMultiplier *
              10
          ) / 10,
        positiveRate:
          Math.round(
            baseData.humanCapitalScore.positiveRate *
              customerMultiplier *
              periodMultiplier *
              10
          ) / 10,
      },
    };
  };

  const currentData = getCurrentData();

  const metricsData = [
    {
      name: "キズナ度",
      score: currentData.kizunaScore.score,
      positiveRate: currentData.kizunaScore.positiveRate,
    },
    {
      name: "エンゲージメントスコア",
      score: currentData.engagementScore.score,
      positiveRate: currentData.engagementScore.positiveRate,
    },
    {
      name: "従業員満足度スコア",
      score: currentData.satisfactionScore.score,
      positiveRate: currentData.satisfactionScore.positiveRate,
    },
    {
      name: "人的資本スコア",
      score: currentData.humanCapitalScore.score,
      positiveRate: currentData.humanCapitalScore.positiveRate,
    },
  ];

  const BarChart = ({
    data,
    title,
  }: {
    data: typeof metricsData;
    title: string;
  }) => {
    const width = 500;
    const height = 400;
    const padding = 60;
    const maxValue = 6;
    const chartHeight = height - 2 * padding;

    return (
      <div
        className="bg-white rounded-lg shadow-sm border p-6"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-lg">
            <svg
              width="100%"
              height="400"
              viewBox="0 0 500 400"
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
                const barWidth = (width - padding - 20) / data.length - 20;
                const x =
                  padding + (index * (width - padding - 20)) / data.length + 10;
                const barHeight = (item.score / maxValue) * chartHeight;
                const y = chartHeight - barHeight + padding;

                return (
                  <g key={index}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="#2C9AEF"
                      rx="2"
                      className="hover:opacity-80 cursor-pointer"
                    >
                      <title>{`${item.name}: ${item.score.toFixed(1)}`}</title>
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
                    {/* X軸ラベル - 改行対応 */}
                    <text
                      x={x + barWidth / 2}
                      y={height - 30}
                      textAnchor="middle"
                      className="text-sm fill-gray-600"
                      style={{ fontSize: "12px" }}
                    >
                      {/* 文字列を適切な長さで改行 */}
                      {(() => {
                        const label = item.name;
                        const maxLength = 8;

                        if (label.length <= maxLength) {
                          return <tspan>{label}</tspan>;
                        }

                        // 改行処理
                        const lines = [];
                        let currentLine = "";
                        for (let i = 0; i < label.length; i++) {
                          currentLine += label[i];
                          if (
                            currentLine.length >= maxLength ||
                            i === label.length - 1
                          ) {
                            lines.push(currentLine);
                            currentLine = "";
                          }
                        }

                        return lines.map((line, index) => (
                          <tspan
                            key={index}
                            x={x + barWidth / 2}
                            dy={index === 0 ? 0 : 14}
                          >
                            {line}
                          </tspan>
                        ));
                      })()}
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

  const RadarChart = ({
    data,
    title,
  }: {
    data: typeof metricsData;
    title: string;
  }) => {
    const size = 350;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 120;
    const maxValue = 100; // ポジティブ割合なので100%まで

    const angleStep = (2 * Math.PI) / data.length;

    const points = data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const value = item.positiveRate / maxValue;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      return { x, y, angle, label: item.name, value: item.positiveRate };
    });

    const pathData =
      points
        .map(
          (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        )
        .join(" ") + " Z";

    return (
      <div
        className="bg-white rounded-lg shadow-sm border p-6"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-sm">
            <svg
              width="100%"
              height="350"
              viewBox="0 0 350 350"
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible w-full h-auto"
            >
              {/* Background grid circles */}
              {[20, 40, 60, 80, 100].map((percentage) => (
                <circle
                  key={percentage}
                  cx={centerX}
                  cy={centerY}
                  r={(radius * percentage) / 100}
                  fill="none"
                  stroke={THEME_COLORS.border}
                  strokeWidth="1"
                />
              ))}

              {/* Grid lines */}
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

              {/* Data points */}
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#71D3D8"
                />
              ))}

              {/* ラベル - 改行対応 */}
              {points.map((point, index) => {
                const labelRadius = radius + 50;
                const angle = index * angleStep - Math.PI / 2;
                const labelX = centerX + Math.cos(angle) * labelRadius;
                const labelY = centerY + Math.sin(angle) * labelRadius;

                return (
                  <text
                    key={index}
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-medium fill-gray-600"
                    style={{ fontSize: "12px" }}
                  >
                    {/* 項目名を改行対応で表示 */}
                    {(() => {
                      const label = point.label;
                      const maxLength = 8;

                      if (label.length <= maxLength) {
                        return (
                          <>
                            <tspan x={labelX} dy="-0.7em">
                              {label}
                            </tspan>
                            <tspan
                              x={labelX}
                              dy="1.4em"
                              className="font-semibold"
                              style={{ fontSize: "12px" }}
                            >
                              {point.value.toFixed(1)}%
                            </tspan>
                          </>
                        );
                      }

                      // 改行処理
                      const lines = [];
                      let currentLine = "";
                      for (let i = 0; i < label.length; i++) {
                        currentLine += label[i];
                        if (
                          currentLine.length >= maxLength ||
                          i === label.length - 1
                        ) {
                          lines.push(currentLine);
                          currentLine = "";
                        }
                      }

                      return (
                        <>
                          {lines.map((line, lineIndex) => (
                            <tspan
                              key={lineIndex}
                              x={labelX}
                              dy={lineIndex === 0 ? "-0.7em" : "1.2em"}
                            >
                              {line}
                            </tspan>
                          ))}
                          <tspan
                            x={labelX}
                            dy="1.4em"
                            className="font-semibold"
                            style={{ fontSize: "12px" }}
                          >
                            {point.value.toFixed(1)}%
                          </tspan>
                        </>
                      );
                    })()}
                  </text>
                );
              })}

              {/* Percentage labels on grid */}
              {[20, 40, 60, 80, 100].map((percentage) => (
                <text
                  key={percentage}
                  x={centerX + 5}
                  y={centerY - (radius * percentage) / 100}
                  className="text-xs fill-gray-400"
                  style={{ fontSize: "9px" }}
                >
                  {percentage}%
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const DataTable = ({ data }: { data: typeof metricsData }) => (
    <div
      className="bg-white rounded-lg shadow-sm border overflow-x-auto"
      style={{ borderColor: THEME_COLORS.border }}
    >
      <div className="p-4 sm:p-6 xl:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl xl:text-2xl font-semibold text-gray-900 mb-2 sm:mb-0">
            指標別データ
          </h2>
          <div className="text-sm text-gray-600">
            実施日:{" "}
            {selectedPeriod === "2024-04-01"
              ? "2024年4月1日"
              : selectedPeriod === "2024-03-01"
              ? "2024年3月1日"
              : selectedPeriod === "2024-02-01"
              ? "2024年2月1日"
              : selectedPeriod === "2024-01-01"
              ? "2024年1月1日"
              : selectedPeriod === "2023-10-01"
              ? "2023年10月1日"
              : "不明"}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: THEME_COLORS.border }}
              >
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  指標
                </th>
                {data.map((metric) => (
                  <th
                    key={metric.name}
                    className="text-center py-3 px-2 font-medium text-gray-900 min-w-[120px]"
                  >
                    <div className="text-xs whitespace-nowrap">
                      <span className="hidden lg:inline">{metric.name}</span>
                      <span className="lg:hidden">
                        {metric.name.length > 8
                          ? metric.name.substring(0, 7) + "..."
                          : metric.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr
                className="border-b"
                style={{ borderColor: THEME_COLORS.border }}
              >
                <td className="py-3 px-4 font-medium text-gray-700">スコア</td>
                {data.map((metric) => (
                  <td key={metric.name} className="text-center py-3 px-2">
                    <span className="font-semibold text-blue-600">
                      {metric.score.toFixed(1)}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-gray-700">
                  ポジティブ割合
                </td>
                {data.map((metric) => (
                  <td key={metric.name} className="text-center py-3 px-2">
                    <span
                      className="font-semibold"
                      style={{ color: "#71D3D8" }}
                    >
                      {metric.positiveRate.toFixed(1)}%
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with customer selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900">
          サマリーレポート
        </h1>
        <CustomerSelector showPeriod={true} />
      </div>

      {/* Data Table - 1段目 */}
      <DataTable data={metricsData} />

      {/* Charts Grid - 2段目 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <BarChart data={metricsData} title="スコア" />
        <RadarChart data={metricsData} title="ポジティブ割合" />
      </div>
    </div>
  );
};

export default SummaryReport;
