export const CORS_ALLOWED_METHODS = ["GET", "POST", "DELETE", "OPTIONS"];
export const CORS_ALLOWED_HEADERS = ["Content-Type", "Accept", "Authorization", "Mcp-Session-Id", "MCP-Protocol-Version", "Last-Event-ID"];
export const CORS_EXPOSED_HEADERS = ["Mcp-Session-Id", "MCP-Protocol-Version", "WWW-Authenticate"];
export const CORS_MAX_AGE_SECONDS = 86_400;

export interface CorsRequest {
  requestHeaders?: string | null;
  privateNetwork?: boolean;
}

export function corsHeaders(origin = "*", { requestHeaders, privateNetwork = false }: CorsRequest = {}): Record<string, string> {
  const requested = (requestHeaders ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  const allowed = [...CORS_ALLOWED_HEADERS, ...requested.filter((h) => !CORS_ALLOWED_HEADERS.some((a) => a.toLowerCase() === h.toLowerCase()))];
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": CORS_ALLOWED_METHODS.join(", "),
    "Access-Control-Allow-Headers": allowed.join(", "),
    "Access-Control-Expose-Headers": CORS_EXPOSED_HEADERS.join(", "),
    "Access-Control-Max-Age": String(CORS_MAX_AGE_SECONDS),
  };
  if (origin !== "*") headers.Vary = "Origin";
  if (privateNetwork) headers["Access-Control-Allow-Private-Network"] = "true";
  return headers;
}
