import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearchHistory } from "./useSearchHistory";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });

describe("useSearchHistory", () => {
  beforeEach(() => localStorageMock.clear());

  it("initialises with empty history", () => {
    const { result } = renderHook(() => useSearchHistory());
    expect(result.current.history).toEqual([]);
  });

  it("adds a search term", () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => result.current.add("jazz"));
    expect(result.current.history).toContain("jazz");
  });

  it("puts the newest term first", () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => { result.current.add("first"); result.current.add("second"); });
    expect(result.current.history[0]).toBe("second");
  });

  it("deduplicates: re-adding moves term to front", () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => { result.current.add("foo"); result.current.add("bar"); result.current.add("foo"); });
    expect(result.current.history[0]).toBe("foo");
    expect(result.current.history.filter((h) => h === "foo")).toHaveLength(1);
  });

  it("ignores empty strings", () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => result.current.add(""));
    expect(result.current.history).toHaveLength(0);
  });

  it("ignores whitespace-only strings", () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => result.current.add("   "));
    expect(result.current.history).toHaveLength(0);
  });

  it("clears history", () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => { result.current.add("a"); result.current.add("b"); result.current.clear(); });
    expect(result.current.history).toHaveLength(0);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => result.current.add("concert"));
    const stored = JSON.parse(localStorageMock.getItem("ps_search_history") || "[]");
    expect(stored).toContain("concert");
  });

  it("caps history at 10 items", () => {
    const { result } = renderHook(() => useSearchHistory());
    act(() => {
      for (let i = 0; i < 15; i++) result.current.add(`term${i}`);
    });
    expect(result.current.history.length).toBeLessThanOrEqual(10);
  });
});
