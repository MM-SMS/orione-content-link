/**
 * Normalize article path for code computation.
 * Pinned algorithm (short-links-spec): leading slash, no trailing slash (except root).
 */
export function normalizeArticlePath(path: string): string {
  let p = path.trim()
  if (!p.startsWith("/")) p = `/${p}`
  p = p.replace(/\/+$/, "")
  return p || "/"
}
