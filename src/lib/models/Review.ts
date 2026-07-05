import { model, models, Schema, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
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

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

export const Review = models.Review || model("Review", reviewSchema);
