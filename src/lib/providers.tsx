
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AuthProvider as SupabaseAuthProvider } from "@/components/auth/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SupabaseAuthProvider>
        {children}
      </SupabaseAuthProvider>
    </Provider>
  );
}
