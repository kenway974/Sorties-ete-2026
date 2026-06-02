import { describe, it, expect } from "vitest";
import { formatTime, formatPrice, formatDistance, slugify } from "./formatters";

describe("formatTime", () => {
  it("returns HH:MM from HH:MM:SS", () => {
    expect(formatTime("20:30:00")).toBe("20:30");
  });

  it("handles midnight", () => {
    expect(formatTime("00:00:00")).toBe("00:00");
  });

  it("handles already-short strings", () => {
    expect(formatTime("09:45")).toBe("09:45");
  });
});

describe("formatPrice", () => {
  it("returns free label for null", () => {
    expect(formatPrice(null, "Gratuit")).toBe("Gratuit");
  });

  it("returns free label for 0", () => {
    expect(formatPrice(0, "Free")).toBe("Free");
  });

  it("formats a positive price with currency symbol", () => {
    const result = formatPrice(15, "Gratuit");
    expect(result).toContain("15");
    expect(result).toContain("€");
  });

  it("formats decimal price", () => {
    const result = formatPrice(9.99, "Gratuit");
    expect(result).toContain("9");
  });
});

describe("formatDistance", () => {
  it("returns meters for values below 1 km", () => {
    expect(formatDistance(0.3)).toBe("300 m");
    expect(formatDistance(0.75)).toBe("750 m");
  });

  it("returns km for values >= 1 km", () => {
    expect(formatDistance(1.5)).toBe("1.5 km");
    expect(formatDistance(10)).toBe("10 km");
  });

  it("rounds sub-km to nearest meter", () => {
    expect(formatDistance(0.555)).toBe("555 m");
  });
});

describe("slugify", () => {
  it("lowercases text", () => {
    expect(slugify("HELLO")).toBe("hello");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  it("strips French accents", () => {
    expect(slugify("café")).toBe("cafe");
    expect(slugify("événement")).toBe("evenement");
  });

  it("removes leading/trailing hyphens", () => {
    expect(slugify("-test-")).toBe("test");
  });

  it("collapses multiple spaces", () => {
    expect(slugify("foo  bar   baz")).toBe("foo-bar-baz");
  });

  it("strips special characters", () => {
    expect(slugify("hello! world?")).toBe("hello-world");
  });
});
