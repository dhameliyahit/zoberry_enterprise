// Common contract every payment gateway must implement.
// Adding a new gateway later = drop a new file in ./payment-gateways and
// register it in ./payment-gateways/index.ts. No order-flow code changes.
export interface GatewayPaymentInput {
  merchantOrderId: string;
  amount: number; // in rupees
  customerName: string;
  customerEmail: string;
  notes?: string;
}

export interface GatewayPaymentResult {
  gatewayOrderId: string;
  qr?: string | null;
  deepLink?: string;
  raw?: any;
}

export interface PaymentGateway {
  readonly provider: string;
  createPayment(input: GatewayPaymentInput): Promise<GatewayPaymentResult>;
  submitReference(gatewayOrderId: string, reference: string): Promise<any>;
  getStatus(gatewayOrderId: string): Promise<any>;
  verifyWebhook(rawBody: string, signature: string | null): boolean;
}
