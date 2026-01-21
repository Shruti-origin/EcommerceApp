import { UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // Optional full name
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  vendorId?: string; // Vendor ID for vendor users
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole | string; // Optional - client may set this to 'customer' when registering
}
