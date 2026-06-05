import {BASE_URL} from './endpoints';
import {sessionManager} from './sessionManager';
import {ApiError} from './types';

const JSON_TIMEOUT_MS = 15_000;
const MULTIPART_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 2;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {...options, signal: controller.signal});
  } finally {
    clearTimeout(timeoutId);
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let code = `HTTP_${response.status}`;
  let message = `Request failed with status ${response.status}`;
  try {
    const body = (await response.json()) as {code?: string; message?: string};
    if (body.code) {
      code = body.code;
    }
    if (body.message) {
      message = body.message;
    }
  } catch {
    // Body is not JSON — keep defaults.
  }
  return new ApiError(code, message, response.status);
}

function buildHeaders(
  token: string | null,
  isMultipart: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  endpoint: string,
  options: RequestInit,
  isMultipart = false,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const timeoutMs = isMultipart ? MULTIPART_TIMEOUT_MS : JSON_TIMEOUT_MS;

  const headers: Record<string, string> = {
    ...buildHeaders(sessionManager.getToken(), isMultipart),
    ...(options.headers as Record<string, string> | undefined),
  };

  const requestOptions: RequestInit = {...options, headers};

  let lastNetworkError: ApiError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (__DEV__) {
        console.log(`[API] ${String(options.method)} ${url}`);
      }

      const response = await fetchWithTimeout(url, requestOptions, timeoutMs);

      if (!response.ok) {
        const apiError = await toApiError(response);
        if (__DEV__) {
          console.warn(
            `[API] ${String(options.method)} ${url} -> ${response.status} ${apiError.code}: ${apiError.message}`,
          );
        }
        // Only trigger the unauthorized handler when there is an active
        // session. Without this guard a fire-and-forget logout request
        // (sent without a token) that returns 401 would call logout() again
        // and wipe status='authenticated' if the user had already signed
        // back in by the time the stale response arrived.
        if (response.status === 401 && sessionManager.getToken() !== null) {
          sessionManager.notifyUnauthorized();
        }
        throw apiError;
      }

      if (__DEV__) {
        console.log(
          `[API] ${String(options.method)} ${url} -> ${response.status}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network / timeout error — eligible for 1 retry.
      lastNetworkError = new ApiError(
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network error',
        0,
      );

      if (__DEV__) {
        console.warn(
          `[API] Network error (attempt ${attempt}/${MAX_ATTEMPTS})`,
          error,
        );
      }

      if (attempt < MAX_ATTEMPTS) {
        await new Promise<void>(resolve => setTimeout(resolve, 500));
      }
    }
  }

  throw lastNetworkError ?? new ApiError('UNKNOWN_ERROR', 'Unknown error', 0);
}

export const apiClient = {
  get: <T>(endpoint: string): Promise<T> =>
    request<T>(endpoint, {method: 'GET'}),

  post: <T>(endpoint: string, body: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string): Promise<T> =>
    request<T>(endpoint, {method: 'DELETE'}),

  postForm: <T>(endpoint: string, formData: FormData): Promise<T> =>
    request<T>(endpoint, {method: 'POST', body: formData}, true),
};
