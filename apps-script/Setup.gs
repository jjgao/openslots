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
 * Admin email configuration (DEPRECATED - now stored in System_Config)
 * Admin emails are now managed through: Appointment System → Admin → Manage Admin Users
 * This array is kept for backward compatibility only
 */
var ADMIN_EMAILS = [
  // DEPRECATED: Use "Manage Admin Users" menu instead
  // Emails here will still work but should be migrated to System_Config
];

/**
 * Checks if current user is an admin
 * Reads from System_Config sheet for admin email list
 * @returns {boolean} True if user is admin or owner
 */
function isAdmin() {
  var userEmail = Session.getActiveUser().getEmail();
  var owner = SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail();

  // Owner is always admin
  if (userEmail === owner) {
    return true;
  }

  // Get admin emails from System_Config
  var adminEmailsConfig = getConfig('admin_emails', '');
  var adminList = [];

  if (adminEmailsConfig) {
    adminList = adminEmailsConfig.split(',').map(function(email) {
      return email.trim();
    }).filter(function(email) {
      return email.length > 0;
    });
  }

  // Check config-based admin list
  if (adminList.indexOf(userEmail) !== -1) {
    return true;
  }

  // Check legacy hardcoded list (backward compatibility)
  return ADMIN_EMAILS.indexOf(userEmail) !== -1;
}

/**
 * Creates custom menu when spreadsheet opens
 * Menu items shown based on user role (Admin vs Staff)
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var isAdminUser = isAdmin();

  var menu = ui.createMenu('Appointment System');

  // ========== STAFF FUNCTIONS (Everyone) ==========
  menu.addItem('Book Appointment', 'showBookingSidebar')
      .addItem('Manage Appointments', 'showAppointmentManagementSidebar')
      .addItem('Review Past Appointments', 'reviewPastAppointments')
      .addItem('Manage Clients', 'showClientManagementSidebar');

  // ========== ADMIN FUNCTIONS ==========
  if (isAdminUser) {
    menu.addSeparator()
        .addSubMenu(ui.createMenu('Admin')
          .addItem('Initialize System', 'initializeSystem')
          .addItem('Add Sample Data', 'addSampleData')
          .addItem('Clear All Data', 'clearAllData')
          .addSeparator()
          .addItem('Archive Old Appointments', 'archiveOldAppointmentsUI')
          .addSeparator()
          .addSubMenu(ui.createMenu('Calendar')
            .addItem('Sync Missing Calendar Events', 'syncAllMissingCalendarEvents')
            .addItem('Update Calendar Colors', 'updateAllProviderCalendarColors')
            .addSeparator()
            .addItem('Setup Edit Trigger', 'setupOnEditTrigger')
            .addItem('Remove Edit Trigger', 'removeOnEditTrigger'))
          .addSeparator()
          .addSubMenu(ui.createMenu('Sheet Protection')
            .addItem('Protect Sheets (Basic Warning)', 'protectAllSheets')
            .addItem('Protect Sheets (Advanced)', 'protectSheetsAdvanced')
            .addItem('Remove All Protections', 'unprotectAllSheets')
            .addSeparator()
            .addItem('Check Protection Status', 'checkProtectionStatus'))
          .addSeparator()
          .addItem('Manage Admin Users', 'manageAdminUsers')
          .addItem('Access Control Guide', 'showAccessControlGuide'));

    // ========== DEV/TEST FUNCTIONS ==========
    menu.addSubMenu(ui.createMenu('Dev & Test')
          .addItem('Run All Tests', 'runAllTests')
          .addItem('Run Quick Tests', 'runQuickTests')
          .addItem('Run MVP2 Tests', 'runMvp2Tests')
          .addItem('Run MVP3 Tests', 'runMvp3Tests')
          .addItem('Run MVP4 Tests', 'runMvp4Tests')
          .addSeparator()
          .addItem('Debug Appointments', 'debugAppointments')
          .addItem('Debug Service Lookup', 'remoteDebugServiceLookup')
          .addItem('Show Appointment Details', 'showAppointmentDetailsInAlert')
          .addSeparator()
          .addItem('Cleanup Test Sheets', 'cleanupTestSheets')
          .addItem('Cleanup Calendar Events', 'cleanupTestData'));
  }

  // ========== HELP (Everyone) ==========
  menu.addSeparator()
      .addItem('About', 'showAbout');

  menu.addToUi();
}

/**
 * Shows information about the system
 */
function showAbout() {
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    'Appointment Booking System',
    'Version: MVP 4.0 - Appointment Management\n\n' +
    'This system manages appointments for multiple service providers.\n\n' +
    'Features:\n' +
    '• Easy booking UI with client search\n' +
    '• Appointment management UI with search and filtering\n' +
    '• Check-in, complete, cancel, and no-show tracking\n' +
    '• Automatic calendar event creation\n' +
    '• Availability checking\n' +
    '• Double-booking prevention\n' +
    '• Client history tracking\n' +
    '• Activity logging\n\n' +
    'To set up:\n' +
    '1. Click "Appointment System → Initialize System"\n' +
    '2. Click "Appointment System → Calendar → Setup Edit Trigger"\n' +
    '3. Click "Appointment System → Book Appointment" to start booking\n' +
    '4. Click "Appointment System → Access Control Guide" for security setup\n\n' +
    'For help: https://github.com/jjgao/openslots',
    ui.ButtonSet.OK
  );
}

/**
 * Shows access control guide
 * Explains how to set up view-only access with UI-only permissions
 */
function showAccessControlGuide() {
  var ui = SpreadsheetApp.getUi();

  var message = 'RECOMMENDED: Editor Access + Sheet Protection\n\n' +
    'IMPORTANT: Viewers cannot see custom menus!\n' +
    'Staff need Editor access to see the "Appointment System" menu.\n\n' +
    '=== SETUP STEPS ===\n\n' +
    '1. Share this spreadsheet:\n' +
    '   • Click "Share" button (top-right)\n' +
    '   • Add staff email addresses\n' +
    '   • Set permission to "Editor" (required for menu access)\n' +
    '   • Click "Send"\n\n' +
    '2. Protect the sheets:\n' +
    '   • Go to: Appointment System → Sheet Protection\n' +
    '   • Choose protection level:\n' +
    '     - Basic Warning: Shows warning, staff can override\n' +
    '     - Advanced: Only admins can edit sheets directly\n\n' +
    '3. Staff can now:\n' +
    '   • See the "Appointment System" menu\n' +
    '   • Use Book Appointment, Manage Appointments, etc.\n' +
    '   • Scripts work normally (protection doesn\'t block them)\n\n' +
    '=== PROTECTION LEVELS ===\n\n' +
    '• Basic Warning: Shows "protected cell" warning, can be overridden\n' +
    '  - Good for training/awareness\n' +
    '  - Staff can still edit if needed\n\n' +
    '• Advanced: Hard protection, only specified admins can edit\n' +
    '  - Strongest protection\n' +
    '  - Specify admin emails who can edit\n' +
    '  - Leave blank = only you (owner) can edit\n\n' +
    '=== HOW IT WORKS ===\n\n' +
    '• Staff (Editors): See menus, can use UIs, sheets are protected\n' +
    '• Scripts bypass protection (always work)\n' +
    '• Data integrity maintained\n' +
    '• Validated changes only through UIs';

  ui.alert('Access Control Guide', message, ui.ButtonSet.OK);
}

/**
 * Manages admin users through a simple UI
 * Allows owner to add/remove admin email addresses
 */
function manageAdminUsers() {
  var ui = SpreadsheetApp.getUi();
  var owner = SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail();
  var currentUser = Session.getActiveUser().getEmail();

  // Only owner can manage admin users
  if (currentUser !== owner) {
    ui.alert(
      'Permission Denied',
      'Only the spreadsheet owner can manage admin users.\n\n' +
      'Owner: ' + owner,
      ui.ButtonSet.OK
    );
    return;
  }

  // Get current admin emails
  var adminEmailsConfig = getConfig('admin_emails', '');
  var adminList = [];

  if (adminEmailsConfig) {
    adminList = adminEmailsConfig.split(',').map(function(email) {
      return email.trim();
    }).filter(function(email) {
      return email.length > 0;
    });
  }

  var currentAdmins = adminList.length > 0
    ? adminList.join('\n')
    : '(No additional admins - only you have admin access)';

  var message = 'Current Admin Users:\n\n' +
    currentAdmins + '\n\n' +
    'Note: You (owner) always have admin access.\n\n' +
    'Click YES to add an admin\n' +
    'Click NO to remove an admin\n' +
    'Click CANCEL to exit';

  var response = ui.alert(
    'Manage Admin Users',
    message,
    ui.ButtonSet.YES_NO_CANCEL
  );

  if (response === ui.Button.YES) {
    // Add admin
    addAdminUser(adminList);
  } else if (response === ui.Button.NO) {
    // Remove admin
    removeAdminUser(adminList);
  }
  // CANCEL = do nothing
}

/**
 * Helper function to add an admin user
 * @param {Array<string>} currentAdminList - Current list of admin emails
 */
function addAdminUser(currentAdminList) {
  var ui = SpreadsheetApp.getUi();

  var response = ui.prompt(
    'Add Admin User',
    'Enter the email address of the user to grant admin access:\n\n' +
    '(This user will see Admin and Dev & Test menus)',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var newEmail = response.getResponseText().trim().toLowerCase();

  if (!newEmail) {
    ui.alert('Error', 'Email address cannot be empty.', ui.ButtonSet.OK);
    return;
  }

  // Basic email validation
  if (newEmail.indexOf('@') === -1 || newEmail.indexOf('.') === -1) {
    ui.alert('Error', 'Please enter a valid email address.', ui.ButtonSet.OK);
    return;
  }

  // Check if already admin
  if (currentAdminList.indexOf(newEmail) !== -1) {
    ui.alert('Already Admin', newEmail + ' is already an admin user.', ui.ButtonSet.OK);
    return;
  }

  // Add to list
  currentAdminList.push(newEmail);

  // Save to config
  var adminEmailsString = currentAdminList.join(',');
  if (setConfig('admin_emails', adminEmailsString)) {
    ui.alert(
      'Admin Added',
      'Successfully added admin user:\n\n' + newEmail + '\n\n' +
      'They will see Admin and Dev & Test menus when they open the spreadsheet.',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      'Error',
      'Failed to save admin user. Please check that System_Config sheet exists.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Helper function to remove an admin user
 * @param {Array<string>} currentAdminList - Current list of admin emails
 */
function removeAdminUser(currentAdminList) {
  var ui = SpreadsheetApp.getUi();

  if (currentAdminList.length === 0) {
    ui.alert(
      'No Admins',
      'There are no additional admin users to remove.\n\n' +
      'Only you (the owner) have admin access.',
      ui.ButtonSet.OK
    );
    return;
  }

  var response = ui.prompt(
    'Remove Admin User',
    'Current admin users:\n' + currentAdminList.join('\n') + '\n\n' +
    'Enter the email address to remove admin access:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var emailToRemove = response.getResponseText().trim().toLowerCase();

  if (!emailToRemove) {
    ui.alert('Error', 'Email address cannot be empty.', ui.ButtonSet.OK);
    return;
  }

  // Find and remove
  var index = currentAdminList.indexOf(emailToRemove);

  if (index === -1) {
    ui.alert(
      'Not Found',
      emailToRemove + ' is not in the admin list.\n\n' +
      'Current admins:\n' + currentAdminList.join('\n'),
      ui.ButtonSet.OK
    );
    return;
  }

  currentAdminList.splice(index, 1);

  // Save to config
  var adminEmailsString = currentAdminList.join(',');
  if (setConfig('admin_emails', adminEmailsString)) {
    ui.alert(
      'Admin Removed',
      'Successfully removed admin access for:\n\n' + emailToRemove + '\n\n' +
      'They will no longer see Admin and Dev & Test menus.',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      'Error',
      'Failed to save changes. Please check that System_Config sheet exists.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Main initialization function
 * Creates all sheets and configures the system
 */
function initializeSystem() {
  var ui = SpreadsheetApp.getUi();

  // Confirm with user
  var response = ui.alert(
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Providers';

  // Delete existing sheet if present
  deleteSheetIfExists(sheetName);

  // Create new sheet
  var sheet = ss.insertSheet(sheetName);

  // Add headers
  var headers = ['provider_id', 'name', 'email', 'phone', 'services_offered', 'active_status', 'calendar_id'];
  sheet.appendRow(headers);

  // Format header row
  formatHeaderRow(sheet, headers.length);

  // IDs are auto-generated in code when adding rows

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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Services';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = ['service_id', 'name', 'default_duration_options', 'description'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  // IDs are auto-generated in code when adding rows

  // Note: default_duration_options uses pipe (|) delimiter for multiple options
  // Example: "30|60" for 30 or 60 minute options

  sheet.setColumnWidth(1, 100);  // service_id
  sheet.setColumnWidth(2, 180);  // name
  sheet.setColumnWidth(3, 200);  // default_duration_options (pipe-delimited: "30|60")
  sheet.setColumnWidth(4, 300);  // description

  Logger.log('Services sheet created');
}

/**
 * Creates the Clients sheet
 */
function createClientsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Clients';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = ['client_id', 'name', 'phone', 'email', 'notes', 'first_visit_date', 'last_visit_date'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  // IDs are auto-generated in code when adding rows

  // Add data validation
  addPhoneValidation(sheet, 'C2:C1000', false);  // phone (required)
  addEmailValidation(sheet, 'D2:D1000', true);   // email (optional)
  addDateValidation(sheet, 'F2:F1000', true);    // first_visit_date
  addDateValidation(sheet, 'G2:G1000', true);    // last_visit_date

  sheet.setColumnWidth(1, 100);  // client_id
  sheet.setColumnWidth(2, 150);  // name
  sheet.setColumnWidth(3, 120);  // phone
  sheet.setColumnWidth(4, 200);  // email
  sheet.setColumnWidth(5, 250);  // notes
  sheet.setColumnWidth(6, 130);  // first_visit_date
  sheet.setColumnWidth(7, 130);  // last_visit_date

  Logger.log('Clients sheet created');
}

/**
 * Creates the Appointments sheet
 */
function createAppointmentsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Appointments';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = [
    'appointment_id', 'client_id', 'provider_id', 'service_id',
    'appointment_date', 'start_time', 'end_time', 'duration',
    'status', 'created_date', 'notes', 'calendar_event_id'
  ];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  // IDs are auto-generated in code when adding rows

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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Provider_Availability';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = [
    'availability_id', 'provider_id', 'day_of_week', 'start_time', 'end_time',
    'effective_date_start', 'effective_date_end', 'is_recurring'
  ];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  // IDs are auto-generated in code when adding rows

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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Provider_Exceptions';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = ['exception_id', 'provider_id', 'exception_date', 'start_time', 'end_time', 'reason'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  // IDs are auto-generated in code when adding rows

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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Activity_Log';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = [
    'log_id', 'timestamp', 'action_type', 'appointment_id', 'client_id',
    'provider_id', 'user', 'previous_value', 'new_value', 'notes'
  ];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  // IDs are auto-generated in code when adding rows

  // Add data validation
  addDropdownValidation(sheet, 'C2:C1000',
    ['book', 'cancel', 'reschedule', 'check-in', 'no-show', 'complete', 'late', 'confirmation-call', 'confirmation-text', 'confirmation-email', 'calendar-create', 'calendar-update', 'calendar-delete', 'client-create', 'client-update'],
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Confirmation_Tracking';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = ['confirmation_id', 'appointment_id', 'confirmation_date', 'method', 'status', 'notes'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  // IDs are auto-generated in code when adding rows

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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'System_Config';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = ['setting_name', 'setting_value'];
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
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
  var headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * IDs are now generated directly in code (see DataAccess.gs addRow function)
 * No formulas needed - safer and simpler!
 */

/**
 * Creates the Business_Holidays sheet
 */
function createBusinessHolidaysSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Business_Holidays';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = ['holiday_id', 'date', 'name', 'recurring', 'notes'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);

  // Set column widths
  sheet.setColumnWidth(1, 100);  // holiday_id
  sheet.setColumnWidth(2, 120);  // date
  sheet.setColumnWidth(3, 200);  // name
  sheet.setColumnWidth(4, 100);  // recurring
  sheet.setColumnWidth(5, 300);  // notes

  // Add auto-increment formula for holiday_id
  // IDs are auto-generated in code when adding rows

  // Add data validation
  addDateValidation(sheet, 'B2:B1000', false);  // Date required
  addDropdownValidation(sheet, 'D2:D1000', ['Yes', 'No'], 'Is this an annual holiday?');

  Logger.log('Business_Holidays sheet created');
}

/**
 * Creates the Business_Exceptions sheet
 */
function createBusinessExceptionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Business_Exceptions';

  deleteSheetIfExists(sheetName);
  var sheet = ss.insertSheet(sheetName);

  var headers = ['exception_id', 'date', 'start_time', 'end_time', 'reason', 'notes'];
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
  // IDs are auto-generated in code when adding rows

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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Sheet1');

  // Only delete if it exists and has no data (just 1 row)
  if (sheet && sheet.getLastRow() <= 1 && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet);
    Logger.log('Deleted default Sheet1');
  }
}

/**
 * Protects all data sheets from editing
 * Users with Editor access can see menus but cannot edit sheets directly
 * Scripts can still modify protected sheets
 */
function protectAllSheets() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    'Protect All Sheets',
    'This will protect all data sheets with a warning.\n\n' +
    'Staff with Editor access will:\n' +
    '• See "You are trying to edit a protected cell..." warning\n' +
    '• Be able to click "OK" and edit anyway (soft protection)\n\n' +
    'For stronger protection, use "Protect Sheets (Advanced)" instead.\n\n' +
    'Continue with basic protection?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToProtect = [
    'Appointments',
    'Clients',
    'Providers',
    'Services',
    'Provider_Availability',
    'Provider_Exceptions',
    'Business_Holidays',
    'Business_Exceptions',
    'Activity_Log',
    'Confirmation_Tracking',
    'System_Config'
  ];

  var protected = 0;
  var skipped = 0;

  sheetsToProtect.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      skipped++;
      return;
    }

    // Remove existing protections first
    var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    protections.forEach(function(p) { p.remove(); });

    // Add new protection with warning
    var protection = sheet.protect().setDescription('Protected data sheet - use UIs to make changes');
    protection.setWarningOnly(true);
    protected++;
    Logger.log('Protected sheet: ' + sheetName);
  });

  ui.alert(
    'Protection Complete',
    'Protected ' + protected + ' sheet(s).\n' +
    (skipped > 0 ? 'Skipped ' + skipped + ' missing sheet(s).\n\n' : '\n') +
    'Staff will see warnings when trying to edit sheets directly.',
    ui.ButtonSet.OK
  );
}

/**
 * Protects all data sheets with specific editors only (advanced protection)
 * Only specified users can edit sheets directly
 */
function protectSheetsAdvanced() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.prompt(
    'Protect Sheets (Advanced)',
    'This will protect sheets so ONLY specified users can edit.\n\n' +
    'Enter admin email addresses (comma-separated):\n' +
    'Example: admin@example.com, manager@example.com\n\n' +
    'Leave blank to allow only yourself (the owner).',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var adminEmails = response.getResponseText().trim();
  var adminList = [];

  if (adminEmails) {
    adminList = adminEmails.split(',').map(function(email) {
      return email.trim();
    }).filter(function(email) {
      return email.length > 0;
    });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToProtect = [
    'Appointments',
    'Clients',
    'Providers',
    'Services',
    'Provider_Availability',
    'Provider_Exceptions',
    'Business_Holidays',
    'Business_Exceptions',
    'Activity_Log',
    'Confirmation_Tracking',
    'System_Config'
  ];

  var protected = 0;
  var skipped = 0;

  sheetsToProtect.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      skipped++;
      return;
    }

    // Remove existing protections first
    var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    protections.forEach(function(p) { p.remove(); });

    // Add new protection with specific editors
    var protection = sheet.protect().setDescription('Protected data sheet - use UIs to make changes');
    protection.setWarningOnly(false);

    // CRITICAL: Remove all editors first (Google Sheets adds them by default)
    var currentEditors = protection.getEditors();
    if (currentEditors.length > 0) {
      protection.removeEditors(currentEditors);
    }

    // Add only specified admin editors (if any)
    if (adminList.length > 0) {
      protection.addEditors(adminList);
    }

    // Always disable domain editing to prevent all editors from editing
    protection.setDomainEdit(false);

    protected++;
    Logger.log('Protected sheet (advanced): ' + sheetName);
  });

  var adminMessage = adminList.length > 0
    ? 'Only you and ' + adminList.length + ' admin(s) can edit.\n'
    : 'Only you (the owner) can edit.\n';

  ui.alert(
    'Advanced Protection Complete',
    'Protected ' + protected + ' sheet(s).\n' +
    (skipped > 0 ? 'Skipped ' + skipped + ' missing sheet(s).\n\n' : '\n') +
    adminMessage + '\n' +
    'Other staff CANNOT edit sheets directly, even with Editor access.\n' +
    'Scripts will continue to work normally.',
    ui.ButtonSet.OK
  );
}

/**
 * Shows current protection status for all sheets
 */
function checkProtectionStatus() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();

  var statusReport = 'PROTECTION STATUS:\n\n';

  sheets.forEach(function(sheet) {
    var sheetName = sheet.getName();
    var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);

    if (protections.length === 0) {
      statusReport += sheetName + ': NO PROTECTION\n';
    } else {
      protections.forEach(function(p) {
        var warningOnly = p.isWarningOnly();
        var editors = p.getEditors().map(function(user) { return user.getEmail(); });
        var canDomainEdit = p.canDomainEdit();

        statusReport += sheetName + ':\n';
        statusReport += '  Type: ' + (warningOnly ? 'WARNING ONLY' : 'PROTECTED') + '\n';
        statusReport += '  Domain Edit: ' + (canDomainEdit ? 'YES' : 'NO') + '\n';
        statusReport += '  Editors: ' + (editors.length > 0 ? editors.join(', ') : 'NONE') + '\n';
      });
    }
    statusReport += '\n';
  });

  Logger.log(statusReport);
  ui.alert('Protection Status', statusReport, ui.ButtonSet.OK);
}

/**
 * Removes all sheet protections
 */
function unprotectAllSheets() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    'Remove All Protections',
    'This will remove protection from all sheets.\n\n' +
    'All users with Editor access will be able to edit directly.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var unprotected = 0;

  sheets.forEach(function(sheet) {
    var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    protections.forEach(function(p) {
      p.remove();
      unprotected++;
    });
  });

  ui.alert(
    'Unprotection Complete',
    'Removed ' + unprotected + ' protection(s).\n\n' +
    'All sheets are now fully editable by anyone with Editor access.',
    ui.ButtonSet.OK
  );
}
