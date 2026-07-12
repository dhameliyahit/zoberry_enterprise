import { type NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";

export const runtime = "nodejs";

const MYMONEY_API = process.env.MYMONEY_API_URL || "https://m2money.duckdns.org/api";
const MYMONEY_KEY = process.env.MYMONEY_PARTNER_KEY || "";

/**
 * Proxy endpoint: checks myMoney partner API to see if a UTR has been
 * auto-verified by the SMS-parsing backend (from the Android companion app).
 * Returns { found, status, amount } if found.
 */
export async function POST(request: NextRequest) {
  try {
    const { utr } = await request.json();
    if (!utr || String(utr).trim().length < 12) {
      return apiError("Invalid UTR", 400);
    }

    if (!MYMONEY_KEY) {
      // myMoney not configured — silently skip auto-verify
      return apiSuccess({ found: false });
    }

    const res = await fetch(`${MYMONEY_API}/partner/transactions/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": MYMONEY_KEY,
      },
      body: JSON.stringify({ utr: utr.trim() }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return apiSuccess({ found: false });
    }

    const data = await res.json();
    const txn = data?.data?.transactions?.[0] || data?.data?.[0] || null;

    if (!txn) {
      return apiSuccess({ found: false });
    }

    return apiSuccess({
      found: true,
      status: txn.status,       // "pending" | "verified" | "failed"
      amount: txn.amount,
      utr: txn.utr,
      transactionDate: txn.transactionDate,
    });
  } catch {
    // Network error or timeout — silently degrade
    return apiSuccess({ found: false });
  }
}
