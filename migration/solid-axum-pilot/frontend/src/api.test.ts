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
});

