export type BlogItem = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
};
