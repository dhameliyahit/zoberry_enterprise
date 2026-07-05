import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storefrontAddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, default: "" },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const storefrontUserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      default: "",
    },
    addresses: {
      type: [storefrontAddressSchema],
      default: [],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

storefrontUserSchema.index({ role: 1 });

export type StorefrontUserDocument = InferSchemaType<typeof storefrontUserSchema>;

const StorefrontUserModel = models.StorefrontUser as Model<StorefrontUserDocument> | undefined;

export const StorefrontUser =
  StorefrontUserModel || model<StorefrontUserDocument>("StorefrontUser", storefrontUserSchema, "users");

export { StorefrontUser as User };
