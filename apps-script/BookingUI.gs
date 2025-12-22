/**
 * Appointment Booking System - Booking UI
 *
 * Provides sidebar UI for easy appointment booking.
 * Part of MVP 3: Client Management + Booking UI
 */

/**
 * Shows the booking sidebar
 */
function showBookingSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('BookingSidebar')
    .setTitle('Book Appointment')
    .setWidth(400);

  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Gets data for booking form (providers, services)
 * @returns {Object} Form data with providers and services
 */
function getBookingFormData() {
  var providers = getProviders(true); // Active only
  var services = getServices();

  return {
    providers: providers,
    services: services
  };
}

/**
 * Searches for clients (called from UI)
 * @param {string} searchTerm - Search term
 * @returns {Array<Object>} Array of matching clients
 */
function searchClientsForUI(searchTerm) {
  return searchClients(searchTerm);
}

/**
 * Creates a new client from the UI
 * @param {Object} clientData - Client data
 * @returns {Object} Result with success status and client info
 */
function createClientFromUI(clientData) {
  return createClient(clientData);
}

/**
 * Gets available time slots for a provider on a date
 * @param {string} providerId - Provider ID
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} duration - Appointment duration in minutes
 * @returns {Object} Result with available slots or error
 */
function getAvailableTimeSlots(providerId, dateStr, duration) {
  if (!providerId || !dateStr || !duration) {
    return {
      success: false,
      error: 'Provider, date, and duration are required'
    };
  }

  try {
    var date = parseDateInTimezone(dateStr);

    // Check if provider is available on this date
    var availability = checkProviderAvailability(providerId, date);

    if (!availability.available) {
      return {
        success: false,
        error: availability.reason || 'Provider not available on this date'
      };
    }

    // Get available time blocks
    var timeBlocks = availability.timeBlocks || [];
    if (timeBlocks.length === 0) {
      return {
        success: false,
        error: 'No available time blocks for this provider on this date'
      };
    }

    // Get existing appointments
    var existingAppointments = getProviderAppointments(providerId, date);

    // Generate available slots
    var slots = generateTimeSlots(timeBlocks, existingAppointments, duration);

    return {
      success: true,
      slots: slots,
      timeBlocks: timeBlocks
    };

  } catch (error) {
    Logger.log('Error getting available time slots: ' + error.toString());
    return {
      success: false,
      error: 'Error calculating available slots: ' + error.message
    };
  }
}

/**
 * Generates time slots from available time blocks
 * @param {Array<Object>} timeBlocks - Available time blocks
 * @param {Array<Object>} existingAppointments - Existing appointments
 * @param {number} duration - Desired duration in minutes
 * @returns {Array<string>} Array of available time slots in HH:MM format
 */
function generateTimeSlots(timeBlocks, existingAppointments, duration) {
  var slots = [];
  var slotInterval = 15; // Generate slots every 15 minutes

  for (var i = 0; i < timeBlocks.length; i++) {
    var block = timeBlocks[i];
    var startMinutes = timeToMinutes(block.start);
    var endMinutes = timeToMinutes(block.end);

    // Generate slots within this time block
    for (var minutes = startMinutes; minutes + duration <= endMinutes; minutes += slotInterval) {
      var slotTime = minutesToTime(minutes);

      // Check if this slot conflicts with existing appointments
      if (!hasConflict(slotTime, duration, existingAppointments)) {
        slots.push(slotTime);
      }
    }
  }

  return slots;
}

/**
 * Converts time string to minutes since midnight
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(timeStr) {
  var parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/**
 * Converts minutes since midnight to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
function minutesToTime(minutes) {
  var hours = Math.floor(minutes / 60);
  var mins = minutes % 60;
  return padZero(hours) + ':' + padZero(mins);
}

/**
 * Pads single digit with leading zero
 * @param {number} num - Number to pad
 * @returns {string} Padded string
 */
function padZero(num) {
  return num < 10 ? '0' + num : '' + num;
}

/**
 * Checks if a time slot conflicts with existing appointments
 * @param {string} slotTime - Start time of slot in HH:MM
 * @param {number} duration - Duration in minutes
 * @param {Array<Object>} appointments - Existing appointments
 * @returns {boolean} True if there's a conflict
 */
function hasConflict(slotTime, duration, appointments) {
  var slotStart = timeToMinutes(slotTime);
  var slotEnd = slotStart + duration;

  for (var i = 0; i < appointments.length; i++) {
    var apt = appointments[i];

    // Skip cancelled or no-show appointments
    if (apt.status === 'Cancelled' || apt.status === 'No-show') {
      continue;
    }

    var aptStart = timeToMinutes(apt.start_time);
    var aptEnd = timeToMinutes(apt.end_time);

    // Check for overlap
    if (slotStart < aptEnd && slotEnd > aptStart) {
      return true; // Conflict found
    }
  }

  return false; // No conflict
}

/**
 * Books an appointment from the UI
 * @param {Object} bookingData - Booking data
 * @returns {Object} Result with success status and appointment info
 */
function bookAppointmentFromUI(bookingData) {
  try {
    // Validate required fields
    if (!bookingData.clientId || !bookingData.providerId ||
        !bookingData.serviceId || !bookingData.date || !bookingData.startTime) {
      return {
        success: false,
        error: 'All fields are required'
      };
    }

    // Get service to determine duration
    var service = getService(bookingData.serviceId);
    if (!service) {
      return {
        success: false,
        error: 'Service not found'
      };
    }

    // Parse duration (use first option if multiple)
    var durationOptions = service.default_duration_options.toString().split(',');
    var duration = parseInt(durationOptions[0]);

    // Calculate end time
    var startMinutes = timeToMinutes(bookingData.startTime);
    var endTime = minutesToTime(startMinutes + duration);

    // Create appointment data
    var appointmentData = {
      clientId: bookingData.clientId,
      providerId: bookingData.providerId,
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      startTime: bookingData.startTime,
      duration: duration,
      notes: bookingData.notes || ''
    };

    // Book the appointment
    var result = bookAppointment(appointmentData);

    if (result.success) {
      // Update client visit history
      updateClientVisitHistory(bookingData.clientId, bookingData.date);
    }

    return result;

  } catch (error) {
    Logger.log('Error booking appointment from UI: ' + error.toString());
    return {
      success: false,
      error: 'Error booking appointment: ' + error.message
    };
  }
}

/**
 * Gets client details including appointment history
 * @param {string} clientId - Client ID
 * @returns {Object} Client details with history and stats
 */
function getClientDetails(clientId) {
  var client = getClient(clientId);
  if (!client) {
    return null;
  }

  var history = getClientAppointmentHistory(clientId);
  var stats = getClientStats(clientId);

  return {
    client: client,
    history: history,
    stats: stats
  };
}
