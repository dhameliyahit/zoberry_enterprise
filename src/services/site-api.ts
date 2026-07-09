const inflightRequests = new Map<string, Promise<any>>();

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || "GET";

  if (method.toUpperCase() === "GET") {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage.getItem("zoberry_token") || "";
    }
    const cacheKey = `${url}::${token}`;

    if (inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const headers: Record<string, string> = {
          ...(options.headers as Record<string, string>),
        };

        if (typeof window !== "undefined") {
          const token = localStorage.getItem("zoberry_token");
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }

        if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Request failed");
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

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("zoberry_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
) {
  let url = `/api${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}

export function getFromSiteApi<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
) {
  return request<T>(buildUrl(endpoint, params));
}

export function postToSiteApi<T>(endpoint: string, body?: unknown) {
  return request<T>(buildUrl(endpoint), {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body || {}),
  });
}

export function putToSiteApi<T>(endpoint: string, body?: unknown) {
  return request<T>(buildUrl(endpoint), {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body || {}),
  });
}

export function patchToSiteApi<T>(endpoint: string, body?: unknown) {
  return request<T>(buildUrl(endpoint), {
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body || {}),
  });
}

export function deleteFromSiteApi<T>(endpoint: string) {
  return request<T>(buildUrl(endpoint), {
    method: "DELETE",
  });
}
