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
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900">
            設問項目
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 xl:space-x-4 mt-3 sm:mt-0">
          <CustomerSelector />
          {/* Annotations Button - Always visible */}
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="bg-white text-gray-700 text-sm font-medium py-2 px-4 rounded-lg shadow-lg border transition-colors duration-200 hover:bg-gray-50 w-full sm:w-auto"
            style={{ borderColor: THEME_COLORS.border }}
          >
            注釈 {showAnnotations ? "▼" : "▶"}
          </button>
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
        <div
          className="fixed top-32 right-4 w-80 bg-white rounded-lg shadow-lg border p-4 z-20 max-h-96 overflow-y-auto"
          style={{ borderColor: THEME_COLORS.border }}
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div
                        className="font-medium text-left"
                        style={{ color: THEME_COLORS.status.error }}
                      >
                        ※{index + 1}
                      </div>
                      <div className="text-gray-600 text-left">
                        {question.note}
                      </div>
                    </div>
                    {/* 人事IDのみ削除ボタンを表示 */}
                    {isHR && (
                      <button
                        onClick={() => handleDeleteAnnotation(question.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                        title="注釈を削除"
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
              ))}
            {questions.filter((q) => q.note).length === 0 && (
              <div className="text-sm text-gray-500">注釈はありません</div>
            )}
          </div>
        </div>
      )}

      {/* Questions List */}
      <div
        className="bg-white rounded-lg shadow-sm border"
        style={{ borderColor: THEME_COLORS.border }}
      >
        <div
          className="px-6 py-4 bg-gray-50 border-b"
          style={{ borderColor: THEME_COLORS.border }}
        >
          <h3 className="text-lg font-semibold text-gray-900">設問一覧</h3>
        </div>
        <div className="divide-y" style={{ borderColor: THEME_COLORS.border }}>
          {currentQuestions.map((question) => {
            const annotationNumber = getAnnotationNumber(question.id);
            return (
              <div key={question.id} className="p-6">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {question.order}
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
                    <h4 className="text-lg font-medium text-gray-900 mb-2 text-left">
                      {question.text}
                    </h4>

                    {/* Annotation display and edit */}
                    {(question.note || editingAnnotation === question.id) && (
                      <div
                        className="mt-3 p-3 bg-gray-50 rounded-lg border"
                        style={{ borderColor: THEME_COLORS.border }}
                      >
                        <div className="flex items-start justify-between">
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
                                  className="w-full px-3 py-2 border rounded-lg text-sm text-left"
                                  style={{ borderColor: THEME_COLORS.border }}
                                  rows={3}
                                  placeholder="注釈を入力してください..."
                                  autoFocus
                                />
                                <div className="flex space-x-2">
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
                                </div>
                              </div>
                            ) : (
                              question.note && (
                                <div className="text-sm text-gray-600 text-left">
                                  {question.note}
                                </div>
                              )
                            )}
                          </div>
                          {/* 人事IDのみ編集・削除ボタンを表示 */}
                          {isHR && editingAnnotation !== question.id && (
                            <div className="flex space-x-2 ml-2">
                              <button
                                onClick={() =>
                                  handleEditAnnotation(question.id)
                                }
                                className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                              >
                                {question.note ? "編集" : "注釈を追加"}
                              </button>
                              {question.note && (
                                <button
                                  onClick={() =>
                                    handleDeleteAnnotation(question.id)
                                  }
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="注釈を削除"
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
                          )}
                        </div>
                      </div>
                    )}

                    {/* 人事IDのみ注釈追加ボタンを表示 */}
                    {!question.note &&
                      isHR &&
                      editingAnnotation !== question.id && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleEditAnnotation(question.id)}
                            className="px-3 py-1 text-xs font-medium text-white rounded transition-colors hover:opacity-90 flex-shrink-0"
                            style={{ backgroundColor: THEME_COLORS.accent }}
                          >
                            + 注釈を追加
                          </button>
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
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: THEME_COLORS.border }}
        >
          前のページ
        </button>

        <div className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === index + 1
                  ? "text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              style={{
                backgroundColor:
                  currentPage === index + 1
                    ? THEME_COLORS.accent
                    : "transparent",
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: THEME_COLORS.border }}
        >
          次のページ
        </button>
      </div>

      {/* Distribution Settings Modal */}
      {showDistributionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
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
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: THEME_COLORS.border }}
                    min={new Date().toISOString().split("T")[0]}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div
              className="px-6 py-4 bg-gray-50 border-t flex justify-center space-x-3"
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
                className="px-4 py-2 text-white rounded-lg transition-colors"
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
