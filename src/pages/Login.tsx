import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import type { LoginRequest, UserProfile } from "../types";
import { THEME_COLORS } from "../types";

const Login: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: "",
    password: "",
    companyName: "",
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    department: "",
    gender: "",
    nationality: "",
    age: "",
    tenure: "",
    jobType: "",
    position: "",
    grade: "",
    evaluation: "",
    location: "",
    employmentType: "",
    recruitmentType: "",
    education: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // companyNameは空文字列のままログイン処理を実行
      await login(loginData);
      // Check if profile setup is needed (for new users)
      if (loginData.email.includes("new")) {
        setShowProfileForm(true);
      } else {
        // ログイン成功後、少し遅延してからリダイレクト
        setTimeout(() => {
          // ログイン後のユーザー情報が確実に利用可能になるまで少し待機
          const userRole = user?.role || "member";
          const idType = user?.idType || "employee";

          // マスター権限と人事ID、または従業員IDもダッシュボード画面へ遷移
          navigate("/dashboard");
        }, 300); // 300ミリ秒の遅延を追加
      }
    } catch (err) {
      setError("ログインに失敗しました。入力内容を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Profile saved:", profileData);

      // プロフィール保存後、少し遅延してからリダイレクト
      setTimeout(() => {
        // すべてのユーザータイプをダッシュボードに遷移
        navigate("/dashboard");
      }, 300); // 300ミリ秒の遅延を追加
    } catch (err) {
      setError("プロフィール情報の保存に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  if (showProfileForm) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center px-4 py-8"
        style={{
          background: `linear-gradient(135deg, ${THEME_COLORS.main}20, ${THEME_COLORS.accent}20)`,
        }}
      >
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: THEME_COLORS.main }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              プロフィール設定
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              初回ログイン時に必要な情報を入力してください
            </p>
          </div>

          <div
            className="bg-white rounded-xl shadow-lg p-6"
            style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
          >
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  部署{" "}
                  <span style={{ color: THEME_COLORS.status.error }}>*</span>
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderColor: THEME_COLORS.border }}
                  placeholder="例: 営業部"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  性別{" "}
                  <span style={{ color: THEME_COLORS.status.error }}>*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={profileData.gender}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderColor: THEME_COLORS.border }}
                  required
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  年代{" "}
                  <span style={{ color: THEME_COLORS.status.error }}>*</span>
                </label>
                <select
                  id="age"
                  name="age"
                  value={profileData.age}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderColor: THEME_COLORS.border }}
                  required
                >
                  <option value="">選択してください</option>
                  <option value="10s">10代</option>
                  <option value="20s">20代</option>
                  <option value="30s">30代</option>
                  <option value="40s">40代</option>
                  <option value="50s">50代</option>
                  <option value="60s">60代</option>
                  <option value="70s">70代～</option>
                </select>
              </div>

              {/* Tenure */}
              <div>
                <label
                  htmlFor="tenure"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  勤続年数{" "}
                  <span style={{ color: THEME_COLORS.status.error }}>*</span>
                </label>
                <select
                  id="tenure"
                  name="tenure"
                  value={profileData.tenure}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderColor: THEME_COLORS.border }}
                  required
                >
                  <option value="">選択してください</option>
                  <option value="less-than-3">3年未満</option>
                  <option value="3-7">3-7年</option>
                  <option value="8-13">8-13年</option>
                  <option value="14-20">14-20年</option>
                  <option value="20-plus">20年以上</option>
                </select>
              </div>

              {/* Job Type */}
              <div>
                <label
                  htmlFor="jobType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  職種{" "}
                  <span style={{ color: THEME_COLORS.status.error }}>*</span>
                </label>
                <input
                  type="text"
                  id="jobType"
                  name="jobType"
                  value={profileData.jobType}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderColor: THEME_COLORS.border }}
                  placeholder="例: 営業"
                  required
                />
              </div>

              {error && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    backgroundColor: `${THEME_COLORS.status.error}20`,
                    borderColor: THEME_COLORS.status.error,
                    borderWidth: "1px",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: THEME_COLORS.status.error }}
                  >
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: THEME_COLORS.accent }}
              >
                {isLoading ? "保存中..." : "設定完了"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center px-4 py-8"
      style={{
        background: `linear-gradient(135deg, ${THEME_COLORS.main}20, ${THEME_COLORS.accent}20)`,
      }}
    >
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: THEME_COLORS.main }}
          >
            <span className="text-3xl font-bold text-white">K</span>
          </div>
          <h1
            className="text-4xl font-bold"
            style={{ color: THEME_COLORS.accent }}
          >
            KizuNavi
          </h1>
          <p className="text-gray-600 mt-2">エンゲージメント分析システム</p>
          <p className="text-sm text-gray-500 mt-1">
            社員のエンゲージメント向上を支援
          </p>
        </div>

        {/* Login Form */}
        <div
          className="bg-white rounded-xl shadow-lg p-6"
          style={{ borderColor: THEME_COLORS.border, borderWidth: "1px" }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                placeholder="example@company.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ borderColor: THEME_COLORS.border }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                className="rounded-lg p-3"
                style={{
                  backgroundColor: `${THEME_COLORS.status.error}20`,
                  borderColor: THEME_COLORS.status.error,
                  borderWidth: "1px",
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: THEME_COLORS.status.error }}
                >
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: THEME_COLORS.accent }}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/password-reset"
              className="text-sm hover:underline"
              style={{ color: THEME_COLORS.accent }}
            >
              パスワードをお忘れですか？
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>© 2024 KizuNavi. All rights reserved.</p>
          <p className="mt-1">中小企業の業績・採用力向上を支援</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
