import { getPaymentConfig } from "../payment-config";
import type { PaymentGateway } from "./types";

// Note: Direct UPI QR payment does not use a gateway class.
// This registry exists for future payment providers.
export async function getGateway(provider: string): Promise<PaymentGateway> {
  const config = await getPaymentConfig(false);
  const providerConfig = config?.providers?.[provider];

  if (!providerConfig || !providerConfig.enabled) {
    throw new Error(`Payment provider "${provider}" is not enabled`);
  }

  throw new Error(`Payment provider "${provider}" is not implemented`);
}
