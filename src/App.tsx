import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AIChat from "./components/AIChat";

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <AIChat />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
