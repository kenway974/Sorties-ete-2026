import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins two class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out null", () => {
    expect(cn("foo", null, "bar")).toBe("foo bar");
  });

  it("filters out undefined", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("filters out false", () => {
    expect(cn("foo", false, "bar")).toBe("foo bar");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles single class", () => {
    expect(cn("solo")).toBe("solo");
  });

  it("handles all falsy values", () => {
    expect(cn(null, undefined, false)).toBe("");
  });

  it("preserves class order", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });
});
