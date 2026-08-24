# orione-content-link

Resolve brand **`/c/{code}`** short links via Orione **`GET /api/public/content-link`**, with **local recompute** on `503` and **fallback article** when the resolved URL is on another host.

## Install on a brand

From monorepo (before publish):

```bash
cd packages/orione-content-link && npm run build
cd ../../your-brand
npm install file:../redirections-lp-setup/packages/orione-content-link
```

Or after publish: `npm install orione-content-link`

## Env (brand)

| Variable | Purpose |
|----------|---------|
| `CAMPAIGNS_MNG_URL` | Orione API base |
| `ORIONE_CONTENT_LINK_TOKEN` | Token with `content-links:read` |

## Next.js route

See `examples/next-app-router-route.ts` — copy to `app/c/[code]/route.ts`.

## API

```ts
import { resolveContentLink, computeContentCode } from "orione-content-link"

const outcome = await resolveContentLink({
  code: "rJwuYllo",
  host: "brand.com",
  token: process.env.ORIONE_CONTENT_LINK_TOKEN!,
  articlePaths: ["/blog/my-article", "/blog/other"],
  fallbackArticlePath: "/blog/my-article",
})

// outcome.status: "article" | "fallback" | "not_found"
// outcome.url when article or fallback → redirect or rewrite
```

## Behaviour

| Situation | Result |
|-----------|--------|
| API `found: true`, same host | `status: "article"`, `long_url` |
| API `found: true`, other host | `status: "fallback"`, first/fallback article on **this** brand |
| API `found: false` | `status: "not_found"` → your 404 |
| API `503` | local recompute from `articlePaths` (same algorithm as CRM) |
| API `401` | throws `ContentLinkAuthError` |

## Code algorithm (pinned v1)

Path only (host **not** included):

1. Normalize: leading `/`, strip trailing `/`
2. `SHA-256` → `base64url` → first **8** chars (case-sensitive)

Test vector: `/blog/my-article` → `rJwuYllo`

```ts
computeContentCode("/blog/my-article") // "rJwuYllo"
```

## Build

```bash
npm run build
npm test
```
