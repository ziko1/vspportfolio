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
  if (typeof record.ok !== "boolean" || (response.status === 503 && record.ok)) {
    throw new Error("INVALID_PROBE_RESPONSE");
  }
  if (record.service !== undefined && typeof record.service !== "string") {
    throw new Error("INVALID_PROBE_RESPONSE");
  }
  if (record.database !== undefined &&
      !["ready", "unavailable", "not_configured"].includes(String(record.database))) {
    throw new Error("INVALID_PROBE_RESPONSE");
  }

  return {
    ok: response.ok && record.ok,
    ...(typeof record.service === "string" ? { service: record.service } : {}),
    ...(record.database !== undefined ? { database: record.database as Probe["database"] } : {})
  };
}

