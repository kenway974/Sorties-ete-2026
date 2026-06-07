// Current date & time in the Europe/Paris timezone, regardless of server TZ.
// Activities store local Paris date/time, so all "is it past?" checks must
// compare against Paris-local now (Vercel servers run in UTC).
export function parisNow(): { date: string; time: string } {
  const now = new Date();
  const date = now.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" }); // YYYY-MM-DD
  const time = now.toLocaleTimeString("en-GB", { timeZone: "Europe/Paris", hour12: false }); // HH:MM:SS
  return { date, time };
}

// PostgREST .or() clause selecting only activities that are not yet past
// (future date, or today but the start time has not passed).
export function futureOrClause(): string {
  const { date, time } = parisNow();
  return `date.gt.${date},and(date.eq.${date},time.gte.${time})`;
}

// PostgREST .or() clause selecting strictly past activities (for cleanup/deletion).
export function pastOrClause(): string {
  const { date, time } = parisNow();
  return `date.lt.${date},and(date.eq.${date},time.lt.${time})`;
}