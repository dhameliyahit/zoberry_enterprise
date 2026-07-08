import { unstable_cache } from "next/cache";

export function cacheProducts(fn: (params: Record<string, any>) => Promise<{ success: boolean; data: any[]; pagination?: any }>) {
  return unstable_cache(fn, undefined, {
    tags: ["catalog", "products"],
    revalidate: 60,
  });
}

export function cacheProductById(fn: (id: string) => Promise<any>) {
  return unstable_cache(fn, undefined, {
    tags: ["catalog", "products"],
    revalidate: 60,
  });
}

export function cacheProductBySlug(fn: (slug: string) => Promise<any>) {
  return unstable_cache(fn, undefined, {
    tags: ["catalog", "products"],
    revalidate: 60,
  });
}

export function cacheCategories(fn: (isActive?: boolean) => Promise<{ success: boolean; data: any[] }>) {
  return unstable_cache(fn, undefined, {
    tags: ["catalog", "categories"],
    revalidate: 300,
  });
}

export function cacheCategoryById(fn: (id: string) => Promise<any>) {
  return unstable_cache(fn, undefined, {
    tags: ["catalog", "categories"],
    revalidate: 300,
  });
}

export function cacheCategoryBySlug(fn: (slug: string) => Promise<any>) {
  return unstable_cache(fn, undefined, {
    tags: ["catalog", "categories"],
    revalidate: 300,
  });
}

export function cacheHeroSlides(fn: (isActive?: boolean) => Promise<{ success: boolean; data: any[] }>) {
  return unstable_cache(fn, undefined, {
    tags: ["catalog", "hero-slides"],
    revalidate: 300,
  });
}

export function cacheHeroSlideById(fn: (id: string) => Promise<any>) {
  return unstable_cache(fn, undefined, {
    tags: ["catalog", "hero-slides"],
    revalidate: 300,
  });
}
