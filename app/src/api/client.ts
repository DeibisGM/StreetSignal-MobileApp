import {API_BASE_URL} from '../constants';

const REQUEST_TIMEOUT_MS = 10_000;

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new TypeError('Network request failed');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({message: 'Request failed'}));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, {method: 'GET'}, token),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, {method: 'POST', body: JSON.stringify(body)}, token),

  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, {method: 'PATCH', body: JSON.stringify(body)}, token),

  postForm: <T>(endpoint: string, formData: FormData, token?: string) =>
    request<T>(
      endpoint,
      {method: 'POST', headers: {}, body: formData},
      token,
    ),
};
