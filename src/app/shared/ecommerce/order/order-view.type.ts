export type orderDetailsType = {
  paymentDetails: PaymentDetails;
  orderSummary: OrderSummary;
  orderDetails: OrderDetail[];
  deliveryInformation: DeliveryInformation;
};

export type PaymentDetails = {
  itemTotal: number;
  deliveryFees: number;
  discount: number;
  total: number;
};

export type OrderSummary = {
  checkOutOrderNumber: string;
  quantity: number;
  transactionDate: string;
  checkoutTotal: number;
  checkOutStatus: string;
  discount: number;
  shippingCost: number;
  customerId: string;
};

export type OrderDetail = {
  checkOutOrderNumber: string;
  productCode: string;
  brand: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  salesPrice: number;
  discount: number;
  imageOne: string;
};

export type DeliveryInformation = {
  address: string;
  digitalAddress: string;
  region: string;
  destination: string;
};



export type OrderStatus = Array<{
  id: number;
  name: string;
  displayName: string;
}>;