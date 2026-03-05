import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../api/api";

type User = {
  id: number;
  email: string;
  nome: string;
  tipo: string;
  oficina_id: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("driveon:token") ?? sessionStorage.getItem("driveon:token")
  );

  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("driveon:user") ?? sessionStorage.getItem("driveon:user");
    return raw ? JSON.parse(raw) : null;
  });

  // ✅ Normaliza o usuário retornado pelo backend
  const normalizeUser = (u: any): User => ({
    id: u.id,
    email: u.email,
    nome: u.nome,
    tipo: u.tipo,
    oficina_id: Number(u.oficina_id ?? u.oficinaId ?? 0),
  });

  // ✅ Armazena token e usuário de forma persistente
  const persist = (t: string, u: User, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("driveon:token", t);
    storage.setItem("driveon:user", JSON.stringify(u));
    setToken(t);
    setUser(u);
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  };

  // ✅ Login e persistência
  const signIn = async (email: string, password: string, remember: boolean) => {
    const { data } = await api.post("/auth/login", { email, senha: password });
    const normalized = normalizeUser(data.usuario);
    persist(data.token, normalized, remember);
  };

  // ✅ Logout
  const signOut = () => {
    localStorage.removeItem("driveon:token");
    localStorage.removeItem("driveon:user");
    sessionStorage.removeItem("driveon:token");
    sessionStorage.removeItem("driveon:user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  // ✅ Garante que o header Authorization sempre exista
  if (token && !api.defaults.headers.common["Authorization"]) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      signIn,
      signOut,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
