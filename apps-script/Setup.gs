/**
 * Appointment Booking System - Setup Script
 *
 * This script automatically creates and configures all Google Sheets
 * for the appointment booking system.
 *
 * Usage:
 * 1. Create a blank Google Sheet
 * 2. Extensions -> Apps Script
 * 3. Copy this file content
 * 4. Run initializeSystem()
 */

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Appointment System')
    .addItem('Initialize System', 'initializeSystem')
    .addItem('Add Sample Data', 'addSampleData')
    .addSeparator()
    .addSubMenu(ui.createMenu('Calendar')
      .addItem('Sync Missing Calendar Events', 'syncAllMissingCalendarEvents')
      .addItem('Setup Edit Trigger', 'setupOnEditTrigger')
      .addItem('Remove Edit Trigger', 'removeOnEditTrigger'))
    .addSeparator()
    .addItem('Clear All Data', 'clearAllData')
    .addSeparator()
    .addSubMenu(ui.createMenu('Tests')
      .addItem('Run All Tests', 'runAllTests')
      .addItem('Run Quick Tests', 'runQuickTests')
      .addItem('Run MVP2 Tests', 'runMvp2Tests')
      .addSeparator()
      .addItem('Cleanup Test Sheets', 'cleanupTestSheets')
      .addItem('Cleanup Calendar Events', 'cleanupTestData'))
    .addSeparator()
    .addItem('About', 'showAbout')
    .addToUi();
}

/**
 * Shows information about the system
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Appointment Booking System',
    'Version: MVP 2.0 - Calendar Integration\n\n' +
    'This system manages appointments for multiple service providers.\n\n' +
    'Features:\n' +
    '• Automatic calendar event creation\n' +
    '• Availability checking\n' +
    '• Double-booking prevention\n' +
    '• Activity logging\n\n' +
    'To set up:\n' +
    '1. Click "Appointment System → Initialize System"\n' +
    '2. Click "Appointment System → Calendar → Setup Edit Trigger"\n' +
    '3. All sheets will be created automatically\n\n' +
    'For help: https://github.com/jjgao/openslots',
    ui.ButtonSet.OK
  );
}

/**
 * Main initialization function
 * Creates all sheets and configures the system
 */
function initializeSystem() {
  const ui = SpreadsheetApp.getUi();

  // Confirm with user
  const response = ui.alert(
    'Initialize System',
    'This will create all system sheets. Any existing sheets with the same names will be deleted.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    Logger.log('System initialization cancelled by user');
    return;
  }

  Logger.log('Starting system initialization...');

  try {
    // Create all sheets in order
    createProvidersSheet();
    createServicesSheet();
    createClientsSheet();
    createAppointmentsSheet();
    createProviderAvailabilitySheet();
    createProviderExceptionsSheet();
    createActivityLogSheet();
    createConfirmationTrackingSheet();
    createSystemConfigSheet();
    createBusinessHolidaysSheet();
    createBusinessExceptionsSheet();

    // Delete the default Sheet1 if it exists and is empty
    deleteDefaultSheet();

    Logger.log('System initialization complete!');
    ui.alert(
      'Success!',
      'All sheets have been created and configured.\n\n' +
      '11 sheets created:\n' +
      '• Providers\n' +
      '• Services\n' +
      '• Clients\n' +
      '• Appointments\n' +
      '• Provider_Availability\n' +
      '• Provider_Exceptions\n' +
      '• Activity_Log\n' +
      '• Confirmation_Tracking\n' +
      '• System_Config\n' +
      '• Business_Holidays\n' +
      '• Business_Exceptions\n\n' +
      'You can now start using the system!',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('Error during initialization: ' + error.toString());
    ui.alert(
      'Error',
      'An error occurred during setup:\n\n' + error.toString(),
      ui.ButtonSet.OK
    );
  }
}

/**
 * Creates the Providers sheet
 */
function createProvidersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Providers';

  // Delete existing sheet if present
  deleteSheetIfExists(sheetName);

  // Create new sheet
  const sheet = ss.insertSheet(sheetName);

  // Add headers
  const headers = ['provider_id', 'name', 'email', 'phone', 'services_offered', 'active_status', 'calendar_id'];
  sheet.appendRow(headers);

  // Format header row
  formatHeaderRow(sheet, headers.length);

  // Add auto-increment formula for provider_id
  addAutoIncrementFormula(sheet, 'PROV', 'B');

  // Add data validation
  addEmailValidation(sheet, 'C2:C1000', true);  // email (allow blank)
  addPhoneValidation(sheet, 'D2:D1000', true);  // phone (allow blank)
  addDropdownValidation(sheet, 'F2:F1000', ['Active', 'Inactive'], 'Select provider status');  // active_status

  // Set column widths
  sheet.setColumnWidth(1, 100);  // provider_id
  sheet.setColumnWidth(2, 150);  // name
  sheet.setColumnWidth(3, 200);  // email
  sheet.setColumnWidth(4, 120);  // phone
  sheet.setColumnWidth(5, 180);  // services_offered
  sheet.setColumnWidth(6, 120);  // active_status
  sheet.setColumnWidth(7, 250);  // calendar_id (auto-populated)

  Logger.log('Providers sheet created');
}

/**
 * Creates the Services sheet
 */
function createServicesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Services';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = ['service_id', 'service_name', 'default_duration_options', 'description'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  addAutoIncrementFormula(sheet, 'SERV', 'B');

  sheet.setColumnWidth(1, 100);  // service_id
  sheet.setColumnWidth(2, 180);  // service_name
  sheet.setColumnWidth(3, 200);  // default_duration_options
  sheet.setColumnWidth(4, 300);  // description

  Logger.log('Services sheet created');
}

/**
 * Creates the Clients sheet
 */
function createClientsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Clients';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = ['client_id', 'name', 'phone', 'email', 'is_member', 'notes', 'first_visit_date', 'last_visit_date'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  addAutoIncrementFormula(sheet, 'CLI', 'B');

  // Add data validation
  addPhoneValidation(sheet, 'C2:C1000', false);  // phone (required)
  addEmailValidation(sheet, 'D2:D1000', true);   // email (optional)
  addDropdownValidation(sheet, 'E2:E1000', ['Yes', 'No'], 'Is this client a member?');  // is_member
  addDateValidation(sheet, 'G2:G1000', true);    // first_visit_date
  addDateValidation(sheet, 'H2:H1000', true);    // last_visit_date

  sheet.setColumnWidth(1, 100);  // client_id
  sheet.setColumnWidth(2, 150);  // name
  sheet.setColumnWidth(3, 120);  // phone
  sheet.setColumnWidth(4, 200);  // email
  sheet.setColumnWidth(5, 100);  // is_member
  sheet.setColumnWidth(6, 250);  // notes
  sheet.setColumnWidth(7, 130);  // first_visit_date
  sheet.setColumnWidth(8, 130);  // last_visit_date

  Logger.log('Clients sheet created');
}

/**
 * Creates the Appointments sheet
 */
function createAppointmentsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Appointments';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = [
    'appointment_id', 'client_id', 'provider_id', 'service_id',
    'appointment_date', 'start_time', 'end_time', 'duration',
    'status', 'created_date', 'notes', 'calendar_event_id'
  ];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  addAutoIncrementFormula(sheet, 'APT', 'B');

  // Add data validation
  addDateValidation(sheet, 'E2:E1000', false);  // appointment_date (required)
  addTimeValidation(sheet, 'F2:F1000');         // start_time
  addTimeValidation(sheet, 'G2:G1000');         // end_time
  addNumberValidation(sheet, 'H2:H1000', 1, 480);  // duration (1-480 minutes / 8 hours max)
  addDropdownValidation(sheet, 'I2:I1000',
    ['Booked', 'Confirmed', 'Checked-in', 'Completed', 'No-show', 'Cancelled', 'Rescheduled'],
    'Select appointment status');  // status
  addDateValidation(sheet, 'J2:J1000', true);   // created_date

  sheet.setColumnWidth(1, 120);  // appointment_id
  sheet.setColumnWidth(2, 100);  // client_id
  sheet.setColumnWidth(3, 100);  // provider_id
  sheet.setColumnWidth(4, 100);  // service_id
  sheet.setColumnWidth(5, 130);  // appointment_date
  sheet.setColumnWidth(6, 100);  // start_time
  sheet.setColumnWidth(7, 100);  // end_time
  sheet.setColumnWidth(8, 80);   // duration
  sheet.setColumnWidth(9, 120);  // status
  sheet.setColumnWidth(10, 130); // created_date
  sheet.setColumnWidth(11, 250); // notes
  sheet.setColumnWidth(12, 150); // calendar_event_id

  Logger.log('Appointments sheet created');
}

/**
 * Creates the Provider_Availability sheet
 */
function createProviderAvailabilitySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Provider_Availability';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = [
    'availability_id', 'provider_id', 'day_of_week', 'start_time', 'end_time',
    'effective_date_start', 'effective_date_end', 'is_recurring'
  ];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  addAutoIncrementFormula(sheet, 'AVL', 'B');

  // Add data validation
  addDropdownValidation(sheet, 'C2:C1000',
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    'Select day of week');  // day_of_week
  addTimeValidation(sheet, 'D2:D1000');  // start_time
  addTimeValidation(sheet, 'E2:E1000');  // end_time
  addDateValidation(sheet, 'F2:F1000', true);  // effective_date_start
  addDateValidation(sheet, 'G2:G1000', true);  // effective_date_end
  addDropdownValidation(sheet, 'H2:H1000', ['Yes', 'No'], 'Is this a recurring schedule?');  // is_recurring

  sheet.setColumnWidth(1, 120);  // availability_id
  sheet.setColumnWidth(2, 100);  // provider_id
  sheet.setColumnWidth(3, 120);  // day_of_week
  sheet.setColumnWidth(4, 100);  // start_time
  sheet.setColumnWidth(5, 100);  // end_time
  sheet.setColumnWidth(6, 150);  // effective_date_start
  sheet.setColumnWidth(7, 150);  // effective_date_end
  sheet.setColumnWidth(8, 100);  // is_recurring

  Logger.log('Provider_Availability sheet created');
}

/**
 * Creates the Provider_Exceptions sheet
 */
function createProviderExceptionsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Provider_Exceptions';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = ['exception_id', 'provider_id', 'exception_date', 'start_time', 'end_time', 'reason'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  addAutoIncrementFormula(sheet, 'EXC', 'B');

  // Add data validation
  addDateValidation(sheet, 'C2:C1000', false);  // exception_date (required)
  addTimeValidation(sheet, 'D2:D1000');  // start_time
  addTimeValidation(sheet, 'E2:E1000');  // end_time

  sheet.setColumnWidth(1, 120);  // exception_id
  sheet.setColumnWidth(2, 100);  // provider_id
  sheet.setColumnWidth(3, 130);  // exception_date
  sheet.setColumnWidth(4, 100);  // start_time
  sheet.setColumnWidth(5, 100);  // end_time
  sheet.setColumnWidth(6, 300);  // reason

  Logger.log('Provider_Exceptions sheet created');
}

/**
 * Creates the Activity_Log sheet
 */
function createActivityLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Activity_Log';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = [
    'log_id', 'timestamp', 'action_type', 'appointment_id', 'client_id',
    'provider_id', 'user', 'previous_value', 'new_value', 'notes'
  ];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  addAutoIncrementFormula(sheet, 'LOG', 'C');  // Trigger on action_type (C) instead of timestamp

  // Add data validation
  addDropdownValidation(sheet, 'C2:C1000',
    ['book', 'cancel', 'reschedule', 'check-in', 'no-show', 'late', 'confirmation-call', 'confirmation-text', 'confirmation-email'],
    'Select action type');  // action_type

  sheet.setColumnWidth(1, 100);  // log_id
  sheet.setColumnWidth(2, 150);  // timestamp
  sheet.setColumnWidth(3, 150);  // action_type
  sheet.setColumnWidth(4, 120);  // appointment_id
  sheet.setColumnWidth(5, 100);  // client_id
  sheet.setColumnWidth(6, 100);  // provider_id
  sheet.setColumnWidth(7, 150);  // user
  sheet.setColumnWidth(8, 200);  // previous_value
  sheet.setColumnWidth(9, 200);  // new_value
  sheet.setColumnWidth(10, 250); // notes

  Logger.log('Activity_Log sheet created');
}

/**
 * Creates the Confirmation_Tracking sheet
 */
function createConfirmationTrackingSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Confirmation_Tracking';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = ['confirmation_id', 'appointment_id', 'confirmation_date', 'method', 'status', 'notes'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  addAutoIncrementFormula(sheet, 'CNF', 'B');

  // Add data validation
  addDateValidation(sheet, 'C2:C1000', true);  // confirmation_date
  addDropdownValidation(sheet, 'D2:D1000', ['Call', 'Text', 'Email'], 'Select contact method');  // method
  addDropdownValidation(sheet, 'E2:E1000', ['Confirmed', 'Declined', 'Rescheduled', 'No-response'], 'Select confirmation status');  // status

  sheet.setColumnWidth(1, 130);  // confirmation_id
  sheet.setColumnWidth(2, 120);  // appointment_id
  sheet.setColumnWidth(3, 150);  // confirmation_date
  sheet.setColumnWidth(4, 100);  // method
  sheet.setColumnWidth(5, 120);  // status
  sheet.setColumnWidth(6, 300);  // notes

  Logger.log('Confirmation_Tracking sheet created');
}

/**
 * Creates the System_Config sheet
 */
function createSystemConfigSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'System_Config';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = ['setting_name', 'setting_value'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);

  sheet.setColumnWidth(1, 250);  // setting_name
  sheet.setColumnWidth(2, 300);  // setting_value

  Logger.log('System_Config sheet created');
}

/**
 * Helper function: Deletes a sheet if it exists
 * @param {string} sheetName - Name of the sheet to delete
 */
function deleteSheetIfExists(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    ss.deleteSheet(sheet);
    Logger.log('Deleted existing sheet: ' + sheetName);
  }
}

/**
 * Helper function: Formats the header row
 * @param {Sheet} sheet - The sheet to format
 * @param {number} numColumns - Number of columns in header
 */
function formatHeaderRow(sheet, numColumns) {
  const headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * Helper function: Adds auto-increment formula to column A
 * @param {Sheet} sheet - The sheet to add formula to
 * @param {string} prefix - ID prefix (e.g., 'PROV', 'CLI', 'APT')
 * @param {string} triggerColumn - Column that triggers ID generation (e.g., 'B')
 */
function addAutoIncrementFormula(sheet, prefix, triggerColumn) {
  const formula = `=IF(${triggerColumn}2<>"", "${prefix}"&TEXT(ROW()-1,"000"), "")`;
  sheet.getRange('A2').setFormula(formula);

  // Copy formula down to row 100 for easier manual entry
  sheet.getRange('A2:A100').setFormula(formula);
}

/**
 * Creates the Business_Holidays sheet
 */
function createBusinessHolidaysSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Business_Holidays';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = ['holiday_id', 'date', 'name', 'recurring', 'notes'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);

  // Set column widths
  sheet.setColumnWidth(1, 100);  // holiday_id
  sheet.setColumnWidth(2, 120);  // date
  sheet.setColumnWidth(3, 200);  // name
  sheet.setColumnWidth(4, 100);  // recurring
  sheet.setColumnWidth(5, 300);  // notes

  // Add auto-increment formula for holiday_id
  addAutoIncrementFormula(sheet, 'HOL', 'B');

  // Add data validation
  addDateValidation(sheet, 'B2:B1000', false);  // Date required
  addDropdownValidation(sheet, 'D2:D1000', ['Yes', 'No'], 'Is this an annual holiday?');

  Logger.log('Business_Holidays sheet created');
}

/**
 * Creates the Business_Exceptions sheet
 */
function createBusinessExceptionsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Business_Exceptions';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = ['exception_id', 'date', 'start_time', 'end_time', 'reason', 'notes'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);

  // Set column widths
  sheet.setColumnWidth(1, 100);  // exception_id
  sheet.setColumnWidth(2, 120);  // date
  sheet.setColumnWidth(3, 100);  // start_time
  sheet.setColumnWidth(4, 100);  // end_time
  sheet.setColumnWidth(5, 200);  // reason
  sheet.setColumnWidth(6, 300);  // notes

  // Add auto-increment formula for exception_id
  addAutoIncrementFormula(sheet, 'EXC', 'B');

  // Add data validation
  addDateValidation(sheet, 'B2:B1000', false);  // Date required
  addTimeValidation(sheet, 'C2:C1000');  // Start time
  addTimeValidation(sheet, 'D2:D1000');  // End time

  Logger.log('Business_Exceptions sheet created');
}

/**
 * Helper function: Deletes the default Sheet1 if it exists and is empty
 */
function deleteDefaultSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Sheet1');

  // Only delete if it exists and has no data (just 1 row)
  if (sheet && sheet.getLastRow() <= 1 && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet);
    Logger.log('Deleted default Sheet1');
  }
}
