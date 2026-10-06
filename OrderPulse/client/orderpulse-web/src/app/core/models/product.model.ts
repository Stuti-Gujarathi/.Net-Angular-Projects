export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  unitOfMeasure: string;
  taxRate: number;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  unitOfMeasure: string;
  taxRate: number;
  costPrice: number;
  sellingPrice: number;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  categoryId?: number;
  unitOfMeasure: string;
  taxRate: number;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  productCount: number;
}
