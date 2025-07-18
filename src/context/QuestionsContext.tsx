import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Question } from "../types";

interface QuestionsContextType {
  questions: Question[];
  updateQuestionNote: (
    questionId: string,
    note: string,
    customerId: string
  ) => void;
  getQuestionsForCustomer: (customerId: string) => Question[];
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
  selectedCustomerId: string;
}

// LocalStorageのキー
const STORAGE_KEY = "kizu_navi_customer_annotations";

// LocalStorageから注釈データを読み込む関数
const loadAnnotationsFromStorage = (): {
  [customerId: string]: { [questionId: string]: string };
} => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load annotations from localStorage:", error);
    return {};
  }
};

// LocalStorageに注釈データを保存する関数
const saveAnnotationsToStorage = (annotations: {
  [customerId: string]: { [questionId: string]: string };
}) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  } catch (error) {
    console.error("Failed to save annotations to localStorage:", error);
  }
};

export const QuestionsProvider: React.FC<QuestionsProviderProps> = ({
  children,
  selectedCustomerId,
}) => {
  // 初期データ（デフォルト注釈）
  const defaultAnnotations = {
    "1": {
      "1": "株式会社サンプル様向け：オフィス移転により環境が変化しています",
      "2": "定期面談の頻度について特に注目してください",
    },
    "2": {
      "1": "株式会社テスト様向け：新しいオープンオフィス導入の効果を評価してください",
      "3": "新規事業立ち上げによる業務変化を考慮してください",
      "6": "リモートワーク制度の導入効果について評価してください",
    },
    "3": {
      "1": "qqq様向け：職場の物理的環境、設備、快適性について評価してください",
      "2": "上司との意思疎通、フィードバックの質について評価してください",
      "3": "業務の意義、成長実感、達成感について評価してください",
      "6": "労働時間と私生活のバランスについて評価してください",
      "9": "役員、取締役、部長級以上の管理職を指します",
    },
  };

  // LocalStorageから読み込んだデータとデフォルトデータをマージ
  const initializeAnnotations = (): {
    [customerId: string]: { [questionId: string]: string };
  } => {
    const storedAnnotations = loadAnnotationsFromStorage();
    const mergedAnnotations: {
      [customerId: string]: { [questionId: string]: string };
    } = { ...defaultAnnotations };

    // 既存のデータがある場合はマージ
    Object.keys(storedAnnotations).forEach((customerId) => {
      mergedAnnotations[customerId] = {
        ...mergedAnnotations[customerId],
        ...storedAnnotations[customerId],
      };
    });

    return mergedAnnotations;
  };

  // 顧客別注釈を管理するstate
  const [customerAnnotations, setCustomerAnnotations] = useState<{
    [customerId: string]: { [questionId: string]: string };
  }>(() => initializeAnnotations());

  const [questions] = useState<Question[]>([
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
    {
      id: "6",
      text: "ワークライフバランスは保たれていますか？",
      type: "rating",
      category: "ワークライフバランス",
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

  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);

  const updateQuestionNote = (
    questionId: string,
    note: string,
    customerId: string
  ) => {
    const updatedAnnotations = {
      ...customerAnnotations,
      [customerId]: {
        ...customerAnnotations[customerId],
        [questionId]: note.trim() || "",
      },
    };

    setCustomerAnnotations(updatedAnnotations);
    // LocalStorageに保存
    saveAnnotationsToStorage(updatedAnnotations);
  };

  // 特定の顧客向けの質問リストを取得（注釈付き）
  const getQuestionsForCustomer = (customerId: string): Question[] => {
    const annotations = customerAnnotations[customerId] || {};

    return questions.map((question) => ({
      ...question,
      note: annotations[question.id] || undefined,
    }));
  };

  // selectedCustomerId が変更されたときに質問リストを更新
  useEffect(() => {
    setCurrentQuestions(getQuestionsForCustomer(selectedCustomerId));
  }, [selectedCustomerId, customerAnnotations]);

  return (
    <QuestionsContext.Provider
      value={{
        questions: currentQuestions,
        updateQuestionNote,
        getQuestionsForCustomer,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};
