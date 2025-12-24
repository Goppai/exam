/* eslint-disable @typescript-eslint/no-explicit-any */
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  const json: ApiResponse<T> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.msg || 'API error');
  }
  return json.data;
}

/**
 * 解析试卷
 */
export async function extractExam(
  file: File,
  subject: string = 'auto',
  debug: boolean = false
) {
  const form = new FormData();
  form.append('file', file);

  const params = new URLSearchParams({
    subject,
    debug: debug ? 'true' : 'false',
  });

  return request<{
    from_cache: boolean;
    cost: number;
    subject: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
    raw?: string;
  }>(`/api/extract?${params.toString()}`, {
    method: 'POST',
    body: form,
  });
}

/**
 * 单题讲解
 */
export async function explainQuestion(subject: string, question: any) {
  return request<{
    from_cache: boolean;
    cost: number;
    explanation: string;
  }>('/api/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subject, question }),
  });
}
