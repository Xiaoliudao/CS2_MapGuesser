import { describe, expect, it } from "vitest";
import { APP_BUILD_ID } from "../shared/appVersion";
import { clientVersionResponse } from "./clientVersion";

describe("client version endpoint", () => {
  it("returns the deployed bundle identity without caching", async () => {
    const response = clientVersionResponse("GET");

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ version: APP_BUILD_ID });
  });
});
