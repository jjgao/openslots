/**
 * Appointment Booking System - Archive Module
 *
 * Functions for archiving old appointments to keep the main sheet performant.
 * Archives are read-only and preserve historical data.
 */

/**
 * Archives appointments older than specified years
 * Moves appointments from Appointments sheet to Archive_Appointments sheet
 * @param {number} yearsOld - Archive appointments older than this many years (default: 2)
 * @returns {Object} Result with counts of archived appointments
 */
function archiveOldAppointments(yearsOld) {
  try {
    var years = yearsOld || 2;

    // Calculate cutoff date
    var cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
    var cutoffDateStr = normalizeDate(cutoffDate);

    Logger.log('Archiving appointments older than ' + years + ' years (before ' + cutoffDateStr + ')');

    // Ensure archive sheet exists
    ensureArchiveSheetExists();

    // Get all appointments
    var appointments = getSheetData(SHEETS.APPOINTMENTS);

    if (appointments.length === 0) {
      return {
        success: true,
        message: 'No appointments to archive',
        archived_count: 0,
        remaining_count: 0
      };
    }

    // Filter appointments to archive
    var toArchive = appointments.filter(function(apt) {
      var aptDate = normalizeDate(apt.appointment_date);
      return aptDate < cutoffDateStr;
    });

    if (toArchive.length === 0) {
      return {
        success: true,
        message: 'No appointments older than ' + years + ' years found',
        archived_count: 0,
        remaining_count: appointments.length
      };
    }

    // Get archive sheet
    var archiveSheet = getSheet('Archive_Appointments');
    var appointmentsSheet = getSheet(SHEETS.APPOINTMENTS);

    // Get headers from Appointments sheet
    var headers = appointmentsSheet.getRange(1, 1, 1, appointmentsSheet.getLastColumn()).getValues()[0];

    // Track row numbers to delete (in reverse order to avoid shifting)
    var rowsToDelete = [];

    // Add archived_date column to each appointment
    var archivedDate = getCurrentTimestamp();

    // Append archived appointments to archive sheet
    for (var i = 0; i < toArchive.length; i++) {
      var apt = toArchive[i];

      // Convert appointment object to row array
      var rowData = [];
      for (var j = 0; j < headers.length; j++) {
        rowData.push(apt[headers[j]]);
      }

      // Add archived date
      rowData.push(archivedDate);

      // Append to archive sheet
      archiveSheet.appendRow(rowData);

      // Find row number in original sheet to delete
      var aptId = apt.appointment_id;
      var dataRange = appointmentsSheet.getDataRange();
      var values = dataRange.getValues();

      for (var row = 1; row < values.length; row++) {
        if (values[row][0] === aptId) {
          rowsToDelete.push(row + 1); // +1 for 1-indexed
          break;
        }
      }
    }

    // Delete rows from Appointments sheet (in reverse order)
    rowsToDelete.sort(function(a, b) { return b - a; });
    for (var i = 0; i < rowsToDelete.length; i++) {
      appointmentsSheet.deleteRow(rowsToDelete[i]);
    }

    Logger.log('Archived ' + toArchive.length + ' appointments');

    return {
      success: true,
      message: 'Successfully archived ' + toArchive.length + ' appointments older than ' + years + ' years',
      archived_count: toArchive.length,
      remaining_count: appointments.length - toArchive.length,
      cutoff_date: cutoffDateStr
    };

  } catch (error) {
    Logger.log('Error archiving appointments: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Ensures the Archive_Appointments sheet exists with proper structure
 */
function ensureArchiveSheetExists() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var archiveSheet = ss.getSheetByName('Archive_Appointments');

  if (!archiveSheet) {
    Logger.log('Creating Archive_Appointments sheet');

    // Get headers from Appointments sheet
    var appointmentsSheet = getSheet(SHEETS.APPOINTMENTS);
    var headers = appointmentsSheet.getRange(1, 1, 1, appointmentsSheet.getLastColumn()).getValues()[0];

    // Add archived_date column
    headers.push('archived_date');

    // Create archive sheet
    archiveSheet = ss.insertSheet('Archive_Appointments');

    // Set headers
    archiveSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    archiveSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    archiveSheet.setFrozenRows(1);

    // Auto-resize columns
    for (var i = 1; i <= headers.length; i++) {
      archiveSheet.autoResizeColumn(i);
    }

    // Move to end
    ss.moveActiveSheet(ss.getNumSheets());

    Logger.log('Archive_Appointments sheet created');
  }
}

/**
 * UI function to prompt user and archive old appointments
 * Called from menu: Appointment System → Admin → Archive Old Appointments
 */
function archiveOldAppointmentsUI() {
  var ui = SpreadsheetApp.getUi();

  // Prompt for years
  var response = ui.prompt(
    'Archive Old Appointments',
    'Archive appointments older than how many years? (default: 2)\n\n' +
    'This will move old appointments to Archive_Appointments sheet.',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var yearsText = response.getResponseText().trim();
  var years = 2;

  if (yearsText) {
    years = parseInt(yearsText);
    if (isNaN(years) || years < 1) {
      ui.alert('Invalid input', 'Please enter a number 1 or greater', ui.ButtonSet.OK);
      return;
    }
  }

  // Confirm action
  var confirmResponse = ui.alert(
    'Confirm Archive',
    'Archive all appointments older than ' + years + ' years?\n\n' +
    'Archived appointments will be moved to Archive_Appointments sheet.\n' +
    'This cannot be easily undone.',
    ui.ButtonSet.YES_NO
  );

  if (confirmResponse !== ui.Button.YES) {
    return;
  }

  // Execute archive
  var result = archiveOldAppointments(years);

  if (result.success) {
    ui.alert(
      'Archive Complete',
      result.message + '\n\n' +
      'Archived: ' + result.archived_count + ' appointments\n' +
      'Remaining: ' + result.remaining_count + ' appointments',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      'Archive Failed',
      'Error: ' + result.error,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Gets count of appointments that would be archived
 * @param {number} yearsOld - Years threshold
 * @returns {number} Count of appointments to archive
 */
function getArchivableAppointmentsCount(yearsOld) {
  try {
    var years = yearsOld || 2;
    var cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
    var cutoffDateStr = normalizeDate(cutoffDate);

    var appointments = getSheetData(SHEETS.APPOINTMENTS);

    var count = 0;
    for (var i = 0; i < appointments.length; i++) {
      var aptDate = normalizeDate(appointments[i].appointment_date);
      if (aptDate < cutoffDateStr) {
        count++;
      }
    }

    return count;
  } catch (error) {
    Logger.log('Error counting archivable appointments: ' + error.toString());
    return 0;
  }
}
