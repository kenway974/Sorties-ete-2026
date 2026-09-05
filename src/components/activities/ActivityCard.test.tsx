import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ActivityCard from "./ActivityCard";
import type { Activity } from "@/types";

const base: Activity = {
  id: "abc-123",
  title: "Concert de Jazz au Caveau",
  description: "Un concert intime de jazz manouche",
  curiosity: "mise-en-scene",
  tags: ["jazz", "manouche"],
  address: "12 rue de la Huchette, Paris",
  lat: 48.852,
  lng: 2.347,
  date: "2026-08-15",
  time: "20:30:00",
  max_participants: 80,
  current_participants: 30,
  price: 12,
  external_url: "https://example.com",
  status: "approved",
  creator_id: "user-1",
  photos: [],
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

describe("ActivityCard", () => {
  it("renders the activity title", () => {
    render(<ActivityCard activity={base} />);
    expect(screen.getByText("Concert de Jazz au Caveau")).toBeDefined();
  });

  it("renders the address", () => {
    render(<ActivityCard activity={base} />);
    expect(screen.getByText("12 rue de la Huchette, Paris")).toBeDefined();
  });

  it("renders spots left (max - current)", () => {
    render(<ActivityCard activity={base} />);
    // 80 - 30 = 50 spots left; translation key includes the count
    expect(screen.getByText(/50/)).toBeDefined();
  });

  it("shows full label when activity is full", () => {
    render(<ActivityCard activity={{ ...base, max_participants: 10, current_participants: 10 }} />);
    // "Complet" appears both as the image overlay badge and the spots line
    expect(screen.getAllByText("Complet").length).toBeGreaterThan(0);
  });

  it("shows unlimited label when max_participants is null", () => {
    render(<ActivityCard activity={{ ...base, max_participants: null }} />);
    expect(screen.getByText(/illimitées/)).toBeDefined();
  });

  it("shows free label when price is null", () => {
    render(<ActivityCard activity={{ ...base, price: null }} />);
    expect(screen.getByText("Gratuit")).toBeDefined();
  });

  it("shows formatted price when price is set", () => {
    render(<ActivityCard activity={base} />);
    // formatPrice(12) → "12,00 €"
    expect(screen.getByText(/12,00/)).toBeDefined();
  });

  it("renders the favorite button when onFavoriteToggle is provided", () => {
    render(<ActivityCard activity={base} onFavoriteToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("does not render favorite button when no handler", () => {
    render(<ActivityCard activity={base} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("calls onFavoriteToggle when heart is clicked", () => {
    const onToggle = vi.fn();
    render(<ActivityCard activity={base} onFavoriteToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("prevents event propagation when heart is clicked", () => {
    const cardClick = vi.fn();
    render(
      <div onClick={cardClick}>
        <ActivityCard activity={base} onFavoriteToggle={vi.fn()} />
      </div>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(cardClick).not.toHaveBeenCalled();
  });

  it("renders filled heart icon when isFavorite=true", () => {
    const { container } = render(<ActivityCard activity={base} isFavorite onFavoriteToggle={vi.fn()} />);
    expect(container.querySelector(".fill-brand-red")).not.toBeNull();
  });

  it("renders unfilled heart when isFavorite=false", () => {
    const { container } = render(<ActivityCard activity={base} isFavorite={false} onFavoriteToggle={vi.fn()} />);
    expect(container.querySelector(".fill-brand-red")).toBeNull();
  });

  it("renders average rating when provided", () => {
    render(<ActivityCard activity={{ ...base, avg_rating: 4.5 }} />);
    expect(screen.getByText("4.5")).toBeDefined();
  });

  it("does not render rating section when avg_rating is undefined", () => {
    render(<ActivityCard activity={base} />);
    expect(screen.queryByText(/\.\d+/)).toBeNull();
  });
});
