import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontContact } from "@/lib/storefront-models/Contact";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return apiError("Name, email, and message are required");
    }

    const contact = await StorefrontContact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return apiSuccess(contact, 201);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to submit contact message"), 500);
  }
}
