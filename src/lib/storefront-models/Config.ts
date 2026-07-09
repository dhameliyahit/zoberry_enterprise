import { model, models, Schema, type Model, type InferSchemaType } from "mongoose";

// Mirrors the admin `Config` model and reads the same `configs` collection,
// so payment settings configured in the admin panel are visible to the storefront.
const storefrontConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

type StorefrontConfigDocument = InferSchemaType<typeof storefrontConfigSchema>;

const StorefrontConfigModel = models.StorefrontConfig as
  | Model<StorefrontConfigDocument>
  | undefined;

export const StorefrontConfig =
  StorefrontConfigModel ||
  model<StorefrontConfigDocument>("StorefrontConfig", storefrontConfigSchema, "configs");

export { StorefrontConfig as Config };
