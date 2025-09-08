"use client";

import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  LogIn,
  Coins,
  Wifi,
  Server,
} from "lucide-react";
import { ApiError, getErrorMessage } from "@/lib/errorHandling";

interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
  onSignIn?: () => void;
  onAddCredits?: () => void;
  retryCount?: number;
  isRetrying?: boolean;
}

export default function ErrorDisplay({
  error,
  onRetry,
  onSignIn,
  onAddCredits,
  retryCount = 0,
  isRetrying = false,
}: ErrorDisplayProps) {
  const getIcon = () => {
    switch (error.type) {
      case "auth":
        return <LogIn className="w-8 h-8 text-red-500" />;
      case "credits":
        return <Coins className="w-8 h-8 text-yellow-500" />;
      case "network":
        return <Wifi className="w-8 h-8 text-orange-500" />;
      case "server":
        return <Server className="w-8 h-8 text-red-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (error.type) {
      case "auth":
        return "Authentication Required";
      case "credits":
        return "Insufficient Credits";
      case "network":
        return "Connection Error";
      case "server":
        return "Server Error";
      default:
        return "Something Went Wrong";
    }
  };

  const getActionButton = () => {
    if (isRetrying) {
      return (
        <button
          disabled
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Retrying...</span>
        </button>
      );
    }

    switch (error.type) {
      case "auth":
        return onSignIn ? (
          <button
            onClick={onSignIn}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        ) : null;

      case "credits":
        return onAddCredits ? (
          <button
            onClick={onAddCredits}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
          >
            <Coins className="w-4 h-4" />
            <span>Add Credits</span>
          </button>
        ) : null;

      case "network":
      case "server":
        return onRetry ? (
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        ) : null;

      default:
        return onRetry ? (
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        ) : null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full border border-white/10">
        {/* Icon */}
        <div className="flex justify-center mb-6">{getIcon()}</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">{getTitle()}</h2>

        {/* Message */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          {getErrorMessage(error)}
        </p>

        {/* Credits info for credit errors */}
        {error.type === "credits" && error.credits !== undefined && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <Coins className="w-5 h-5" />
              <span className="font-semibold">
                Current Credits: {error.credits}
              </span>
            </div>
          </div>
        )}

        {/* Retry count for retryable errors */}
        {retryCount > 0 &&
          (error.type === "network" || error.type === "server") && (
            <p className="text-sm text-gray-400 mb-6">
              Attempt {retryCount + 1} of 3
            </p>
          )}

        {/* Action Button */}
        <div className="flex justify-center">{getActionButton()}</div>

        {/* Additional help text */}
        {error.type === "network" && (
          <p className="text-xs text-gray-500 mt-4">
            Check your internet connection and try again
          </p>
        )}

        {error.type === "server" && (
          <p className="text-xs text-gray-500 mt-4">
            If the problem persists, please contact support
          </p>
        )}
      </div>
    </div>
  );
}
