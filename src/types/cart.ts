import { PreparedPackage, CustomBoxOption } from '../data/giftsData';

export interface CartItemPrepared {
  id: string;
  type: 'package';
  package: PreparedPackage;
  quantity: number;
  customNote?: string;
}

export interface CartItemCustom {
  id: string;
  type: 'custom';
  boxStyle: CustomBoxOption;
  selectedItems: CustomBoxOption[];
  cardMessage: string;
  ribbonColor: string;
  quantity: number;
  totalPrice: number;
}

export type CartItem = CartItemPrepared | CartItemCustom;

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderCustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  giftRecipientName?: string;
  giftSenderName?: string;
  giftMessage?: string;
}

export interface Order {
  id: string;
  createdAt: string; // ISO date string or formatted date
  status: OrderStatus;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentReceiptUrl?: string; // Cloudinary URL for payment receipt
  giftBoxStyle?: string; // Name of selected gift box
  giftBoxPrice?: number; // Price of selected gift box
}
