import { describe, expect, it, vi } from "vitest";
import { checkForClientUpdate } from "./useClientVersionGuard";

describe("client version guard", () => {
  it("keeps the current page when client and deployment versions match", async () => {
    const onMismatch = vi.fn();
    const changed = await checkForClientUpdate({
      currentVersion: "build-a",
      fetchVersion: async () => Response.json({ version: "build-a" }),
      onMismatch,
    });

    expect(changed).toBe(false);
    expect(onMismatch).not.toHaveBeenCalled();
  });

  it("requests one reload target when a newer deployment is detected", async () => {
    const onMismatch = vi.fn();
    const changed = await checkForClientUpdate({
      currentVersion: "build-a",
      fetchVersion: async () => Response.json({ version: "build-b" }),
      onMismatch,
    });

    expect(changed).toBe(true);
    expect(onMismatch).toHaveBeenCalledOnce();
    expect(onMismatch).toHaveBeenCalledWith("build-b");
  });

  it("does not disrupt the match when the version endpoint is unavailable", async () => {
    const onMismatch = vi.fn();
    const changed = await checkForClientUpdate({
      currentVersion: "build-a",
      fetchVersion: async () => new Response(null, { status: 503 }),
      onMismatch,
    });

    expect(changed).toBe(false);
    expect(onMismatch).not.toHaveBeenCalled();
  });
});
