/**
 * Appointment Booking System - Activity Logging Module
 *
 * Provides functions for logging all appointment-related activities
 * to the Activity_Log sheet for audit and tracking purposes.
 */

/**
 * Action type constants
 * @const {Object}
 */
var ACTION_TYPES = {
  BOOK: 'book',
  CANCEL: 'cancel',
  RESCHEDULE: 'reschedule',
  CHECK_IN: 'check-in',
  NO_SHOW: 'no-show',
  COMPLETE: 'complete',
  LATE: 'late',
  CONFIRMATION_CALL: 'confirmation-call',
  CONFIRMATION_TEXT: 'confirmation-text',
  CONFIRMATION_EMAIL: 'confirmation-email',
  CALENDAR_CREATE: 'calendar-create',
  CALENDAR_UPDATE: 'calendar-update',
  CALENDAR_DELETE: 'calendar-delete'
};

/**
 * Logs an activity to the Activity_Log sheet
 * @param {Object} logData - Log entry data
 * @param {string} logData.actionType - Type of action (from ACTION_TYPES)
 * @param {string} [logData.appointmentId] - Related appointment ID
 * @param {string} [logData.clientId] - Related client ID
 * @param {string} [logData.providerId] - Related provider ID
 * @param {string} [logData.user] - User who performed action
 * @param {string} [logData.previousValue] - Previous value (for changes)
 * @param {string} [logData.newValue] - New value (for changes)
 * @param {string} [logData.notes] - Additional notes
 * @returns {boolean} True if logging successful
 */
function logActivity(logData) {
  try {
    var timestamp = getCurrentTimestamp();
    var user = logData.user || Session.getActiveUser().getEmail() || 'system';

    var rowData = [
      timestamp,
      logData.actionType || '',
      logData.appointmentId || '',
      logData.clientId || '',
      logData.providerId || '',
      user,
      logData.previousValue || '',
      logData.newValue || '',
      logData.notes || ''
    ];

    var logId = addRow(SHEETS.ACTIVITY_LOG, rowData);

    if (logId) {
      Logger.log(`Activity logged: ${logData.actionType} for ${logData.appointmentId || 'N/A'}`);
      return true;
    }

    return false;

  } catch (error) {
    Logger.log(`Error logging activity: ${error.toString()}`);
    return false;
  }
}

/**
 * Logs an appointment booking
 * @param {string} appointmentId - The appointment ID
 * @param {string} clientId - The client ID
 * @param {string} providerId - The provider ID
 * @param {string} [notes] - Optional notes
 * @returns {boolean} True if successful
 */
function logBooking(appointmentId, clientId, providerId, notes) {
  return logActivity({
    actionType: ACTION_TYPES.BOOK,
    appointmentId: appointmentId,
    clientId: clientId,
    providerId: providerId,
    newValue: 'Booked',
    notes: notes || 'New appointment created'
  });
}

/**
 * Logs an appointment cancellation
 * @param {string} appointmentId - The appointment ID
 * @param {string} clientId - The client ID
 * @param {string} providerId - The provider ID
 * @param {string} previousStatus - Previous appointment status
 * @param {string} [notes] - Optional notes
 * @returns {boolean} True if successful
 */
function logCancellation(appointmentId, clientId, providerId, previousStatus, notes) {
  return logActivity({
    actionType: ACTION_TYPES.CANCEL,
    appointmentId: appointmentId,
    clientId: clientId,
    providerId: providerId,
    previousValue: previousStatus,
    newValue: 'Cancelled',
    notes: notes || 'Appointment cancelled'
  });
}

/**
 * Logs a status change
 * @param {string} appointmentId - The appointment ID
 * @param {string} clientId - The client ID
 * @param {string} providerId - The provider ID
 * @param {string} previousStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} [notes] - Optional notes
 * @returns {boolean} True if successful
 */
function logStatusChange(appointmentId, clientId, providerId, previousStatus, newStatus, notes) {
  var actionType = ACTION_TYPES.BOOK;

  // Map status to action type
  switch (newStatus.toLowerCase()) {
    case 'cancelled':
      actionType = ACTION_TYPES.CANCEL;
      break;
    case 'checked-in':
      actionType = ACTION_TYPES.CHECK_IN;
      break;
    case 'no-show':
      actionType = ACTION_TYPES.NO_SHOW;
      break;
    case 'completed':
      actionType = ACTION_TYPES.COMPLETE;
      break;
    case 'rescheduled':
      actionType = ACTION_TYPES.RESCHEDULE;
      break;
    default:
      actionType = 'status-change';
  }

  return logActivity({
    actionType: actionType,
    appointmentId: appointmentId,
    clientId: clientId,
    providerId: providerId,
    previousValue: previousStatus,
    newValue: newStatus,
    notes: notes || `Status changed from ${previousStatus} to ${newStatus}`
  });
}

/**
 * Logs a check-in
 * @param {string} appointmentId - The appointment ID
 * @param {string} clientId - The client ID
 * @param {string} providerId - The provider ID
 * @param {string} [notes] - Optional notes
 * @returns {boolean} True if successful
 */
function logCheckIn(appointmentId, clientId, providerId, notes) {
  return logActivity({
    actionType: ACTION_TYPES.CHECK_IN,
    appointmentId: appointmentId,
    clientId: clientId,
    providerId: providerId,
    previousValue: 'Confirmed',
    newValue: 'Checked-in',
    notes: notes || 'Client checked in'
  });
}

/**
 * Logs a no-show
 * @param {string} appointmentId - The appointment ID
 * @param {string} clientId - The client ID
 * @param {string} providerId - The provider ID
 * @param {string} [notes] - Optional notes
 * @returns {boolean} True if successful
 */
function logNoShow(appointmentId, clientId, providerId, notes) {
  return logActivity({
    actionType: ACTION_TYPES.NO_SHOW,
    appointmentId: appointmentId,
    clientId: clientId,
    providerId: providerId,
    previousValue: 'Booked',
    newValue: 'No-show',
    notes: notes || 'Client did not show up'
  });
}

/**
 * Logs a calendar event creation
 * @param {string} appointmentId - The appointment ID
 * @param {string} eventId - The calendar event ID
 * @param {string} [notes] - Optional notes
 * @returns {boolean} True if successful
 */
function logCalendarCreate(appointmentId, eventId, notes) {
  return logActivity({
    actionType: ACTION_TYPES.CALENDAR_CREATE,
    appointmentId: appointmentId,
    newValue: eventId,
    notes: notes || 'Calendar event created'
  });
}

/**
 * Logs a calendar event update
 * @param {string} appointmentId - The appointment ID
 * @param {string} eventId - The calendar event ID
 * @param {string} [notes] - Optional notes
 * @returns {boolean} True if successful
 */
function logCalendarUpdate(appointmentId, eventId, notes) {
  return logActivity({
    actionType: ACTION_TYPES.CALENDAR_UPDATE,
    appointmentId: appointmentId,
    newValue: eventId,
    notes: notes || 'Calendar event updated'
  });
}

/**
 * Logs a calendar event deletion
 * @param {string} appointmentId - The appointment ID
 * @param {string} eventId - The calendar event ID
 * @param {string} [notes] - Optional notes
 * @returns {boolean} True if successful
 */
function logCalendarDelete(appointmentId, eventId, notes) {
  return logActivity({
    actionType: ACTION_TYPES.CALENDAR_DELETE,
    appointmentId: appointmentId,
    previousValue: eventId,
    notes: notes || 'Calendar event deleted'
  });
}

/**
 * Gets recent activity logs
 * @param {number} [limit=50] - Maximum number of records to return
 * @returns {Array<Object>} Array of log entries
 */
function getRecentActivityLogs(limit) {
  var logs = getSheetData(SHEETS.ACTIVITY_LOG);
  var sortedLogs = logs.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return sortedLogs.slice(0, limit || 50);
}

/**
 * Gets activity logs for a specific appointment
 * @param {string} appointmentId - The appointment ID
 * @returns {Array<Object>} Array of log entries
 */
function getActivityLogsForAppointment(appointmentId) {
  return findRecords(SHEETS.ACTIVITY_LOG, { appointment_id: appointmentId });
}

/**
 * Gets activity logs for a specific client
 * @param {string} clientId - The client ID
 * @returns {Array<Object>} Array of log entries
 */
function getActivityLogsForClient(clientId) {
  return findRecords(SHEETS.ACTIVITY_LOG, { client_id: clientId });
}

/**
 * Gets activity logs for a specific provider
 * @param {string} providerId - The provider ID
 * @returns {Array<Object>} Array of log entries
 */
function getActivityLogsForProvider(providerId) {
  return findRecords(SHEETS.ACTIVITY_LOG, { provider_id: providerId });
}
