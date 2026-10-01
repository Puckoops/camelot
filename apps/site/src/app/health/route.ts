import { handleHealthRequest } from "@puckoops/camelot-mcp";
import { catalogFor } from "../mcp/catalog";

export const dynamic = "force-dynamic";

function handle(request: Request) {
  return handleHealthRequest(request, catalogFor(request));
}

export const GET = handle;
export const HEAD = handle;
export const OPTIONS = handle;
