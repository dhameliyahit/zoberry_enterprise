import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontOrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "StorefrontProduct",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const storefrontShippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },
    zip: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const storefrontOrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "StorefrontUser",
      required: true,
    },
    shippingAddress: {
      type: storefrontShippingAddressSchema,
      required: true,
    },
    items: {
      type: [storefrontOrderItemSchema],
      validate: [(items: unknown[]) => items.length > 0, "Order items are required"],
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "netbanking", "wallet"],
      default: "cod",
    },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

storefrontOrderSchema.pre("save", async function assignOrderNumber(next) {
  if (!this.isNew || this.orderNumber) {
    next();
    return;
  }

  const count = await StorefrontOrder.countDocuments();
  this.orderNumber = `ZOB-${10001 + count}`;
  next();
});

storefrontOrderSchema.index({ customer: 1, createdAt: -1 });
storefrontOrderSchema.index({ status: 1 });
storefrontOrderSchema.index({ paymentStatus: 1 });

export type StorefrontOrderDocument = InferSchemaType<typeof storefrontOrderSchema>;

const StorefrontOrderModel = models.StorefrontOrder as Model<StorefrontOrderDocument> | undefined;

export const StorefrontOrder =
  StorefrontOrderModel || model<StorefrontOrderDocument>("StorefrontOrder", storefrontOrderSchema, "orders");

export { StorefrontOrder as Order };
