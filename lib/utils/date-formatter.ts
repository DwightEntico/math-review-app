export function timeAgo(date: string | Date | null | undefined): string {
  // 1. Guard clause for null or undefined values
  if (!date) return "N/A";

  const now = new Date();

  // 2. Normalize the input safely
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else {
    // If it's a string, fix the PostgreSQL space issue
    dateObj = new Date(date.replace(" ", "T"));
  }

  // 3. Check if the date creation actually worked
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Handle future dates
  if (diffInSeconds < 0) return "just now";

  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const { label, seconds } of units) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${label}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}