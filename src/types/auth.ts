export type Role = 'SUPERADMIN' | 'STORE_ADMIN' | 'USER';

export interface User {
  id: string;
  phone: string;
  email?: string | null;
  role: Role;
  shopIds?: string[];
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
  shopId?: string;
}

export interface SendOtpBody {
  phone: string;
}

export interface VerifyOtpBody {
  phone: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
}
