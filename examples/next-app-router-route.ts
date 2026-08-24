/**
 * Drop into brand Next.js App Router: app/c/[code]/route.ts
 *
 * Env:
 *   CAMPAIGNS_MNG_URL
 *   ORIONE_CONTENT_LINK_TOKEN  (content-links:read)
 *
 * Provide article paths for 503 fallback + foreign-host fallback.
 * Usually from your CMS/sitemap at build time or a static list.
 */

import { NextRequest, NextResponse } from "next/server"
import { resolveContentLink } from "orione-content-link"

const ARTICLE_PATHS = [
  "/blog/my-article",
  "/blog/another-post",
  // ...
]

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params
  const host = request.headers.get("host") ?? request.nextUrl.hostname

  const token = process.env.ORIONE_CONTENT_LINK_TOKEN
  if (!token) {
    return new NextResponse("Content link token not configured", { status: 500 })
  }

  const outcome = await resolveContentLink({
    code,
    host,
    token,
    articlePaths: ARTICLE_PATHS,
    fallbackArticlePath: ARTICLE_PATHS[0],
  })

  if (outcome.status === "not_found") {
    return NextResponse.redirect(new URL("/not-found", request.url), 302)
  }

  return NextResponse.redirect(outcome.url, 302)
}
