import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";
import slugify from "slugify";

const storefrontCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "StorefrontCategory",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

storefrontCategorySchema.pre("save", function updateSlug(next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

storefrontCategorySchema.index({ parentCategory: 1 });

export type StorefrontCategoryDocument = InferSchemaType<typeof storefrontCategorySchema>;

const StorefrontCategoryModel = models.StorefrontCategory as Model<StorefrontCategoryDocument> | undefined;

export const StorefrontCategory =
  StorefrontCategoryModel || model<StorefrontCategoryDocument>("StorefrontCategory", storefrontCategorySchema, "categories");

export { StorefrontCategory as Category };
