export interface ApiError {
  status: number;
  message: string;
  credits?: number;
  type: "auth" | "credits" | "server" | "network" | "unknown";
}

export interface ErrorState {
  hasError: boolean;
  error: ApiError | null;
  retryCount: number;
}

/**
 * Parse API error response and categorize it
 */
export function parseApiError(
  response: Response,
  errorData?: unknown
): ApiError {
  const status = response.status;
  let message = "An unexpected error occurred";
  let type: ApiError["type"] = "unknown";

  // Try to get error message from response
  if (errorData && typeof errorData === "object" && errorData !== null) {
    const errorObj = errorData as Record<string, unknown>;
    if (typeof errorObj.error === "string") {
      message = errorObj.error;
    } else if (typeof errorObj.message === "string") {
      message = errorObj.message;
    }
  }

  // Categorize error based on status code
  if (status === 401) {
    type = "auth";
    message = "Please sign in to continue";
  } else if (status === 402) {
    type = "credits";
    if (errorData && typeof errorData === "object" && errorData !== null) {
      const errorObj = errorData as Record<string, unknown>;
      message =
        typeof errorObj.error === "string"
          ? errorObj.error
          : "Insufficient credits. Please add more credits to continue.";
    } else {
      message = "Insufficient credits. Please add more credits to continue.";
    }
  } else if (status >= 500) {
    type = "server";
    message = "Server error. Please try again later.";
  } else if (status === 0 || !response.ok) {
    type = "network";
    message = "Network error. Please check your connection.";
  }

  let credits: number | undefined;
  if (errorData && typeof errorData === "object" && errorData !== null) {
    const errorObj = errorData as Record<string, unknown>;
    if (typeof errorObj.credits === "number") {
      credits = errorObj.credits;
    }
  }

  return {
    status,
    message,
    credits,
    type,
  };
}

/**
 * Handle API call with proper error handling
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<Response>
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const response = await apiCall();

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}` };
      }

      const error = parseApiError(response, errorData);
      return { data: null, error };
    }

    const data = await response.json();
    return { data, error: null };
  } catch {
    const error: ApiError = {
      status: 0,
      message: "Network error. Please check your connection and try again.",
      type: "network",
    };
    return { data: null, error };
  }
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: ApiError): string {
  switch (error.type) {
    case "auth":
      return "Please sign in to continue using the app.";
    case "credits":
      return `You don't have enough credits. ${
        error.credits !== undefined
          ? `You have ${error.credits} credits remaining.`
          : ""
      } Please add more credits to continue.`;
    case "server":
      return "Something went wrong on our end. Please try again in a few moments.";
    case "network":
      return "Please check your internet connection and try again.";
    default:
      return error.message || "An unexpected error occurred. Please try again.";
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  return error.type === "network" || error.type === "server";
}

/**
 * Get retry delay based on retry count
 */
export function getRetryDelay(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
  return Math.min(1000 * Math.pow(2, retryCount), 10000);
}
