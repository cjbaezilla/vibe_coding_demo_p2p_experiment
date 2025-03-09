/**
 * Utility functions for date and time operations
 */

/**
 * Format date to show time since creation in a human-readable format
 * @param {string|Date} dateString - The date to format
 * @returns {string} Human-readable time ago string (e.g., "2 hours ago")
 */
export const formatTimeSince = (dateString) => {
  if (!dateString) {
    return 'Unknown';
  }

  const createdAt = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((now - createdAt) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'just now';
  }
};