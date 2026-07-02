export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type LoginResponse = {
  success: boolean;
  error?: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
};
