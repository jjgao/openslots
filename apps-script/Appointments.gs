/**
 * Appointment Booking System - Appointment Management Module
 *
 * Core functions for booking, updating, and managing appointments.
 */

/**
 * Books a new appointment with full validation
 * @param {Object} appointmentData - Appointment data
 * @param {string} appointmentData.clientId - Client ID
 * @param {string} appointmentData.providerId - Provider ID
 * @param {string} appointmentData.serviceId - Service ID
 * @param {string} appointmentData.date - Appointment date (YYYY-MM-DD)
 * @param {string} appointmentData.startTime - Start time (HH:MM)
 * @param {number} appointmentData.duration - Duration in minutes
 * @param {string} [appointmentData.notes] - Optional notes
 * @param {boolean} [appointmentData.createCalendarEvent=true] - Whether to create calendar event
 * @returns {Object} Result with success status, appointmentId, or error
 */
function bookAppointment(appointmentData) {
  try {
    // Step 1: Validate required fields
    var validationResult = validateAppointmentData(appointmentData);
    if (!validationResult.valid) {
      return { success: false, error: validationResult.error };
    }

    // Step 2: Validate entities exist
    var client = getClient(appointmentData.clientId);
    if (!client) {
      return { success: false, error: `Client not found: ${appointmentData.clientId}` };
    }

    var provider = getProvider(appointmentData.providerId);
    if (!provider) {
      return { success: false, error: `Provider not found: ${appointmentData.providerId}` };
    }

    if (provider.active_status !== 'Active') {
      return { success: false, error: `Provider is not active: ${appointmentData.providerId}` };
    }

    var service = getService(appointmentData.serviceId);
    if (!service) {
      return { success: false, error: `Service not found: ${appointmentData.serviceId}` };
    }

    // Step 3: Validate date/time
    var dateValidation = validateAppointmentDateTime(
      appointmentData.date,
      appointmentData.startTime
    );
    if (!dateValidation.valid) {
      return { success: false, error: dateValidation.error };
    }

    // Step 4: Check slot availability
    var isAvailable = isSlotAvailable(
      appointmentData.providerId,
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.duration
    );

    if (!isAvailable) {
      return {
        success: false,
        error: 'Time slot is not available. Please choose another time.'
      };
    }

    // Step 5: Calculate end time
    var endTime = calculateEndTime(appointmentData.startTime, appointmentData.duration);

    // Step 6: Create appointment record
    var today = formatDateYMD(new Date());
    var rowData = [
      appointmentData.clientId,
      appointmentData.providerId,
      appointmentData.serviceId,
      appointmentData.date,
      appointmentData.startTime,
      endTime,
      appointmentData.duration,
      'Booked',
      today,
      appointmentData.notes || '',
      '' // calendar_event_id - will be updated after calendar sync
    ];

    // Add appointment row (returns generated ID directly)
    var appointmentId = addRow(SHEETS.APPOINTMENTS, rowData);
    if (!appointmentId) {
      return { success: false, error: 'Failed to create appointment record' };
    }

    // Step 7: Create calendar event (unless explicitly disabled)
    let calendarResult = null;
    if (appointmentData.createCalendarEvent !== false) {
      calendarResult = createCalendarEvent(appointmentId);
      if (!calendarResult.success) {
        Logger.log(`Warning: Calendar event creation failed: ${calendarResult.error}`);
      }
    }

    // Step 8: Log the booking
    logBooking(
      appointmentId,
      appointmentData.clientId,
      appointmentData.providerId,
      appointmentData.notes
    );

    // Step 9: Update client visit history (first_visit and last_visit)
    updateClientVisitHistory(appointmentData.clientId, appointmentData.date);

    // Step 10: Clear availability cache for this date
    clearAvailabilityCache(appointmentData.date);

    Logger.log(`Appointment booked successfully: ${appointmentId}`);

    return {
      success: true,
      appointmentId: appointmentId,
      calendarEventId: calendarResult ? calendarResult.eventId : null,
      data: {
        clientId: appointmentData.clientId,
        clientName: client.name,
        providerId: appointmentData.providerId,
        providerName: provider.name,
        serviceId: appointmentData.serviceId,
        serviceName: service.name,
        date: appointmentData.date,
        startTime: appointmentData.startTime,
        endTime: endTime,
        duration: appointmentData.duration,
        status: 'Booked'
      }
    };

  } catch (error) {
    Logger.log(`Error booking appointment: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Validates appointment data has all required fields
 * @param {Object} data - Appointment data
 * @returns {Object} Validation result {valid, error}
 */
function validateAppointmentData(data) {
  if (!data) {
    return { valid: false, error: 'Appointment data is required' };
  }

  if (!data.clientId) {
    return { valid: false, error: 'Client ID is required' };
  }

  if (!data.providerId) {
    return { valid: false, error: 'Provider ID is required' };
  }

  if (!data.serviceId) {
    return { valid: false, error: 'Service ID is required' };
  }

  if (!data.date) {
    return { valid: false, error: 'Appointment date is required' };
  }

  if (!data.startTime) {
    return { valid: false, error: 'Start time is required' };
  }

  if (!data.duration || data.duration <= 0) {
    return { valid: false, error: 'Valid duration is required' };
  }

  if (!isValidTimeFormat(data.startTime)) {
    return { valid: false, error: 'Invalid time format. Use HH:MM' };
  }

  if (!isValidDateFormat(data.date)) {
    return { valid: false, error: 'Invalid date format' };
  }

  return { valid: true };
}

/**
 * Validates appointment date and time
 * @param {string} date - Appointment date
 * @param {string} startTime - Start time
 * @returns {Object} Validation result {valid, error}
 */
function validateAppointmentDateTime(date, startTime) {
  var appointmentDate = parseDateInTimezone(date);
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  appointmentDate.setHours(0, 0, 0, 0);

  // Check if date is in the past
  if (appointmentDate < today) {
    return { valid: false, error: 'Cannot book appointments in the past' };
  }

  // Check if date is too far in the future
  var maxDays = getMaxAdvanceBookingDays();
  var maxDate = addDays(today, maxDays);
  if (appointmentDate > maxDate) {
    return {
      valid: false,
      error: `Cannot book more than ${maxDays} days in advance`
    };
  }

  // If booking for today, check if the time hasn't passed
  if (isSameDate(appointmentDate, today)) {
    var now = new Date();
    var appointmentDateTime = combineDateAndTime(date, startTime);

    if (appointmentDateTime <= now) {
      return { valid: false, error: 'Cannot book appointments in the past' };
    }
  }

  return { valid: true };
}

// Note: cancelAppointment() and rescheduleAppointment() are now in AppointmentManagement.gs
// with enhanced functionality including status transition validation and comprehensive logging.

/**
 * Updates appointment status
 * @param {string} appointmentId - The appointment ID
 * @param {string} newStatus - New status
 * @param {string} [notes] - Optional notes
 * @returns {Object} Result with success status
 */
function updateAppointmentStatus(appointmentId, newStatus, notes) {
  try {
    var appointment = getAppointment(appointmentId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    var validStatuses = [
      'Booked', 'Confirmed', 'Checked-in', 'Completed',
      'No-show', 'Cancelled', 'Rescheduled'
    ];

    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: `Invalid status: ${newStatus}` };
    }

    var previousStatus = appointment.status;

    // Update the status
    var updates = { status: newStatus };
    if (notes) {
      updates.notes = appointment.notes
        ? `${appointment.notes}\n[${newStatus}] ${notes}`
        : `[${newStatus}] ${notes}`;
    }

    var updated = updateRecordById(SHEETS.APPOINTMENTS, appointmentId, updates);

    if (!updated) {
      return { success: false, error: 'Failed to update appointment' };
    }

    // Update calendar event color
    if (appointment.calendar_event_id) {
      syncCalendarEventColor(appointmentId, newStatus);
    }

    // Log the status change
    logStatusChange(
      appointmentId,
      appointment.client_id,
      appointment.provider_id,
      previousStatus,
      newStatus,
      notes
    );

    // Update client's last_visit_date if completed
    if (newStatus === 'Completed') {
      updateRecordById(SHEETS.CLIENTS, appointment.client_id, {
        last_visit_date: appointment.appointment_date
      });
    }

    Logger.log(`Appointment ${appointmentId} status updated: ${previousStatus} -> ${newStatus}`);

    return { success: true, previousStatus: previousStatus };

  } catch (error) {
    Logger.log(`Error updating appointment status: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Gets appointments for today
 * @returns {Array<Object>} Today's appointments
 */
function getTodayAppointments() {
  return getAppointmentsByDate(new Date());
}

/**
 * Gets upcoming appointments for a client
 * @param {string} clientId - The client ID
 * @param {number} [limit=10] - Maximum number to return
 * @returns {Array<Object>} Upcoming appointments
 */
function getClientUpcomingAppointments(clientId, limit) {
  var appointments = getAppointments();
  var today = normalizeDate(new Date());

  var upcoming = appointments.filter(apt =>
    apt.client_id === clientId &&
    normalizeDate(apt.appointment_date) >= today &&
    !['Cancelled', 'No-show', 'Completed'].includes(apt.status)
  );

  // Sort by date/time
  upcoming.sort((a, b) => {
    var dateA = `${normalizeDate(a.appointment_date)} ${a.start_time}`;
    var dateB = `${normalizeDate(b.appointment_date)} ${b.start_time}`;
    return dateA.localeCompare(dateB);
  });

  return upcoming.slice(0, limit || 10);
}

/**
 * Checks for appointment conflicts
 * @param {string} providerId - Provider ID
 * @param {string} date - Date to check
 * @param {string} startTime - Start time
 * @param {number} duration - Duration in minutes
 * @param {string} [excludeAppointmentId] - Appointment ID to exclude (for reschedules)
 * @returns {boolean} True if there's a conflict
 */
function hasAppointmentConflict(providerId, date, startTime, duration, excludeAppointmentId) {
  var appointments = getProviderAppointments(providerId, date);
  var newStart = parseTimeToMinutes(startTime);
  var newEnd = newStart + duration;

  for (var i = 0; i < appointments.length; i++) {
    var apt = appointments[i];

    // Skip the excluded appointment
    if (excludeAppointmentId && apt.appointment_id === excludeAppointmentId) {
      continue;
    }

    var aptStart = parseTimeToMinutes(apt.start_time);
    var aptEnd = parseTimeToMinutes(apt.end_time);

    // Check for overlap
    if (newStart < aptEnd && aptStart < newEnd) {
      return true;
    }
  }

  return false;
}
