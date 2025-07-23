import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navigation from "./Navigation";
import Header from "./Header";
import { THEME_COLORS } from "../types";

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, canAccessRoute, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ユーザーが未認証の場合はログイン画面にリダイレクト
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // 現在のパスにアクセスできるかをチェックして、アクセスできない場合はリダイレクト
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // ルートパスのリダイレクト処理
      if (location.pathname === "/") {
        // 従業員IDは回答画面に、その他はダッシュボードに遷移
        if (user.idType === "employee") {
          navigate("/survey");
        } else {
          navigate("/dashboard");
        }
        return;
      }

      // IDタイプに基づいたリダイレクト
      if (!canAccessRoute(location.pathname)) {
        // 従業員IDは回答画面に、その他はダッシュボードに遷移
        if (user.idType === "employee") {
          navigate("/survey");
        } else {
          navigate("/dashboard");
        }
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    location.pathname,
    navigate,
    canAccessRoute,
  ]);

  // ローディング中またはユーザーが未認証の場合は何も表示しない
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Different layout handling based on user role and idType
  // const isOnlyMember = user?.role === "member";
  const isEmployee = user?.idType === "employee";

  // アクセス制限表示の設定
  const showAccessRestriction =
    (isEmployee && location.pathname !== "/survey") ||
    (user?.idType === "hr" &&
      user?.role !== "master" &&
      location.pathname === "/customers");

  // アクセス制限メッセージの設定
  const getAccessRestrictionMessage = () => {
    if (isEmployee) {
      return "メンバー権限ではアンケート回答のみ利用可能です。";
    }
    if (
      user?.idType === "hr" &&
      user?.role !== "master" &&
      location.pathname === "/customers"
    ) {
      return "人事IDでは基本情報登録画面にアクセスできません。";
    }
    return "この画面を表示する権限がありません。";
  };

  // リダイレクト先の設定
  const getRedirectPath = () => {
    if (isEmployee) {
      return "/survey";
    }
    if (user?.idType === "hr") {
      return "/dashboard";
    }
    return "/login";
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ backgroundColor: THEME_COLORS.background }}
    >
      {/* Fixed Header */}
      <Header onMenuToggle={handleMenuToggle} />

      {/* Navigation - Show for all authenticated users */}
      <Navigation isOpen={mobileMenuOpen} onClose={handleMenuClose} />

      {/* Main Content */}
      <main className="pt-16 lg:ml-64">
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-full overflow-x-hidden w-full">
          <div className="mx-auto w-full max-w-screen-2xl">
            <div className="w-full">{children || <Outlet />}</div>
          </div>
        </div>
      </main>

      {/* Role-specific overlay for restricted access */}
      {showAccessRestriction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 m-4 max-w-md text-center"
            style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${THEME_COLORS.accent}20` }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: THEME_COLORS.accent }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              アクセス制限
            </h3>
            <p className="text-gray-600 mb-4">
              {getAccessRestrictionMessage()}
              <br />
            </p>
            <button
              onClick={() => navigate(getRedirectPath())}
              className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: THEME_COLORS.accent }}
            >
              {isEmployee ? "アンケート回答画面へ" : "ダッシュボードへ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
