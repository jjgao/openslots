/**
 * Appointment Booking System - Availability Checking Module
 *
 * Functions to check provider availability and find open time slots.
 */

/**
 * Gets provider availability for a specific date
 * Returns available time windows after considering:
 * - Recurring schedule
 * - Provider exceptions
 * - Business holidays
 * - Business exceptions
 * - Existing appointments
 *
 * @param {string} providerId - The provider ID
 * @param {Date|string} date - The date to check
 * @returns {Array<Object>} Array of available time windows {start, end}
 */
function getProviderAvailability(providerId, date) {
  const targetDate = typeof date === 'string' ? parseDateInTimezone(date) : date;
  const dayName = getDayName(targetDate);

  // Step 1: Check if it's a business holiday
  if (isBusinessHoliday(targetDate)) {
    Logger.log(`${normalizeDate(targetDate)} is a business holiday`);
    return [];
  }

  // Step 2: Get recurring availability for this day of week
  let availableWindows = getRecurringAvailability(providerId, dayName, targetDate);

  if (availableWindows.length === 0) {
    Logger.log(`No recurring availability for ${providerId} on ${dayName}`);
    return [];
  }

  // Step 3: Subtract provider exceptions
  availableWindows = subtractProviderExceptions(providerId, targetDate, availableWindows);

  // Step 4: Subtract business exceptions
  availableWindows = subtractBusinessExceptions(targetDate, availableWindows);

  // Step 5: Subtract existing appointments
  availableWindows = subtractExistingAppointments(providerId, targetDate, availableWindows);

  return availableWindows;
}

/**
 * Gets recurring availability for a provider on a day of week
 * @param {string} providerId - The provider ID
 * @param {string} dayName - Day name (e.g., 'Monday')
 * @param {Date} targetDate - The target date (for checking effective dates)
 * @returns {Array<Object>} Array of time windows
 */
function getRecurringAvailability(providerId, dayName, targetDate) {
  const availabilityRecords = getProviderAvailabilityRecords(providerId);
  const windows = [];

  for (let i = 0; i < availabilityRecords.length; i++) {
    const record = availabilityRecords[i];

    // Check if this record applies to the day of week
    if (record.day_of_week !== dayName) {
      continue;
    }

    // Check if recurring or within effective date range
    if (record.is_recurring !== 'Yes') {
      // Non-recurring: check effective dates
      if (record.effective_date_start) {
        const effectiveStart = new Date(record.effective_date_start);
        if (targetDate < effectiveStart) {
          continue;
        }
      }
      if (record.effective_date_end) {
        const effectiveEnd = new Date(record.effective_date_end);
        if (targetDate > effectiveEnd) {
          continue;
        }
      }
    }

    // Add this window
    windows.push({
      start: parseTimeToMinutes(record.start_time),
      end: parseTimeToMinutes(record.end_time)
    });
  }

  // Merge overlapping windows
  return mergeTimeWindows(windows);
}

/**
 * Subtracts provider exceptions from available windows
 * @param {string} providerId - The provider ID
 * @param {Date} targetDate - The date
 * @param {Array<Object>} windows - Current available windows
 * @returns {Array<Object>} Updated windows
 */
function subtractProviderExceptions(providerId, targetDate, windows) {
  const exceptions = getProviderExceptionsForDate(providerId, targetDate);

  for (let i = 0; i < exceptions.length; i++) {
    const exc = exceptions[i];

    // If no times specified, the entire day is blocked
    if (!exc.start_time || !exc.end_time ||
        exc.start_time === '00:00' && exc.end_time === '23:59') {
      return [];
    }

    const excStart = parseTimeToMinutes(exc.start_time);
    const excEnd = parseTimeToMinutes(exc.end_time);

    windows = subtractTimeRange(windows, excStart, excEnd);
  }

  return windows;
}

/**
 * Subtracts business exceptions from available windows
 * @param {Date} targetDate - The date
 * @param {Array<Object>} windows - Current available windows
 * @returns {Array<Object>} Updated windows
 */
function subtractBusinessExceptions(targetDate, windows) {
  const exceptions = getBusinessExceptionsForDate(targetDate);

  for (let i = 0; i < exceptions.length; i++) {
    const exc = exceptions[i];

    if (!exc.start_time || !exc.end_time) {
      continue;
    }

    const excStart = parseTimeToMinutes(exc.start_time);
    const excEnd = parseTimeToMinutes(exc.end_time);

    windows = subtractTimeRange(windows, excStart, excEnd);
  }

  return windows;
}

/**
 * Subtracts existing appointments from available windows
 * @param {string} providerId - The provider ID
 * @param {Date} targetDate - The date
 * @param {Array<Object>} windows - Current available windows
 * @returns {Array<Object>} Updated windows
 */
function subtractExistingAppointments(providerId, targetDate, windows) {
  const appointments = getProviderAppointments(providerId, targetDate);

  for (let i = 0; i < appointments.length; i++) {
    const apt = appointments[i];

    const aptStart = parseTimeToMinutes(apt.start_time);
    const aptEnd = parseTimeToMinutes(apt.end_time);

    windows = subtractTimeRange(windows, aptStart, aptEnd);
  }

  return windows;
}

/**
 * Gets available time slots for a provider on a date
 * @param {string} providerId - The provider ID
 * @param {Date|string} date - The date
 * @param {number} duration - Required duration in minutes
 * @returns {Array<Object>} Array of available slots {startTime, endTime}
 */
function getAvailableSlots(providerId, date, duration) {
  const availableWindows = getProviderAvailability(providerId, date);

  if (availableWindows.length === 0) {
    return [];
  }

  const slotIncrement = getSlotIncrement();
  const slots = [];

  for (let i = 0; i < availableWindows.length; i++) {
    const window = availableWindows[i];
    let currentStart = window.start;

    // Generate slots within this window
    while (currentStart + duration <= window.end) {
      slots.push({
        startTime: minutesToTimeString(currentStart),
        endTime: minutesToTimeString(currentStart + duration)
      });

      currentStart += slotIncrement;
    }
  }

  return slots;
}

/**
 * Checks if a specific time slot is available
 * @param {string} providerId - The provider ID
 * @param {Date|string} date - The date
 * @param {string} startTime - Start time (HH:MM)
 * @param {number} duration - Duration in minutes
 * @returns {boolean} True if slot is available
 */
function isSlotAvailable(providerId, date, startTime, duration) {
  const availableWindows = getProviderAvailability(providerId, date);

  if (availableWindows.length === 0) {
    return false;
  }

  const slotStart = parseTimeToMinutes(startTime);
  const slotEnd = slotStart + duration;

  // Check if the slot fits within any available window
  for (let i = 0; i < availableWindows.length; i++) {
    const window = availableWindows[i];

    if (slotStart >= window.start && slotEnd <= window.end) {
      return true;
    }
  }

  return false;
}

/**
 * Merges overlapping time windows
 * @param {Array<Object>} windows - Array of {start, end} windows
 * @returns {Array<Object>} Merged windows
 */
function mergeTimeWindows(windows) {
  if (windows.length <= 1) {
    return windows;
  }

  // Sort by start time
  windows.sort((a, b) => a.start - b.start);

  const merged = [windows[0]];

  for (let i = 1; i < windows.length; i++) {
    const current = windows[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      // Overlapping or adjacent, merge
      last.end = Math.max(last.end, current.end);
    } else {
      // Non-overlapping, add new window
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Subtracts a time range from windows
 * @param {Array<Object>} windows - Current windows
 * @param {number} subtractStart - Start of range to subtract (minutes)
 * @param {number} subtractEnd - End of range to subtract (minutes)
 * @returns {Array<Object>} Updated windows
 */
function subtractTimeRange(windows, subtractStart, subtractEnd) {
  const result = [];

  for (let i = 0; i < windows.length; i++) {
    const window = windows[i];

    // No overlap
    if (subtractEnd <= window.start || subtractStart >= window.end) {
      result.push(window);
      continue;
    }

    // Complete overlap - window is removed
    if (subtractStart <= window.start && subtractEnd >= window.end) {
      continue;
    }

    // Partial overlap at start
    if (subtractStart <= window.start && subtractEnd < window.end) {
      result.push({
        start: subtractEnd,
        end: window.end
      });
      continue;
    }

    // Partial overlap at end
    if (subtractStart > window.start && subtractEnd >= window.end) {
      result.push({
        start: window.start,
        end: subtractStart
      });
      continue;
    }

    // Subtraction splits the window
    if (subtractStart > window.start && subtractEnd < window.end) {
      result.push({
        start: window.start,
        end: subtractStart
      });
      result.push({
        start: subtractEnd,
        end: window.end
      });
    }
  }

  return result;
}

/**
 * Gets a summary of provider availability for a date range
 * @param {string} providerId - The provider ID
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {Object} Object with dates as keys and availability as values
 */
function getAvailabilitySummary(providerId, startDate, endDate) {
  const summary = {};
  const dates = getDateRange(startDate, endDate);

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dateStr = normalizeDate(date);
    const windows = getProviderAvailability(providerId, date);

    // Calculate total available minutes
    let totalMinutes = 0;
    for (let j = 0; j < windows.length; j++) {
      totalMinutes += windows[j].end - windows[j].start;
    }

    summary[dateStr] = {
      available: windows.length > 0,
      totalMinutes: totalMinutes,
      windows: windows.map(w => ({
        start: minutesToTimeString(w.start),
        end: minutesToTimeString(w.end)
      }))
    };
  }

  return summary;
}

/**
 * Finds the next available slot for a provider
 * @param {string} providerId - The provider ID
 * @param {number} duration - Required duration in minutes
 * @param {number} [maxDaysAhead=30] - Maximum days to search
 * @returns {Object|null} Next available slot or null
 */
function findNextAvailableSlot(providerId, duration, maxDaysAhead) {
  const maxDays = maxDaysAhead || 30;
  let currentDate = new Date();

  for (let i = 0; i < maxDays; i++) {
    const slots = getAvailableSlots(providerId, currentDate, duration);

    if (slots.length > 0) {
      return {
        date: normalizeDate(currentDate),
        startTime: slots[0].startTime,
        endTime: slots[0].endTime
      };
    }

    currentDate = addDays(currentDate, 1);
  }

  return null;
}
