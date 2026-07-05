import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";

const indianPhonePattern = /^(?:\+91|0)?[6-9]\d{9}$/;
const indianPincodePattern = /^\d{6}$/;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuthenticatedUser(request);
    const body = await request.json();

    const address = {
      label: typeof body.label === "string" && body.label.trim() ? body.label.trim() : "Home",
      fullName: typeof body.fullName === "string" ? body.fullName.trim() : "",
      phone: typeof body.phone === "string" ? body.phone.trim() : "",
      street: typeof body.street === "string" ? body.street.trim() : "",
      city: typeof body.city === "string" ? body.city.trim() : "",
      state: typeof body.state === "string" ? body.state.trim() : "",
      zip: typeof body.zip === "string" ? body.zip.trim() : "",
      country: typeof body.country === "string" ? body.country.trim() : "",
      isDefault: Boolean(body.isDefault),
    };

    if (!address.fullName || !address.phone || !address.street || !address.city || !address.zip || !address.country) {
      return apiError("All required address fields must be provided");
    }

    if (!indianPhonePattern.test(address.phone)) {
      return apiError("Please enter a valid Indian phone number");
    }

    if (!indianPincodePattern.test(address.zip)) {
      return apiError("Please enter a valid 6-digit Indian pincode");
    }

    user.addresses.push(address);
    await user.save();

    return apiSuccess(user.addresses);
  } catch (error) {
    const message = getErrorMessage(error, "Failed to save address");
    const status = message === "Authentication required" || message === "User not found" ? 401 : 500;
    return apiError(message, status);
  }
}
