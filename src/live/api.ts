export interface ApiError extends Error {
  status?: number;
}

export async function api<T = any>(
  path: string,
  method = "GET",
  body?: any,
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
      "Không kết nối được máy chủ. Nội dung đang nhập vẫn được giữ; hãy thử lại khi có kết nối.",
    );
  }
  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Máy chủ chưa sẵn sàng. Vui lòng kiểm tra kết nối và tải lại.",
    );
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "/login")
      window.dispatchEvent(new Event("lms:unauthorized"));
    const error: ApiError = new Error(
      data.error || "Không thực hiện được yêu cầu.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
export const roleLabels = {
  admin: "Quản trị",
  instructor: "Giảng viên",
  learner: "Người học",
  manager: "Quản lý",
};
export const statusLabels = {
  draft: "Bản nháp",
  published: "Đã phát hành",
  archived: "Đã lưu trữ",
  todo: "Chưa nộp",
  submitted: "Chờ đánh giá",
  revision: "Cần bổ sung",
  approved: "Đã đạt",
};
export const dateLabel = (value: string | number | Date) =>
  new Date(value).toLocaleString("vi-VN");
