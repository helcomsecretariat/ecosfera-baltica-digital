import { describe, it, expect, vi } from "vitest";
import { SEED_PARAM, stripSeedFromUrl, returnToLobby } from "@/lib/navigation";

const fakeLocation = (href: string) => ({ href, replace: vi.fn(), reload: vi.fn() });

describe("stripSeedFromUrl", () => {
  it("removes the seed and leaves a clean URL when seed is the only param", () => {
    expect(stripSeedFromUrl("https://example.com/?seed=abc")).toBe("https://example.com/");
  });

  it("keeps other params", () => {
    const result = new URL(stripSeedFromUrl("https://example.com/?debug&seed=abc&lang=fi"));
    expect(result.searchParams.has(SEED_PARAM)).toBe(false);
    expect(result.searchParams.has("debug")).toBe(true);
    expect(result.searchParams.get("lang")).toBe("fi");
  });

  it("preserves the hash", () => {
    const result = new URL(stripSeedFromUrl("https://example.com/?seed=abc#foo"));
    expect(result.hash).toBe("#foo");
    expect(result.searchParams.has(SEED_PARAM)).toBe(false);
  });

  it("re-serialises a URL without seed but keeps its params", () => {
    // URLSearchParams.delete() always re-serialises the query, so a bare flag gains "=".
    expect(stripSeedFromUrl("https://example.com/?debug")).toBe("https://example.com/?debug=");
  });

  it("keeps encoded values semantically intact", () => {
    const result = new URL(stripSeedFromUrl("https://example.com/?name=a%20b&seed=x"));
    expect(result.searchParams.get("name")).toBe("a b");
  });

  it("throws on a relative href", () => {
    expect(() => stripSeedFromUrl("/?seed=abc")).toThrow(TypeError);
  });
});

describe("returnToLobby", () => {
  it("replaces with a seedless URL when href has a seed", () => {
    const location = fakeLocation("https://example.com/?debug&seed=abc");
    returnToLobby(location);
    expect(location.reload).not.toHaveBeenCalled();
    expect(location.replace).toHaveBeenCalledTimes(1);
    const target = new URL(location.replace.mock.calls[0][0] as string);
    expect(target.searchParams.has(SEED_PARAM)).toBe(false);
    expect(target.searchParams.has("debug")).toBe(true);
  });

  it.each([
    "https://example.com/",
    "https://example.com/?debug",
    "https://example.com/?debug=",
    "https://example.com/#foo",
  ])("reloads when href has no seed: %s", (href) => {
    const location = fakeLocation(href);
    returnToLobby(location);
    expect(location.reload).toHaveBeenCalledTimes(1);
    expect(location.replace).not.toHaveBeenCalled();
  });
});
