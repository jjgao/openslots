/**
 * Appointment Booking System - Utility Functions
 *
 * General helper functions used across the system.
 */

/**
 * Parses a date string in the script's timezone to avoid UTC midnight issues.
 * new Date('YYYY-MM-DD') parses as UTC midnight, which shifts to previous day
 * in western timezones. This function parses in local timezone.
 * @param {string|Date} dateStr - Date string in YYYY-MM-DD format or Date object
 * @returns {Date} Date object at midnight in script timezone
 */
function parseDateInTimezone(dateStr) {
  if (!dateStr) {
    return new Date();
  }

  // If already a Date object, return a copy at noon to avoid DST issues
  if (dateStr instanceof Date) {
    var date = new Date(dateStr);
    date.setHours(12, 0, 0, 0);
    return date;
  }

  // Parse string as noon to avoid any DST edge cases
  return Utilities.parseDate(dateStr + ' 12:00:00', Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Parses a time string to minutes since midnight
 * @param {string|Date} time - Time string (HH:MM format) or Date object
 * @returns {number} Minutes since midnight
 */
function parseTimeToMinutes(time) {
  if (!time) {
    return 0;
  }

  if (time instanceof Date) {
    return time.getHours() * 60 + time.getMinutes();
  }

  var timeStr = time.toString();
  var parts = timeStr.split(':');

  if (parts.length >= 2) {
    var hours = parseInt(parts[0], 10) || 0;
    var minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  }

  return 0;
}

/**
 * Converts minutes since midnight to HH:MM string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
function minutesToTimeString(minutes) {
  var hours = Math.floor(minutes / 60);
  var mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Gets the day name from a date
 * @param {Date|string} date - The date
 * @returns {string} Day name (e.g., 'Monday')
 */
function getDayName(date) {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (typeof date === 'string') {
    date = parseDateInTimezone(date);
  }

  return days[date.getDay()];
}

/**
 * Compares two dates for equality (ignoring time)
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if dates are the same
 */
function isSameDate(date1, date2) {
  return normalizeDate(date1) === normalizeDate(date2);
}

/**
 * Checks if a date is in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is in the future
 */
function isFutureDate(date) {
  var targetDate = typeof date === 'string' ? parseDateInTimezone(date) : new Date(date);
  var today = new Date();

  // Set both to start of day for comparison
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return targetDate > today;
}

/**
 * Checks if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is today
 */
function isToday(date) {
  return isSameDate(date, new Date());
}

/**
 * Checks if a date is today or in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is today or future
 */
function isTodayOrFuture(date) {
  return isToday(date) || isFutureDate(date);
}

/**
 * Creates a Date object from date and time values
 * Uses timezone-aware parsing to avoid date shifting issues.
 * @param {Date|string} date - The date (Date object or YYYY-MM-DD string)
 * @param {Date|string} time - Time (Date object from Sheets or HH:MM string)
 * @returns {Date} Combined Date object in script timezone
 */
function combineDateAndTime(date, time) {
  var hours = 0;
  var minutes = 0;

  // Handle time - can be Date object (from Sheets) or string (HH:MM)
  if (time instanceof Date) {
    // Google Sheets returns time as Date object (with date portion as Dec 30, 1899)
    hours = time.getHours();
    minutes = time.getMinutes();
  } else if (time) {
    // String format "HH:MM"
    var timeParts = time.toString().split(':');
    hours = parseInt(timeParts[0], 10) || 0;
    minutes = parseInt(timeParts[1], 10) || 0;
  }

  if (typeof date === 'string') {
    // Parse date string in script timezone to avoid UTC midnight issue
    // new Date('YYYY-MM-DD') parses as UTC midnight, which shifts day in western timezones
    var dateStr = `${date} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    return Utilities.parseDate(dateStr, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  }

  // For Date objects, create a new date and set the time
  var d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Calculates end time from start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} duration - Duration in minutes
 * @returns {string} End time in HH:MM format
 */
function calculateEndTime(startTime, duration) {
  var startMinutes = parseTimeToMinutes(startTime);
  var endMinutes = startMinutes + duration;
  return minutesToTimeString(endMinutes);
}

/**
 * Checks if two time ranges overlap
 * @param {string} start1 - First range start time (HH:MM)
 * @param {string} end1 - First range end time (HH:MM)
 * @param {string} start2 - Second range start time (HH:MM)
 * @param {string} end2 - Second range end time (HH:MM)
 * @returns {boolean} True if ranges overlap
 */
function timeRangesOverlap(start1, end1, start2, end2) {
  var s1 = parseTimeToMinutes(start1);
  var e1 = parseTimeToMinutes(end1);
  var s2 = parseTimeToMinutes(start2);
  var e2 = parseTimeToMinutes(end2);

  // Ranges overlap if one starts before the other ends
  return s1 < e2 && s2 < e1;
}

/**
 * Checks if a time falls within a range
 * @param {string} time - Time to check (HH:MM)
 * @param {string} rangeStart - Range start time (HH:MM)
 * @param {string} rangeEnd - Range end time (HH:MM)
 * @returns {boolean} True if time is within range
 */
function isTimeInRange(time, rangeStart, rangeEnd) {
  var t = parseTimeToMinutes(time);
  var start = parseTimeToMinutes(rangeStart);
  var end = parseTimeToMinutes(rangeEnd);

  return t >= start && t < end;
}

/**
 * Generates a unique ID with timestamp
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
function generateUniqueId(prefix) {
  var timestamp = Date.now().toString(36);
  var random = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

/**
 * Formats a date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} Formatted date
 */
function formatDateYMD(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Formats a date/time as YYYY-MM-DD HH:MM:SS
 * @param {Date} date - The date/time to format
 * @returns {string} Formatted datetime
 */
function formatDateTimeYMDHMS(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Validates an email address format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a phone number (basic check)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if looks like a phone number
 */
function isValidPhone(phone) {
  if (!phone) {
    return false;
  }
  // Remove common formatting characters
  var cleaned = phone.toString().replace(/[\s\-\(\)\+\.]/g, '');
  // Check if it's at least 7 digits
  return /^\d{7,15}$/.test(cleaned);
}

/**
 * Validates a time string format
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid HH:MM format
 */
function isValidTimeFormat(time) {
  if (!time || typeof time !== 'string') {
    return false;
  }
  var timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time.trim());
}

/**
 * Validates a date string format
 * @param {string} date - Date string to validate
 * @returns {boolean} True if valid date
 */
function isValidDateFormat(date) {
  if (!date) {
    return false;
  }
  var d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Trims whitespace from object string properties
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
function trimObjectStrings(obj) {
  var result = {};
  for (var key in obj) {
    if (typeof obj[key] === 'string') {
      result[key] = obj[key].trim();
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Deep clones an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Checks if an object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if object has no own properties
 */
function isEmptyObject(obj) {
  return obj && Object.keys(obj).length === 0;
}

/**
 * Gets the current timestamp formatted for logging
 * @returns {string} Formatted timestamp
 */
function getCurrentTimestamp() {
  return formatDateTimeYMDHMS(new Date());
}

/**
 * Adds days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date
 */
function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Gets dates between two dates (inclusive)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array<Date>} Array of dates
 */
function getDateRange(startDate, endDate) {
  var dates = [];
  var currentDate = new Date(startDate);
  var end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
