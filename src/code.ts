import { createHash } from "node:crypto"
import { normalizeArticlePath } from "./path.js"

/** Algorithm version — bump if short-links-spec changes. */
export const CONTENT_CODE_ALGORITHM_VERSION = "1"

/**
 * Compute the 8-character /c/{code} from an article path (host is NOT part of the digest).
 * Test vector: /blog/my-article → rJwuYllo
 */
export function computeContentCode(articlePath: string): string {
  const normalized = normalizeArticlePath(articlePath)
  return createHash("sha256")
    .update(normalized, "utf8")
    .digest("base64url")
    .slice(0, 8)
}

/** Find first article path whose code matches (linear scan). */
export function findArticlePathByCode(
  articlePaths: string[],
  code: string
): string | null {
  for (const path of articlePaths) {
    if (computeContentCode(path) === code) return normalizeArticlePath(path)
  }
  return null
}
