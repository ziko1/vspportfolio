import { describe, expect, it } from "vitest";
import { getProbe } from "./api";

describe("fixed-scope API probes", () => {
  it("recognizes an available API without exposing credentials", async () => {
    const mock: typeof fetch = async (_path, init) => {
      expect(init?.credentials).toBe("omit");
      expect(init?.cache).toBe("no-store");
      return new Response(JSON.stringify({ ok: true, service: "vspportfolio-solid-axum-pilot" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    };
    const result = await getProbe("/api/migration/health", mock);
    expect(result.ok).toBe(true);
    expect(result.service).toBe("vspportfolio-solid-axum-pilot");
  });

  it("fails closed when PostgreSQL is absent", async () => {
    const mock: typeof fetch = async () =>
      new Response(JSON.stringify({ ok: false, database: "not_configured" }), { status: 503 });
    expect(await getProbe("/api/migration/ready", mock)).toEqual({
      ok: false,
      database: "not_configured"
    });
  });

  it("rejects inconsistent JSON body and HTTP status", async () => {
    const mock: typeof fetch = async () =>
      new Response(JSON.stringify({ ok: true }), { status: 503 });
    await expect(getProbe("/api/migration/ready", mock)).rejects.toThrow("INVALID_PROBE_RESPONSE");
  });

  it("does not treat a server error as healthy", async () => {
    const mock: typeof fetch = async () => new Response("internal error", { status: 500 });
    await expect(getProbe("/api/migration/health", mock)).rejects.toThrow("UNEXPECTED_HTTP_STATUS");
  });

  it.each([
    [200, { ok: true }],
    [200, { ok: true, database: "unavailable" }],
    [200, { ok: false, database: "ready" }],
    [503, { ok: false, database: "ready" }],
    [503, { ok: false, database: ["unavailable"] }],
    [200, null]
  ])("rejects inconsistent readiness payload (%s, %j)", async (status, body) => {
    const mock: typeof fetch = async () => new Response(JSON.stringify(body), { status });
    await expect(getProbe("/api/migration/ready", mock)).rejects.toThrow("INVALID_PROBE_RESPONSE");
  });

  it("accepts ready only after a successful database probe", async () => {
    const mock: typeof fetch = async () =>
      new Response(JSON.stringify({ ok: true, database: "ready" }), { status: 200 });
    expect(await getProbe("/api/migration/ready", mock)).toEqual({ ok: true, database: "ready" });
  });

  it("rejects a response belonging to another service", async () => {
    const mock: typeof fetch = async () =>
      new Response(JSON.stringify({ ok: true, service: "other" }), { status: 200 });
    await expect(getProbe("/api/migration/health", mock)).rejects.toThrow("INVALID_PROBE_RESPONSE");
  });

  it("rejects arbitrary URLs before transport", async () => {
    let called = false;
    const mock: typeof fetch = async () => { called = true; return new Response(); };
    // Exercise an untyped caller crossing the TypeScript boundary.
    await expect(getProbe("https://example.com" as never, mock)).rejects.toThrow("INVALID_PROBE_PATH");
    expect(called).toBe(false);
  });

  it("propagates network/timeout failure without a success result", async () => {
    const mock: typeof fetch = async (_path, init) => {
      expect(init?.redirect).toBe("error");
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      throw new DOMException("Timed out", "TimeoutError");
    };
    await expect(getProbe("/api/migration/health", mock)).rejects.toThrow("Timed out");
  });
});

