import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";

/**
 * Parameters for logging application errors
 */
export interface LogAppErrorParams {
  userId?: string;
  message: string;
  severity: Database["public"]["Enums"]["log_severity_enum"];
  stackTrace?: string;
  payload?: Record<string, unknown>;
  planId?: string;
}

/**
 * Logs an application error to the database
 * @param supabase - Supabase client instance
 * @param params - Error logging parameters
 */
export async function logAppError(supabase: SupabaseClient, params: LogAppErrorParams): Promise<void> {
  try {
    // Simulate async DB logging with a delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Mock: log error details to the server console
    // In production, replace with Supabase 'app_error_logs' insert
    // eslint-disable-next-line no-console
    console.error("Mock App Error Log:", {
      occurrence: new Date().toISOString(),
      userId: params.userId || null,
      planId: params.planId || null,
      severity: params.severity,
      message: params.message,
      stackTrace: params.stackTrace || null,
      payload: params.payload || null,
    });

    // Production implementation (commented out for now):
    /*
    await supabase.from('app_error_logs').insert({
      user_id: params.userId || null,
      plan_id: params.planId || null,
      severity: params.severity,
      message: params.message,
      stack_trace: params.stackTrace || null,
      payload: params.payload || null,
    });
    */
  } catch (logError) {
    // Failed to log error - log to console as fallback
    // eslint-disable-next-line no-console
    console.error("Failed to log application error:", logError);
    // eslint-disable-next-line no-console
    console.error("Original error details:", params);
  }
}

/**
 * Formats an error into a standardized error response
 * @param error - The error to format
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Formatted error message string
 */
export function formatErrorMessage(error: unknown, defaultMessage = "An unexpected error occurred"): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return defaultMessage;
}

/**
 * Extracts stack trace from an error
 * @param error - The error to extract stack trace from
 * @returns Stack trace string or undefined
 */
export function getStackTrace(error: unknown): string | undefined {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }

  return undefined;
}
