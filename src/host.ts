/** Strip port; lowercase hostname. */
export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0]
}

/** Apex-ish compare: www.brand.com ≈ brand.com */
export function hostsMatch(requestHost: string, urlHost: string): boolean {
  const a = normalizeHost(requestHost)
  const b = normalizeHost(urlHost)
  if (a === b) return true
  if (a === `www.${b}` || b === `www.${a}`) return true
  return false
}

export function hostFromUrl(url: string): string | null {
  try {
    return normalizeHost(new URL(url).hostname)
  } catch {
    return null
  }
}
