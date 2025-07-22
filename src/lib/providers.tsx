
import React from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AuthProvider as SupabaseAuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SupabaseAuthProvider>
        {children}
        <Toaster />
      </SupabaseAuthProvider>
    </Provider>
  );
}
