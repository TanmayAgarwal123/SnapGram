import { describe, it, expect } from "vitest";
import { cn, checkIsLiked } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes conflicting tailwind classes (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });
});

describe("checkIsLiked", () => {
  it("returns true when the user id is in the like list", () => {
    expect(checkIsLiked(["u1", "u2"], "u2")).toBe(true);
  });

  it("returns false when the user id is absent", () => {
    expect(checkIsLiked(["u1", "u2"], "u3")).toBe(false);
  });
});
