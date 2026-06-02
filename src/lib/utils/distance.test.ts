import { describe, it, expect } from "vitest";
import { haversineDistance } from "./distance";

describe("haversineDistance", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineDistance(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0);
  });

  it("calculates Paris centre to Eiffel Tower (~3.5 km)", () => {
    const dist = haversineDistance(48.8566, 2.3522, 48.8584, 2.2945);
    expect(dist).toBeGreaterThan(3);
    expect(dist).toBeLessThan(5);
  });

  it("calculates Paris to Versailles (~17 km)", () => {
    const dist = haversineDistance(48.8566, 2.3522, 48.8044, 2.1204);
    expect(dist).toBeGreaterThan(14);
    expect(dist).toBeLessThan(20);
  });

  it("is symmetric (A to B == B to A)", () => {
    const ab = haversineDistance(48.8566, 2.3522, 48.8044, 2.1204);
    const ba = haversineDistance(48.8044, 2.1204, 48.8566, 2.3522);
    expect(ab).toBe(ba);
  });

  it("returns a non-negative number", () => {
    const dist = haversineDistance(48.85, 2.35, 48.86, 2.36);
    expect(dist).toBeGreaterThanOrEqual(0);
  });

  it("returns result rounded to 1 decimal", () => {
    const dist = haversineDistance(48.8566, 2.3522, 48.8584, 2.2945);
    expect(dist).toBe(Math.round(dist * 10) / 10);
  });
});
