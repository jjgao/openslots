/**
 * Debug functions to help diagnose issues
 */

/**
 * Debug function to check what appointments exist
 */
function debugAppointments() {
  Logger.log('=== DEBUG: Checking Appointments ===');

  // Get appointments using the same function the UI uses
  var appointments = getAppointments();
  Logger.log('Total appointments returned by getAppointments(): ' + appointments.length);

  if (appointments.length > 0) {
    Logger.log('\nFirst appointment:');
    Logger.log(JSON.stringify(appointments[0], null, 2));

    Logger.log('\nAll appointment dates:');
    appointments.forEach(function(apt) {
      Logger.log('  - ' + apt.appointment_id + ': ' + apt.appointment_date + ' ' + apt.start_time + ' (' + apt.status + ')');
    });
  }

  // Test the search function with empty params
  Logger.log('\n=== Testing searchAppointmentsForUI({}) ===');
  var searchResults = searchAppointmentsForUI({});
  Logger.log('Results returned: ' + searchResults.length);

  if (searchResults.length > 0) {
    Logger.log('First result:');
    Logger.log(JSON.stringify(searchResults[0], null, 2));
  } else {
    Logger.log('WARNING: Search returned 0 results even though appointments exist!');
  }

  // Check the Appointments sheet directly
  Logger.log('\n=== Checking Appointments sheet directly ===');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Appointments');
  if (sheet) {
    var lastRow = sheet.getLastRow();
    Logger.log('Last row in sheet: ' + lastRow);

    if (lastRow > 1) {
      var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
      Logger.log('Rows of data in sheet: ' + data.length);

      // Show first row
      Logger.log('First row from sheet:');
      Logger.log(data[0]);
    }
  } else {
    Logger.log('ERROR: Appointments sheet not found!');
  }

  Logger.log('\n=== End Debug ===');

  // Show results in UI
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    'Debug Complete',
    'Found ' + appointments.length + ' appointments.\n' +
    'Search returned ' + searchResults.length + ' results.\n\n' +
    'Check View → Logs (Ctrl/Cmd+Enter) for detailed output.',
    ui.ButtonSet.OK
  );
}

/**
 * Debug: Show appointment details in UI alert
 * This bypasses the browser/HTML and shows results directly
 */
function showAppointmentDetailsInAlert() {
  var ui = SpreadsheetApp.getUi();

  // Prompt for appointment ID
  var response = ui.prompt(
    'Debug Appointment Details',
    'Enter appointment ID (e.g., APT001):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var appointmentId = response.getResponseText().trim();

  // Get appointment details using the same function the UI uses
  var details = getAppointmentDetailsForUI(appointmentId);

  if (!details) {
    ui.alert('Error', 'Appointment not found: ' + appointmentId, ui.ButtonSet.OK);
    return;
  }

  // Build message showing all details
  var msg = 'Appointment: ' + appointmentId + '\n\n';
  msg += 'STATUS: ' + details.appointment.status + '\n';
  msg += 'Client: ' + details.client.name + '\n';
  msg += 'Provider: ' + details.provider.name + '\n';
  msg += 'Service: ' + details.service.name + '\n';
  msg += 'Date: ' + details.appointment.appointment_date + '\n';
  msg += 'Time: ' + details.appointment.start_time + '\n\n';

  msg += '=== PERMISSION FLAGS ===\n';
  msg += 'canCheckIn: ' + details.canCheckIn + '\n';
  msg += 'canComplete: ' + details.canComplete + '\n';
  msg += 'canReschedule: ' + details.canReschedule + '\n';
  msg += 'canMarkNoShow: ' + details.canMarkNoShow + '\n';
  msg += 'canCancel: ' + details.canCancel + '\n\n';

  msg += 'Types:\n';
  msg += 'canCheckIn type: ' + typeof details.canCheckIn + '\n';
  msg += 'canCancel type: ' + typeof details.canCancel;

  ui.alert('Appointment Details', msg, ui.ButtonSet.OK);
}

/**
 * Debug: Check appointment status and button permissions
 * Run this from Apps Script editor to see why buttons aren't showing
 */
function debugAppointmentButtons() {
  var appointments = getAppointments();

  if (appointments.length === 0) {
    Logger.log('No appointments found!');
    return;
  }

  Logger.log('=== APPOINTMENT BUTTON DEBUG ===');
  Logger.log('Checking first 5 appointments:\n');

  for (var i = 0; i < Math.min(5, appointments.length); i++) {
    var apt = appointments[i];
    Logger.log('--- Appointment ' + (i + 1) + ': ' + apt.appointment_id + ' ---');
    Logger.log('Status: "' + apt.status + '" (length: ' + apt.status.length + ')');
    Logger.log('Status type: ' + typeof apt.status);

    // Check what transitions are allowed
    var allowedTransitions = VALID_STATUS_TRANSITIONS[apt.status];
    Logger.log('Allowed transitions: ' + (allowedTransitions ? JSON.stringify(allowedTransitions) : 'NONE - STATUS NOT RECOGNIZED'));

    // Check each button permission
    Logger.log('  canCancel: ' + canTransitionTo(apt.status, 'Cancelled'));
    Logger.log('  canReschedule: ' + canTransitionTo(apt.status, 'Rescheduled'));
    Logger.log('  canCheckIn: ' + canTransitionTo(apt.status, 'Checked-in'));
    Logger.log('  canMarkNoShow: ' + canTransitionTo(apt.status, 'No-show'));
    Logger.log('  canComplete: ' + canTransitionTo(apt.status, 'Completed'));
    Logger.log('');
  }

  Logger.log('=== VALID STATUS VALUES ===');
  Logger.log('Expected statuses: ' + Object.keys(VALID_STATUS_TRANSITIONS).join(', '));

  // Show results in UI
  var ui = SpreadsheetApp.getUi();
  var firstApt = appointments[0];
  var allowedForFirst = VALID_STATUS_TRANSITIONS[firstApt.status];

  ui.alert(
    'Button Debug Complete',
    'First appointment status: "' + firstApt.status + '"\n' +
    'Allowed transitions: ' + (allowedForFirst ? allowedForFirst.join(', ') : 'NONE') + '\n\n' +
    'Expected statuses:\n' + Object.keys(VALID_STATUS_TRANSITIONS).join(', ') + '\n\n' +
    'Check View → Logs for detailed output.',
    ui.ButtonSet.OK
  );
}
