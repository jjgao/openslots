/**
 * Appointment Booking System - Appointment Management Module
 *
 * Functions for managing the full appointment lifecycle:
 * - Cancel appointments
 * - Reschedule appointments
 * - Check in clients
 * - Mark no-shows
 * - Complete appointments
 */

/**
 * Valid status transitions
 * Defines which status changes are allowed
 * @const {Object}
 */
var VALID_STATUS_TRANSITIONS = {
  'Booked': ['Cancelled', 'Rescheduled', 'Checked-in', 'No-show', 'Confirmed'],
  'Confirmed': ['Cancelled', 'Rescheduled', 'Checked-in', 'No-show'],
  'Checked-in': ['Completed', 'No-show'],
  'Rescheduled': [],  // Finalized - original appointment replaced by new one
  'Cancelled': [],  // Finalized - no further changes
  'Completed': [],  // Finalized
  'No-show': []     // Finalized
};

/**
 * Cancels an appointment
 * @param {string} appointmentId - The appointment ID to cancel
 * @param {string} reason - Reason for cancellation
 * @param {string} [cancelledBy] - User who cancelled (defaults to current user)
 * @returns {Object} Result object with success status and message
 */
function cancelAppointment(appointmentId, reason, cancelledBy) {
  try {
    // Validate inputs
    if (!appointmentId) {
      return { success: false, message: 'Appointment ID is required' };
    }

    // Get appointment
    var appointment = getAppointmentById(appointmentId);
    if (!appointment) {
      return { success: false, message: `Appointment ${appointmentId} not found` };
    }

    // Check if cancellation is allowed
    var currentStatus = appointment.status;
    if (!canTransitionTo(currentStatus, 'Cancelled')) {
      return {
        success: false,
        message: `Cannot cancel appointment with status "${currentStatus}"`
      };
    }

    // Update appointment status
    var updated = updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      status: 'Cancelled',
      cancelled_at: getCurrentTimestamp(),
      cancelled_by: cancelledBy || Session.getActiveUser().getEmail(),
      cancellation_reason: reason || ''
    });

    if (!updated) {
      return { success: false, message: 'Failed to update appointment' };
    }

    // Delete calendar event
    if (appointment.calendar_event_id) {
      var calendarResult = deleteCalendarEvent(appointmentId);
      if (calendarResult.success) {
        logCalendarDelete(appointmentId, appointment.calendar_event_id, 'Event deleted due to cancellation');
      }
    }

    // Log the cancellation
    logCancellation(
      appointmentId,
      appointment.client_id,
      appointment.provider_id,
      currentStatus,
      reason
    );

    // Clear availability cache for this date
    clearAvailabilityCache(appointment.appointment_date);

    return {
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        appointment_id: appointmentId,
        previous_status: currentStatus,
        new_status: 'Cancelled',
        reason: reason
      }
    };

  } catch (error) {
    Logger.log(`Error cancelling appointment: ${error.toString()}`);
    return {
      success: false,
      message: `Error cancelling appointment: ${error.message}`
    };
  }
}

/**
 * Reschedules an appointment by creating a new one and marking the old one as Rescheduled
 * This maintains complete audit trail by keeping both appointments
 * @param {string} appointmentId - The original appointment ID
 * @param {Object} options - Reschedule options
 * @param {string} [options.newDate] - New date (YYYY-MM-DD)
 * @param {string} [options.newStartTime] - New start time (HH:MM)
 * @param {string} [options.newProviderId] - New provider ID
 * @param {string} [options.newServiceId] - New service ID
 * @param {number} [options.newDuration] - New duration in minutes
 * @param {string} [options.reason] - Reason for rescheduling
 * @returns {Object} Result object with new appointment ID
 */
function rescheduleAppointment(appointmentId, options) {
  try {
    // Validate inputs
    if (!appointmentId) {
      return { success: false, message: 'Appointment ID is required' };
    }

    if (!options || (!options.newDate && !options.newStartTime && !options.newProviderId)) {
      return { success: false, message: 'At least one change (date, time, or provider) is required' };
    }

    // Get original appointment
    var originalApt = getAppointmentById(appointmentId);
    if (!originalApt) {
      return { success: false, message: 'Appointment ' + appointmentId + ' not found' };
    }

    // Check if rescheduling is allowed
    var currentStatus = originalApt.status;
    if (!canTransitionTo(currentStatus, 'Rescheduled')) {
      return {
        success: false,
        message: 'Cannot reschedule appointment with status "' + currentStatus + '"'
      };
    }

    // Prepare new appointment data (inherit from original, override with new values)
    var newDate = options.newDate || originalApt.appointment_date;
    var newStartTime = options.newStartTime || originalApt.start_time;
    var newProviderId = options.newProviderId || originalApt.provider_id;
    var newServiceId = options.newServiceId || originalApt.service_id;
    var newDuration = options.newDuration || originalApt.duration;

    // Validate new provider and service
    if (options.newProviderId) {
      var provider = getProvider(options.newProviderId);
      if (!provider) {
        return { success: false, message: 'Provider ' + options.newProviderId + ' not found' };
      }

      if (!providerOffersService(options.newProviderId, newServiceId)) {
        return { success: false, message: 'Provider does not offer this service' };
      }
    }

    if (options.newServiceId) {
      var service = getService(options.newServiceId);
      if (!service) {
        return { success: false, message: 'Service ' + options.newServiceId + ' not found' };
      }
    }

    // Check availability of new slot
    var available = isSlotAvailable(
      newProviderId,
      newDate,
      newStartTime,
      newDuration,
      null // Don't exclude any appointment since we're creating a new one
    );

    if (!available) {
      return {
        success: false,
        message: 'The new time slot is not available'
      };
    }

    // Calculate end time for new appointment
    var newEndTime = calculateEndTime(newStartTime, newDuration);

    // Create new appointment
    var newAppointmentData = {
      clientId: originalApt.client_id,
      providerId: newProviderId,
      serviceId: newServiceId,
      date: newDate,
      startTime: newStartTime,
      duration: newDuration,
      notes: (originalApt.notes ? originalApt.notes + ' | ' : '') +
             'Rescheduled from ' + appointmentId + ' (' + originalApt.appointment_date + ' at ' + originalApt.start_time + ')'
    };

    var newAppointmentResult = bookAppointment(newAppointmentData);

    if (!newAppointmentResult.success) {
      return {
        success: false,
        message: 'Failed to create new appointment: ' + newAppointmentResult.message
      };
    }

    var newAppointmentId = newAppointmentResult.appointmentId;

    // Mark original appointment as Rescheduled and add reference to new appointment
    var originalUpdates = {
      status: 'Rescheduled',
      notes: (originalApt.notes ? originalApt.notes + ' | ' : '') +
             'Rescheduled to ' + newAppointmentId + ' (' + newDate + ' at ' + newStartTime + ')'
    };

    var updatedOriginal = updateRecordById(SHEETS.APPOINTMENTS, appointmentId, originalUpdates);
    if (!updatedOriginal) {
      // Rollback: try to delete the new appointment
      Logger.log('WARNING: Failed to mark original appointment as Rescheduled. New appointment ' + newAppointmentId + ' may need manual cleanup.');
    }

    // Cancel original calendar event if it exists
    if (originalApt.calendar_event_id) {
      var cancelResult = deleteCalendarEvent(originalApt.calendar_event_id);
      if (cancelResult.success) {
        logCalendarUpdate(appointmentId, originalApt.calendar_event_id, 'Event cancelled due to rescheduling');
      }
    }

    // Log the reschedule activity
    logActivity({
      actionType: ACTION_TYPES.RESCHEDULE,
      appointmentId: appointmentId,
      clientId: originalApt.client_id,
      providerId: originalApt.provider_id,
      previousValue: JSON.stringify({
        appointment_id: appointmentId,
        date: originalApt.appointment_date,
        start_time: originalApt.start_time,
        provider_id: originalApt.provider_id,
        service_id: originalApt.service_id,
        duration: originalApt.duration
      }),
      newValue: JSON.stringify({
        appointment_id: newAppointmentId,
        date: newDate,
        start_time: newStartTime,
        provider_id: newProviderId,
        service_id: newServiceId,
        duration: newDuration
      }),
      notes: (options.reason || 'Appointment rescheduled') + ' - New appointment: ' + newAppointmentId
    });

    // Clear availability cache for original date (new date is cleared by bookAppointment)
    clearAvailabilityCache(originalApt.appointment_date);

    return {
      success: true,
      message: 'Appointment rescheduled successfully',
      data: {
        original_appointment_id: appointmentId,
        new_appointment_id: newAppointmentId,
        original_details: {
          date: originalApt.appointment_date,
          start_time: originalApt.start_time,
          provider_id: originalApt.provider_id
        },
        new_details: {
          date: newDate,
          start_time: newStartTime,
          provider_id: newProviderId
        },
        reason: options.reason
      }
    };

  } catch (error) {
    Logger.log('Error rescheduling appointment: ' + error.toString());
    return {
      success: false,
      message: 'Error rescheduling appointment: ' + error.message
    };
  }
}

/**
 * Checks in a client for their appointment
 * @param {string} appointmentId - The appointment ID
 * @param {string} [checkedInBy] - User who checked in the client
 * @returns {Object} Result object
 */
function checkInAppointment(appointmentId, checkedInBy) {
  try {
    // Validate inputs
    if (!appointmentId) {
      return { success: false, message: 'Appointment ID is required' };
    }

    // Get appointment
    var appointment = getAppointmentById(appointmentId);
    if (!appointment) {
      return { success: false, message: `Appointment ${appointmentId} not found` };
    }

    // Check if check-in is allowed
    var currentStatus = appointment.status;
    if (!canTransitionTo(currentStatus, 'Checked-in')) {
      return {
        success: false,
        message: `Cannot check in appointment with status "${currentStatus}"`
      };
    }

    // Validate check-in window
    var now = new Date();
    var appointmentDate = parseDateInTimezone(appointment.appointment_date);
    var appointmentTime = parseTimeToMinutes(appointment.start_time);

    appointmentDate.setHours(Math.floor(appointmentTime / 60));
    appointmentDate.setMinutes(appointmentTime % 60);
    appointmentDate.setSeconds(0);
    appointmentDate.setMilliseconds(0);

    var diffMinutes = (now - appointmentDate) / (1000 * 60);
    var checkInWindowBefore = getConfig('check_in_window_before', 60); // 1 hour before
    var checkInWindowAfter = getConfig('check_in_window_after', 30);   // 30 min after

    if (diffMinutes < -checkInWindowBefore) {
      return {
        success: false,
        message: `Too early to check in. Check-in opens ${checkInWindowBefore} minutes before appointment time.`
      };
    }

    if (diffMinutes > checkInWindowAfter) {
      return {
        success: false,
        message: `Too late to check in. Appointment was more than ${checkInWindowAfter} minutes ago. Consider marking as no-show.`
      };
    }

    // Update appointment status
    var updated = updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      status: 'Checked-in',
      checked_in_at: getCurrentTimestamp(),
      checked_in_by: checkedInBy || Session.getActiveUser().getEmail()
    });

    if (!updated) {
      return { success: false, message: 'Failed to update appointment' };
    }

    // Log the check-in
    logCheckIn(
      appointmentId,
      appointment.client_id,
      appointment.provider_id,
      `Client arrived ${diffMinutes > 0 ? diffMinutes.toFixed(0) + ' min late' : 'on time'}`
    );

    return {
      success: true,
      message: 'Client checked in successfully',
      data: {
        appointment_id: appointmentId,
        checked_in_at: getCurrentTimestamp(),
        minutes_early: -diffMinutes.toFixed(0),
        on_time: diffMinutes <= 5
      }
    };

  } catch (error) {
    Logger.log(`Error checking in appointment: ${error.toString()}`);
    return {
      success: false,
      message: `Error checking in appointment: ${error.message}`
    };
  }
}

/**
 * Marks an appointment as no-show
 * @param {string} appointmentId - The appointment ID
 * @param {string} [markedBy] - User who marked the no-show
 * @param {string} [notes] - Optional notes
 * @returns {Object} Result object
 */
function markNoShow(appointmentId, markedBy, notes) {
  try {
    // Validate inputs
    if (!appointmentId) {
      return { success: false, message: 'Appointment ID is required' };
    }

    // Get appointment
    var appointment = getAppointmentById(appointmentId);
    if (!appointment) {
      return { success: false, message: `Appointment ${appointmentId} not found` };
    }

    // Check if no-show marking is allowed
    var currentStatus = appointment.status;
    if (!canTransitionTo(currentStatus, 'No-show')) {
      return {
        success: false,
        message: `Cannot mark appointment with status "${currentStatus}" as no-show`
      };
    }

    // Validate appointment is in the past (with grace period)
    var now = new Date();
    var appointmentDate = parseDateInTimezone(appointment.appointment_date);
    var appointmentTime = parseTimeToMinutes(appointment.start_time);

    appointmentDate.setHours(Math.floor(appointmentTime / 60));
    appointmentDate.setMinutes(appointmentTime % 60);
    appointmentDate.setSeconds(0);
    appointmentDate.setMilliseconds(0);

    var diffMinutes = (now - appointmentDate) / (1000 * 60);
    var gracePeriod = getConfig('no_show_grace_period_minutes', 30);

    if (diffMinutes < gracePeriod) {
      return {
        success: false,
        message: `Cannot mark as no-show yet. Grace period is ${gracePeriod} minutes after appointment time.`
      };
    }

    // Update appointment status
    var updated = updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      status: 'No-show',
      no_show_marked_at: getCurrentTimestamp(),
      no_show_marked_by: markedBy || Session.getActiveUser().getEmail(),
      no_show_notes: notes || ''
    });

    if (!updated) {
      return { success: false, message: 'Failed to update appointment' };
    }

    // Update client's no-show count
    var client = getClient(appointment.client_id);
    if (client) {
      var currentNoShowCount = parseInt(client.no_show_count || 0);
      updateRecordById(SHEETS.CLIENTS, appointment.client_id, {
        no_show_count: currentNoShowCount + 1
      });
    }

    // Update/delete calendar event (mark as cancelled)
    if (appointment.calendar_event_id) {
      var calendarResult = deleteCalendarEvent(appointmentId);
      if (calendarResult.success) {
        logCalendarDelete(appointmentId, appointment.calendar_event_id, 'Event deleted due to no-show');
      }
    }

    // Log the no-show
    logNoShow(
      appointmentId,
      appointment.client_id,
      appointment.provider_id,
      notes || 'Client did not show up for appointment'
    );

    // Clear availability cache for this date (No-show status frees up the time slot)
    clearAvailabilityCache(appointment.appointment_date);

    return {
      success: true,
      message: 'Appointment marked as no-show',
      data: {
        appointment_id: appointmentId,
        client_id: appointment.client_id,
        marked_at: getCurrentTimestamp(),
        notes: notes
      }
    };

  } catch (error) {
    Logger.log(`Error marking no-show: ${error.toString()}`);
    return {
      success: false,
      message: `Error marking no-show: ${error.message}`
    };
  }
}

/**
 * Completes an appointment
 * @param {string} appointmentId - The appointment ID
 * @param {string} [completedBy] - User who marked as completed
 * @param {string} [notes] - Optional completion notes
 * @returns {Object} Result object
 */
function completeAppointment(appointmentId, completedBy, notes) {
  try {
    // Validate inputs
    if (!appointmentId) {
      return { success: false, message: 'Appointment ID is required' };
    }

    // Get appointment
    var appointment = getAppointmentById(appointmentId);
    if (!appointment) {
      return { success: false, message: `Appointment ${appointmentId} not found` };
    }

    // Check if completion is allowed
    var currentStatus = appointment.status;
    if (!canTransitionTo(currentStatus, 'Completed')) {
      return {
        success: false,
        message: `Cannot complete appointment with status "${currentStatus}". Please check in the client first.`
      };
    }

    // Update appointment status
    var updated = updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      status: 'Completed',
      completed_at: getCurrentTimestamp(),
      completed_by: completedBy || Session.getActiveUser().getEmail(),
      completion_notes: notes || ''
    });

    if (!updated) {
      return { success: false, message: 'Failed to update appointment' };
    }

    // Log the completion
    logActivity({
      actionType: ACTION_TYPES.COMPLETE,
      appointmentId: appointmentId,
      clientId: appointment.client_id,
      providerId: appointment.provider_id,
      previousValue: currentStatus,
      newValue: 'Completed',
      notes: notes || 'Appointment completed successfully'
    });

    // Clear availability cache for this date (Completed status frees up the time slot)
    clearAvailabilityCache(appointment.appointment_date);

    return {
      success: true,
      message: 'Appointment completed successfully',
      data: {
        appointment_id: appointmentId,
        completed_at: getCurrentTimestamp()
      }
    };

  } catch (error) {
    Logger.log(`Error completing appointment: ${error.toString()}`);
    return {
      success: false,
      message: `Error completing appointment: ${error.message}`
    };
  }
}

/**
 * Checks if a status transition is valid
 * @param {string} currentStatus - Current appointment status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} True if transition is allowed
 */
function canTransitionTo(currentStatus, newStatus) {
  if (!currentStatus || !newStatus) {
    return false;
  }

  var allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions && allowedTransitions.includes(newStatus);
}

/**
 * Checks if a provider offers a specific service
 * @param {string} providerId - The provider ID
 * @param {string} serviceId - The service ID
 * @returns {boolean} True if provider offers the service
 */
function providerOffersService(providerId, serviceId) {
  var provider = getProvider(providerId);
  if (!provider || !provider.services_offered) {
    return false;
  }

  var servicesOffered = provider.services_offered.split('|').map(function(s) {
    return s.trim();
  });

  return servicesOffered.includes(serviceId);
}
