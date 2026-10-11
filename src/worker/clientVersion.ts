import { APP_BUILD_ID } from "../shared/appVersion";

const CLIENT_VERSION_HEADERS = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

export function clientVersionResponse(method: string): Response {
  return method === "HEAD"
    ? new Response(null, { headers: CLIENT_VERSION_HEADERS })
    : Response.json({ version: APP_BUILD_ID }, { headers: CLIENT_VERSION_HEADERS });
}
