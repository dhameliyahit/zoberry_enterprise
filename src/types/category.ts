export type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentCategory: Category | string | null;
  isActive: boolean;
};
