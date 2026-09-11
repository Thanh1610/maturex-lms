export interface ApiError extends Error {
  status?: number;
}

export * from "./api-routes";

export async function api<T = unknown>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Không kết nối được máy chủ. Vui lòng kiểm tra lại kết nối mạng.",
    );
  }
  let data: Record<string, unknown> | null = null;
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new Error(
      "Máy chủ chưa sẵn sàng hoặc phản hồi không đúng định dạng.",
    );
  }
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("lms:unauthorized"));
      }
    }
    const errorMessage =
      typeof data?.error === "string"
        ? data.error
        : "Không thực hiện được yêu cầu.";
    const error: ApiError = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  return data as T;
}
