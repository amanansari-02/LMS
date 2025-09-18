export const getInitials = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user) return "??";

  const firstName = user.first_name || "";
  const lastName = user.last_name || "";

  if (firstName && lastName) {
    // First letter of first name + first letter of last name
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  if (firstName) {
    // Take first two letters of firstName
    return firstName.substring(0, 2).toUpperCase();
  }

  if (lastName) {
    // Take first two letters of lastName
    return lastName.substring(0, 2).toUpperCase();
  }

  return "??";
};

// utils/formatTime.ts
export function formatVideoTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 sec";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs} hrs ${mins} min ${secs} sec`;
  } else if (mins > 0) {
    return `${mins} min ${secs} sec`;
  } else {
    return `${secs} sec`;
  }
}
