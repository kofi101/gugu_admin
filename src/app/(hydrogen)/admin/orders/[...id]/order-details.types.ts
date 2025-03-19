export type OrderDetailsProps = {
  order: {
    paymentDetails: {
      itemTotal: number;
      deliveryFees: number;
      discount: number;
      total: number;
    };
    orderSummary: {
      checkOutOrderNumber: string;
      quantity: number;
      transactionDate: string;
      checkoutTotal: number;
      checkOutStatus: string;
      discount: number;
      shippingCost: number;
      customerId: string;
    };
    orderDetails: {
      checkOutOrderNumber: string;
      productCode: string;
      brand: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      salesPrice: number;
      discount: number;
      imageOne: string;
      merchant: string;
    }[];
    deliveryInformation: {
      address: string;
      digitalAddress: string;
      region: string;
      destination: string;
    };
  };
};
