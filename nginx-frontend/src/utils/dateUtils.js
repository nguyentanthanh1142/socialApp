export function parseValidDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^(just now|Just now)$/i.test(trimmed)) return null;
  if (/^\d+[smhd](o)?\s+ago$/i.test(trimmed) || /^\d+s ago$/i.test(trimmed)) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatRelativeTime(value, fallback = "Just now") {
  const date = parseValidDate(value);
  if (!date) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    return fallback;
  }

  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 0) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (diff < 60) return diff < 10 ? "Just now" : `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 3600 * 24 * 30) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 3600 * 24 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatLocaleDateTime(value, fallback = "") {
  const date = parseValidDate(value);
  if (!date) return fallback;
  return date.toLocaleString();
}

export function formatLocaleDate(value, options, fallback = "") {
  const date = parseValidDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString(undefined, options);
}

export function formatLocaleTime(value, options, fallback = "") {
  const date = parseValidDate(value);
  if (!date) return fallback;
  return date.toLocaleTimeString(undefined, options);
}

export function getPostDisplayTime(post, fallback = "Just now") {
  if (!post) return fallback;

  const preformatted = post.timestamp;
  if (typeof preformatted === "string" && preformatted.trim()) {
    return preformatted.trim();
  }

  const raw =
    post.createdDate ?? post.createDate ?? post.createdAt ?? post.modifiedDate;
  return formatRelativeTime(raw, fallback);
}
