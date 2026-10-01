import { handleMcpRequest } from "@puckoops/camelot-mcp";
import { catalogFor } from "./catalog";

export const dynamic = "force-dynamic";

function handle(request: Request) {
  return handleMcpRequest(request, catalogFor(request));
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
export const OPTIONS = handle;
