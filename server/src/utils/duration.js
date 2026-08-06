/**
 * Parse a JWT duration string (e.g. '15m', '7d', '3600') into milliseconds.
 * Supports formats: pure numeric (seconds), or number + unit (s/m/h/d).
 * Throws on unrecognized formats to fail fast during development.
 * @param {string} durationStr - Duration string from config.
 * @returns {number} Duration in milliseconds.
 */
export const parseDurationToMs = (durationStr) => {
  // Pure numeric string represents seconds
  if (/^\d+$/.test(durationStr)) {
    return parseInt(durationStr, 10) * 1000;
  }

  const match = durationStr.match(/^(\d+)([smhd])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
    }
  }

  throw new Error(`Invalid duration format: "${durationStr}". Expected a number or a string like "15m", "1h", "7d".`);
};
