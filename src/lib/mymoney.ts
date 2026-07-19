import crypto from "crypto";

// Server-side client for the myMoney UPI payment gateway (partner API).
// Used by the Direct UPI capture flow to (a) look up a credit by UTR and
// (b) register the storefront's webhook so late SMS credits get pushed.

const MYMONEY_API = process.env.MYMONEY_API_URL || "https://m2money.duckdns.org/api";
const MYMONEY_KEY = process.env.MYMONEY_PARTNER_KEY || "";

export const MYMONEY_CONFIGURED = Boolean(MYMONEY_KEY);

interface MyMoneyTxn {
  utr?: string;
  status?: string;
  amount?: number;
  transactionDate?: string;
  [k: string]: unknown;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": MYMONEY_KEY,
  };
}

function extractItems(data: any): MyMoneyTxn[] {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.transactions)) return data.transactions;
  return [];
}

// Returns the matching transaction for a UTR, or null if the gateway has not
// yet recorded the credit (e.g. the companion SMS has not arrived).
export async function searchTransactionByUtr(utr: string): Promise<MyMoneyTxn | null> {
  if (!MYMONEY_KEY) return null;
  const res = await fetch(`${MYMONEY_API}/partner/transactions/search`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ utr }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const txn = extractItems(data).find((t) => String(t?.utr || "").trim() === utr);
  return txn || null;
}

// Used for fully automatic capture (no UTR entry required). Scans the most
// recent gateway credits and returns the one whose amount equals the order's
// unique padded billed amount. Each order has a distinct amount, so an exact
// match unambiguously identifies the order.
export async function findCreditByAmount(billedAmount: number): Promise<MyMoneyTxn | null> {
  if (!MYMONEY_KEY || !billedAmount) return null;
  try {
    const res = await fetch(`${MYMONEY_API}/partner/transactions?limit=50`, {
      method: "GET",
      headers: authHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items = extractItems(data);
    return (
      items.find(
        (t) =>
          (t.type || "credit") === "credit" &&
          Math.abs(Number(t.amount) - billedAmount) < 0.01
      ) || null
    );
  } catch {
    return null;
  }
}

// Idempotently register the storefront webhook at myMoney so future
// transaction.verified / transaction.pending events are pushed to us. Safe to
// call repeatedly — the idempotency-key prevents duplicate registrations.
let webhookRegistered: Promise<boolean> | null = null;

export function registerStorefrontWebhook(): Promise<boolean> {
  if (!MYMONEY_KEY) return Promise.resolve(false);
  if (webhookRegistered) return webhookRegistered;

  webhookRegistered = (async () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "";
    const trimmed = siteUrl.replace(/\/+$/, "");
    const webhookUrl = trimmed ? `${trimmed}/api/payments/mymoney/webhook` : "";
    if (!/^https?:\/\//.test(webhookUrl)) return false;

    try {
      const res = await fetch(`${MYMONEY_API}/partner/webhooks`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          url: webhookUrl,
          events: ["transaction.verified", "transaction.pending"],
        }),
        signal: AbortSignal.timeout(5000),
      });
      // 200/201 = registered, 409 (idempotency reuse) = already registered.
      return res.status === 200 || res.status === 201 || res.status === 409;
    } catch {
      return false;
    }
  })();

  return webhookRegistered;
}

// HMAC-SHA256 signature myMoney uses for webhook deliveries. Export kept for
// parity/testing; the verification itself lives in the webhook route.
export function signMyMoneyPayload(secret: string, timestamp: string, rawBody: string): string {
  return crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}
