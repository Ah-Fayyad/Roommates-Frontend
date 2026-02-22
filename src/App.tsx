import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "./context/LoadingContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import AIChat from "./components/AIChat";
import AdminLayout from "./admin/layouts/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import UserManagement from "./admin/pages/UserManagement";
import ContentEditor from "./admin/pages/ContentEditor";
import ModerationLogs from "./admin/pages/ModerationLogs";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Initialize document direction based on saved language
    const savedLanguage = localStorage.getItem("language") || "en";
    document.dir = savedLanguage === "ar" ? "rtl" : "ltr";
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <LoadingProvider>
                <PageLoader />
                <AppRoutes />
                <AIChat />
              </LoadingProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
