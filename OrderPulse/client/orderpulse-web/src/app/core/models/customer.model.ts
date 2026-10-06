export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  phone?: string;
  email?: string;
  creditLimit: number;
  paymentTermsDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCustomerRequest {
  customerCode: string;
  name: string;
  phone?: string;
  email?: string;
  creditLimit: number;
  paymentTermsDays: number;
}

export interface UpdateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  creditLimit: number;
  paymentTermsDays: number;
  isActive: boolean;
}
