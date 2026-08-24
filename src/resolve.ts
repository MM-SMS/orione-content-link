import { fetchContentLink } from "./api.js"
import { findArticlePathByCode } from "./code.js"
import { hostFromUrl, hostsMatch, normalizeHost } from "./host.js"
import type {
  ContentLinkOutcome,
  ResolveContentLinkOptions,
} from "./types.js"
import { ContentLinkUnavailableError } from "./api.js"

function defaultApiBase(): string {
  const url = process.env.CAMPAIGNS_MNG_URL
  if (!url) throw new Error("CAMPAIGNS_MNG_URL is not set")
  return url.replace(/\/$/, "")
}

function articleUrl(
  host: string,
  path: string,
  preferHttps: boolean
): string {
  const scheme = preferHttps ? "https" : "http"
  const h = normalizeHost(host)
  const p = path.startsWith("/") ? path : `/${path}`
  return `${scheme}://${h}${p}`
}

function pickFallbackPath(options: ResolveContentLinkOptions): string | null {
  if (options.fallbackArticlePath) {
    return options.fallbackArticlePath.startsWith("/")
      ? options.fallbackArticlePath
      : `/${options.fallbackArticlePath}`
  }
  const paths = options.articlePaths
  if (paths?.length) return paths[0].startsWith("/") ? paths[0] : `/${paths[0]}`
  return null
}

function outcomeFromLongUrl(
  longUrl: string,
  requestHost: string,
  source: "api" | "local",
  options: ResolveContentLinkOptions
): ContentLinkOutcome {
  const urlHost = hostFromUrl(longUrl)
  if (urlHost && !hostsMatch(requestHost, urlHost)) {
    const fallbackPath = pickFallbackPath(options)
    if (!fallbackPath) {
      return { status: "not_found" }
    }
    return {
      status: "fallback",
      url: articleUrl(requestHost, fallbackPath, options.preferHttps !== false),
      reason: "foreign_host",
      originalUrl: longUrl,
    }
  }
  return { status: "article", url: longUrl, source }
}

/**
 * Resolve /c/{code} for a brand request:
 * 1) Orione API
 * 2) on 503 → local recompute from articlePaths
 * 3) foreign host on long_url → fallback article on this brand
 * 4) found: false → not_found (render 404)
 */
export async function resolveContentLink(
  options: ResolveContentLinkOptions
): Promise<ContentLinkOutcome> {
  const host = normalizeHost(options.host)
  const apiBase = options.apiBase ?? defaultApiBase()

  let apiResult: Awaited<ReturnType<typeof fetchContentLink>> | null = null

  try {
    apiResult = await fetchContentLink({
      code: options.code,
      host,
      token: options.token,
      apiBase,
      fetch: options.fetch,
    })
  } catch (err) {
    if (err instanceof ContentLinkUnavailableError) {
      const localPath = options.articlePaths
        ? findArticlePathByCode(options.articlePaths, options.code)
        : null
      if (!localPath) return { status: "not_found" }
      const url = articleUrl(host, localPath, options.preferHttps !== false)
      return outcomeFromLongUrl(url, host, "local", options)
    }
    throw err
  }

  if (!apiResult.found) {
    return { status: "not_found" }
  }

  return outcomeFromLongUrl(apiResult.long_url, host, "api", options)
}
