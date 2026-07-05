import { postToSiteApi } from "./site-api";
import type { ApiResponse, Contact } from "@/types";

export const contactService = {
  create: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    postToSiteApi<ApiResponse<Contact>>("/contact", data),
};
