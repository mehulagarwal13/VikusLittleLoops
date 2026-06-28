import { createContext, useContext, useEffect, useState } from "react";
import { customerApi } from "@/lib/api";

const CustomerAuthContext = createContext(null);
const KEY = "vll_customer_token";

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(KEY));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(KEY)));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    customerApi
      .get("/customer/me")
      .then((r) => setCustomer(r.data))
      .catch(() => {
        localStorage.removeItem(KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const finishAuth = async (access_token) => {
    localStorage.setItem(KEY, access_token);
    setToken(access_token);
    const me = await customerApi.get("/customer/me");
    setCustomer(me.data);
    return me.data;
  };

  const register = async (payload) => {
    const { data } = await customerApi.post("/customer/register", payload);
    return finishAuth(data.access_token);
  };

  const login = async (email, password) => {
    const { data } = await customerApi.post("/customer/login", { email, password });
    return finishAuth(data.access_token);
  };

  const googleLogin = async (credential) => {
    const { data } = await customerApi.post("/customer/google", { credential });
    return finishAuth(data.access_token);
  };

  const updateProfile = async (payload) => {
    const { data } = await customerApi.patch("/customer/me", payload);
    setCustomer(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setToken(null);
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{ customer, loading, register, login, googleLogin, updateProfile, logout, isAuthed: Boolean(customer) }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);
