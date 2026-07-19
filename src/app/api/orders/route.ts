import mongoose, { type Types } from "mongoose";
import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import { StorefrontProduct } from "@/lib/storefront-models/Product";
import { getPaymentConfig } from "@/lib/payment-config";
import {
  generateBilledAmount,
  computeCaptureDeadline,
} from "@/lib/payment-capture";

const indianPhonePattern = /^(?:\+91|0)?[6-9]\d{9}$/;
const indianPincodePattern = /^\d{6}$/;
// Only these shipping costs are valid (free / FedEx / DHL) — prevents tampering.
const ALLOWED_SHIPPING_COSTS = [0, 150, 250];
const VALID_PAYMENT_METHODS = ["card", "upi", "netbanking", "directupi"];

type CreateOrderPayload = {
  items?: {
    product: string;
    title: string;
    image?: string;
    price?: number;
    quantity: number;
  }[];
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  total?: number;
  paymentMethod?: string;
  notes?: string;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();

  try {
    await connectToDatabase();

    // HARD authentication — no guest fallback. Order placement requires a real user.
    const user = await requireAuthenticatedUser(request);

    const rawText = await request.text();
    if (!rawText || !rawText.trim()) {
      return apiError("Request body is empty. Please fill the checkout form and try again.");
    }

    let body: CreateOrderPayload;
    try {
      body = JSON.parse(rawText) as CreateOrderPayload;
    } catch {
      return apiError("Invalid request. Could not parse order data. Please try again.");
    }

    const items = body.items || [];
    const shippingAddress = body.shippingAddress;

    if (!items.length) {
      return apiError("Order items are required");
    }

    if (!shippingAddress) {
      return apiError("Shipping address is required");
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.zip ||
      !shippingAddress.country
    ) {
      return apiError("All required shipping address fields must be provided");
    }

    if (!indianPhonePattern.test(shippingAddress.phone)) {
      return apiError("Please enter a valid Indian phone number");
    }

    if (!indianPincodePattern.test(shippingAddress.zip)) {
      return apiError("Please enter a valid 6-digit Indian pincode");
    }

    // Validate payment method against the admin-controlled configuration.
    const config = await getPaymentConfig();
    const requestedMethod = body.paymentMethod || "directupi";
    if (
      !VALID_PAYMENT_METHODS.includes(requestedMethod) ||
      !config.enabledMethods.includes(requestedMethod)
    ) {
      return apiError(
        `Payment method "${requestedMethod}" is not available. Enabled: ${config.enabledMethods.join(", ")}`,
        400
      );
    }

    const shippingCost = ALLOWED_SHIPPING_COSTS.includes(Number(body.shippingCost))
      ? Number(body.shippingCost)
      : 0;

    const productIds = items.map((item) => new mongoose.Types.ObjectId(item.product));

    session.startTransaction();

    const products = await StorefrontProduct.find({
      _id: { $in: productIds },
      isActive: true,
    }).session(session);

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    let subtotal = 0;

    for (const item of items) {
      if (!item.product || item.quantity < 1) {
        throw new Error("Each order item must include a valid product and quantity");
      }

      const product = productMap.get(item.product);

      if (!product) {
        throw new Error(`Product not found: ${item.title || item.product}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }

      product.stock -= item.quantity;
      subtotal += product.price * item.quantity;
      await product.save({ session });
    }

    // Server-authoritative pricing: never trust client totals.
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + shippingCost + tax;

    if (
      body.total !== undefined &&
      Math.abs(total - Number(body.total)) > 1
    ) {
      throw new Error("Order total mismatch. Please refresh and try again.");
    }

    // Generate a padded billed amount so this order has a unique exact amount.
    const orderCount = await StorefrontOrder.estimatedDocumentCount();
    const billedAmount = generateBilledAmount(total, orderCount);
    const captureDeadline = computeCaptureDeadline(new Date());

    const order = await StorefrontOrder.create(
      [
        {
          customer: user._id,
          items: items.map((item) => ({
            product: new mongoose.Types.ObjectId(item.product),
            title: item.title,
            image: item.image || "",
            price: productMap.get(item.product).price, // server source of truth
            quantity: item.quantity,
          })),
          shippingAddress: {
            fullName: shippingAddress.fullName.trim(),
            phone: shippingAddress.phone.trim(),
            street: shippingAddress.street.trim(),
            city: shippingAddress.city.trim(),
            state: shippingAddress.state?.trim() || "",
            zip: shippingAddress.zip.trim(),
            country: shippingAddress.country.trim(),
          },
          subtotal,
          shippingCost,
          tax,
          total,
          billedAmount,
          captureDeadline,
          paymentMethod: requestedMethod,
          upiVpa:
            requestedMethod === "directupi"
              ? config.providers?.directupi?.vpa || ""
              : "",
          notes: body.notes?.trim() || "",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return apiSuccess(order[0], 201);
  } catch (error) {
    await session.abortTransaction();
    return apiError(getErrorMessage(error, "Failed to create order"), 500);
  } finally {
    await session.endSession();
  }
}
