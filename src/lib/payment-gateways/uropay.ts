import crypto from "crypto";
import type {
  PaymentGateway,
  GatewayPaymentInput,
  GatewayPaymentResult,
} from "./types";
import type { ProviderConfig } from "../payment-config";

const UROPAY_API_URL = "https://api.uropay.me";

export class UroPayGateway implements PaymentGateway {
  readonly provider = "uropay";
  private cfg: ProviderConfig;

  constructor(cfg: ProviderConfig) {
    this.cfg = cfg;
  }

  private authHeaders(): Record<string, string> {
    if (!this.cfg.apiKey || !this.cfg.secret) {
      throw new Error("UroPay is not configured");
    }
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": this.cfg.apiKey,
      Authorization: `Bearer ${crypto
        .createHash("sha512")
        .update(this.cfg.secret)
        .digest("hex")}`,
    };
  }

  async createPayment(input: GatewayPaymentInput): Promise<GatewayPaymentResult> {
    const res = await fetch(`${UROPAY_API_URL}/order/generate`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify({
        vpa: this.cfg.vpa || undefined,
        vpaName: this.cfg.vpaName || undefined,
        amount: Math.round(input.amount * 100), // UroPay expects paise
        merchantOrderId: input.merchantOrderId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        transactionNote: input.notes || `Order ${input.merchantOrderId}`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "UroPay order generation failed");
    }

    const qr =
      data.qrCode || data.qr || data.qrImage || data.qrDataUrl || null;

    return { gatewayOrderId: data.uroPayOrderId, qr, raw: data };
  }

  async submitReference(gatewayOrderId: string, reference: string) {
    const res = await fetch(`${UROPAY_API_URL}/order/update`, {
      method: "PATCH",
      headers: this.authHeaders(),
      body: JSON.stringify({
        uroPayOrderId: gatewayOrderId,
        referenceNumber: reference,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "UroPay UTR submission failed");
    }
    return data;
  }

  async getStatus(gatewayOrderId: string) {
    const res = await fetch(`${UROPAY_API_URL}/order/status/${gatewayOrderId}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return res.json();
  }

  verifyWebhook(rawBody: string, signature: string | null): boolean {
    if (!signature || !this.cfg.secret) return false;

    const key = crypto.createHash("sha512").update(this.cfg.secret).digest();
    const expected = crypto
      .createHmac("sha256", key)
      .update(rawBody)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;

    // UroPay signs some events with keys in a fixed order. Reconstruct the
    // documented Case 2b ordering and retry.
    try {
      const p = JSON.parse(rawBody);
      if (p.event === "order.status.utrsubmitted") {
        const ordered = {
          event: p.event,
          uroPayOrderId: p.uroPayOrderId,
          merchantOrderId: p.merchantOrderId,
          orderStatus: p.orderStatus,
          submittedUTR: p.submittedUTR,
          amount: p.amount,
          customerName: p.customerName,
          customerEmail: p.customerEmail,
          customerVPA: p.customerVPA,
          environment: p.environment,
          utrSubmittedAt: p.utrSubmittedAt,
        };
        const e2 = crypto
          .createHmac("sha256", key)
          .update(JSON.stringify(ordered))
          .digest("hex");
        const c = Buffer.from(e2);
        if (c.length === b.length && crypto.timingSafeEqual(c, b)) return true;
      }
    } catch {
      // ignore parse errors
    }

    return false;
  }
}
