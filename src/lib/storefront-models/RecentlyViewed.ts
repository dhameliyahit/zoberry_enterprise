import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontRecentlyViewedSchema = new Schema(
  {
    macAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "StorefrontProduct",
      },
    ],
  },
  { timestamps: true }
);

export type StorefrontRecentlyViewedDocument = InferSchemaType<typeof storefrontRecentlyViewedSchema>;

const StorefrontRecentlyViewedModel =
  models.StorefrontRecentlyViewed as Model<StorefrontRecentlyViewedDocument> | undefined;

export const StorefrontRecentlyViewed =
  StorefrontRecentlyViewedModel ||
  model<StorefrontRecentlyViewedDocument>("StorefrontRecentlyViewed", storefrontRecentlyViewedSchema, "recentlyvieweds");

export { StorefrontRecentlyViewed as RecentlyViewed };
