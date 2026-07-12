import { connectToDatabase } from "./db";
import { StorefrontConfig } from "./storefront-models/Config";

export type ProviderConfig = {
  enabled: boolean;
  mode?: string;
  apiKey?: string;
  secret?: string;
  vpa?: string;
  vpaName?: string;
  [key: string]: any;
};

export type PaymentConfig = {
  enabledMethods: string[];
  defaultMethod: string;
  providers: Record<string, ProviderConfig>;
};

// Bootstrap defaults come from env so the gateway works immediately.
// The admin panel persists the real config into the shared `configs` collection,
// which then becomes the source of truth for both admin and storefront.
const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  enabledMethods: ["cod", "uropay", "directupi"],
  defaultMethod: "cod",
  providers: {
    uropay: {
      enabled: true,
      mode: process.env.UROPAY_MODE || "test",
      apiKey: process.env.UROPAY_API_KEY || "",
      secret: process.env.UROPAY_SECRET || "",
      vpa: process.env.UROPAY_VPA || "",
      vpaName: process.env.UROPAY_VPA_NAME || "Zoberry",
    },
    // Static UPI QR: customer scans and pays directly to your VPA.
    // No automatic confirmation — buyer submits UTR, merchant verifies manually.
    directupi: {
      enabled: true,
      vpa: process.env.UPI_VPA || "heetdhameliya59-2@oksbi",
      vpaName: process.env.UPI_VPA_NAME || "Zoberry",
    },
  },
};

let cache: PaymentConfig | null = null;

export async function getPaymentConfig(useCache = true): Promise<PaymentConfig> {
  if (useCache && cache) return cache;

  await connectToDatabase();
  let doc = await StorefrontConfig.findOne({ key: "payment" });

  if (!doc) {
    doc = await StorefrontConfig.create({ key: "payment", value: DEFAULT_PAYMENT_CONFIG });
  }

  cache = (doc.value as PaymentConfig) || DEFAULT_PAYMENT_CONFIG;
  return cache;
}

export function clearPaymentConfigCache() {
  cache = null;
}
