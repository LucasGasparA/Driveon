import api from "../api/client";

export type LoginRequest = {
  email: string;
  password: string;
  empresaId: number;
};

export type LoginResponse = {
  token: string;
  usuarioId: number;
  nome: string;
  cargo: string;
  empresaId: number;
};

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", req);
  return data;
}

export async function LoginResponse(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login-email", req);
  return data;
}


