export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'superadmin';
  phone?: string;
  address?: string;
  location?: string;
  walletBalance: number;
  mpinSet: boolean;
}

export interface AuthResponse {
  token: string;
  role: 'user' | 'superadmin';
  name: string;
  email: string;
}

export interface Vault {
  _id: string;
  lockerNo: string;
  name?: string;
  location: string;
  price: number;
  slotDate: string;
  timeSlot: string;
  status: 'available' | 'booked';
  timeSlots?: {
    start: string;
    end: string;
    isBooked: boolean;
  }[];
}

export interface Booking {
  _id: string;
  user: string | User;
  vault: Vault;
  start: string;
  end: string;
  status: string;
  lockStatus: 'open' | 'closed';
  reminderSentAt?: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalVaults: number;
  totalBookings: number;
}

export interface LockActionResponse {
  message: string;
  hasHardware: boolean;
}

export interface WalletResponse {
  balance: number;
}

export interface MpinVerifyResponse {
  valid: boolean;
  message?: string;
}

export interface OtpResponse {
  message: string;
  checkSpamNotice?: string;
  devOtp?: string;
}
