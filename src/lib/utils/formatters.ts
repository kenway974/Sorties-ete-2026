export function formatDate(dateStr: string, locale: string = "fr"): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export function formatPrice(price: number | null, freeLabel: string = "Gratuit"): string {
  if (price === null || price === 0) return freeLabel;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(price);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km} km`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
