import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";
import slugify from "slugify";

const storefrontBlogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    category: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },
    author: { type: String, default: "Zoberry" },
    views: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

storefrontBlogSchema.pre("save", function updateBlogSlug(next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

storefrontBlogSchema.index({ slug: 1 });
storefrontBlogSchema.index({ category: 1, isActive: 1 });
storefrontBlogSchema.index({ publishedAt: -1 });

export type StorefrontBlogDocument = InferSchemaType<typeof storefrontBlogSchema>;

const StorefrontBlogModel = models.StorefrontBlog as Model<StorefrontBlogDocument> | undefined;

export const StorefrontBlog =
  StorefrontBlogModel || model<StorefrontBlogDocument>("StorefrontBlog", storefrontBlogSchema, "blogs");

export { StorefrontBlog as Blog };
