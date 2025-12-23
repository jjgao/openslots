/**
 * Appointment Booking System - Sample Data Generator
 *
 * Generates realistic test data for all sheets
 */

/**
 * Main function to add sample data to all sheets
 * Call this after running initializeSystem()
 */
function addSampleData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Add Sample Data?',
    'This will add test data to all sheets. Any existing data will remain.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    Logger.log('Sample data cancelled by user');
    return;
  }

  Logger.log('Adding sample data...');

  try {
    addSampleProviders();
    addSampleServices();
    addSampleClients();
    addSampleProviderAvailability();
    addSampleProviderExceptions();
    addSampleAppointments();
    addSampleActivityLog();
    addSampleConfirmationTracking();
    addSampleSystemConfig();
    addSampleBusinessHolidays();
    addSampleBusinessExceptions();

    Logger.log('Sample data added successfully');
    ui.alert(
      'Success!',
      'Sample data has been added to all sheets.\n\n' +
      'Added:\n' +
      '• 5 providers\n' +
      '• 7 services\n' +
      '• 10 clients\n' +
      '• Provider schedules\n' +
      '• 3 provider exceptions\n' +
      '• 15 appointments (past and future)\n' +
      '• Sample activity logs\n' +
      '• Sample confirmations\n' +
      '• 6 business holidays\n' +
      '• 4 business exceptions\n\n' +
      'You can now test the system!',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('Error adding sample data: ' + error.toString());
    ui.alert(
      'Error',
      'An error occurred while adding sample data:\n\n' + error.toString(),
      ui.ButtonSet.OK
    );
  }
}

/**
 * Adds sample providers
 */
function addSampleProviders() {
  var sampleData = [
    ['Dr. Sarah Johnson', 'sarah.johnson@example.com', '555-0101', 'SERV001,SERV002', 'Active'],
    ['Dr. Michael Chen', 'michael.chen@example.com', '555-0102', 'SERV001,SERV003,SERV004', 'Active'],
    ['Emma Williams', 'emma.williams@example.com', '555-0103', 'SERV002,SERV004,SERV005', 'Active'],
    ['James Brown', 'james.brown@example.com', '555-0104', 'SERV003,SERV005,SERV006', 'Active'],
    ['Lisa Martinez', 'lisa.martinez@example.com', '555-0105', 'SERV001,SERV007', 'Inactive']
  ];

  // Use addRow() to generate IDs automatically
  for (var i = 0; i < sampleData.length; i++) {
    addRow('Providers', sampleData[i]);
  }

  Logger.log('Sample providers added: ' + sampleData.length);
}

/**
 * Adds sample services
 */
function addSampleServices() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Services');
  var sampleData = [
    ['Initial Consultation', '30|60', 'First-time client consultation'],
    ['Follow-up Appointment', '30', 'Follow-up visit for existing clients'],
    ['Standard Treatment', '60', 'Regular treatment session'],
    ['Extended Treatment', '90|120', 'Extended treatment session for complex cases'],
    ['Group Session', '60|90', 'Group session (multiple clients)'],
    ['Emergency Visit', '30|60', 'Urgent/emergency appointment'],
    ['Annual Review', '60', 'Annual checkup and assessment']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    addRow('Services', sampleData[i]);
  }

  Logger.log('Sample services added: ' + sampleData.length);
}

/**
 * Adds sample clients
 */
function addSampleClients() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients');
  // Headers: client_id, name, phone, email, notes, first_visit_date, last_visit_date
  var sampleData = [
    ['John Doe', '555-1001', 'john.doe@email.com', 'Prefers morning appointments', '', ''],
    ['Jane Smith', '555-1002', 'jane.smith@email.com', 'Allergic to latex', '', ''],
    ['Bob Wilson', '555-1003', '', 'No email provided', '', ''],
    ['Alice Cooper', '555-1004', 'alice.cooper@email.com', 'VIP client', '', ''],
    ['Charlie Brown', '555-1005', 'charlie.b@email.com', 'Reminder calls preferred', '', ''],
    ['Diana Prince', '555-1006', 'diana.prince@email.com', '', '', ''],
    ['Frank Castle', '555-1007', '', 'Prefers afternoon slots', '', ''],
    ['Grace Kelly', '555-1008', 'grace.kelly@email.com', 'Referral from Dr. Chen', '', ''],
    ['Henry Ford', '555-1009', 'henry.ford@email.com', '', '', ''],
    ['Iris West', '555-1010', 'iris.west@email.com', 'Frequent no-shows in past', '', '']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    addRow(sheet.getName(), sampleData[i]);
  }

  Logger.log('Sample clients added: ' + sampleData.length);
}

/**
 * Adds sample provider availability (weekly schedules)
 */
function addSampleProviderAvailability() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Provider_Availability');

  // Dr. Sarah Johnson (PROV001) - Mon-Fri 9-5
  var drJohnson = [
    ['PROV001', 'Monday', '09:00', '17:00', '', '', 'Yes'],
    ['PROV001', 'Tuesday', '09:00', '17:00', '', '', 'Yes'],
    ['PROV001', 'Wednesday', '09:00', '17:00', '', '', 'Yes'],
    ['PROV001', 'Thursday', '09:00', '17:00', '', '', 'Yes'],
    ['PROV001', 'Friday', '09:00', '17:00', '', '', 'Yes']
  ];

  // Dr. Michael Chen (PROV002) - Mon-Thu 10-6, Fri 9-2
  var drChen = [
    ['PROV002', 'Monday', '10:00', '18:00', '', '', 'Yes'],
    ['PROV002', 'Tuesday', '10:00', '18:00', '', '', 'Yes'],
    ['PROV002', 'Wednesday', '10:00', '18:00', '', '', 'Yes'],
    ['PROV002', 'Thursday', '10:00', '18:00', '', '', 'Yes'],
    ['PROV002', 'Friday', '09:00', '14:00', '', '', 'Yes']
  ];

  // Emma Williams (PROV003) - Tue-Sat 8-4
  var emma = [
    ['PROV003', 'Tuesday', '08:00', '16:00', '', '', 'Yes'],
    ['PROV003', 'Wednesday', '08:00', '16:00', '', '', 'Yes'],
    ['PROV003', 'Thursday', '08:00', '16:00', '', '', 'Yes'],
    ['PROV003', 'Friday', '08:00', '16:00', '', '', 'Yes'],
    ['PROV003', 'Saturday', '08:00', '12:00', '', '', 'Yes']
  ];

  // James Brown (PROV004) - Mon-Fri 11-7
  var james = [
    ['PROV004', 'Monday', '11:00', '19:00', '', '', 'Yes'],
    ['PROV004', 'Tuesday', '11:00', '19:00', '', '', 'Yes'],
    ['PROV004', 'Wednesday', '11:00', '19:00', '', '', 'Yes'],
    ['PROV004', 'Thursday', '11:00', '19:00', '', '', 'Yes'],
    ['PROV004', 'Friday', '11:00', '19:00', '', '', 'Yes']
  ];

  var allSchedules = drJohnson.concat(drChen, emma, james);

  for (var i = 0; i < allSchedules.length; i++) {
    addRow(sheet.getName(), allSchedules[i]);
  }

  Logger.log('Sample provider availability added: ' + allSchedules.length + ' entries');
}

/**
 * Adds sample provider exceptions (time off, vacations)
 */
function addSampleProviderExceptions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Provider_Exceptions');

  var today = new Date();
  var futureDate1 = new Date(today);
  futureDate1.setDate(futureDate1.getDate() + 14);

  var futureDate2 = new Date(today);
  futureDate2.setDate(futureDate2.getDate() + 21);

  var futureDate3 = new Date(today);
  futureDate3.setDate(futureDate3.getDate() + 7);

  var sampleData = [
    ['PROV001', formatDate(futureDate1), '00:00', '23:59', 'Vacation day'],
    ['PROV002', formatDate(futureDate2), '09:00', '12:00', 'Conference attendance - morning only'],
    ['PROV003', formatDate(futureDate3), '14:00', '16:00', 'Training session']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    addRow(sheet.getName(), sampleData[i]);
  }

  Logger.log('Sample provider exceptions added: ' + sampleData.length);
}

/**
 * Adds sample appointments (mix of past, present, and future)
 */
function addSampleAppointments() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Appointments');

  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  var nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  var pastDate1 = new Date(today);
  pastDate1.setDate(pastDate1.getDate() - 3);

  var pastDate2 = new Date(today);
  pastDate2.setDate(pastDate2.getDate() - 7);

  var futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + 14);

  var sampleData = [
    // Today's appointments
    ['CLI001', 'PROV001', 'SERV001', formatDate(today), '09:00', '10:00', 60, 'Booked', formatDate(today), 'First appointment', ''],
    ['CLI002', 'PROV001', 'SERV002', formatDate(today), '10:30', '11:00', 30, 'Confirmed', formatDate(yesterday), 'Follow-up from last month', ''],
    ['CLI003', 'PROV002', 'SERV001', formatDate(today), '14:00', '15:00', 60, 'Checked-in', formatDate(today), 'Client arrived early', ''],

    // Tomorrow's appointments
    ['CLI004', 'PROV003', 'SERV003', formatDate(tomorrow), '09:00', '10:00', 60, 'Booked', formatDate(today), '', ''],
    ['CLI005', 'PROV003', 'SERV002', formatDate(tomorrow), '11:00', '11:30', 30, 'Confirmed', formatDate(today), '', ''],
    ['CLI006', 'PROV001', 'SERV004', formatDate(tomorrow), '15:00', '16:30', 90, 'Booked', formatDate(today), 'Extended session needed', ''],

    // Next week
    ['CLI007', 'PROV002', 'SERV001', formatDate(nextWeek), '10:00', '11:00', 60, 'Booked', formatDate(today), '', ''],
    ['CLI008', 'PROV004', 'SERV005', formatDate(nextWeek), '14:00', '15:00', 60, 'Booked', formatDate(today), 'Group session', ''],

    // Future appointments
    ['CLI009', 'PROV001', 'SERV007', formatDate(futureDate), '09:00', '10:00', 60, 'Booked', formatDate(today), 'Annual review', ''],

    // Past appointments - completed
    ['CLI001', 'PROV002', 'SERV001', formatDate(pastDate1), '10:00', '11:00', 60, 'Completed', formatDate(pastDate1), 'Went well', ''],
    ['CLI004', 'PROV003', 'SERV003', formatDate(pastDate2), '14:00', '15:30', 90, 'Completed', formatDate(pastDate2), '', ''],

    // Past appointments - no-show
    ['CLI010', 'PROV001', 'SERV001', formatDate(pastDate1), '09:00', '10:00', 60, 'No-show', formatDate(pastDate1), 'Client did not arrive', ''],

    // Past appointments - cancelled
    ['CLI006', 'PROV002', 'SERV002', formatDate(pastDate2), '16:00', '16:30', 30, 'Cancelled', formatDate(pastDate2), 'Client called to cancel - family emergency', ''],

    // Rescheduled
    ['CLI002', 'PROV004', 'SERV006', formatDate(yesterday), '11:00', '12:00', 60, 'Rescheduled', formatDate(pastDate1), 'Moved to tomorrow - conflict', ''],

    // More future appointments
    ['CLI008', 'PROV003', 'SERV002', formatDate(futureDate), '15:00', '15:30', 30, 'Booked', formatDate(today), '', '']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    addRow(sheet.getName(), sampleData[i]);
  }

  Logger.log('Sample appointments added: ' + sampleData.length);
}

/**
 * Adds sample activity log entries
 */
function addSampleActivityLog() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Activity_Log');

  var now = new Date();
  var timestamp1 = formatDateTime(now);

  var earlier1 = new Date(now.getTime() - 3600000); // 1 hour ago
  var timestamp2 = formatDateTime(earlier1);

  var earlier2 = new Date(now.getTime() - 7200000); // 2 hours ago
  var timestamp3 = formatDateTime(earlier2);

  var yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  var timestamp4 = formatDateTime(yesterday);

  var sampleData = [
    [timestamp1, 'check-in', 'APT003', 'CLI003', 'PROV002', 'receptionist@example.com', 'Booked', 'Checked-in', 'Client arrived at 13:55'],
    [timestamp2, 'confirmation-call', 'APT002', 'CLI002', 'PROV001', 'receptionist@example.com', '', 'Confirmed', 'Client confirmed via phone'],
    [timestamp3, 'book', 'APT001', 'CLI001', 'PROV001', 'receptionist@example.com', '', 'Booked', 'New appointment created'],
    [timestamp4, 'cancel', 'APT013', 'CLI006', 'PROV002', 'receptionist@example.com', 'Booked', 'Cancelled', 'Client called - family emergency'],
    [timestamp4, 'no-show', 'APT012', 'CLI010', 'PROV001', 'receptionist@example.com', 'Booked', 'No-show', 'Client did not arrive or call']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    addRow(sheet.getName(), sampleData[i]);
  }

  Logger.log('Sample activity log entries added: ' + sampleData.length);
}

/**
 * Adds sample confirmation tracking entries
 */
function addSampleConfirmationTracking() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Confirmation_Tracking');

  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  var sampleData = [
    ['APT002', formatDate(yesterday), 'Call', 'Confirmed', 'Client confirmed appointment for today'],
    ['APT004', formatDate(yesterday), 'Text', 'Confirmed', 'SMS confirmation received'],
    ['APT005', formatDate(today), 'Call', 'Confirmed', 'Confirmed for tomorrow'],
    ['APT006', formatDate(today), 'Email', 'No-response', 'Email sent, awaiting response'],
    ['APT007', formatDate(today), 'Call', 'Confirmed', 'Confirmed for next week']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    addRow(sheet.getName(), sampleData[i]);
  }

  Logger.log('Sample confirmation tracking entries added: ' + sampleData.length);
}

/**
 * Helper function: Formats a date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Helper function: Formats a date/time as YYYY-MM-DD HH:MM:SS
 * @param {Date} date - The date/time to format
 * @returns {string} Formatted datetime string
 */
function formatDateTime(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Clears all data from sheets (keeps structure and headers)
 */
function clearAllData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Clear All Data?',
    'This will delete all data from all sheets (keeping structure and headers).\n\nThis cannot be undone!\n\nContinue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    Logger.log('Clear data cancelled by user');
    return;
  }

  var sheetNames = [
    'Providers', 'Services', 'Clients', 'Appointments',
    'Provider_Availability', 'Provider_Exceptions',
    'Activity_Log', 'Confirmation_Tracking',
    'Business_Holidays', 'Business_Exceptions'
  ];

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  sheetNames.forEach(name => {
    var sheet = ss.getSheetByName(name);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
      Logger.log('Cleared data from: ' + name);
    }
  });

  ui.alert('Data Cleared', 'All data has been removed from sheets.', ui.ButtonSet.OK);
  Logger.log('All data cleared successfully');
}

/**
 * Adds sample business holidays
 */
function addSampleBusinessHolidays() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Business_Holidays');
  var today = new Date();

  var sampleData = [
    // Recurring holidays
    [formatDate(new Date(today.getFullYear(), 0, 1)), 'New Year\'s Day', 'Yes', 'Office closed for New Year'],
    [formatDate(new Date(today.getFullYear(), 11, 25)), 'Christmas Day', 'Yes', 'Office closed for Christmas'],
    [formatDate(new Date(today.getFullYear(), 6, 4)), 'Independence Day', 'Yes', 'Office closed for July 4th'],
    [formatDate(new Date(today.getFullYear(), 10, 28)), 'Thanksgiving', 'Yes', 'Office closed for Thanksgiving'],

    // One-time closures
    [formatDate(new Date(today.getFullYear(), 7, 2)), 'Summer Break', 'No', 'Annual staff retreat'],
    [formatDate(new Date(today.getFullYear() + 1, 2, 15)), 'Staff Training Day', 'No', 'All-day training workshop']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    addRow(sheet.getName(), sampleData[i]);
  }

  Logger.log('Sample business holidays added: ' + sampleData.length);
}

/**
 * Adds sample business exceptions (partial day closures)
 */
function addSampleBusinessExceptions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Business_Exceptions');
  var today = new Date();

  // Get next month dates
  var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  var sampleData = [
    // Meetings and events
    [formatDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 5)), '10:00', '12:00', 'All-Staff Meeting', 'Monthly team meeting - no appointments'],
    [formatDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15)), '14:00', '17:00', 'Building Maintenance', 'HVAC system inspection'],
    [formatDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 20)), '09:00', '11:00', 'IT System Upgrade', 'Network infrastructure update'],
    [formatDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 25)), '13:00', '14:30', 'Safety Training', 'Mandatory fire safety drill']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    addRow(sheet.getName(), sampleData[i]);
  }

  Logger.log('Sample business exceptions added: ' + sampleData.length);
}

/**
 * Adds sample system configuration settings
 */
function addSampleSystemConfig() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('System_Config');

  var sampleData = [
    ['business_name', 'OpenSlots Appointment Center'],
    ['business_hours_start', '09:00'],
    ['business_hours_end', '17:00'],
    ['business_days', 'Monday,Tuesday,Wednesday,Thursday,Friday'],
    ['default_appointment_duration', '30'],
    ['appointment_slot_increment', '30'],
    ['timezone', 'America/New_York'],
    ['enable_email_notifications', 'Yes'],
    ['enable_sms_notifications', 'No'],
    ['max_advance_booking_days', '90'],
    ['min_cancellation_notice_hours', '24'],
    ['late_arrival_threshold_minutes', '15']
  ];

  for (var i = 0; i < sampleData.length; i++) {
    sheet.getRange(i + 2, 1, 1, sampleData[i].length).setValues([sampleData[i]]);
  }

  Logger.log('Sample system config added: ' + sampleData.length + ' settings');
}
