import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { getGateway } from "@/lib/payment-gateways";

export const runtime = "nodejs";

// Client-side pollable status. UroPay allows calling this without auth headers.
export async function GET(request: NextRequest) {
  try {
    const uroPayOrderId = request.nextUrl.searchParams.get("uroPayOrderId");
    if (!uroPayOrderId) return apiError("uroPayOrderId is required");

    const gateway = await getGateway("uropay");
    const data = await gateway.getStatus(uroPayOrderId);

    return apiSuccess(data);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to fetch payment status"), 500);
  }
}
