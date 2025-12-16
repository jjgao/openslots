/**
 * Appointment Booking System - Triggers Module
 *
 * Contains trigger functions for automated actions on sheet edits.
 * Handles manual appointment entry validation and calendar sync.
 */

/**
 * Installable onEdit trigger for handling manual sheet edits
 * This must be set up via Project Settings > Triggers
 *
 * @param {Object} e - Edit event object
 */
function onEditTrigger(e) {
  try {
    if (!e || !e.range) {
      return;
    }

    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();

    // Only process Appointments sheet
    if (sheetName !== SHEETS.APPOINTMENTS) {
      return;
    }

    const row = e.range.getRow();
    const col = e.range.getColumn();

    // Ignore header row
    if (row === 1) {
      return;
    }

    // Handle different edit scenarios
    handleAppointmentEdit(sheet, row, col, e);

  } catch (error) {
    Logger.log(`Error in onEditTrigger: ${error.toString()}`);
  }
}

/**
 * Handles edits to the Appointments sheet
 * @param {Sheet} sheet - The sheet
 * @param {number} row - Row number that was edited
 * @param {number} col - Column number that was edited
 * @param {Object} e - Edit event
 */
function handleAppointmentEdit(sheet, row, col, e) {
  const columns = COLUMNS.APPOINTMENTS;

  // Check if this is a new row (editing required fields)
  const isNewRow = isNewAppointmentRow(sheet, row);

  if (isNewRow && hasRequiredAppointmentFields(sheet, row)) {
    // New appointment - validate and create calendar event
    processNewManualAppointment(sheet, row);
    return;
  }

  // Handle status changes (column 9 = status)
  if (col === columns.STATUS + 1) {
    const newStatus = e.value || sheet.getRange(row, col).getValue();
    const appointmentId = sheet.getRange(row, 1).getValue();

    if (appointmentId && newStatus) {
      handleStatusChange(appointmentId, newStatus);
    }
    return;
  }

  // Handle date/time changes - update calendar
  if (col === columns.DATE + 1 ||
      col === columns.START_TIME + 1 ||
      col === columns.END_TIME + 1) {
    const appointmentId = sheet.getRange(row, 1).getValue();
    if (appointmentId) {
      updateCalendarEvent(appointmentId);
    }
  }
}

/**
 * Checks if a row is a new appointment (no ID yet but has data)
 * @param {Sheet} sheet - The sheet
 * @param {number} row - Row number
 * @returns {boolean} True if this is a new row
 */
function isNewAppointmentRow(sheet, row) {
  // Column A contains auto-generated ID - it's new if ID is empty but other data exists
  const appointmentId = sheet.getRange(row, 1).getValue();
  const clientId = sheet.getRange(row, 2).getValue();

  return !appointmentId && clientId;
}

/**
 * Checks if required fields are filled for a new appointment
 * @param {Sheet} sheet - The sheet
 * @param {number} row - Row number
 * @returns {boolean} True if all required fields are filled
 */
function hasRequiredAppointmentFields(sheet, row) {
  const clientId = sheet.getRange(row, 2).getValue();
  const providerId = sheet.getRange(row, 3).getValue();
  const serviceId = sheet.getRange(row, 4).getValue();
  const date = sheet.getRange(row, 5).getValue();
  const startTime = sheet.getRange(row, 6).getValue();

  return clientId && providerId && serviceId && date && startTime;
}

/**
 * Processes a new manually entered appointment
 * @param {Sheet} sheet - The sheet
 * @param {number} row - Row number
 */
function processNewManualAppointment(sheet, row) {
  try {
    // Get all data from the row
    const data = {
      clientId: sheet.getRange(row, 2).getValue(),
      providerId: sheet.getRange(row, 3).getValue(),
      serviceId: sheet.getRange(row, 4).getValue(),
      date: sheet.getRange(row, 5).getValue(),
      startTime: formatTimeValue(sheet.getRange(row, 6).getValue()),
      endTime: formatTimeValue(sheet.getRange(row, 7).getValue()),
      duration: sheet.getRange(row, 8).getValue(),
      status: sheet.getRange(row, 9).getValue() || 'Booked',
      notes: sheet.getRange(row, 11).getValue()
    };

    // Validate entities exist
    const client = getClient(data.clientId);
    if (!client) {
      showValidationError(sheet, row, `Client not found: ${data.clientId}`);
      return;
    }

    const provider = getProvider(data.providerId);
    if (!provider) {
      showValidationError(sheet, row, `Provider not found: ${data.providerId}`);
      return;
    }

    const service = getService(data.serviceId);
    if (!service) {
      showValidationError(sheet, row, `Service not found: ${data.serviceId}`);
      return;
    }

    // Calculate duration if not provided
    if (!data.duration && data.startTime && data.endTime) {
      const startMinutes = parseTimeToMinutes(data.startTime);
      const endMinutes = parseTimeToMinutes(data.endTime);
      data.duration = endMinutes - startMinutes;
      sheet.getRange(row, 8).setValue(data.duration);
    }

    // Calculate end time if not provided
    if (!data.endTime && data.startTime && data.duration) {
      data.endTime = calculateEndTime(data.startTime, data.duration);
      sheet.getRange(row, 7).setValue(data.endTime);
    }

    // Set default duration from service if not provided
    if (!data.duration) {
      const defaultDuration = getDefaultDuration();
      data.duration = defaultDuration;
      sheet.getRange(row, 8).setValue(defaultDuration);
      data.endTime = calculateEndTime(data.startTime, defaultDuration);
      sheet.getRange(row, 7).setValue(data.endTime);
    }

    // Normalize date format
    const normalizedDate = normalizeDate(data.date);
    sheet.getRange(row, 5).setValue(normalizedDate);

    // Set status if not provided
    if (!data.status) {
      sheet.getRange(row, 9).setValue('Booked');
      data.status = 'Booked';
    }

    // Set created date
    const today = formatDateYMD(new Date());
    sheet.getRange(row, 10).setValue(today);

    // Force recalculation to generate appointment ID
    SpreadsheetApp.flush();

    // Get the generated ID
    const appointmentId = sheet.getRange(row, 1).getValue();

    if (!appointmentId) {
      Logger.log('Warning: Appointment ID not generated');
      return;
    }

    // Check for conflicts (but allow the entry)
    const hasConflict = hasAppointmentConflict(
      data.providerId,
      normalizedDate,
      data.startTime,
      data.duration,
      appointmentId
    );

    if (hasConflict) {
      showWarning(sheet, row, 'Warning: This time slot may have a conflict');
    }

    // Create calendar event
    const calendarResult = createCalendarEvent(appointmentId);
    if (calendarResult.success) {
      Logger.log(`Calendar event created for manual entry: ${appointmentId}`);
    } else {
      Logger.log(`Failed to create calendar event: ${calendarResult.error}`);
    }

    // Log the activity
    logBooking(appointmentId, data.clientId, data.providerId, 'Manual entry');

    Logger.log(`Manual appointment processed: ${appointmentId}`);

  } catch (error) {
    Logger.log(`Error processing manual appointment: ${error.toString()}`);
  }
}

/**
 * Handles status change for an existing appointment
 * @param {string} appointmentId - The appointment ID
 * @param {string} newStatus - New status value
 */
function handleStatusChange(appointmentId, newStatus) {
  try {
    // Sync calendar color
    syncCalendarEventColor(appointmentId, newStatus);

    // If cancelled, consider deleting calendar event
    if (newStatus === 'Cancelled') {
      deleteCalendarEvent(appointmentId);
    }

    // Log the status change (simplified - actual status change logging
    // happens through updateAppointmentStatus function for programmatic changes)
    Logger.log(`Manual status change: ${appointmentId} -> ${newStatus}`);

  } catch (error) {
    Logger.log(`Error handling status change: ${error.toString()}`);
  }
}

/**
 * Shows a validation error in the sheet
 * @param {Sheet} sheet - The sheet
 * @param {number} row - Row number
 * @param {string} message - Error message
 */
function showValidationError(sheet, row, message) {
  // Set a note on the first cell with the error
  const cell = sheet.getRange(row, 1);
  cell.setNote(`Error: ${message}`);
  cell.setBackground('#ffcdd2'); // Light red

  // Also show an alert if UI is available
  try {
    SpreadsheetApp.getUi().alert('Validation Error', message, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    // UI not available (running from trigger), just log
    Logger.log(`Validation error (row ${row}): ${message}`);
  }
}

/**
 * Shows a warning in the sheet
 * @param {Sheet} sheet - The sheet
 * @param {number} row - Row number
 * @param {string} message - Warning message
 */
function showWarning(sheet, row, message) {
  const cell = sheet.getRange(row, 1);
  const existingNote = cell.getNote();
  cell.setNote(existingNote ? `${existingNote}\n${message}` : message);
  cell.setBackground('#fff9c4'); // Light yellow
}

/**
 * Formats a time value to HH:MM string
 * Handles Date objects from spreadsheet
 * @param {*} value - Time value
 * @returns {string} Formatted time string
 */
function formatTimeValue(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  return value.toString();
}

/**
 * Sets up the installable onEdit trigger
 * Run this function once to create the trigger
 */
function setupOnEditTrigger() {
  // Remove any existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onEditTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create new trigger
  ScriptApp.newTrigger('onEditTrigger')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  Logger.log('onEditTrigger installed successfully');

  try {
    SpreadsheetApp.getUi().alert(
      'Trigger Installed',
      'The onEdit trigger has been set up. Manual entries in the Appointments sheet will now automatically create calendar events.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    // UI not available
  }
}

/**
 * Removes the onEdit trigger
 */
function removeOnEditTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onEditTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }

  Logger.log(`Removed ${removed} onEditTrigger(s)`);

  try {
    SpreadsheetApp.getUi().alert(
      'Trigger Removed',
      `Removed ${removed} onEdit trigger(s).`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    // UI not available
  }
}
