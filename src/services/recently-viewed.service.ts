import { getFromSiteApi, postToSiteApi } from "./site-api";
import type { ApiResponse, Product } from "@/types";

export const recentlyViewedService = {
  getRecentlyViewed: (macAddress: string) =>
    getFromSiteApi<ApiResponse<Product[]>>("/recently-viewed", { macAddress }),

  addRecentlyViewed: (macAddress: string, productId: string) =>
    postToSiteApi<ApiResponse<null>>("/recently-viewed", { macAddress, productId }),
};
