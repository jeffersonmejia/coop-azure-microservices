export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AccountResponse {
  id: number;
  accountNumber: string;
  userId: number;
  balance: number;
  status: string;
  createdAt: string;
}

export interface TransactionResponse {
  id: number;
  sourceAccountNumber: string | null;
  destinationAccountNumber: string | null;
  amount: number;
  type: string;
  status: string;
  reference: string;
  occurredAt: string;
}

export interface PaymentResponse {
  id: number;
  userId: number;
  accountNumber: string;
  amount: number;
  description: string | null;
  status: string;
  failureReason: string | null;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
