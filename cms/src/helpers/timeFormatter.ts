export function formatDateTimeLocale(dateString: string | null | undefined): string {
  // Returns: "22:43 5 thg 10, 2025"
  if (!dateString) return "--";

  const date = new Date(dateString);
  return date.toLocaleDateString("us-EN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export function formatDateTime(dateString: string | null | undefined): string {
  // Returns: "5 thg 10, 2025"
  if (!dateString) return "--";

  const date = new Date(dateString);
  return date.toLocaleDateString("us-EN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
