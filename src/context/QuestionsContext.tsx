import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Question } from "../types";

interface QuestionsContextType {
  questions: Question[];
  updateQuestionNote: (questionId: string, note: string) => void;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(
  undefined
);

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return context;
};

interface QuestionsProviderProps {
  children: ReactNode;
}

export const QuestionsProvider: React.FC<QuestionsProviderProps> = ({
  children,
}) => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "現在の職場環境に満足していますか？",
      type: "rating",
      category: "職場環境",
      note: "職場の物理的環境、設備、快適性について評価してください",
      order: 1,
    },
    {
      id: "2",
      text: "上司とのコミュニケーションは円滑ですか？",
      type: "rating",
      category: "コミュニケーション",
      note: "上司との意思疎通、フィードバックの質について評価してください",
      order: 2,
    },
    {
      id: "3",
      text: "仕事にやりがいを感じていますか？",
      type: "rating",
      category: "やりがい",
      note: "業務の意義、成長実感、達成感について評価してください",
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
    {
      id: "6",
      text: "ワークライフバランスは保たれていますか？",
      type: "rating",
      category: "ワークライフバランス",
      note: "労働時間と私生活のバランスについて評価してください",
      order: 6,
    },
    {
      id: "7",
      text: "会社の将来性に期待していますか？",
      type: "rating",
      category: "将来性",
      order: 7,
    },
    {
      id: "8",
      text: "今の会社を友人に勧めたいと思いますか？",
      type: "rating",
      category: "推奨度",
      order: 8,
    },
    {
      id: "9",
      text: "経営幹部への信頼はありますか？",
      type: "rating",
      category: "経営幹部への信頼",
      note: "役員、取締役、部長級以上の管理職を指します",
      order: 9,
    },
    {
      id: "10",
      text: "企業風土に満足していますか？",
      type: "rating",
      category: "企業風土",
      order: 10,
    },
    {
      id: "11",
      text: "人間関係は良好ですか？",
      type: "rating",
      category: "人間関係",
      order: 11,
    },
    {
      id: "12",
      text: "人事制度は適切だと思いますか？",
      type: "rating",
      category: "人事制度",
      order: 12,
    },
    {
      id: "13",
      text: "改革への取り組みを感じますか？",
      type: "rating",
      category: "改革の息吹",
      order: 13,
    },
    {
      id: "14",
      text: "その他、ご意見・ご要望がありましたらお聞かせください。",
      type: "text",
      category: "自由記述",
      order: 14,
    },
  ]);

  const updateQuestionNote = (questionId: string, note: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, note: note.trim() || undefined }
          : question
      )
    );
  };

  return (
    <QuestionsContext.Provider value={{ questions, updateQuestionNote }}>
      {children}
    </QuestionsContext.Provider>
  );
};
