export type ProbePath = "/api/migration/health" | "/api/migration/ready";

export interface Probe {
  ok: boolean;
  service?: string;
  database?: "ready" | "unavailable" | "not_configured";
}

// Only allow fixed same-origin paths. Credentials and arbitrary URLs are never forwarded.
export async function getProbe(
  path: ProbePath,
  transport: typeof fetch = fetch
): Promise<Probe> {
  if (path !== "/api/migration/health" && path !== "/api/migration/ready") {
    throw new Error("INVALID_PROBE_PATH");
  }
  const response = await transport(path, {
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
    signal: AbortSignal.timeout(2500)
  });

  if (response.status !== 200 && response.status !== 503) {
    throw new Error("UNEXPECTED_HTTP_STATUS");
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("INVALID_PROBE_RESPONSE");
  }

  const record = payload as Record<string, unknown>;
  if (path === "/api/migration/health") {
    if (response.status !== 200 || record.ok !== true ||
        record.service !== "vspportfolio-solid-axum-pilot") {
      throw new Error("INVALID_PROBE_RESPONSE");
    }
    return { ok: true, service: record.service };
  }

  if (response.status === 200 && record.ok === true && record.database === "ready") {
    return { ok: true, database: "ready" };
  }
  if (response.status === 503 && record.ok === false &&
      (record.database === "unavailable" || record.database === "not_configured")) {
    return { ok: false, database: record.database };
  }
  throw new Error("INVALID_PROBE_RESPONSE");
}

