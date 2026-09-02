import type { CallToolResult } from "@modelcontextprotocol/server";

export const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const;

export function success(data: Record<string, unknown>): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

export function failure(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return { isError: true, content: [{ type: "text", text: message }] };
}

export function sourceMetadata(
  provider: string,
  url: string | undefined,
  retrievedAt: Date,
): Record<string, unknown> {
  return {
    provider,
    ...(url ? { url } : {}),
    retrievedAt: retrievedAt.toISOString(),
    untrustedThirdPartyContent: true,
  };
}

export function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
