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

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  enabledMethods: ["directupi"],
  defaultMethod: "directupi",
  providers: {
    directupi: {
      enabled: true,
      vpa: process.env.UPI_VPA || "heetdhameliya59-2@oksbi",
      vpaName: process.env.UPI_VPA_NAME || "Zoberry",
    },
  },
};

const ALLOWED_PAYMENT_METHODS = new Set(["card", "upi", "netbanking", "directupi"]);

function sanitizeConfig(config: PaymentConfig): PaymentConfig {
  const providers: Record<string, ProviderConfig> = {};
  for (const [name, p] of Object.entries(config.providers || {})) {
    if (p?.enabled && ALLOWED_PAYMENT_METHODS.has(name)) {
      providers[name] = { ...p };
    }
  }

  const enabledMethods = (config.enabledMethods || [])
    .filter((m) => ALLOWED_PAYMENT_METHODS.has(m));

  if (enabledMethods.length === 0) {
    enabledMethods.push("directupi");
  }

  const defaultMethod = ALLOWED_PAYMENT_METHODS.has(config.defaultMethod)
    ? config.defaultMethod
    : enabledMethods[0];

  return { enabledMethods, defaultMethod, providers };
}

let cache: PaymentConfig | null = null;

export async function getPaymentConfig(useCache = true): Promise<PaymentConfig> {
  if (useCache && cache) return cache;

  await connectToDatabase();
  let doc = await StorefrontConfig.findOne({ key: "payment" });

  if (!doc) {
    doc = await StorefrontConfig.create({ key: "payment", value: DEFAULT_PAYMENT_CONFIG });
  }

  cache = sanitizeConfig((doc.value as PaymentConfig) || DEFAULT_PAYMENT_CONFIG);
  return cache;
}

export function clearPaymentConfigCache() {
  cache = null;
}
