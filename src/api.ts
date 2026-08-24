import type {
  ContentLinkApiError,
  ContentLinkApiResponse,
  ContentLinkUnavailable,
} from "./types.js"
import { normalizeHost } from "./host.js"

export class ContentLinkAuthError extends Error {
  constructor(message = "Invalid or missing content-links token") {
    super(message)
    this.name = "ContentLinkAuthError"
  }
}

export class ContentLinkUnavailableError extends Error {
  constructor(message = "Content link lookup unavailable") {
    super(message)
    this.name = "ContentLinkUnavailableError"
  }
}

export interface FetchContentLinkParams {
  code: string
  host: string
  token: string
  apiBase: string
  fetch?: typeof fetch
}

function apiBaseUrl(raw: string): string {
  return raw.replace(/\/$/, "")
}

/**
 * GET /api/public/content-link?code=&host=
 * Header: x-brand-token (content-links:read).
 */
export async function fetchContentLink(
  params: FetchContentLinkParams
): Promise<ContentLinkApiResponse> {
  const { code, token, fetch: fetchFn = fetch } = params
  const host = normalizeHost(params.host)
  const base = apiBaseUrl(params.apiBase)

  const url = new URL(`${base}/api/public/content-link`)
  url.searchParams.set("code", code)
  url.searchParams.set("host", host)

  const res = await fetchFn(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-brand-token": token,
    },
    cache: "no-store",
  })

  if (res.status === 401) {
    let detail = ""
    try {
      const body = (await res.json()) as ContentLinkApiError
      detail = body.message || body.error || ""
    } catch {
      /* ignore */
    }
    throw new ContentLinkAuthError(detail || undefined)
  }

  if (res.status === 503) {
    let detail = ""
    try {
      const body = (await res.json()) as ContentLinkUnavailable
      detail = body.message || body.error || ""
    } catch {
      /* ignore */
    }
    throw new ContentLinkUnavailableError(detail || undefined)
  }

  if (!res.ok) {
    throw new Error(`content-link HTTP ${res.status}`)
  }

  return (await res.json()) as ContentLinkApiResponse
}
