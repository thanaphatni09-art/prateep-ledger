/**
 * Build a display URL for a platform file-storage blob hash.
 *
 * `TransferProof.imageKey` holds the storage hash (`sha256:<hex>`) produced by
 * the platform upload path. The gateway URL is injected at deploy time through
 * `env.json`, so it is read at runtime rather than hardcoded.
 */
let cachedGatewayUrl: string | null = null;
let gatewayPromise: Promise<string | null> | null = null;

async function loadGatewayUrl(): Promise<string | null> {
  if (cachedGatewayUrl) return cachedGatewayUrl;
  if (!gatewayPromise) {
    gatewayPromise = fetch("env.json")
      .then((response) => (response.ok ? response.json() : null))
      .then((config: { storage_gateway_url?: string } | null) => {
        const url = config?.storage_gateway_url;
        if (!url || url === "undefined") return null;
        cachedGatewayUrl = url;
        return url;
      })
      .catch(() => null);
  }
  return gatewayPromise;
}

/** Resolve a stored blob hash into an inline-display URL, or null when unavailable. */
export async function resolveBlobUrl(
  hash: string | undefined | null,
): Promise<string | null> {
  if (!hash) return null;
  const gateway = await loadGatewayUrl();
  if (!gateway) return null;
  const config = await fetch("env.json")
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);
  const owner = config?.backend_canister_id;
  const project = config?.project_id;
  if (!owner || owner === "undefined") return null;
  const params = new URLSearchParams({ blob_hash: hash, owner_id: owner });
  if (project && project !== "undefined") params.set("project_id", project);
  return `${gateway}/v1/blob/?${params.toString()}`;
}
