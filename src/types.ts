/** Matches GET /api/public/content-link when the code exists for this host. */
export interface ContentLinkHit {
  found: true
  long_url: string
}

/** Uniform miss — not an HTTP error. */
export interface ContentLinkMiss {
  found: false
}

export type ContentLinkApiResponse = ContentLinkHit | ContentLinkMiss

export interface ContentLinkApiError {
  ok?: false
  error?: string
  message?: string
}

export interface ContentLinkUnavailable {
  error: "lookup_unavailable"
  message?: string
}

export type ResolveSource = "api" | "local"

export type ContentLinkOutcome =
  | {
      status: "article"
      url: string
      source: ResolveSource
    }
  | {
      status: "fallback"
      url: string
      reason: "foreign_host"
      originalUrl: string
    }
  | {
      status: "not_found"
    }

export interface ResolveContentLinkOptions {
  /** 8-char code from /c/{code}. Case-sensitive. */
  code: string
  /** Request host, e.g. brand.com or www.brand.com (port stripped). */
  host: string
  /** API token with content-links:read scope. */
  token: string
  /** CampaignsMng base URL. Default: process.env.CAMPAIGNS_MNG_URL */
  apiBase?: string
  /**
   * Article paths on this brand (e.g. /blog/foo).
   * Used for 503 local recompute and for foreign-host fallback.
   */
  articlePaths?: string[]
  /** HTTPS preferred when building URLs from paths. Default true. */
  preferHttps?: boolean
  /** Explicit fallback path; else first articlePaths entry. */
  fallbackArticlePath?: string
  fetch?: typeof fetch
}
