import React from "react";
import { THEME_COLORS } from "../types";
import { useCustomer } from "../context/CustomerContext";
import CustomerSelector from "../components/CustomerSelector";

const CategoryReport: React.FC = () => {
  const { selectedPeriod, selectedCustomerId, periods } = useCustomer();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ベースデータ（顧客・期間によって調整される）
  const baseData = [
    { name: "経営幹部への信頼", score: 4.8, positiveRate: 74.2 },
    { name: "企業風土", score: 4.2, positiveRate: 68.5 },
    { name: "人間関係", score: 5.1, positiveRate: 82.3 },
    { name: "仕事のやりがい", score: 4.7, positiveRate: 71.8 },
    { name: "事業運営", score: 4.5, positiveRate: 69.7 },
    { name: "人事制度", score: 4.0, positiveRate: 62.4 },
    { name: "ワークライフバランス", score: 4.9, positiveRate: 78.6 },
    { name: "改革の息吹", score: 4.3, positiveRate: 66.9 },
    { name: "従業員の当事者意識", score: 4.6, positiveRate: 72.5 },
    { name: "従業員の自己肯定感", score: 4.4, positiveRate: 70.2 },
    { name: "人材の流動性", score: 4.2, positiveRate: 65.8 },
    { name: "コーポレートガバナンス", score: 4.7, positiveRate: 73.4 },
  ];

  // 顧客IDと期間に基づいて数値を調整
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

  // 動的にデータを生成
  const currentData = baseData.map((item) => ({
    ...item,
    score:
      Math.round(item.score * customerMultiplier * periodMultiplier * 10) / 10,
    positiveRate:
      Math.round(
        item.positiveRate * customerMultiplier * periodMultiplier * 10
      ) / 10,
  }));

  // 最新の実施日を選択している場合のみ、前回のデータを比較用に取得
  const getComparisonData = () => {
    if (selectedPeriod === periods[0].value && periods.length > 1) {
      const previousPeriodMultiplier = 0.95;
      return baseData.map((item) => ({
        ...item,
        score:
          Math.round(
            item.score * customerMultiplier * previousPeriodMultiplier * 10
          ) / 10,
        positiveRate:
          Math.round(
            item.positiveRate *
              customerMultiplier *
              previousPeriodMultiplier *
              10
          ) / 10,
      }));
    }
    return undefined;
  };

  const comparisonData = getComparisonData();

  const BarChart = ({
    data,
    comparisonData,
    title,
  }: {
    data: typeof currentData;
    comparisonData?: typeof currentData;
    title: string;
  }) => {
    // 画面サイズに応じてグラフのサイズと余白を設定
    const width = isMobile ? 1600 : 1200; // サイズを縮小
    const height = isMobile ? 450 : 400;
    const padding = {
      top: 40,
      right: 80,
      bottom: isMobile ? 160 : 120,
      left: 80,
    };
    const maxValue = 6;
    const chartHeight = height - padding.top - padding.bottom;

    return (
      <div
        className="bg-white rounded-lg shadow-sm border p-6"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="w-full overflow-x-auto pb-4">
          <div className={`${isMobile ? "w-[1680px]" : "w-[1280px]"}`}>
            {" "}
            {/* スマホでも適度なサイズに調整 */}
            <svg
              width="100%"
              height={isMobile ? "450" : "400"}
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="xMinYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4, 5, 6].map((level) => {
                const y =
                  height - padding.bottom - (level / maxValue) * chartHeight;
                return (
                  <g key={level}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={THEME_COLORS.border}
                      strokeWidth="0.5"
                    />
                    <text
                      x={padding.left - 10}
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
                  ((width - padding.left - padding.right) / data.length) *
                  (isMobile ? 0.4 : 0.5); // バー幅を調整
                const x =
                  padding.left +
                  (index * (width - padding.left - padding.right)) /
                    data.length +
                  ((width - padding.left - padding.right) / data.length) * 0.3; // バー間の間隔を均等に
                const barHeight = (item.score / maxValue) * chartHeight;
                const y = height - padding.bottom - barHeight;

                return (
                  <g key={index}>
                    <g>
                      {/* メインデータのバー */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth * 0.45}
                        height={barHeight}
                        fill={THEME_COLORS.accent}
                        rx="2"
                        className="hover:opacity-80 cursor-pointer"
                      >
                        <title>{`${item.name}: ${item.score.toFixed(
                          1
                        )}`}</title>
                      </rect>
                      {/* 比較データのバー */}
                      {selectedPeriod === periods[0].value &&
                        periods.length > 1 &&
                        comparisonData && (
                          <rect
                            x={x + barWidth * 0.55}
                            y={
                              padding.top +
                              chartHeight -
                              (comparisonData[index].score / maxValue) *
                                chartHeight
                            }
                            width={barWidth * 0.45}
                            height={
                              (comparisonData[index].score / maxValue) *
                              chartHeight
                            }
                            fill={THEME_COLORS.border}
                            rx="2"
                            className="hover:opacity-80 cursor-pointer"
                          >
                            <title>{`${item.name} (比較): ${comparisonData[
                              index
                            ].score.toFixed(1)}`}</title>
                          </rect>
                        )}
                    </g>
                    {/* 現在のスコア表示 */}
                    <text
                      x={x + barWidth * 0.225}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                    >
                      {item.score.toFixed(1)}
                    </text>
                    {/* 比較スコア表示 */}
                    {comparisonData && (
                      <text
                        x={x + barWidth * 0.775}
                        y={
                          padding.top +
                          chartHeight -
                          (comparisonData[index].score / maxValue) *
                            chartHeight -
                          5
                        }
                        textAnchor="middle"
                        className="text-xs font-medium fill-gray-500"
                      >
                        {comparisonData[index].score.toFixed(1)}
                      </text>
                    )}
                    {/* X軸ラベル - 改行対応 */}
                    <foreignObject
                      x={x - (isMobile ? barWidth * 1.2 : barWidth * 0.8)}
                      y={height - padding.bottom + 10}
                      width={isMobile ? barWidth * 3 : barWidth * 2.0}
                      height={isMobile ? 140 : 100}
                    >
                      <div
                        className="text-center text-sm text-gray-600 px-1"
                        style={{
                          fontSize: isMobile ? "11px" : "12px",
                          lineHeight: "1.2",
                          wordBreak: "break-word",
                          paddingLeft: "4ch",
                        }}
                      >
                        {item.name}
                      </div>
                    </foreignObject>
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
    comparisonData,
    title,
  }: {
    data: typeof currentData;
    comparisonData?: typeof currentData;
    title: string;
  }) => {
    const size = 450;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 140;
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
        <div className="flex justify-center w-full overflow-x-auto">
          <div className="w-full max-w-md">
            <svg
              width="100%"
              height="450"
              viewBox="0 0 450 450"
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

              {/* 比較データのエリア（後ろに表示） */}
              {comparisonData && (
                <>
                  <path
                    d={
                      comparisonData
                        .map((item, index) => {
                          const angle = index * angleStep - Math.PI / 2;
                          const value = item.positiveRate / maxValue;
                          const x = centerX + Math.cos(angle) * radius * value;
                          const y = centerY + Math.sin(angle) * radius * value;
                          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ") + " Z"
                    }
                    fill="#E5E7EB"
                    fillOpacity="0.3"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  {/* 比較データのポイント */}
                  {comparisonData.map((item, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const value = item.positiveRate / maxValue;
                    const x = centerX + Math.cos(angle) * radius * value;
                    const y = centerY + Math.sin(angle) * radius * value;
                    return (
                      <circle
                        key={`comparison-point-${index}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#9CA3AF"
                        stroke="white"
                        strokeWidth="1"
                      />
                    );
                  })}
                </>
              )}

              {/* メインデータのエリア */}
              <path
                d={pathData}
                fill="#71D3D8"
                fillOpacity="0.4"
                stroke="#71D3D8"
                strokeWidth="2"
              />
              {/* メインデータのポイント */}
              {points.map((point, index) => (
                <circle
                  key={`main-point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#71D3D8"
                  stroke="white"
                  strokeWidth="1"
                />
              ))}

              {/* ラベル - 改行対応 */}
              {points.map((point, index) => {
                const labelRadius = radius + 60;
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
                    style={{ fontSize: isMobile ? "9px" : "11px" }}
                  >
                    {/* 項目名を改行対応で表示 */}
                    {(() => {
                      const label = point.label;
                      const maxLength = isMobile ? 6 : 8;

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
                              style={{ fontSize: isMobile ? "9px" : "11px" }}
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
                            style={{ fontSize: isMobile ? "9px" : "11px" }}
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
                  style={{ fontSize: "8px" }}
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with customer selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 flex-shrink-0">
          カテゴリ別レポート
        </h1>
        <div className="flex justify-end w-full sm:w-auto">
          <CustomerSelector showPeriod={true} />
        </div>
      </div>

      {/* Data Table */}
      <div
        className="bg-white rounded-lg shadow-sm border overflow-x-auto"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <div className="p-4 sm:p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-xl xl:text-2xl font-semibold text-gray-900 mb-2 sm:mb-0">
              カテゴリ別データ
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: THEME_COLORS.border }}
                >
                  <th className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                    カテゴリ
                  </th>
                  {currentData.map((item) => (
                    <th
                      key={item.name}
                      className="text-center py-3 px-2 font-medium text-gray-900 w-[120px]"
                    >
                      <div className="text-sm break-words">{item.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr
                  className="border-b"
                  style={{ borderColor: THEME_COLORS.border }}
                >
                  <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                    スコア
                  </td>
                  {currentData.map((item) => {
                    const currentMaxScore = Math.max(
                      ...currentData.map((item) => item.score)
                    );
                    const currentMinScore = Math.min(
                      ...currentData.map((item) => item.score)
                    );
                    return (
                      <td key={item.name} className="text-center py-3 px-2">
                        <div className="flex items-center justify-center">
                          {item.score === currentMaxScore && (
                            <svg
                              className="w-5 h-5 text-yellow-500 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <title>最高スコア</title>
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                          {item.score === currentMinScore && (
                            <svg
                              className="w-5 h-5 text-red-500 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <title>最低スコア</title>
                              <path d="M10 15 L5 5 L15 5 Z" />
                            </svg>
                          )}
                          <span
                            className={`font-semibold ${
                              item.score === currentMaxScore
                                ? "text-yellow-600"
                                : item.score === currentMinScore
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {item.score.toFixed(1)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {comparisonData && (
                  <tr
                    className="border-b"
                    style={{ borderColor: THEME_COLORS.border }}
                  >
                    <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      比較対象のスコア
                    </td>
                    {comparisonData.map((item) => {
                      const comparisonMaxScore = Math.max(
                        ...comparisonData.map((item) => item.score)
                      );
                      const comparisonMinScore = Math.min(
                        ...comparisonData.map((item) => item.score)
                      );
                      return (
                        <td key={item.name} className="text-center py-3 px-2">
                          <div className="flex items-center justify-center">
                            {item.score === comparisonMaxScore && (
                              <svg
                                className="w-5 h-5 text-yellow-500 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <title>比較データの最高スコア</title>
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                            {item.score === comparisonMinScore && (
                              <svg
                                className="w-5 h-5 text-red-500 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <title>比較データの最低スコア</title>
                                <path d="M10 15 L5 5 L15 5 Z" />
                              </svg>
                            )}
                            <span
                              className={`font-semibold ${
                                item.score === comparisonMaxScore
                                  ? "text-yellow-600"
                                  : item.score === comparisonMinScore
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {item.score.toFixed(1)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )}
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                    ポジティブ割合
                  </td>
                  {currentData.map((item) => (
                    <td key={item.name} className="text-center py-3 px-2">
                      <span
                        className="font-semibold"
                        style={{ color: "#71D3D8" }}
                      >
                        {item.positiveRate.toFixed(1)}%
                      </span>
                    </td>
                  ))}
                </tr>
                {comparisonData && (
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      比較対象のポジティブ割合
                    </td>
                    {comparisonData.map((item) => (
                      <td key={item.name} className="text-center py-3 px-2">
                        <span
                          className="font-semibold"
                          style={{ color: "#9CA3AF" }}
                        >
                          {item.positiveRate.toFixed(1)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <BarChart
          data={currentData}
          comparisonData={comparisonData}
          title="スコア"
        />
        <RadarChart
          data={currentData}
          comparisonData={comparisonData}
          title="ポジティブ割合"
        />
      </div>
    </div>
  );
};

export default CategoryReport;
