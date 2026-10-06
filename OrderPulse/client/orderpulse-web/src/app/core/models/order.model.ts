export interface OrderItem {
  id: number; productId: number; productName: string;
  quantity: number; unitPrice: number; discount: number;
  tax: number; total: number;
}
export interface Order {
  id: number; orderNumber: string; customerId: number;
  customerName: string; orderDate: string;
  subtotal: number; taxAmount: number; discountAmount: number;
  totalAmount: number; status: string; paymentStatus: string;
  items: OrderItem[];
}
