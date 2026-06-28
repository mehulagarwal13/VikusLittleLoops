import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { AuthProvider } from "@/admin/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import { QuickViewProvider } from "@/context/QuickViewContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 60_000 } },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CustomerAuthProvider>
            <ToastProvider>
              <WishlistProvider>
                <CartProvider>
                  <QuickViewProvider>
                    <App />
                  </QuickViewProvider>
                </CartProvider>
              </WishlistProvider>
            </ToastProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
