import { get, post } from "./api";
import type { ApiResponse, Product } from "@/types";

export const recentlyViewedService = {
  getRecentlyViewed: (macAddress: string) =>
    get<ApiResponse<Product[]>>("/recently-viewed", { macAddress }),

  addRecentlyViewed: (macAddress: string, productId: string) =>
    post<ApiResponse<null>>("/recently-viewed", { macAddress, productId }),
};
