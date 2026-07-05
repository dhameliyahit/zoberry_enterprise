import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "StorefrontUser",
      required: [true, "Review must belong to a user"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "StorefrontProduct",
      required: [true, "Review must belong to a product"],
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating between 1 and 5"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
      trim: true,
    },
  },
  { timestamps: true }
);

storefrontReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export type StorefrontReviewDocument = InferSchemaType<typeof storefrontReviewSchema>;

const StorefrontReviewModel = models.StorefrontReview as Model<StorefrontReviewDocument> | undefined;

export const StorefrontReview =
  StorefrontReviewModel || model<StorefrontReviewDocument>("StorefrontReview", storefrontReviewSchema, "reviews");

export { StorefrontReview as Review };
