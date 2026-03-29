export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Member {
  id: number;
  book_id: number;
  user_id?: number;
  role: 'owner' | 'editor' | 'viewer' | string;
  status?: 'pending' | 'accepted' | 'rejected' | string;
  user?: User;
  name?: string;
  email?: string;
}

export interface Book {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  user_id: number;
  created_at: string;
  members?: Member[];
  total_income?: number;
  total_expense?: number;
  balance?: number;
  role?: 'owner' | 'editor' | 'viewer' | string;
}

export interface Transaction {
  id: number;
  book_id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
  user_id?: number;
  user?: User;
}

export interface AppNotification {
  id: string; // Often UUIDs in Laravel
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  title?: string;
  message?: string;
  is_read?: boolean;
  data: {
    title: string;
    message: string;
    action_url?: string;
    invitation_id?: number;
    id?: number;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface BookDetailResponse {
  book: Book;
  transactions: Transaction[];
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface Invitation {
  id: number;
  book: Book;
  inviter: User;
  role: string;
  created_at: string;
}
