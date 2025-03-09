/**
 * Utility functions for date and time operations in the chat feature
 */

/**
 * Determines if a user is online based on their last seen timestamp
 * @param {string} lastSeenAt - ISO date string of last activity
 * @param {number} timeoutMinutes - Minutes after which a user is considered offline (default: 5)
 * @returns {boolean} Whether the user is considered online
 */
export const isUserOnline = (lastSeenAt, timeoutMinutes = 5) => {
  if (!lastSeenAt) {
    return false;
  }

  // User is considered online if active in the last X minutes
  const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
  return new Date(lastSeenAt) > cutoffTime;
};

/**
 * Formats a timestamp to a readable time string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time string (HH:MM)
 */
export const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};