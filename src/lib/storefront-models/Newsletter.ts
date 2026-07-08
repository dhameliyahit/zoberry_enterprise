import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontNewsletterSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  },
  { timestamps: true }
);

export type StorefrontNewsletterDocument = InferSchemaType<typeof storefrontNewsletterSchema>;

const StorefrontNewsletterModel = models.StorefrontNewsletter as Model<StorefrontNewsletterDocument> | undefined;

export const StorefrontNewsletter =
  StorefrontNewsletterModel || model<StorefrontNewsletterDocument>("StorefrontNewsletter", storefrontNewsletterSchema, "newsletter_subscriptions");
