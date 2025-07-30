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
        {
          name: "小カテゴリ別レポート",
          href: "/reports/subcategory",
        },
        {
          name: "設問別レポート",
          href: "/reports/question",
        },
        {
          name: "個別レポート",
          href: "/reports/individual",
        },
      ],
    },
    {
      name: "顧客情報",
      href: "#",
      icon: "users",
      permission: "canManageCustomers" as const,
      color: "text-[#2C9AEF]",
      bgColor: "bg-[#71D3D8]/10",
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

  // Filter navigation items based on permissions and user role
  const visibleItems = navigationItems
    .filter((item) => {
      const hasRequiredPermission = hasPermission(item.permission);
      if (!hasRequiredPermission) return false;

      // Survey screen accessible by Employee only, but not master
      if (item.href === "/survey") {
        return user?.idType === "employee" && user?.role !== "master";
      }

      // Employees can only access survey screen
      if (user?.idType === "employee") {
        return false;
      }

      // Check for requiresIDType
      if (item.requiresIDType) {
        if (item.requiresIDType === "master") {
          return user?.role === "master";
        }
        if (user?.idType !== item.requiresIDType) {
          return false;
        }
      }

      return true;
    })
    .map((item) => {
      // 顧客情報メニューの制限
      if (
        item.name === "顧客情報" &&
        item.subItems &&
        user?.idType === "hr" &&
        user?.role !== "master"
      ) {
        const filteredSubItems = item.subItems.filter(
          (subItem) => subItem.href !== "/customers"
        );
        return { ...item, subItems: filteredSubItems };
      }

      // 分析メニューの制限（人事IDの場合）
      if (
        item.name === "分析" &&
        item.subItems &&
        user?.idType === "hr" &&
        user?.role !== "master"
      ) {
        const filteredSubItems = item.subItems.filter(
          (subItem) =>
            subItem.href === "/reports/summary" ||
            subItem.href === "/reports/category"
        );
        return { ...item, subItems: filteredSubItems };
      }

      return item;
    })
    .filter((item) => !item.subItems || item.subItems.length > 0);

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
      return item.subItems.some((subItem) =>
        location.pathname.startsWith(subItem.href)
      );
    }
    return location.pathname.startsWith(item.href);
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
      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Navigation Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ borderColor: THEME_COLORS.border }}
      >
        <nav className="px-4 py-5">
          <div className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = isActiveItem(item);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isItemExpanded = isExpanded(item.name);

              return (
                <div key={item.name} className="mb-2">
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? `${item.color} ${item.bgColor} font-medium`
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`mr-3 ${
                            isActive ? item.color : "text-gray-500"
                          }`}
                        >
                          {getIcon(item.icon, isActive)}
                        </span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isItemExpanded ? "transform rotate-180" : ""
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
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive: navIsActive }) =>
                        `flex items-center px-4 py-3 rounded-lg transition-colors ${
                          navIsActive
                            ? `${item.color} ${item.bgColor} font-medium`
                            : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                      onClick={onClose}
                    >
                      <span
                        className={`mr-3 ${
                          isActive ? item.color : "text-gray-500"
                        }`}
                      >
                        {getIcon(item.icon, isActive)}
                      </span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </NavLink>
                  )}

                  {/* Sub Items */}
                  {hasSubItems && isItemExpanded && (
                    <div
                      className="ml-6 mt-1 space-y-1 border-l-2 pl-3"
                      style={{ borderColor: THEME_COLORS.border }}
                    >
                      {item.subItems?.map((subItem) => (
                        <NavLink
                          key={subItem.href}
                          to={subItem.href}
                          className={({ isActive: subIsActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                              subIsActive
                                ? `${item.color} ${item.bgColor} font-medium`
                                : "text-gray-600 hover:bg-gray-100"
                            }`
                          }
                          onClick={onClose}
                        >
                          <span className="text-sm">{subItem.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Navigation;
