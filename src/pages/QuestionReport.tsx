import React, { useState, useEffect } from "react";
import { THEME_COLORS } from "../types";
import { useCustomer } from "../context/CustomerContext";
import { useQuestions } from "../context/QuestionsContext";
import CustomerSelector from "../components/CustomerSelector";

interface QuestionData {
  id: string;
  text: string;
  category: string;
  note?: string;
  highPositiveRate: number; // 5,6の割合
  midPositiveRate: number; // 3,4の割合
  lowPositiveRate: number; // 1,2の割合
  maxScore: number;
  minScore: number;
  averageScore: number;
}

const QuestionReport: React.FC = () => {
  const { selectedPeriod, selectedCustomerId, periods } = useCustomer();
  const { getQuestionsForCustomer } = useQuestions();
  const [questionData, setQuestionData] = useState<QuestionData[]>([]);
  const [comparisonData, setComparisonData] = useState<
    QuestionData[] | undefined
  >();
  //   const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      //   setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 設問データを生成
  useEffect(() => {
    if (selectedCustomerId) {
      const customerQuestions = getQuestionsForCustomer(selectedCustomerId);

      // 顧客IDと期間に基づいて数値を調整
      const customerMultiplier =
        selectedCustomerId === "1"
          ? 0.9
          : selectedCustomerId === "2"
          ? 1.1
          : 1.0;
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

      const data: QuestionData[] = customerQuestions
        .filter((q) => q.type === "rating") // 評定質問のみ
        .map((question, index) => {
          // ベースとなる評価分布を生成
          const baseHigh = 45 + (index % 3) * 10; // 45-65%
          const baseMid = 25 + (index % 2) * 5; // 25-30%
          const baseLow = 30 - (index % 3) * 5; // 15-30%

          // 顧客・期間による調整
          const adjustedHigh =
            Math.round(baseHigh * customerMultiplier * periodMultiplier * 10) /
            10;
          const adjustedMid =
            Math.round(baseMid * customerMultiplier * periodMultiplier * 10) /
            10;
          const adjustedLow =
            Math.round(baseLow * customerMultiplier * periodMultiplier * 10) /
            10;

          // 合計が100%になるように調整
          const total = adjustedHigh + adjustedMid + adjustedLow;
          const normalizedHigh =
            Math.round((adjustedHigh / total) * 100 * 10) / 10;
          const normalizedMid =
            Math.round((adjustedMid / total) * 100 * 10) / 10;
          const normalizedLow =
            Math.round((100 - normalizedHigh - normalizedMid) * 10) / 10;

          // スコア計算
          const baseAverage = 3.5 + (index % 3) * 0.5; // 3.5-4.5
          const adjustedAverage =
            baseAverage * customerMultiplier * periodMultiplier;
          const finalAverage = Math.round(adjustedAverage * 10) / 10;

          return {
            id: question.id,
            text: question.text,
            category: question.category,
            note: question.note,
            highPositiveRate: normalizedHigh,
            midPositiveRate: normalizedMid,
            lowPositiveRate: normalizedLow,
            maxScore: 6,
            minScore: 1,
            averageScore: finalAverage,
          };
        });

      setQuestionData(data);

      // 最新の実施日を選択している場合のみ、前回のデータを比較用に取得
      if (selectedPeriod === periods[0].value && periods.length > 1) {
        const previousPeriodMultiplier = 0.95;
        const comparisonData: QuestionData[] = customerQuestions
          .filter((q) => q.type === "rating") // 評定質問のみ
          .map((question, index) => {
            // ベースとなる評価分布を生成
            const baseHigh = 45 + (index % 3) * 10; // 45-65%
            const baseMid = 25 + (index % 2) * 5; // 25-30%
            const baseLow = 30 - (index % 3) * 5; // 15-30%

            // 顧客・期間による調整
            const adjustedHigh =
              Math.round(
                baseHigh * customerMultiplier * previousPeriodMultiplier * 10
              ) / 10;
            const adjustedMid =
              Math.round(
                baseMid * customerMultiplier * previousPeriodMultiplier * 10
              ) / 10;
            const adjustedLow =
              Math.round(
                baseLow * customerMultiplier * previousPeriodMultiplier * 10
              ) / 10;

            // 合計が100%になるように調整
            const total = adjustedHigh + adjustedMid + adjustedLow;
            const normalizedHigh =
              Math.round((adjustedHigh / total) * 100 * 10) / 10;
            const normalizedMid =
              Math.round((adjustedMid / total) * 100 * 10) / 10;
            const normalizedLow =
              Math.round((100 - normalizedHigh - normalizedMid) * 10) / 10;

            // スコア計算
            const baseAverage = 3.5 + (index % 3) * 0.5; // 3.5-4.5
            const adjustedAverage =
              baseAverage * customerMultiplier * previousPeriodMultiplier;
            const finalAverage = Math.round(adjustedAverage * 10) / 10;

            return {
              id: question.id,
              text: question.text,
              category: question.category,
              note: question.note,
              highPositiveRate: normalizedHigh,
              midPositiveRate: normalizedMid,
              lowPositiveRate: normalizedLow,
              maxScore: 6,
              minScore: 1,
              averageScore: finalAverage,
            };
          });

        setComparisonData(comparisonData);
      } else {
        setComparisonData(undefined);
      }
    }
  }, [selectedCustomerId, selectedPeriod, getQuestionsForCustomer, periods]);

  const getScoreColor = (score: number): string => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getPositiveRateColor = (
    rate: number,
    type: "high" | "mid" | "low"
  ): string => {
    if (type === "high") {
      if (rate >= 50) return "bg-green-500";
      if (rate >= 30) return "bg-green-400";
      return "bg-green-300";
    } else if (type === "mid") {
      return "bg-yellow-400";
    } else {
      if (rate >= 30) return "bg-red-500";
      if (rate >= 20) return "bg-red-400";
      return "bg-red-300";
    }
  };

  const PositiveRateBar: React.FC<{
    question: QuestionData;
    comparisonQuestion?: QuestionData;
  }> = ({ question, comparisonQuestion }) => {
    return (
      <div className="w-full">
        <div
          className="flex h-6 rounded-lg overflow-hidden border"
          style={{ borderColor: THEME_COLORS.border }}
        >
          {/* 高評価 (5-6) */}
          <div
            className={`${getPositiveRateColor(
              question.highPositiveRate,
              "high"
            )} flex items-center justify-center text-white text-xs font-medium`}
            style={{ width: `${question.highPositiveRate}%` }}
          >
            {question.highPositiveRate >= 15 && `${question.highPositiveRate}%`}
          </div>
          {/* 中評価 (3-4) */}
          <div
            className={`${getPositiveRateColor(
              question.midPositiveRate,
              "mid"
            )} flex items-center justify-center text-white text-xs font-medium`}
            style={{ width: `${question.midPositiveRate}%` }}
          >
            {question.midPositiveRate >= 15 && `${question.midPositiveRate}%`}
          </div>
          {/* 低評価 (1-2) */}
          <div
            className={`${getPositiveRateColor(
              question.lowPositiveRate,
              "low"
            )} flex items-center justify-center text-white text-xs font-medium`}
            style={{ width: `${question.lowPositiveRate}%` }}
          >
            {question.lowPositiveRate >= 15 && `${question.lowPositiveRate}%`}
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>高評価 {question.highPositiveRate}%</span>
          <span>中評価 {question.midPositiveRate}%</span>
          <span>低評価 {question.lowPositiveRate}%</span>
        </div>
        {comparisonQuestion && (
          <>
            <div
              className="flex h-6 rounded-lg overflow-hidden border mt-2"
              style={{ borderColor: THEME_COLORS.border }}
            >
              {/* 高評価 (5-6) */}
              <div
                className={`${getPositiveRateColor(
                  comparisonQuestion.highPositiveRate,
                  "high"
                )} opacity-60 flex items-center justify-center text-white text-xs font-medium`}
                style={{ width: `${comparisonQuestion.highPositiveRate}%` }}
              >
                {comparisonQuestion.highPositiveRate >= 15 &&
                  `${comparisonQuestion.highPositiveRate}%`}
              </div>
              {/* 中評価 (3-4) */}
              <div
                className={`${getPositiveRateColor(
                  comparisonQuestion.midPositiveRate,
                  "mid"
                )} opacity-60 flex items-center justify-center text-white text-xs font-medium`}
                style={{ width: `${comparisonQuestion.midPositiveRate}%` }}
              >
                {comparisonQuestion.midPositiveRate >= 15 &&
                  `${comparisonQuestion.midPositiveRate}%`}
              </div>
              {/* 低評価 (1-2) */}
              <div
                className={`${getPositiveRateColor(
                  comparisonQuestion.lowPositiveRate,
                  "low"
                )} opacity-60 flex items-center justify-center text-white text-xs font-medium`}
                style={{ width: `${comparisonQuestion.lowPositiveRate}%` }}
              >
                {comparisonQuestion.lowPositiveRate >= 15 &&
                  `${comparisonQuestion.lowPositiveRate}%`}
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>高評価 {comparisonQuestion.highPositiveRate}%</span>
              <span>中評価 {comparisonQuestion.midPositiveRate}%</span>
              <span>低評価 {comparisonQuestion.lowPositiveRate}%</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with customer selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900">
          設問別レポート
        </h1>
        <CustomerSelector showPeriod={true} />
      </div>

      {/* 凡例 */}
      <div
        className="bg-white rounded-lg shadow-sm border p-4"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          評価分布の見方
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>高評価 (5-6点)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>中評価 (3-4点)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>低評価 (1-2点)</span>
          </div>
        </div>
      </div>

      {/* 設問データテーブル */}
      <div
        className="bg-white rounded-lg shadow-sm border"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <div className="p-4 sm:p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl xl:text-2xl font-semibold text-gray-900 mb-2 sm:mb-0">
              設問別データ
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

          {questionData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              データがありません
            </div>
          ) : (
            <div className="space-y-6">
              {questionData.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: THEME_COLORS.border }}
                >
                  {/* 設問ヘッダー */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 pr-4">
                        Q{index + 1}. {question.text}
                      </h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                        {question.category}
                      </span>
                    </div>
                    {question.note && question.note.trim() !== "" && (
                      <p className="text-sm text-gray-600 italic">
                        注釈: {question.note}
                      </p>
                    )}
                  </div>

                  {/* データ表示 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 評価分布 */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        評価分布
                      </h5>
                      <PositiveRateBar
                        question={question}
                        comparisonQuestion={comparisonData?.find(
                          (q) => q.id === question.id
                        )}
                      />
                    </div>

                    {/* スコア情報 */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        スコア情報
                      </h5>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="text-xs text-gray-600 mb-1">
                            平均点
                          </div>
                          <div
                            className={`text-lg font-bold ${getScoreColor(
                              question.averageScore
                            )}`}
                          >
                            {question.averageScore}
                          </div>
                          {comparisonData?.find(
                            (q) => q.id === question.id
                          ) && (
                            <div
                              className={`text-sm font-medium mt-1 ${getScoreColor(
                                comparisonData.find((q) => q.id === question.id)
                                  ?.averageScore || 0
                              )}`}
                            >
                              (前回:{" "}
                              {
                                comparisonData.find((q) => q.id === question.id)
                                  ?.averageScore
                              }
                              )
                            </div>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-green-50">
                          <div className="text-xs text-gray-600 mb-1">
                            最高点
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {question.maxScore}
                          </div>
                          {comparisonData?.find(
                            (q) => q.id === question.id
                          ) && (
                            <div className="text-sm font-medium text-green-500 mt-1">
                              (前回:{" "}
                              {
                                comparisonData.find((q) => q.id === question.id)
                                  ?.maxScore
                              }
                              )
                            </div>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-red-50">
                          <div className="text-xs text-gray-600 mb-1">
                            最低点
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {question.minScore}
                          </div>
                          {comparisonData?.find(
                            (q) => q.id === question.id
                          ) && (
                            <div className="text-sm font-medium text-red-500 mt-1">
                              (前回:{" "}
                              {
                                comparisonData.find((q) => q.id === question.id)
                                  ?.minScore
                              }
                              )
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionReport;
