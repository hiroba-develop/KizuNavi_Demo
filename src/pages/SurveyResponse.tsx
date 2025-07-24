import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuestions } from "../context/QuestionsContext";
// import { useCustomer } from "../context/CustomerContext";
import type { Answer, Survey } from "../types";
import { THEME_COLORS } from "../types";

const SurveyResponsePage: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const { user, logout } = useAuth();
  const { questions, getQuestionsForCustomer } = useQuestions();
  // const { selectedCustomerId } = useCustomer();

  // トークンアクセスの場合はデフォルト顧客（"3"）、認証ユーザーの場合は選択された顧客
  // const currentCustomerId = token ? "3" : selectedCustomerId;
  const activeQuestions = token ? getQuestionsForCustomer("3") : questions;

  const [survey, setSurvey] = useState<Survey | null>(null);

  const QUESTIONS_PER_PAGE = 10;
  const totalPages = Math.ceil(activeQuestions.length / QUESTIONS_PER_PAGE);

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [visibleAnnotation, setVisibleAnnotation] = useState<string | null>(
    null
  );

  const ratingLabels = [
    "該当しない",
    "全く思わない",
    "思わない",
    "あまり思わない",
    "少し思う",
    "そう思う",
    "強くそう思う",
  ];

  // Get annotation number for a question based on all questions with notes
  // const getAnnotationNumber = (questionId: string) => {
  //   const questionsWithNotes = activeQuestions
  //     .filter((q) => q.note)
  //     .sort((a, b) => a.order - b.order);
  //   const index = questionsWithNotes.findIndex((q) => q.id === questionId);
  //   return index !== -1 ? index + 1 : null;
  // };

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Mock survey loading - simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        let surveyData: Survey;

        if (token) {
          // Mock: Access via email link token
          surveyData = {
            id: "survey-1",
            title: "エンゲージメントサーベイ",
            companyId: "mock-company-1",
            deadline: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "published",
            targetEmployeeCount: 100,
            implementationDate: new Date().toISOString(),
            questions: questions,
            createdAt: new Date().toISOString(),
          };
        } else if (user?.companyId) {
          // Mock: Access via authenticated user - get latest survey
          const mockSurveys = [
            {
              id: "survey-1",
              title: "エンゲージメントサーベイ",
              companyId: user.companyId,
              deadline: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: "published" as const,
              targetEmployeeCount: 100,
              implementationDate: new Date().toISOString(),
              questions: questions,
              createdAt: new Date().toISOString(),
            },
          ];

          const activeSurvey = mockSurveys.find(
            (s) => s.status === "published"
          );
          if (!activeSurvey) {
            throw new Error("アクティブなサーベイが見つかりません");
          }
          surveyData = activeSurvey;
        } else {
          throw new Error("サーベイにアクセスできません");
        }

        setSurvey(surveyData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "サーベイの読み込みに失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [token, user?.companyId, questions]);

  useEffect(() => {
    // Initialize answers array with empty state
    if (activeQuestions.length > 0) {
      setAnswers(
        activeQuestions.map((question) => ({
          questionId: question.id,
          value: question.type === "text" ? "" : -1, // -1 means no selection for rating
        }))
      );
    }
  }, [activeQuestions]);

  const handleRatingChange = (questionId: string, rating: number) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId ? { ...answer, value: rating } : answer
      )
    );
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId ? { ...answer, value: text } : answer
      )
    );
  };

  const getCurrentAnswer = (questionId: string): number | string => {
    const answer = answers.find((a) => a.questionId === questionId);
    const question = activeQuestions.find((q) => q.id === questionId);
    if (question?.type === "text") {
      return answer ? answer.value : "";
    }
    return answer ? answer.value : -1; // -1 means no selection
  };

  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return activeQuestions.slice(startIndex, endIndex);
  };

  const canProceed = () => {
    const currentPageQuestions = getCurrentPageQuestions();
    return currentPageQuestions.every((question) => {
      const answer = getCurrentAnswer(question.id);
      if (question.type === "rating") {
        return Number(answer) >= 0; // 0 is valid answer (該当しない)
      } else {
        return String(answer).trim() !== "";
      }
    });
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = answers.filter((answer) => {
      const question = activeQuestions.find((q) => q.id === answer.questionId);
      if (question?.type === "rating") {
        return Number(answer.value) === -1; // -1 means no selection
      } else {
        return String(answer.value).trim() === "";
      }
    });

    if (unansweredQuestions.length > 0) {
      setError("すべての質問に回答してください。");
      return;
    }

    if (!survey) {
      setError("サーベイ情報が見つかりません。");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Filter out unselected answers and convert to proper format
      const validAnswers = answers.filter((answer) => {
        const question = activeQuestions.find(
          (q) => q.id === answer.questionId
        );
        if (question?.type === "rating") {
          return Number(answer.value) >= 0; // 0 is valid (該当しない)
        } else {
          return String(answer.value).trim() !== "";
        }
      });

      // Mock submission - simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (token) {
        // Mock: Submit via token (email link access)
        console.log("Mock: Survey submitted via token", {
          token,
          answers: validAnswers,
        });
      } else if (user?.id) {
        // Mock: Submit via authenticated user
        console.log("Mock: Survey submitted via authenticated user", {
          surveyId: survey.id,
          userId: user.id,
          answers: validAnswers,
        });
      } else {
        throw new Error("認証情報が見つかりません");
      }

      setIsCompleted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "回答の送信に失敗しました。もう一度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // const toggleAnnotation = (questionId: string) => {
  //   if (visibleAnnotation === questionId) {
  //     setVisibleAnnotation(null);
  //   } else {
  //     setVisibleAnnotation(questionId);
  //   }
  // };

  // Show loading state
  if (isLoading && !survey) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: `${THEME_COLORS.main}10` }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">サーベイを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !survey) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: `${THEME_COLORS.main}10` }}
      >
        <div className="text-center max-w-md mx-auto">
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
          <p className="text-red-600 font-medium mb-2">
            サーベイの読み込みに失敗しました
          </p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
        style={{ backgroundColor: `${THEME_COLORS.main}10` }}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logout Button for completed screen */}
          <div className="flex justify-end mb-4">
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              ログアウト
            </button>
          </div>

          <div
            className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center"
            style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${THEME_COLORS.status.success}20` }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: THEME_COLORS.status.success }}
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
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">回答完了</h2>
            <p className="text-gray-600 mb-6">
              エンゲージメントサーベイへのご回答ありがとうございました。
              <br />
              皆様の貴重なご意見をもとに、より良い職場環境づくりに取り組んでまいります。
            </p>
            <p className="text-sm text-gray-500">
              回答結果は匿名で処理され、分析結果は後日共有いたします。
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = (currentPage / totalPages) * 100;

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      style={{ backgroundColor: `${THEME_COLORS.main}10` }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        {/* Header with Logout */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center mb-4">
              <svg
                width="120"
                height="28"
                viewBox="0 0 2077 523"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 sm:mr-3 sm:w-[150px] sm:h-[36px] lg:w-[200px] lg:h-[48px]"
              >
                <path
                  d="M430.746 34.6782C430.281 32.5087 429.739 30.6492 429.119 28.8671L440.121 27.085C440.276 28.5572 440.586 31.1915 440.896 33.0511C441.671 38.1649 449.341 77.3705 450.968 85.2736C451.511 87.5206 452.208 90.3099 452.906 92.8668L441.748 94.8039C441.361 91.937 441.206 89.3027 440.663 86.9782C439.501 80.0049 431.986 40.9542 430.746 34.6782ZM409.593 44.5958C411.995 44.4409 414.32 44.2859 416.799 43.976C423.385 43.2012 450.504 39.0172 457.477 37.6225C459.879 37.2351 462.823 36.5378 464.683 35.9954L466.62 46.223C464.915 46.3004 461.738 46.7653 459.414 47.0753C451.201 48.3924 424.547 52.6539 418.736 53.6612C416.334 54.1261 414.32 54.591 411.685 55.2883L409.593 44.5958ZM409.671 67.2979C411.685 67.2204 415.25 66.833 417.651 66.4456C425.942 65.2834 454.223 60.712 463.133 59.0074C466.155 58.465 469.022 57.7677 471.114 57.2253L473.128 67.4529C471.036 67.6079 467.859 68.1502 464.993 68.6151C455.153 70.0873 427.259 74.6587 419.588 76.1308C416.257 76.7507 413.545 77.2156 411.84 77.6804L409.671 67.2979ZM586.019 25.6129C588.033 28.5572 590.9 33.516 592.14 36.2279L585.941 38.8622C584.314 35.6855 581.99 31.269 579.898 28.0923L586.019 25.6129ZM595.781 22.901C597.796 25.7678 600.663 30.7267 602.057 33.4385L595.859 36.0729C594.232 32.8187 591.675 28.3247 589.66 25.3804L595.781 22.901ZM589.505 39.4046C588.886 40.2569 587.491 42.5813 586.794 44.2084C583.617 51.5692 577.883 62.1067 571.22 69.8548C562.542 79.8499 550.842 89.4576 538.833 95.1913L530.774 86.8233C543.326 82.0969 555.259 72.7216 562.542 64.5861C567.656 58.775 572.382 51.1043 574.164 45.6031C570.91 45.6031 551.152 45.6031 547.82 45.6031C544.644 45.6031 540.382 45.9905 538.678 46.1455V35.0656C540.77 35.3756 545.573 35.6855 547.82 35.6855C551.927 35.6855 571.762 35.6855 575.171 35.6855C578.581 35.6855 581.602 35.2206 583.229 34.6782L589.505 39.4046ZM572.227 63.4238C580.208 69.9323 591.21 81.477 596.246 87.6756L587.413 95.3462C581.68 87.3656 573.234 78.1453 564.944 70.6296L572.227 63.4238ZM685.97 37.7775C685.97 35.2206 685.66 31.1915 684.963 28.7121H697.205C696.817 31.1915 696.585 35.453 696.585 37.855C696.585 42.1939 696.585 48.005 696.585 53.1963C696.585 70.0098 692.246 83.8015 674.503 94.4164L664.817 87.2881C681.166 79.7724 685.97 67.6079 685.97 53.1963C685.97 48.005 685.97 42.1164 685.97 37.7775ZM657.147 45.7581C659.549 46.068 662.725 46.3004 665.825 46.3004C670.241 46.3004 709.292 46.3004 714.018 46.3004C717.582 46.3004 720.914 46.068 722.541 45.8356V56.4505C720.914 56.2956 717.04 56.1406 713.941 56.1406C709.292 56.1406 670.241 56.1406 666.057 56.1406C662.725 56.1406 659.626 56.2956 657.147 56.528V45.7581ZM831.635 27.24C833.572 30.1068 836.284 34.9881 837.756 37.855L831.558 40.5668C829.93 37.3901 827.606 32.8187 825.514 29.7969L831.635 27.24ZM840.778 23.7533C842.792 26.6976 845.659 31.579 847.054 34.2908L840.855 37.0027C839.306 33.7484 836.749 29.2545 834.657 26.3102L840.778 23.7533ZM798.163 30.6492C797.853 32.9736 797.621 36.4603 797.621 38.7073C797.621 43.4336 797.621 71.9468 797.621 77.7579C797.621 81.1671 799.17 82.0194 802.657 82.6393C804.981 83.0267 808.158 83.1041 811.567 83.1041C819.703 83.1041 832.177 82.1744 838.608 80.4698V91.7821C831.248 92.8668 819.548 93.3317 811.025 93.3317C805.989 93.3317 801.262 93.0218 797.931 92.4794C791.267 91.2397 787.316 87.5981 787.316 80.8572C787.316 71.9468 787.316 43.5111 787.316 38.7073C787.316 36.9252 787.083 32.9736 786.773 30.6492H798.163ZM793.049 54.436C803.044 52.2665 816.294 48.0825 824.429 44.7508C827.141 43.5886 829.775 42.3489 832.875 40.5668L836.981 50.3295C834.037 51.5692 830.55 53.0413 827.993 54.0486C818.851 57.5353 803.664 62.1067 793.127 64.5861L793.049 54.436Z"
                  fill="#5C5C5C"
                />
                <path
                  d="M539.551 363.578C534.799 363.578 530.976 361.616 528.083 357.69L450.912 258.204L474.776 234.029L553.497 336.615C555.977 339.921 557.217 343.537 557.217 347.462C557.217 352.421 555.357 356.347 551.638 359.24C547.919 362.132 543.89 363.578 539.551 363.578ZM541.1 145.391C545.233 145.391 548.642 147.044 551.328 150.349C554.014 153.655 555.357 157.064 555.357 160.577C555.357 164.296 553.807 167.705 550.708 170.805L417.13 297.564L415.27 260.993L528.703 151.279C532.422 147.353 536.555 145.391 541.1 145.391ZM404.423 363.269C399.671 363.269 395.745 361.822 392.646 358.93C389.753 355.83 388.307 352.008 388.307 347.462V162.127C388.307 157.581 389.857 153.862 392.956 150.969C396.055 147.87 400.084 146.32 405.043 146.32C409.795 146.32 413.618 147.87 416.51 150.969C419.403 153.862 420.849 157.581 420.849 162.127V347.462C420.642 352.008 419.093 355.83 416.2 358.93C413.308 361.822 409.382 363.269 404.423 363.269ZM681.221 347.462C681.221 352.008 679.774 355.83 676.882 358.93C673.989 361.822 670.27 363.269 665.725 363.269C661.386 363.269 657.666 361.822 654.567 358.93C651.675 355.83 650.228 352.008 650.228 347.462V214.814C650.228 210.268 651.675 206.549 654.567 203.657C657.666 200.557 661.386 199.008 665.725 199.008C670.27 199.008 673.989 200.557 676.882 203.657C679.774 206.549 681.221 210.268 681.221 214.814V347.462ZM665.415 178.553C659.423 178.553 655.084 177.52 652.398 175.453C649.712 173.181 648.369 169.462 648.369 164.296V159.337C648.369 154.172 649.815 150.556 652.708 148.49C655.6 146.424 659.939 145.391 665.725 145.391C671.923 145.391 676.365 146.527 679.051 148.8C681.737 150.866 683.08 154.378 683.08 159.337V164.296C683.08 169.668 681.634 173.387 678.741 175.453C676.055 177.52 671.613 178.553 665.415 178.553ZM888.411 334.755C892.543 334.755 895.953 336.098 898.639 338.784C901.531 341.47 902.978 344.88 902.978 349.012C902.978 352.938 901.531 356.347 898.639 359.24C895.953 361.926 892.543 363.269 888.411 363.269H788.305C783.966 363.269 780.454 361.719 777.768 358.62C775.082 355.314 773.842 352.111 774.048 349.012C774.255 346.533 774.565 344.363 774.978 342.504C775.598 340.437 776.941 338.165 779.007 335.685L861.758 225.971V229.69H792.644C788.512 229.69 784.999 228.347 782.107 225.661C779.421 222.769 778.077 219.36 778.077 215.434C778.077 211.302 779.421 207.892 782.107 205.206C784.999 202.52 788.512 201.177 792.644 201.177H888.101C892.027 201.177 895.333 202.727 898.019 205.826C900.911 208.719 902.151 212.335 901.738 216.674C901.738 218.533 901.428 220.393 900.808 222.252C900.395 223.905 899.259 225.868 897.399 228.141L815.888 336.615L814.649 334.755H888.411ZM1117.89 200.248C1122.23 200.248 1125.84 201.797 1128.73 204.896C1131.83 207.789 1133.38 211.508 1133.38 216.054V297.564C1133.38 319.052 1127.39 335.892 1115.41 348.082C1103.42 360.066 1086.48 366.058 1064.58 366.058C1042.89 366.058 1026.05 360.066 1014.06 348.082C1002.28 335.892 996.396 319.052 996.396 297.564V216.054C996.396 211.508 997.842 207.789 1000.74 204.896C1003.63 201.797 1007.35 200.248 1011.89 200.248C1016.23 200.248 1019.85 201.797 1022.74 204.896C1025.84 207.789 1027.39 211.508 1027.39 216.054V297.564C1027.39 310.994 1030.49 321.015 1036.69 327.627C1043.09 334.239 1052.39 337.545 1064.58 337.545C1076.98 337.545 1086.38 334.239 1092.78 327.627C1099.19 321.015 1102.39 310.994 1102.39 297.564V216.054C1102.39 211.508 1103.84 207.789 1106.73 204.896C1109.62 201.797 1113.34 200.248 1117.89 200.248ZM1798.1 198.698C1801.2 198.698 1804.09 199.524 1806.78 201.177C1809.67 202.83 1811.74 205.31 1812.98 208.616L1861.63 321.119L1855.75 323.908L1905.02 208.925C1907.92 202.107 1912.56 198.801 1918.97 199.008C1923.1 199.008 1926.51 200.351 1929.2 203.037C1932.09 205.516 1933.54 208.822 1933.54 212.954C1933.54 214.194 1933.33 215.537 1932.92 216.984C1932.5 218.223 1931.99 219.463 1931.37 220.703L1872.48 353.351C1869.8 359.549 1865.35 362.855 1859.15 363.269C1856.06 363.682 1852.96 363.062 1849.86 361.409C1846.96 359.549 1844.69 356.863 1843.04 353.351L1784.46 220.703C1784.05 219.876 1783.64 218.843 1783.22 217.603C1782.81 216.157 1782.6 214.504 1782.6 212.645C1782.6 209.545 1783.95 206.446 1786.63 203.347C1789.52 200.248 1793.35 198.698 1798.1 198.698ZM2056.2 347.462C2056.2 352.008 2054.75 355.83 2051.86 358.93C2048.97 361.822 2045.25 363.269 2040.7 363.269C2036.36 363.269 2032.64 361.822 2029.55 358.93C2026.65 355.83 2025.21 352.008 2025.21 347.462V214.814C2025.21 210.268 2026.65 206.549 2029.55 203.657C2032.64 200.557 2036.36 199.008 2040.7 199.008C2045.25 199.008 2048.97 200.557 2051.86 203.657C2054.75 206.549 2056.2 210.268 2056.2 214.814V347.462ZM2040.39 178.553C2034.4 178.553 2030.06 177.52 2027.38 175.453C2024.69 173.181 2023.35 169.462 2023.35 164.296V159.337C2023.35 154.172 2024.79 150.556 2027.69 148.49C2030.58 146.424 2034.92 145.391 2040.7 145.391C2046.9 145.391 2051.34 146.527 2054.03 148.8C2056.72 150.866 2058.06 154.378 2058.06 159.337V164.296C2058.06 169.668 2056.61 173.387 2053.72 175.453C2051.03 177.52 2046.59 178.553 2040.39 178.553Z"
                  fill="#1E1E1E"
                />
                <path
                  d="M115.089 53.9083C47.971 78.1576 0 142.435 0 217.917C0 314.198 78.0517 392.25 174.333 392.25C191.992 392.25 209.038 389.625 225.101 384.743L170.73 313.733C153.941 311.692 138.848 301.725 130.487 286.521L129.719 285.124C101.168 277.694 51.9505 254.623 61.1979 214.841C62.6328 208.668 63.8943 202.712 65.0963 197.036C71.9344 164.75 76.8456 141.561 100.777 139.419C145.277 137.677 163.262 155.153 156.863 182.679L141.912 246.999L155.946 272.52C160.567 280.921 169.709 285.804 179.26 284.974L183.767 284.582L184.547 283.985L184.927 284.481L216.494 281.736C229.921 280.568 239.811 268.661 238.493 255.247L236.709 237.082C233.721 237.14 230.689 236.963 227.634 236.536C196.443 232.17 174.697 203.347 179.062 172.156C180.575 161.35 185.023 151.677 191.488 143.831L115.089 53.9083ZM267.41 252.407L265.094 228.831C279.233 220.251 289.542 205.62 292.013 187.964C296.378 156.773 274.632 127.95 243.441 123.585C233.533 122.198 223.864 123.446 215.141 126.795L146.342 45.8187C155.456 44.3479 164.805 43.5835 174.333 43.5835C270.615 43.5835 348.667 121.635 348.667 217.917C348.667 285.862 309.797 344.728 253.082 373.493L205.864 311.826L219.011 310.682C248.552 308.114 270.308 281.917 267.41 252.407ZM270.239 343.593C280.415 345.017 289.818 337.923 291.242 327.747C292.666 317.572 285.572 308.169 275.396 306.744C265.221 305.32 255.817 312.415 254.393 322.59C252.969 332.766 260.064 342.169 270.239 343.593ZM112.066 109.831C110.642 120.006 101.239 127.101 91.0634 125.676C80.8879 124.252 73.7934 114.849 75.2175 104.674C76.6415 94.4982 86.0448 87.4037 96.2203 88.8278C106.396 90.2518 113.49 99.6551 112.066 109.831Z"
                  fill="url(#paint0_linear_49_44)"
                />
                <path
                  d="M271.892 178.717C271.892 197.691 256.968 213.073 237.994 213.073C219.02 213.073 204.096 197.691 204.096 178.717C204.096 159.742 219.02 144.36 237.994 144.36C256.968 144.36 271.892 159.742 271.892 178.717Z"
                  fill="#5BC1E0"
                />
                <path
                  d="M132.343 191.395C135.929 175.965 129.185 162.734 108.732 164.755C93.8515 171.46 92.8473 190.107 87.4673 213.251C82.0873 236.396 105.223 245.804 117.862 248.742C120.851 235.884 128.756 206.824 132.343 191.395Z"
                  fill="#5BC1E0"
                />
                <circle
                  cx="1396.47"
                  cy="172.056"
                  r="28.1926"
                  transform="rotate(7.96676 1396.47 172.056)"
                  stroke="#71D3D8"
                  strokeWidth="24.213"
                />
                <path
                  d="M1352.28 251.741L1413.72 329.927C1418.32 335.785 1424.78 339.896 1432.04 341.581V341.581C1452.55 346.343 1472.15 330.772 1472.15 309.718L1472.15 300.047"
                  stroke="#71D3D8"
                  strokeWidth="29.0556"
                />
                <path
                  d="M1230.77 83.4943V83.4943C1230.77 59.2343 1252.85 40.965 1276.68 45.5047L1282.45 46.6026C1291.34 48.2959 1299.35 53.0475 1305.1 60.0331L1375.3 145.278M1322.03 225.181L1327.71 235.653C1335.06 249.206 1349.76 257.107 1365.12 255.771L1372.49 255.13C1393.96 253.263 1409.78 234.232 1407.69 212.781L1406.77 203.389"
                  stroke="#2C9AEF"
                  strokeWidth="29.0556"
                />
                <path
                  d="M1336.09 177.232C1340.04 160.272 1330.22 149.798 1305.34 151.461C1287.38 158.46 1288.13 172.787 1282.22 198.228C1276.3 223.669 1305.81 237.233 1321.31 240.835L1336.09 177.232Z"
                  stroke="#71D3D8"
                  strokeWidth="24.213"
                />
                <path
                  d="M1216.08 343.631C1216.08 351.654 1222.58 358.159 1230.6 358.159C1238.63 358.159 1245.13 351.654 1245.13 343.631L1216.08 343.631ZM1216.08 82.1309L1216.08 343.631L1245.13 343.631L1245.13 82.1309L1216.08 82.1309Z"
                  fill="#2C9AEF"
                />
                <path
                  d="M1487.26 43.4233C1487.28 35.3999 1480.79 28.8807 1472.77 28.8624C1464.74 28.8441 1458.23 35.3335 1458.21 43.3569L1487.26 43.4233ZM1458.21 43.3569L1457.62 300.014L1486.68 300.081L1487.26 43.4233L1458.21 43.3569Z"
                  fill="#71D3D8"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1573.74 253.101L1548.03 236.93C1542.17 249.022 1539.24 262.944 1539.24 278.696C1539.24 295.019 1542.55 309.585 1549.16 322.395C1555.77 335.206 1564.76 345.33 1576.12 352.768C1587.49 360 1600.3 363.616 1614.55 363.616C1622.61 363.616 1630.15 362.273 1637.18 359.586C1644.2 356.694 1650.3 353.181 1655.46 349.049C1659.6 345.572 1663.01 342.03 1665.69 338.42V344.71C1665.69 349.256 1667.14 353.078 1670.03 356.177C1673.13 359.07 1676.85 360.516 1681.19 360.516C1685.73 360.516 1689.45 359.07 1692.34 356.177C1695.24 353.078 1696.68 349.256 1696.68 344.71V210.822C1696.68 206.276 1695.24 202.557 1692.34 199.665C1689.45 196.565 1685.73 195.016 1681.19 195.016C1676.85 195.016 1673.13 196.565 1670.03 199.665C1667.14 202.764 1665.69 206.483 1665.69 210.822V216.773C1663.49 214.185 1660.9 211.685 1657.94 209.272C1652.36 204.727 1645.75 201.008 1638.11 198.115C1630.89 195.307 1622.98 193.862 1614.4 193.78L1614.4 222.409C1615.57 222.329 1616.76 222.289 1617.96 222.289C1627.67 222.289 1636.25 224.769 1643.69 229.728C1651.12 234.686 1656.91 241.401 1661.04 249.873C1665.17 258.344 1667.24 267.952 1667.24 278.696C1667.24 289.233 1665.17 298.841 1661.04 307.519C1656.91 315.99 1651.12 322.705 1643.69 327.664C1636.25 332.623 1627.67 335.102 1617.96 335.102C1608.46 335.102 1599.99 332.623 1592.55 327.664C1585.32 322.705 1579.53 315.99 1575.19 307.519C1571.06 298.841 1568.99 289.233 1568.99 278.696C1568.99 269.294 1570.58 260.763 1573.74 253.101Z"
                  fill="#1E1E1E"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1589.19 232.238C1590.27 231.356 1591.39 230.519 1592.55 229.727C1599.04 225.397 1606.33 222.957 1614.4 222.409L1614.4 193.78C1614.14 193.777 1613.88 193.776 1613.62 193.776C1599.78 193.776 1587.18 197.392 1575.81 204.623C1575.41 204.881 1575.02 205.142 1574.63 205.407L1589.19 232.238Z"
                  fill="#2C9AEF"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1548.02 236.945C1548.39 236.185 1548.77 235.432 1549.16 234.686C1555.53 222.333 1564.02 212.573 1574.63 205.407L1589.19 232.238C1583.5 236.877 1578.84 242.755 1575.19 249.873C1574.67 250.934 1574.19 252.013 1573.74 253.11L1548.02 236.945Z"
                  fill="#71D3D8"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_49_44"
                    x1="174.333"
                    y1="43.5835"
                    x2="174.333"
                    y2="392.25"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#2C9AEF" />
                    <stop offset="1" stopColor="#A6FFC6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              エンゲージメントサーベイ
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              ページ {currentPage} / {totalPages} （質問{" "}
              {(currentPage - 1) * QUESTIONS_PER_PAGE + 1} -{" "}
              {Math.min(
                currentPage * QUESTIONS_PER_PAGE,
                activeQuestions.length
              )}{" "}
              / {activeQuestions.length}）
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              ログアウト
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: THEME_COLORS.accent,
                }}
              />
            </div>
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
              {activeQuestions
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
                    <div className="text-gray-600 text-left">
                      {question.note}
                    </div>
                  </div>
                ))}
              {activeQuestions.filter((q) => q.note).length === 0 && (
                <div className="text-sm text-gray-500">注釈はありません</div>
              )}
            </div>
          </div>
        )}

        <div
          className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <div className="space-y-8">
            {getCurrentPageQuestions().map((question, index) => {
              // const annotationNumber = getAnnotationNumber(question.id);
              return (
                <div
                  key={question.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 text-left">
                          {(currentPage - 1) * QUESTIONS_PER_PAGE + index + 1}.{" "}
                          {question.text}
                        </h3>
                      </div>
                      {/* 注釈ボタンを設問の右端に配置 */}
                      {question.note && (
                        <div className="relative ml-4 flex-shrink-0">
                          <button
                            onClick={() =>
                              setVisibleAnnotation(
                                visibleAnnotation === question.id
                                  ? null
                                  : question.id
                              )
                            }
                            className="px-3 py-1 text-sm font-medium rounded-lg border hover:bg-gray-50 transition-colors"
                            style={{
                              color: THEME_COLORS.status.error,
                              borderColor: THEME_COLORS.status.error,
                              backgroundColor: `${THEME_COLORS.status.error}10`,
                            }}
                          >
                            注釈
                          </button>

                          {/* 注釈ポップオーバー */}
                          {visibleAnnotation === question.id &&
                            question.note && (
                              <>
                                {/* オーバーレイ */}
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setVisibleAnnotation(null)}
                                />
                                {/* ポップオーバー */}
                                <div
                                  className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border p-4 z-20"
                                  style={{ borderColor: THEME_COLORS.border }}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                      注釈
                                    </h4>
                                    <button
                                      onClick={() => setVisibleAnnotation(null)}
                                      className="text-gray-400 hover:text-gray-600"
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
                                  <div className="text-sm text-gray-600 text-left">
                                    {question.note}
                                  </div>
                                </div>
                              </>
                            )}
                        </div>
                      )}
                    </div>

                    {question.type === "rating" ? (
                      <div className="space-y-3">
                        {[0, 1, 2, 3, 4, 5, 6].map((rating) => (
                          <label
                            key={rating}
                            className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors duration-200 ${
                              getCurrentAnswer(question.id) === rating
                                ? "shadow-sm"
                                : "hover:bg-gray-50"
                            }`}
                            style={{
                              borderColor:
                                getCurrentAnswer(question.id) === rating
                                  ? THEME_COLORS.accent
                                  : THEME_COLORS.border,
                              backgroundColor:
                                getCurrentAnswer(question.id) === rating
                                  ? `${THEME_COLORS.accent}10`
                                  : "transparent",
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={rating}
                              checked={getCurrentAnswer(question.id) === rating}
                              onChange={() =>
                                handleRatingChange(question.id, rating)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center`}
                              style={{
                                borderColor:
                                  getCurrentAnswer(question.id) === rating
                                    ? THEME_COLORS.accent
                                    : THEME_COLORS.border,
                                backgroundColor:
                                  getCurrentAnswer(question.id) === rating
                                    ? THEME_COLORS.accent
                                    : "transparent",
                              }}
                            >
                              {getCurrentAnswer(question.id) === rating && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="flex-1 text-sm text-gray-700 text-left">
                              {rating}. {ratingLabels[rating]}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={String(getCurrentAnswer(question.id))}
                          onChange={(e) =>
                            handleTextChange(question.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ borderColor: THEME_COLORS.border }}
                          rows={4}
                          placeholder="ご意見・ご要望をお聞かせください..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div
              className="mt-6 p-4 rounded-md"
              style={{
                backgroundColor: `${THEME_COLORS.status.error}20`,
                borderColor: THEME_COLORS.status.error,
                borderWidth: "1px",
              }}
            >
              <div
                className="text-sm"
                style={{ color: THEME_COLORS.status.error }}
              >
                {error}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              前のページ
            </button>

            {currentPage === totalPages ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: THEME_COLORS.accent }}
              >
                {isLoading ? "送信中..." : "回答を送信"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: THEME_COLORS.accent }}
              >
                次のページ
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>※ 回答は匿名で処理され、個人を特定することはありません</p>
          <p>※ すべての質問への回答をお願いいたします</p>
        </div>
      </div>
    </div>
  );
};

export default SurveyResponsePage;
