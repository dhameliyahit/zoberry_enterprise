import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontHeroSlideSchema = new Schema(
  {
    discount: { type: String, default: "", trim: true },
    subtitle: { type: String, default: "", trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    link: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

storefrontHeroSlideSchema.index({ isActive: 1, order: 1 });

export type StorefrontHeroSlideDocument = InferSchemaType<typeof storefrontHeroSlideSchema>;

const StorefrontHeroSlideModel = models.StorefrontHeroSlide as Model<StorefrontHeroSlideDocument> | undefined;

export const StorefrontHeroSlide =
  StorefrontHeroSlideModel ||
  model<StorefrontHeroSlideDocument>("StorefrontHeroSlide", storefrontHeroSlideSchema, "heroslides");

export { StorefrontHeroSlide as HeroSlide };
