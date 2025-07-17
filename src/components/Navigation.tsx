import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { THEME_COLORS } from "../types";

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  permission:
    | "canViewDashboard"
    | "canManageQuestions"
    | "canViewReports"
    | "canManageCustomers"
    | "canAnswerSurvey";
  color: string;
  bgColor: string;
  subItems?: { name: string; href: string }[];
  requiresIDType?: "hr" | "employee" | "master";
}

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { hasPermission, user } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const navigationItems: NavigationItem[] = [
    {
      name: "KizuNavi",
      href: "/dashboard",
      icon: "home",
      permission: "canViewDashboard" as const,
      color: "text-[#2C9AEF]",
      bgColor: "bg-[#71D3D8]/10",
      requiresIDType: "hr",
    },
    {
      name: "配信",
      href: "/questions",
      icon: "send",
      permission: "canManageQuestions" as const,
      color: "text-[#2C9AEF]",
      bgColor: "bg-[#71D3D8]/10",
      requiresIDType: "hr",
    },
    {
      name: "分析",
      href: "#",
      icon: "chart",
      permission: "canViewReports" as const,
      color: "text-[#2C9AEF]",
      bgColor: "bg-[#71D3D8]/10",
      requiresIDType: "hr",
      subItems: [
        {
          name: "サマリレポート",
          href: "/reports/summary",
        },
        {
          name: "カテゴリ別レポート",
          href: "/reports/category",
        },
      ],
    },
    {
      name: "顧客情報",
      href: "#",
      icon: "building",
      permission: "canManageCustomers" as const,
      color: "text-[#2C9AEF]",
      bgColor: "bg-[#71D3D8]/10",
      // マスター権限でも表示できるようにrequiresIDTypeを削除
      subItems: [
        {
          name: "基本情報登録",
          href: "/customers",
        },
        {
          name: "従業員情報登録",
          href: "/employees",
        },
      ],
    },
    {
      name: "回答",
      href: "/survey",
      icon: "clipboard-list",
      permission: "canAnswerSurvey" as const,
      color: "text-[#2C9AEF]",
      bgColor: "bg-[#71D3D8]/10",
    },
  ];

  // IDタイプとパーミッションに基づいてナビゲーション項目をフィルタリング
  const visibleItems = navigationItems.filter((item) => {
    // パーミッションチェック
    const hasRequiredPermission = hasPermission(item.permission);

    // IDタイプチェック
    let hasRequiredIDType = true;
    if (item.requiresIDType) {
      if (item.requiresIDType === "master") {
        hasRequiredIDType = user?.role === "master";
      } else {
        hasRequiredIDType = user?.idType === item.requiresIDType;
      }
    }

    // 特別なケース: 人事IDでは基本情報登録画面にアクセスできない
    if (
      user?.idType === "hr" &&
      user?.role !== "master" &&
      item.name === "顧客情報"
    ) {
      return false;
    }

    // 従業員IDは回答画面のみアクセス可能
    if (user?.idType === "employee" && item.href !== "/survey") {
      return false;
    }

    return hasRequiredPermission && hasRequiredIDType;
  });

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isExpanded = (itemName: string) => expandedItems.includes(itemName);

  const isActiveItem = (item: NavigationItem) => {
    if (item.subItems) {
      return item.subItems.some(
        (subItem) => location.pathname === subItem.href
      );
    }
    return location.pathname === item.href;
  };

  const getIcon = (iconName: string, isActive: boolean = false) => {
    const iconClass = `w-6 h-6 ${isActive ? "text-current" : "text-gray-600"}`;

    switch (iconName) {
      case "home":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      case "send":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        );
      case "chart":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
      case "chart-bar":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "users":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        );
      case "building":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "user-plus":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        );
      case "clipboard-list":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay for mobile navigation */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Navigation sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen pt-16 pb-6 transition-transform duration-300 bg-white border-r border-gray-200 w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-lg lg:shadow-none`}
        style={{ borderColor: THEME_COLORS.border }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-1 sm:space-y-2">
            {visibleItems.map((item) => {
              const isActive = isActiveItem(item);
              return (
                <li key={item.name} className="w-full">
                  {item.subItems ? (
                    <div className="w-full">
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`flex items-center w-full p-2 sm:p-3 text-sm sm:text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 group transition-colors duration-200 ${
                          isActive ? item.bgColor : ""
                        }`}
                        aria-expanded={isExpanded(item.name)}
                        aria-label={`${item.name}メニューを${
                          isExpanded(item.name) ? "閉じる" : "開く"
                        }`}
                      >
                        <span
                          className={`mr-2 sm:mr-3 ${
                            isActive ? item.color : ""
                          }`}
                        >
                          {getIcon(item.icon, isActive)}
                        </span>
                        <span className="flex-1 text-left">{item.name}</span>
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-200 ${
                            isExpanded(item.name) ? "rotate-180" : "rotate-0"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isExpanded(item.name) && (
                        <ul className="ml-4 sm:ml-6 mt-1 sm:mt-2 space-y-1 sm:space-y-2 w-full">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.name} className="w-full">
                              <NavLink
                                to={subItem.href}
                                onClick={onClose}
                                className={({ isActive }) =>
                                  `flex items-center p-2 text-sm sm:text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 w-full transition-colors duration-200 ${
                                    isActive ? "bg-gray-100 text-gray-900" : ""
                                  }`
                                }
                              >
                                {subItem.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center p-2 sm:p-3 text-sm sm:text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 w-full transition-colors duration-200 ${
                          isActive ? item.bgColor : ""
                        }`
                      }
                    >
                      <span
                        className={`mr-2 sm:mr-3 ${isActive ? item.color : ""}`}
                      >
                        {getIcon(item.icon, isActive)}
                      </span>
                      <span>{item.name}</span>
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
