// VAPID public key for Web Push. Safe to expose (public half only).
// Override in prod via NEXT_PUBLIC_VAPID_PUBLIC_KEY.
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BAIMLAJvlbDj8bfI4c98cMkjamx9e3DwOpzcvBIv-fWzBAbuX8xZ7OKDw0r9QNEpP1avWjcJauMw_Dz7jnGpFkA";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
