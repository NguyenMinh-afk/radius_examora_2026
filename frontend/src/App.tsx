import { ToastProvider } from "./components/shared/toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppRouter from "./router/index";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
