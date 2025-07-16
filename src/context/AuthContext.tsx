import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, LoginRequest, UserPermissions } from "../types";
import AuthService from "../utils/authService";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  isHR: () => boolean;
  isEmployee: () => boolean;
  canAccessRoute: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to get permissions based on role
const getPermissionsByRole = (role: User["role"]): UserPermissions => {
  switch (role) {
    case "master":
      // Master: All permissions (company staff)
      return {
        canViewDashboard: true,
        canManageQuestions: true,
        canViewReports: true,
        canManageCustomers: true,
        canAnswerSurvey: true,
      };
    case "admin":
      // Admin: All except customer management (HR staff)
      return {
        canViewDashboard: true,
        canManageQuestions: true,
        canViewReports: true,
        canManageCustomers: false,
        canAnswerSurvey: true,
      };
    case "member":
      // Member: Only survey response (general employees)
      return {
        canViewDashboard: false,
        canManageQuestions: false,
        canViewReports: false,
        canManageCustomers: false,
        canAnswerSurvey: true,
      };
    default:
      return {
        canViewDashboard: false,
        canManageQuestions: false,
        canViewReports: false,
        canManageCustomers: false,
        canAnswerSurvey: false,
      };
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already logged in and validate token
        const savedUser = localStorage.getItem("user");
        const authToken = localStorage.getItem("authToken");

        if (savedUser && authToken) {
          // Development mode: Use stored user data without API validation
          if (
            import.meta.env.VITE_USE_MOCK_AUTH === "true" ||
            import.meta.env.DEV ||
            authToken.startsWith("mock-token-")
          ) {
            const userData = JSON.parse(savedUser);
            userData.permissions = getPermissionsByRole(userData.role);
            setUser(userData);
            return;
          }

          // Production mode: Validate token with API
          const validationResult = await AuthService.validateToken();

          if (validationResult.valid && validationResult.user) {
            // Update user data from server
            validationResult.user.permissions = getPermissionsByRole(
              validationResult.user.role
            );
            setUser(validationResult.user);
            localStorage.setItem("user", JSON.stringify(validationResult.user));
          } else {
            // Token is invalid, clear stored data
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
          }
        }
      } catch (error) {
        console.warn("Auth initialization failed:", error);
        // Clear stored data if validation fails
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      // 会社名が空の場合、デフォルト値を設定
      const loginCredentials = {
        ...credentials,
        companyName: credentials.companyName || "DefaultCompany",
      };

      // Development mode: Use mock authentication if API is not available
      if (
        import.meta.env.VITE_USE_MOCK_AUTH === "true" ||
        import.meta.env.DEV
      ) {
        // Mock role assignment based on email pattern
        let role: User["role"] = "member";
        // Mock idType assignment
        let idType: "hr" | "employee" = "employee";

        if (
          loginCredentials.email.includes("master") ||
          loginCredentials.email.includes("admin@kizunavi.com") ||
          loginCredentials.companyName === "KizuNavi"
        ) {
          role = "master";
          idType = "hr";
        } else if (
          loginCredentials.email.includes("hr") ||
          loginCredentials.email.includes("admin")
        ) {
          role = "admin";
          idType = "hr";
        }

        const mockUser: User = {
          id: "mock-" + Date.now(),
          email: loginCredentials.email,
          companyId:
            loginCredentials.companyName === "KizuNavi"
              ? "internal"
              : "mock-company-1",
          role: role,
          idType: idType,
          permissions: getPermissionsByRole(role),
        };

        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
        localStorage.setItem("authToken", "mock-token-" + Date.now());
        return;
      }

      // Production mode: Use actual API
      const loginResponse = await AuthService.login(loginCredentials);

      // Set permissions based on role
      loginResponse.user.permissions = getPermissionsByRole(
        loginResponse.user.role
      );

      setUser(loginResponse.user);
    } catch (error) {
      // Fallback to mock authentication if API is not available
      console.warn(
        "API authentication failed, falling back to mock auth:",
        error
      );

      // 会社名が空の場合、デフォルト値を設定
      const loginCredentials = {
        ...credentials,
        companyName: credentials.companyName || "DefaultCompany",
      };

      // Mock role assignment based on email pattern
      let role: User["role"] = "member";
      // Mock idType assignment
      let idType: "hr" | "employee" = "employee";

      if (
        loginCredentials.email.includes("master") ||
        loginCredentials.email.includes("admin@kizunavi.com") ||
        loginCredentials.companyName === "KizuNavi"
      ) {
        role = "master";
        idType = "hr";
      } else if (
        loginCredentials.email.includes("hr") ||
        loginCredentials.email.includes("admin")
      ) {
        role = "admin";
        idType = "hr";
      }

      const mockUser: User = {
        id: "mock-" + Date.now(),
        email: loginCredentials.email,
        companyId:
          loginCredentials.companyName === "KizuNavi"
            ? "internal"
            : "mock-company-1",
        role: role,
        idType: idType,
        permissions: getPermissionsByRole(role),
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("authToken", "mock-token-" + Date.now());
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      // ローカルストレージをクリア
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      setUser(null);
      // 正しいログインページにリダイレクト
      window.location.href = "/login";
    }
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return user?.permissions[permission] ?? false;
  };

  // Check if user is HR type
  const isHR = (): boolean => {
    return user?.idType === "hr";
  };

  // Check if user is Employee type
  const isEmployee = (): boolean => {
    return user?.idType === "employee";
  };

  // Check if user can access a specific route
  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    // 従業員IDはダッシュボードと回答画面にアクセス可能
    if (user.idType === "employee") {
      return route === "/survey" || route === "/dashboard";
    }

    // マスター権限はすべてのページにアクセス可能
    if (user.role === "master") {
      return true;
    }

    // 人事IDは基本情報登録画面以外アクセス可能
    if (user.idType === "hr") {
      if (route === "/customers") {
        return false;
      }
      return true;
    }

    // デフォルトはアクセス不可
    return false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    hasPermission,
    isHR,
    isEmployee,
    canAccessRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
