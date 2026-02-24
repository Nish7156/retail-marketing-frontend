export type Role = 'SUPERADMIN' | 'STORE_ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: Role;
  storeId?: string | null;
  createdAt?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  role?: Role;
  storeId?: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
}
