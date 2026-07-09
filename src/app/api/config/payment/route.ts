import { type NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getPaymentConfig } from "@/lib/payment-config";

export const runtime = "nodejs";

// Public: tells the checkout which payment methods are enabled and the
// provider metadata. Secrets are NEVER returned here.
export async function GET(request: NextRequest) {
  try {
    const config = await getPaymentConfig();

    const providers: Record<string, { enabled: boolean; mode?: string }> = {};
    for (const [name, p] of Object.entries(config.providers || {})) {
      if (p?.enabled) {
        providers[name] = { enabled: true, mode: p.mode };
      }
    }

    return apiSuccess({
      enabledMethods: config.enabledMethods || ["cod"],
      defaultMethod: config.defaultMethod || "cod",
      providers,
    });
  } catch (error) {
    return apiError("Failed to load payment configuration", 500);
  }
}
