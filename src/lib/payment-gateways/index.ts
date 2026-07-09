import { getPaymentConfig } from "../payment-config";
import type { PaymentGateway } from "./types";
import { UroPayGateway } from "./uropay";

// Resolves a configured, enabled gateway instance by provider name.
// Register new providers here as the system grows.
export async function getGateway(provider: string): Promise<PaymentGateway> {
  // Bypass cache so admin config changes (e.g. rotating keys) apply immediately.
  const config = await getPaymentConfig(false);
  const providerConfig = config?.providers?.[provider];

  if (!providerConfig || !providerConfig.enabled) {
    throw new Error(`Payment provider "${provider}" is not enabled`);
  }

  switch (provider) {
    case "uropay":
      return new UroPayGateway(providerConfig);
    default:
      throw new Error(`Unknown payment provider "${provider}"`);
  }
}
