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
 * @param {string} [excludeAppointmentId] - Optional appointment ID to exclude from conflicts (for rescheduling)
 * @returns {Array<Object>} Array of available time windows {start, end}
 */
function getProviderAvailability(providerId, date, excludeAppointmentId) {
  var targetDate = typeof date === 'string' ? parseDateInTimezone(date) : date;
  var dayName = getDayName(targetDate);

  // Step 1: Check if it's a business holiday
  if (isBusinessHoliday(targetDate)) {
    Logger.log(`${normalizeDate(targetDate)} is a business holiday`);
    return [];
  }

  // Step 2: Get recurring availability for this day of week
  var availableWindows = getRecurringAvailability(providerId, dayName, targetDate);

  if (availableWindows.length === 0) {
    Logger.log(`No recurring availability for ${providerId} on ${dayName}`);
    return [];
  }

  // Step 3: Subtract provider exceptions
  availableWindows = subtractProviderExceptions(providerId, targetDate, availableWindows);

  // Step 4: Subtract business exceptions
  availableWindows = subtractBusinessExceptions(targetDate, availableWindows);

  // Step 5: Subtract existing appointments
  availableWindows = subtractExistingAppointments(providerId, targetDate, availableWindows, excludeAppointmentId);

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
  var availabilityRecords = getProviderAvailabilityRecords(providerId);
  var windows = [];

  for (var i = 0; i < availabilityRecords.length; i++) {
    var record = availabilityRecords[i];

    // Check if this record applies to the day of week
    if (record.day_of_week !== dayName) {
      continue;
    }

    // Check if recurring or within effective date range
    if (record.is_recurring !== 'Yes') {
      // Non-recurring: check effective dates
      if (record.effective_date_start) {
        var effectiveStart = new Date(record.effective_date_start);
        if (targetDate < effectiveStart) {
          continue;
        }
      }
      if (record.effective_date_end) {
        var effectiveEnd = new Date(record.effective_date_end);
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
  var exceptions = getProviderExceptionsForDate(providerId, targetDate);

  for (var i = 0; i < exceptions.length; i++) {
    var exc = exceptions[i];

    // If no times specified, the entire day is blocked
    if (!exc.start_time || !exc.end_time ||
        exc.start_time === '00:00' && exc.end_time === '23:59') {
      return [];
    }

    var excStart = parseTimeToMinutes(exc.start_time);
    var excEnd = parseTimeToMinutes(exc.end_time);

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
  var exceptions = getBusinessExceptionsForDate(targetDate);

  for (var i = 0; i < exceptions.length; i++) {
    var exc = exceptions[i];

    if (!exc.start_time || !exc.end_time) {
      continue;
    }

    var excStart = parseTimeToMinutes(exc.start_time);
    var excEnd = parseTimeToMinutes(exc.end_time);

    windows = subtractTimeRange(windows, excStart, excEnd);
  }

  return windows;
}

/**
 * Subtracts existing appointments from available windows
 * Only active appointments block time slots; closed appointments do not
 * @param {string} providerId - The provider ID
 * @param {Date} targetDate - The date
 * @param {Array<Object>} windows - Available windows
 * @param {string} [excludeAppointmentId] - Optional appointment ID to exclude (for rescheduling)
 * @returns {Array<Object>} Windows with appointments subtracted
 */
function subtractExistingAppointments(providerId, targetDate, windows, excludeAppointmentId) {
  var appointments = getProviderAppointments(providerId, targetDate);

  // Define active statuses that block time slots
  var activeStatuses = ['Booked', 'Confirmed', 'Checked-in'];

  // Closed statuses that do NOT block time slots:
  // 'Rescheduled' - client isn't coming (new appointment created)
  // 'Cancelled' - appointment was cancelled
  // 'Completed' - already happened
  // 'No-show' - client didn't show up

  for (var i = 0; i < appointments.length; i++) {
    var apt = appointments[i];

    // Skip the excluded appointment (for reschedule scenarios)
    if (excludeAppointmentId && apt.appointment_id === excludeAppointmentId) {
      continue;
    }

    // Skip closed appointments - they don't block the calendar
    if (activeStatuses.indexOf(apt.status) === -1) {
      continue;
    }

    var aptStart = parseTimeToMinutes(apt.start_time);
    var aptEnd = parseTimeToMinutes(apt.end_time);

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
  var availableWindows = getProviderAvailability(providerId, date);

  if (availableWindows.length === 0) {
    return [];
  }

  var slotIncrement = getSlotIncrement();
  var slots = [];

  for (var i = 0; i < availableWindows.length; i++) {
    var window = availableWindows[i];
    var currentStart = window.start;

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
 * @param {string} [excludeAppointmentId] - Optional appointment ID to exclude from conflicts (for rescheduling)
 * @returns {boolean} True if slot is available
 */
function isSlotAvailable(providerId, date, startTime, duration, excludeAppointmentId) {
  var availableWindows = getProviderAvailability(providerId, date, excludeAppointmentId);

  if (availableWindows.length === 0) {
    return false;
  }

  var slotStart = parseTimeToMinutes(startTime);
  var slotEnd = slotStart + duration;

  // Check if the slot fits within any available window
  for (var i = 0; i < availableWindows.length; i++) {
    var window = availableWindows[i];

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

  var merged = [windows[0]];

  for (var i = 1; i < windows.length; i++) {
    var current = windows[i];
    var last = merged[merged.length - 1];

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
  var result = [];

  for (var i = 0; i < windows.length; i++) {
    var window = windows[i];

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
  var summary = {};
  var dates = getDateRange(startDate, endDate);

  for (var i = 0; i < dates.length; i++) {
    var date = dates[i];
    var dateStr = normalizeDate(date);
    var windows = getProviderAvailability(providerId, date);

    // Calculate total available minutes
    var totalMinutes = 0;
    for (var j = 0; j < windows.length; j++) {
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
  var maxDays = maxDaysAhead || 30;
  var currentDate = new Date();

  for (var i = 0; i < maxDays; i++) {
    var slots = getAvailableSlots(providerId, currentDate, duration);

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
