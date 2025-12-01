export enum Category {
  Transport = 'Transport',
  Food = 'Food',
  Drink = 'Drink',
  Weed = 'Weed',
  Purchase = 'Purchase',
  Play = 'Play',
  Other = 'Other'
}

export enum PaymentMethod {
  Cash = 'Cash',
  CreditCard = 'Credit Card'
}

export interface Expense {
  id: string;
  timestamp: number;
  amountTHB: number;
  amountHKD: number;
  category: Category;
  description: string;
  paymentMethod: PaymentMethod;
  isSplit: boolean;
  splitCount: number;
  splitAmountTHB: number; // The user's share
}

export interface ExchangeRate {
  THBtoHKD: number; // e.g. 0.22 (100 THB = 22 HKD)
}

export type ViewState = 'log' | 'history' | 'stats';