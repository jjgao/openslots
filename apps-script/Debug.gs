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
