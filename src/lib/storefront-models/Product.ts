import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";
import slugify from "slugify";

const variantOptionSchema = new Schema(
  {
    name: { type: String, required: true },
    values: [{ type: String }],
  },
  { _id: false }
);

const productVariantSchema = new Schema(
  {
    title: { type: String },
    sku: { type: String, trim: true },
    price: { type: Number, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    image: { type: String, default: "" },
    barcode: { type: String, trim: true },
    weight: { type: Number },
    option1: { type: String },
    option2: { type: String },
    option3: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const specificationSchema = new Schema(
  {
    key: { type: String },
    value: { type: String },
  },
  { _id: false }
);

const storefrontProductSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
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
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    productType: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: [0, "Compare-at price cannot be negative"],
    },
    costPrice: {
      type: Number,
      default: null,
      min: [0, "Cost price cannot be negative"],
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
        isFeatured: { type: Boolean, default: false },
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        title: { type: String, default: "" },
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "StorefrontCategory",
      required: [true, "Category is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    barcode: {
      type: String,
      trim: true,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    trackQuantity: {
      type: Boolean,
      default: true,
    },
    continueSelling: {
      type: Boolean,
      default: false,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variantOptions: [variantOptionSchema],
    variants: [productVariantSchema],
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },
    weight: { type: Number, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    length: { type: Number, default: null },
    specifications: [specificationSchema],
    discountedPrice: { type: Number, default: null, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

storefrontProductSchema.pre("save", function updateDerivedFields(next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified("status")) {
    this.isActive = this.status === "active";
  }
  if (this.isModified("isActive")) {
    this.status = this.isActive ? "active" : "draft";
  }
  next();
});

storefrontProductSchema.virtual("name").get(function exposeLegacyName() {
  return this.title;
});

storefrontProductSchema.virtual("margin").get(function calculateMargin() {
  if (this.costPrice && this.price && this.price > 0) {
    return Math.round(((this.price - this.costPrice) / this.price) * 100);
  }
  return null;
});

storefrontProductSchema.set("toJSON", { virtuals: true });
storefrontProductSchema.set("toObject", { virtuals: true });

storefrontProductSchema.index({ category: 1 });
storefrontProductSchema.index({ status: 1 });
storefrontProductSchema.index({ isFeatured: 1 });
storefrontProductSchema.index({ price: 1 });
storefrontProductSchema.index({ "variants.sku": 1 });

export type StorefrontProductDocument = InferSchemaType<typeof storefrontProductSchema>;

const StorefrontProductModel = models.StorefrontProduct as Model<StorefrontProductDocument> | undefined;

export const StorefrontProduct =
  StorefrontProductModel || model<StorefrontProductDocument>("StorefrontProduct", storefrontProductSchema, "products");

export { StorefrontProduct as Product };
