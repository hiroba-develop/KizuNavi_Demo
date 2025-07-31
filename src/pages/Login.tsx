import React, { useState, useEffect } from "react";
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

  // エラーメッセージを5秒後に自動消去
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000); // 5秒後に消去

      return () => clearTimeout(timer); // クリーンアップ
    }
  }, [error]);

  const { login } = useAuth();
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
          // マスター権限と人事ID、または従業員IDもダッシュボード画面へ遷移
          navigate("/dashboard");
        }, 300); // 300ミリ秒の遅延を追加
      }
    } catch {
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
    } catch {
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
                  部門{" "}
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
        <div className="text-center mb-8 flex flex-col items-center">
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
