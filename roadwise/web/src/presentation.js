export const LEVELS = ["Low", "Moderate", "High", "Severe", "No Travel"];
export const COLORS = ["#29856c", "#bc8d26", "#da702e", "#c44542", "#803662"];
export const ROUTES = ["#196954", "#7571a8", "#517b9a"];
export const number = (value, precision = 0) =>
  Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: precision })
    : "—";
export const money = (value) =>
  Number.isFinite(value)
    ? value.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "—";
export function duration(seconds) {
  const minutes = Math.round(seconds / 60);
  return minutes >= 60
    ? Math.floor(minutes / 60) + "h " + (minutes % 60) + "m"
    : minutes + "m";
}
export function timeText(value, includeDate = false) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return date.toLocaleString(
    undefined,
    includeDate
      ? {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }
      : { hour: "numeric", minute: "2-digit", timeZoneName: "short" },
  );
}
export function localDate(value) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
