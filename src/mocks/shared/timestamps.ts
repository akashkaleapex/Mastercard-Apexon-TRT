export const DEMO_TIME_ZONE = "UTC";
export const DEMO_LAST_UPDATED_AT = "2026-10-26T14:32:00.000Z";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: DEMO_TIME_ZONE,
});

export function formatDemoTimestamp(timestamp: string) {
  return `${dateTimeFormatter.format(new Date(timestamp))} UTC`;
}