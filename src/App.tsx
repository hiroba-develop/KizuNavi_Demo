import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { QuestionsProvider } from "./context/QuestionsContext";
import { CustomerProvider, useCustomer } from "./context/CustomerContext";
import { DepartmentProvider } from "./context/DepartmentContext";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import Reports from "./pages/Reports";
import SummaryReport from "./pages/SummaryReport";
import CategoryReport from "./pages/CategoryReport";
import SubCategoryReport from "./pages/SubCategoryReport";
import QuestionReport from "./pages/QuestionReport";
import IndividualReport from "./pages/IndividualReport";
import SurveyResponse from "./pages/SurveyResponse";
import SurveySettings from "./pages/SurveySettings";
import CustomerMaster from "./pages/CustomerMaster";

import EmployeeMaster from "./pages/EmployeeMaster";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import "./App.css";

// QuestionsProviderWrapperコンポーネントを作成してselectedCustomerIdを渡す
const QuestionsProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { selectedCustomerId } = useCustomer();
  return (
    <QuestionsProvider selectedCustomerId={selectedCustomerId}>
      {children}
    </QuestionsProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CustomerProvider>
          <DepartmentProvider>
            <QuestionsProviderWrapper>
              <Router basename="/">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/reset-password/:token"
                    element={<PasswordResetConfirm />}
                  />
                  <Route path="/" element={<Layout />}>
                    <Route
                      index
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="questions" element={<Questions />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="reports/summary" element={<SummaryReport />} />
                    <Route
                      path="reports/category"
                      element={<CategoryReport />}
                    />
                    <Route
                      path="reports/subcategory"
                      element={<SubCategoryReport />}
                    />
                    <Route
                      path="reports/question"
                      element={<QuestionReport />}
                    />
                    <Route
                      path="reports/individual"
                      element={<IndividualReport />}
                    />
                    <Route path="survey" element={<SurveyResponse />} />
                    <Route path="settings" element={<SurveySettings />} />
                    <Route path="customers" element={<CustomerMaster />} />
                    <Route path="employees" element={<EmployeeMaster />} />
                  </Route>
                </Routes>
              </Router>
            </QuestionsProviderWrapper>
          </DepartmentProvider>
        </CustomerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
