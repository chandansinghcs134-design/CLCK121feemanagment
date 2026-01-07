
export type FeeStatus = 'Paid' | 'Unpaid';
export type FeeCategory = 'Registration' | 'Admission' | 'Monthly';

export interface Student {
  id: string;
  serialNumber: string;
  name: string;
  phone: string;
  status: FeeStatus;
  category: FeeCategory;
  paymentDate?: string;
  remarks?: string;
}

export interface FeeConfig {
  registration: number;
  admission: number;
  monthly: number;
}

export interface GlobalState {
  students: Student[];
  feeConfig: FeeConfig;
  dueDate: string;
  activeCategory: FeeCategory;
}

export type Role = 'admin' | 'staff' | null;
