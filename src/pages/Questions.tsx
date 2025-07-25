import React, { useState } from "react";
import { THEME_COLORS } from "../types";
import { useAuth } from "../context/AuthContext";
import { useQuestions } from "../context/QuestionsContext";
import { useCustomer } from "../context/CustomerContext";
import CustomerSelector from "../components/CustomerSelector";

const Questions: React.FC = () => {
  const { user } = useAuth();
  const { questions, updateQuestionNote } = useQuestions();
  const { selectedCustomerId } = useCustomer();

  // 権限判定：人事IDかつマスタ権限でない場合のみ編集可能
  const isMaster = user?.role === "master";
  const isHR = user?.idType === "hr" && !isMaster; // 人事IDかつ非マスタのみ

  const QUESTIONS_PER_PAGE = 10;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const [currentPage, setCurrentPage] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(
    null
  );
  const [annotationText, setAnnotationText] = useState("");
  // 配信設定用のステート追加
  const [deadline, setDeadline] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return questions.slice(startIndex, endIndex);
  };

  const currentQuestions = getCurrentPageQuestions();

  // Get annotation number for a question based on all questions with notes
  const getAnnotationNumber = (questionId: string) => {
    const questionsWithNotes = questions
      .filter((q) => q.note)
      .sort((a, b) => a.order - b.order);
    const index = questionsWithNotes.findIndex((q) => q.id === questionId);
    return index !== -1 ? index + 1 : null;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleEditAnnotation = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      setEditingAnnotation(questionId);
      setAnnotationText(question.note || "");
    }
  };

  const handleSaveAnnotation = () => {
    if (editingAnnotation) {
      updateQuestionNote(editingAnnotation, annotationText, selectedCustomerId);
      setEditingAnnotation(null);
      setAnnotationText("");
    }
  };

  const handleCancelAnnotation = () => {
    setEditingAnnotation(null);
    setAnnotationText("");
  };

  // 注釈削除処理
  const handleDeleteAnnotation = (questionId: string) => {
    if (window.confirm("この注釈を削除してもよろしいですか？")) {
      updateQuestionNote(questionId, "", selectedCustomerId);
    }
  };

  // 配信設定の保存処理（APIを使わないモック実装）
  const handleDistribute = () => {
    // APIを使わずにローカルで処理
    console.log(
      `アンケート配信設定: ${questions.length}問, 回答期限: ${deadline}`
    );
    setShowDistributionModal(false);
    alert("配信設定が完了しました");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          設問項目
        </h1>
        <div className="flex items-center space-x-3">
          <CustomerSelector />

          {/* 配信設定ボタン - 人事IDのみ */}
          {isHR && (
            <button
              onClick={() => setShowDistributionModal(true)}
              className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: THEME_COLORS.accent }}
            >
              配信設定
            </button>
          )}
        </div>
      </div>

      {/* Annotations Panel */}
      {showAnnotations && (
        <>
          {/* Overlay to close annotations when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowAnnotations(false)}
          />
          <div
            className="fixed top-32 right-4 w-80 bg-white rounded-lg shadow-lg border p-4 z-20 max-h-96 overflow-y-auto transition-all duration-300 ease-in-out"
            style={{
              borderColor: THEME_COLORS.border,
              transform: showAnnotations
                ? "translateY(0)"
                : "translateY(-20px)",
              opacity: showAnnotations ? 1 : 0,
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">注釈一覧</h3>
              <button
                onClick={() => setShowAnnotations(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {questions
                .filter((q) => q.note)
                .sort((a, b) => a.order - b.order)
                .map((question, index) => (
                  <div key={question.id} className="text-sm">
                    <div
                      className="font-medium text-left"
                      style={{ color: THEME_COLORS.status.error }}
                    >
                      ※{index + 1}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1 text-left">
                      設問 {question.order}
                    </div>
                    <div className="text-gray-600 text-left">
                      {question.note}
                    </div>
                  </div>
                ))}
              {questions.filter((q) => q.note).length === 0 && (
                <div className="text-sm text-gray-500 text-left">
                  注釈はありません
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Questions List */}
      <div
        className="bg-white rounded-lg shadow-sm p-8"
        style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">設問一覧</h3>
        </div>

        <div className="space-y-6">
          {currentQuestions.map((question) => {
            const annotationNumber = getAnnotationNumber(question.id);
            return (
              <div
                key={question.id}
                className="p-6 bg-gray-50 rounded-lg border"
                style={{ borderColor: THEME_COLORS.border }}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        設問 {question.order}
                        {annotationNumber && (
                          <span
                            className="ml-1 text-xs"
                            style={{ color: THEME_COLORS.status.error }}
                          >
                            ※{annotationNumber}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900 text-left flex-1 mb-3 sm:mb-0">
                        {question.text}
                      </h4>
                      {/* 人事IDのみ注釈追加ボタンを表示 - スマホ表示では非表示、設問の下に表示 */}
                      {!question.note &&
                        isHR &&
                        editingAnnotation !== question.id && (
                          <button
                            onClick={() => handleEditAnnotation(question.id)}
                            className="hidden sm:flex ml-4 px-3 py-1 text-xs font-medium text-white rounded transition-colors hover:opacity-90 flex-shrink-0"
                            style={{ backgroundColor: THEME_COLORS.accent }}
                          >
                            + 注釈を追加
                          </button>
                        )}
                    </div>

                    {/* スマホサイズ用の注釈追加ボタン - 設問の下に表示 */}
                    {!question.note &&
                      isHR &&
                      editingAnnotation !== question.id && (
                        <div className="sm:hidden mb-3">
                          <button
                            onClick={() => handleEditAnnotation(question.id)}
                            className="w-full px-3 py-2 text-sm font-medium text-white rounded transition-colors hover:opacity-90"
                            style={{ backgroundColor: THEME_COLORS.accent }}
                          >
                            + 注釈を追加
                          </button>
                        </div>
                      )}

                    {/* Annotation display and edit */}
                    {(question.note || editingAnnotation === question.id) && (
                      <div
                        className="mt-3 p-3 bg-gray-50 rounded-lg border"
                        style={{ borderColor: THEME_COLORS.border }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            {question.note &&
                              editingAnnotation !== question.id && (
                                <div className="text-sm font-medium text-red-600 mb-1 text-left">
                                  ※{annotationNumber}
                                </div>
                              )}
                            {editingAnnotation === question.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={annotationText}
                                  onChange={(e) =>
                                    setAnnotationText(e.target.value)
                                  }
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  style={{ borderColor: THEME_COLORS.border }}
                                  rows={3}
                                  placeholder="注釈を入力してください..."
                                  autoFocus
                                />
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                  <button
                                    onClick={handleSaveAnnotation}
                                    className="px-3 py-1 text-xs font-medium text-white rounded"
                                    style={{
                                      backgroundColor: THEME_COLORS.accent,
                                    }}
                                  >
                                    保存
                                  </button>
                                  <button
                                    onClick={handleCancelAnnotation}
                                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                  >
                                    キャンセル
                                  </button>
                                  {questions.find(
                                    (q) => q.id === editingAnnotation
                                  )?.note &&
                                    isHR && (
                                      <button
                                        onClick={() =>
                                          editingAnnotation &&
                                          handleDeleteAnnotation(
                                            editingAnnotation
                                          )
                                        }
                                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                                      >
                                        削除
                                      </button>
                                    )}
                                </div>
                              </div>
                            ) : (
                              question.note && (
                                <div className="text-sm text-gray-600 text-left mb-3 sm:mb-0">
                                  {question.note}
                                </div>
                              )
                            )}
                          </div>

                          {/* 編集・削除ボタン - デスクトップでは右側、スマホでは下に表示 */}
                          {editingAnnotation !== question.id && isHR && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-2">
                              <button
                                onClick={() =>
                                  handleEditAnnotation(question.id)
                                }
                                className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                              >
                                {question.note ? "編集" : ""}
                              </button>
                              {question.note && (
                                <button
                                  onClick={() =>
                                    handleDeleteAnnotation(question.id)
                                  }
                                  className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
                                >
                                  削除
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ borderColor: THEME_COLORS.border }}
        >
          前のページ
        </button>

        <div className="flex space-x-1">
          {(() => {
            // ページネーション表示のロジック
            const pageButtons = [];
            const showEllipsisBefore = currentPage > 3;
            const showEllipsisAfter = currentPage < totalPages - 2;

            // 常に最初のページを表示
            if (totalPages > 0) {
              pageButtons.push(
                <button
                  key={1}
                  onClick={() => handlePageClick(1)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === 1
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor:
                      currentPage === 1 ? THEME_COLORS.accent : "transparent",
                  }}
                >
                  1
                </button>
              );
            }

            // 前の省略記号
            if (showEllipsisBefore) {
              pageButtons.push(
                <span
                  key="ellipsis-before"
                  className="px-3 py-2 text-sm font-medium"
                >
                  ...
                </span>
              );
            }

            // 中間のページ
            for (
              let i = Math.max(2, currentPage - 1);
              i <= Math.min(totalPages - 1, currentPage + 1);
              i++
            ) {
              if (i === 1 || i === totalPages) continue; // 最初と最後のページは別に処理
              pageButtons.push(
                <button
                  key={i}
                  onClick={() => handlePageClick(i)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === i
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor:
                      currentPage === i ? THEME_COLORS.accent : "transparent",
                  }}
                >
                  {i}
                </button>
              );
            }

            // 後の省略記号
            if (showEllipsisAfter) {
              pageButtons.push(
                <span
                  key="ellipsis-after"
                  className="px-3 py-2 text-sm font-medium"
                >
                  ...
                </span>
              );
            }

            // 常に最後のページを表示（ページが1以上ある場合）
            if (totalPages > 1) {
              pageButtons.push(
                <button
                  key={totalPages}
                  onClick={() => handlePageClick(totalPages)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor:
                      currentPage === totalPages
                        ? THEME_COLORS.accent
                        : "transparent",
                  }}
                >
                  {totalPages}
                </button>
              );
            }

            return pageButtons;
          })()}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ borderColor: THEME_COLORS.border }}
        >
          次のページ
        </button>
      </div>

      {/* Distribution Settings Modal */}
      {showDistributionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border"
            style={{ borderColor: THEME_COLORS.border }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{ borderColor: THEME_COLORS.border }}
            >
              <h3 className="text-lg font-semibold text-gray-900">配信設定</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                現在の設問（{questions.length}問）でアンケートを配信しますか？
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    回答期限
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ borderColor: THEME_COLORS.border }}
                    min={new Date().toISOString().split("T")[0]}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div
              className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3"
              style={{ borderColor: THEME_COLORS.border }}
            >
              <button
                onClick={() => setShowDistributionModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDistribute}
                className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: THEME_COLORS.accent }}
              >
                配信開始
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
