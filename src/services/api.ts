const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  }
  return process.env.API_URL || "http://localhost:5000/api";
};

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zoberry_token");
  }
  return null;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const inflightRequests = new Map<string, Promise<any>>();

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = options.method || "GET";
  const url = `${getBaseUrl()}${endpoint}`;
  const token = getToken();

  if (method.toUpperCase() === "GET") {
    const cacheKey = `${url}::${token || ""}`;

    if (inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const headers: Record<string, string> = {
          ...(options.headers as Record<string, string>),
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        if (!(options.body instanceof FormData)) {
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new ApiError(data.error || "Request failed", response.status);
        }

        return data;
      } finally {
        setTimeout(() => {
          inflightRequests.delete(cacheKey);
        }, 1000);
      }
    })();

    inflightRequests.set(cacheKey, promise);
    return promise;
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Request failed", response.status);
  }

  return data;
}

export function get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  return request<T>(url);
}

export function post<T>(endpoint: string, body?: any): Promise<T> {
  return request<T>(endpoint, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function put<T>(endpoint: string, body?: any): Promise<T> {
  return request<T>(endpoint, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function patch<T>(endpoint: string, body?: any): Promise<T> {
  return request<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" });
}

export { ApiError };
