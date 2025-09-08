"use client";

import { useState, useCallback } from "react";
import {
  ApiError,
  ErrorState,
  isRetryableError,
  getRetryDelay,
} from "@/lib/errorHandling";

export function useErrorHandling() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0,
  });

  const [isRetrying, setIsRetrying] = useState(false);

  const setError = useCallback((error: ApiError) => {
    setErrorState({
      hasError: true,
      error,
      retryCount: 0,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0,
    });
    setIsRetrying(false);
  }, []);

  const retry = useCallback(
    async (retryFn: () => Promise<void>) => {
      if (!errorState.error || !isRetryableError(errorState.error)) {
        return;
      }

      const newRetryCount = errorState.retryCount + 1;

      if (newRetryCount > 3) {
        // Max retries reached
        return;
      }

      setIsRetrying(true);
      setErrorState((prev) => ({
        ...prev,
        retryCount: newRetryCount,
      }));

      // Wait for retry delay
      const delay = getRetryDelay(newRetryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        await retryFn();
        clearError();
      } catch (error) {
        // Error will be handled by the calling function
        setIsRetrying(false);
      }
    },
    [errorState.error, errorState.retryCount, clearError]
  );

  const handleApiError = useCallback(
    (error: ApiError) => {
      setError(error);
    },
    [setError]
  );

  return {
    errorState,
    isRetrying,
    setError,
    clearError,
    retry,
    handleApiError,
  };
}
