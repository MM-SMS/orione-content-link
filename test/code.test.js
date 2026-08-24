import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { computeContentCode } from "../dist/code.js"

describe("computeContentCode", () => {
  it("matches short-links-spec test vector §7.1", () => {
    assert.equal(computeContentCode("/blog/my-article"), "rJwuYllo")
    assert.equal(computeContentCode("blog/my-article"), "rJwuYllo")
    assert.equal(computeContentCode("/blog/my-article/"), "rJwuYllo")
  })

  it("is case-sensitive output", () => {
    assert.notEqual(computeContentCode("/blog/my-article"), "rjwuylllo")
  })
})
