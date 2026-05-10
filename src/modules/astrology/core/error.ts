import type { AstrologyInfrastructureSnapshot, AstrologySafeError } from "@/modules/astrology/core/types";

export function createAstrologySafeError(
  code: string,
  message: string,
  details?: unknown
): AstrologySafeError {
  return {
    code,
    message,
    details,
  };
}

export function createAstrologyInfrastructureSnapshot<T>(input: {
  status: AstrologyInfrastructureSnapshot<T>["status"];
  data: T | null;
  warnings?: string[];
  error?: AstrologySafeError | null;
}): AstrologyInfrastructureSnapshot<T> {
  return {
    status: input.status,
    data: input.data,
    warnings: input.warnings ?? [],
    error: input.error ?? null,
  };
}
