
import React from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AuthProvider as SupabaseAuthProvider } from "@/components/auth/AuthProvider";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster />
    </Provider>
  );
}
