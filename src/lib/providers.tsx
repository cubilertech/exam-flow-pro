
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AuthProvider as SupabaseAuthProvider } from "@/components/auth/AuthProvider";
import { BrowserRouter as Router } from "react-router-dom";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

