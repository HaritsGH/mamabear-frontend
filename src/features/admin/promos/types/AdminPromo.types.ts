export interface PromoCode {
  id: number;
  code: string;
  name: string;
  isPercentage: boolean;
  amount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoFormValues {
  code: string;
  name: string;
  isPercentage: boolean;
  amount: number;
  isActive: boolean;
}
