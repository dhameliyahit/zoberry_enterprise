import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontTestimonialSchema = new Schema(
  {
    review: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    authorRole: { type: String, default: "", trim: true },
    authorImg: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

storefrontTestimonialSchema.index({ isActive: 1, order: 1 });

export type StorefrontTestimonialDocument = InferSchemaType<typeof storefrontTestimonialSchema>;

const StorefrontTestimonialModel =
  models.StorefrontTestimonial as Model<StorefrontTestimonialDocument> | undefined;

export const StorefrontTestimonial =
  StorefrontTestimonialModel ||
  model<StorefrontTestimonialDocument>("StorefrontTestimonial", storefrontTestimonialSchema, "testimonials");

export { StorefrontTestimonial as Testimonial };
