import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontHeroVideoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    product: { type: Schema.Types.ObjectId, ref: "StorefrontProduct", required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

storefrontHeroVideoSchema.index({ isActive: 1, order: 1 });

export type StorefrontHeroVideoDocument = InferSchemaType<typeof storefrontHeroVideoSchema>;

// Force clear cached model to handle Next.js development hot-reloading changes
if (models.StorefrontHeroVideo) {
  delete (models as any).StorefrontHeroVideo;
}

export const StorefrontHeroVideo =
  model<StorefrontHeroVideoDocument>("StorefrontHeroVideo", storefrontHeroVideoSchema, "herovideos");

export { StorefrontHeroVideo as HeroVideo };
