# orione-content-link

Next.js middleware helpers for Orione **`/c/{code}`** content short links (SPEC 0328).

## Install

```bash
npm install orione-content-link
```

Peer: `next` >= 14.

## Env (brand Vercel)

| Variable | Required |
|----------|----------|
| `ORIONE_CONTENT_LINK_TOKEN` | Samples API key (`content-links:read`) |
| `CAMPAIGNS_MNG_URL` | `https://orione.io` or `https://dev.orione.io` |
| `ORIONE_CONTENT_LINK_FALLBACK_URL` | optional |
| `ORIONE_CONTENT_LINK_ARTICLE_PATHS` | optional |
| `ORIONE_CONTENT_LINK_NOT_FOUND_PATH` | optional, default `/not-found` |

## Brand without other middleware

`middleware.ts` in project root:

```ts
export { middleware, config } from "orione-content-link"
```

Update package → logic updates; this file stays one line.

## Brand with Supabase (manual)

Keep your matcher; call content-link first:

```ts
import { updateSession } from "@/lib/supabase/auth/middleware"
import { handleContentLink } from "orione-content-link"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const content = await handleContentLink(request)
  if (content) return content
  return updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|studio|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

Or:

```ts
import { updateSession } from "@/lib/supabase/auth/middleware"
import { createMiddleware } from "orione-content-link"

export const middleware = createMiddleware({ fallback: updateSession })
// keep your existing config.matcher
```

## Publish (maintainers)

```bash
cd packages/orione-content-link
npm run build
npm publish --access public   # or your private registry
```
