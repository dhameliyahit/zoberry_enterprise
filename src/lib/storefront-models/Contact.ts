import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    subject: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

storefrontContactSchema.index({ isRead: 1, createdAt: -1 });

export type StorefrontContactDocument = InferSchemaType<typeof storefrontContactSchema>;

const StorefrontContactModel = models.StorefrontContact as Model<StorefrontContactDocument> | undefined;

export const StorefrontContact =
  StorefrontContactModel || model<StorefrontContactDocument>("StorefrontContact", storefrontContactSchema, "contacts");

export { StorefrontContact as Contact };
