/**
 * Appointment Booking System - Automated Tests
 *
 * Simple unit tests for MVP 1 functionality
 */

/**
 * Main test runner - executes all tests and displays results
 */
function runAllTests() {
  var ui = SpreadsheetApp.getUi();

  ui.alert(
    'Running Tests',
    'This will run all automated tests. A temporary test sheet will be created and deleted.\n\nThis may take 30-60 seconds.',
    ui.ButtonSet.OK
  );

  Logger.log('========================================');
  Logger.log('Starting Test Suite');
  Logger.log('========================================');

  var results = [];

  // Setup tests
  results.push(testSheetCreation());
  results.push(testHeaderFormatting());
  results.push(testAutoIncrementFormula());
  results.push(testBusinessSheetsCreation());

  // Validation tests
  results.push(testEmailValidation());
  results.push(testPhoneValidation());
  results.push(testDateValidation());
  results.push(testTimeValidation());
  results.push(testDropdownValidation());
  results.push(testNumberValidation());

  // Data creation tests
  results.push(testSampleDataCreation());

  // Display results
  displayTestResults(results);

  Logger.log('========================================');
  Logger.log('Test Suite Complete');
  Logger.log('========================================');
}

/**
 * Displays test results in a dialog
 */
function displayTestResults(results) {
  var passed = results.filter(r => r.passed).length;
  var failed = results.filter(r => !r.passed).length;
  var total = results.length;

  var message = `Test Results:\n\n`;
  message += `✅ Passed: ${passed}/${total}\n`;
  message += `❌ Failed: ${failed}/${total}\n\n`;

  if (failed > 0) {
    message += 'Failed Tests:\n';
    results.filter(r => !r.passed).forEach(r => {
      message += `\n❌ ${r.name}\n   ${r.message}\n`;
    });
  } else {
    message += '🎉 All tests passed!';
  }

  // Log all results
  results.forEach(r => {
    var status = r.passed ? '✅ PASS' : '❌ FAIL';
    Logger.log(`${status}: ${r.name} - ${r.message}`);
  });

  SpreadsheetApp.getUi().alert(
    failed > 0 ? 'Tests Failed' : 'Tests Passed',
    message,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Test: Sheet creation
 */
function testSheetCreation() {
  var testName = 'Sheet Creation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestSheet_' + Date.now());

    if (!testSheet) {
      return { name: testName, passed: false, message: 'Failed to create sheet' };
    }

    var sheetName = testSheet.getName();
    ss.deleteSheet(testSheet);

    return {
      name: testName,
      passed: true,
      message: `Successfully created and deleted test sheet: ${sheetName}`
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Test: Header formatting
 */
function testHeaderFormatting() {
  var testName = 'Header Formatting';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestHeader_' + Date.now());

    testSheet.appendRow(['Col1', 'Col2', 'Col3']);
    formatHeaderRow(testSheet, 3);

    var headerRange = testSheet.getRange(1, 1, 1, 3);
    var fontWeight = headerRange.getFontWeight();
    var background = headerRange.getBackground();
    var frozenRows = testSheet.getFrozenRows();

    ss.deleteSheet(testSheet);

    var isFormatted = fontWeight === 'bold' &&
                        background === '#4285f4' &&
                        frozenRows === 1;

    return {
      name: testName,
      passed: isFormatted,
      message: isFormatted
        ? 'Headers properly formatted (bold, blue, frozen)'
        : `Formatting incorrect: weight=${fontWeight}, bg=${background}, frozen=${frozenRows}`
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Test: Auto-increment ID generation (code-based)
 */
function testAutoIncrementFormula() {
  var testName = 'Auto-increment ID Generation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestAutoInc_' + Date.now());
    var sheetName = testSheet.getName();

    // Create headers
    testSheet.appendRow(['test_id', 'name']);

    // Test the addRow function which generates IDs
    var id1 = addRow(sheetName, { name: 'First Item' }, 'TEST');
    var id2 = addRow(sheetName, { name: 'Second Item' }, 'TEST');
    var id3 = addRow(sheetName, { name: 'Third Item' }, 'TEST');

    // Clean up
    ss.deleteSheet(testSheet);

    var isCorrect = id1 === 'TEST001' && id2 === 'TEST002' && id3 === 'TEST003';

    return {
      name: testName,
      passed: isCorrect,
      message: isCorrect
        ? 'IDs generated correctly: TEST001, TEST002, TEST003'
        : 'IDs incorrect: ' + id1 + ', ' + id2 + ', ' + id3
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: 'Error: ' + error.toString()
    };
  }
}

/**
 * Test: Email validation
 */
function testEmailValidation() {
  var testName = 'Email Validation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestEmail_' + Date.now());

    testSheet.appendRow(['email']);
    addEmailValidation(testSheet, 'A2:A10', true);

    var validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    var hasValidation = validation !== null;

    return {
      name: testName,
      passed: hasValidation,
      message: hasValidation
        ? 'Email validation rule applied'
        : 'No validation rule found'
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Test: Phone validation
 */
function testPhoneValidation() {
  var testName = 'Phone Validation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestPhone_' + Date.now());

    testSheet.appendRow(['phone']);
    addPhoneValidation(testSheet, 'A2:A10', false);

    // Check for text format (no actual validation rule, just formatting)
    var numberFormat = testSheet.getRange('A2').getNumberFormat();
    var note = testSheet.getRange('A2').getNote();

    ss.deleteSheet(testSheet);

    var hasTextFormat = numberFormat === '@';
    var hasNote = note.includes('phone number');

    return {
      name: testName,
      passed: hasTextFormat && hasNote,
      message: hasTextFormat && hasNote
        ? 'Phone formatting and note applied correctly'
        : `Format: ${numberFormat}, Note: ${note}`
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Test: Date validation
 */
function testDateValidation() {
  var testName = 'Date Validation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestDate_' + Date.now());

    testSheet.appendRow(['date']);
    addDateValidation(testSheet, 'A2:A10', false);

    var validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    var hasValidation = validation !== null;

    return {
      name: testName,
      passed: hasValidation,
      message: hasValidation
        ? 'Date validation rule applied'
        : 'No validation rule found'
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Test: Time validation
 */
function testTimeValidation() {
  var testName = 'Time Validation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestTime_' + Date.now());

    testSheet.appendRow(['time']);
    addTimeValidation(testSheet, 'A2:A10');

    var validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    var hasValidation = validation !== null;

    return {
      name: testName,
      passed: hasValidation,
      message: hasValidation
        ? 'Time validation rule applied'
        : 'No validation rule found'
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Test: Dropdown validation
 */
function testDropdownValidation() {
  var testName = 'Dropdown Validation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestDropdown_' + Date.now());

    testSheet.appendRow(['status']);
    addDropdownValidation(testSheet, 'A2:A10', ['Option1', 'Option2', 'Option3'], 'Select option');

    var validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    var hasValidation = validation !== null;

    return {
      name: testName,
      passed: hasValidation,
      message: hasValidation
        ? 'Dropdown validation rule applied'
        : 'No validation rule found'
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Test: Number validation
 */
function testNumberValidation() {
  var testName = 'Number Validation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var testSheet = ss.insertSheet('TestNumber_' + Date.now());

    testSheet.appendRow(['duration']);
    addNumberValidation(testSheet, 'A2:A10', 1, 480);

    var validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    var hasValidation = validation !== null;

    return {
      name: testName,
      passed: hasValidation,
      message: hasValidation
        ? 'Number validation rule applied (1-480)'
        : 'No validation rule found'
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Test: Sample data creation
 */
function testSampleDataCreation() {
  var testName = 'Sample Data Creation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Check if Providers sheet has sample data
    var providersSheet = ss.getSheetByName('Providers');
    if (!providersSheet) {
      return {
        name: testName,
        passed: false,
        message: 'Providers sheet not found - run Initialize System first'
      };
    }

    var providerCount = providersSheet.getLastRow() - 1; // Subtract header row

    // Check if we have at least some data (either sample or real)
    var hasData = providerCount > 0;

    return {
      name: testName,
      passed: hasData,
      message: hasData
        ? `Found ${providerCount} provider(s) in system`
        : 'No provider data found'
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}

/**
 * Quick smoke test - runs essential tests only
 */
function runQuickTests() {
  var ui = SpreadsheetApp.getUi();

  Logger.log('Running quick smoke tests...');

  var results = [];
  results.push(testSheetCreation());
  results.push(testAutoIncrementFormula());
  results.push(testDropdownValidation());

  displayTestResults(results);
}

/**
 * Test: Business sheets exist and have correct structure
 */
function testBusinessSheetsCreation() {
  var testName = 'Business Sheets Creation';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Check Business_Holidays sheet
    var holidaysSheet = ss.getSheetByName('Business_Holidays');
    if (!holidaysSheet) {
      return { name: testName, passed: false, message: 'Business_Holidays sheet not found' };
    }

    var holidaysHeaders = holidaysSheet.getRange(1, 1, 1, 5).getValues()[0];
    var expectedHolidaysHeaders = ['holiday_id', 'date', 'name', 'recurring', 'notes'];
    if (JSON.stringify(holidaysHeaders) !== JSON.stringify(expectedHolidaysHeaders)) {
      return { name: testName, passed: false, message: `Business_Holidays headers incorrect: ${holidaysHeaders}` };
    }

    // Check Business_Exceptions sheet
    var exceptionsSheet = ss.getSheetByName('Business_Exceptions');
    if (!exceptionsSheet) {
      return { name: testName, passed: false, message: 'Business_Exceptions sheet not found' };
    }

    var exceptionsHeaders = exceptionsSheet.getRange(1, 1, 1, 6).getValues()[0];
    var expectedExceptionsHeaders = ['exception_id', 'date', 'start_time', 'end_time', 'reason', 'notes'];
    if (JSON.stringify(exceptionsHeaders) !== JSON.stringify(expectedExceptionsHeaders)) {
      return { name: testName, passed: false, message: `Business_Exceptions headers incorrect: ${exceptionsHeaders}` };
    }

    return {
      name: testName,
      passed: true,
      message: 'Business_Holidays and Business_Exceptions sheets created correctly'
    };

  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test helper: Clean up any test sheets left over
 */
function cleanupTestSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();

  var deletedCount = 0;

  sheets.forEach(sheet => {
    var name = sheet.getName();
    if (name.startsWith('Test')) {
      ss.deleteSheet(sheet);
      deletedCount++;
      Logger.log(`Deleted test sheet: ${name}`);
    }
  });

  SpreadsheetApp.getUi().alert(
    'Cleanup Complete',
    `Removed ${deletedCount} test sheet(s)`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Clean up test data including calendar events
 * Removes test appointments and their associated calendar events
 */
function cleanupTestData() {
  var ui = SpreadsheetApp.getUi();

  var confirm = ui.alert(
    'Cleanup Test Data',
    'This will:\n' +
    '• Delete all OpenSlots provider calendars\n' +
    '• Clear calendar_event_id from appointments\n' +
    '• Clear calendar_id from providers\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) {
    return;
  }

  // Delete all provider calendars (this also clears calendar_id from providers)
  var calResult = deleteAllProviderCalendars();

  // Clear calendar_event_id from all appointments
  var appointmentsCleared = 0;
  var appointments = getAppointments();
  for (var i = 0; i < appointments.length; i++) {
    if (appointments[i].calendar_event_id) {
      updateRecordById(SHEETS.APPOINTMENTS, appointments[i].appointment_id, {
        calendar_event_id: ''
      });
      appointmentsCleared++;
    }
  }

  ui.alert(
    'Cleanup Complete',
    `Deleted ${calResult.deleted} provider calendar(s)\n` +
    `Cleared ${appointmentsCleared} appointment reference(s)`,
    ui.ButtonSet.OK
  );

  Logger.log(`Test data cleanup: ${calResult.deleted} calendars deleted, ${appointmentsCleared} appointments cleared`);
}

/**
 * MVP2 Test Suite - Tests for Calendar Integration + Basic Automation
 */
function runMvp2Tests() {
  var ui = SpreadsheetApp.getUi();

  ui.alert(
    'Running MVP2 Tests',
    'This will run tests for:\n' +
    '• Configuration functions\n' +
    '• Availability checking\n' +
    '• Appointment booking\n' +
    '• Time utilities\n\n' +
    'This may take 30-60 seconds.',
    ui.ButtonSet.OK
  );

  Logger.log('========================================');
  Logger.log('Starting MVP2 Test Suite');
  Logger.log('========================================');

  var results = [];

  // Config tests
  results.push(testGetConfig());
  results.push(testSetConfig());
  results.push(testGetAllConfig());

  // Utility tests
  results.push(testTimeConversion());
  results.push(testDateNormalization());
  results.push(testTimeRangeOverlap());

  // Availability tests
  results.push(testGetProviderAvailability());
  results.push(testIsSlotAvailable());
  results.push(testGetAvailableSlots());

  // Appointment tests
  results.push(testAppointmentValidation());
  results.push(testBookAppointment());

  // DataAccess tests
  results.push(testGetSheetData());
  results.push(testFindRecords());

  displayTestResults(results);

  Logger.log('========================================');
  Logger.log('MVP2 Test Suite Complete');
  Logger.log('========================================');
}

/**
 * Test: getConfig function
 */
function testGetConfig() {
  var testName = 'Config: getConfig()';

  try {
    // Test getting existing config
    var businessName = getConfig('business_name');

    // Test getting non-existent config with default
    var notFound = getConfig('nonexistent_setting', 'default_value');

    var hasBusinessName = businessName && businessName.length > 0;
    var hasDefault = notFound === 'default_value';

    return {
      name: testName,
      passed: hasBusinessName && hasDefault,
      message: hasBusinessName && hasDefault
        ? `Config retrieved: "${businessName}", default works`
        : `Failed: businessName=${businessName}, default=${notFound}`
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: setConfig function
 */
function testSetConfig() {
  var testName = 'Config: setConfig()';

  try {
    var testKey = 'test_setting_' + Date.now();
    var testValue = 'test_value_123';

    // Set a test config
    var setResult = setConfig(testKey, testValue);

    // Read it back
    invalidateConfigCache();
    var readValue = getConfig(testKey);

    // Clean up - delete the test row
    var sheet = getSheet(CONFIG_SHEET_NAME);
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][0] === testKey) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }

    var passed = setResult && readValue === testValue;

    return {
      name: testName,
      passed: passed,
      message: passed
        ? 'Config set and retrieved successfully'
        : `Failed: set=${setResult}, read=${readValue}`
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: getAllConfig function
 */
function testGetAllConfig() {
  var testName = 'Config: getAllConfig()';

  try {
    var config = getAllConfig();

    var isObject = typeof config === 'object';
    var hasKeys = Object.keys(config).length > 0;

    return {
      name: testName,
      passed: isObject && hasKeys,
      message: isObject && hasKeys
        ? `Retrieved ${Object.keys(config).length} config settings`
        : 'Failed to retrieve config'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: Time conversion utilities
 */
function testTimeConversion() {
  var testName = 'Utils: Time conversion';

  try {
    // Test parseTimeToMinutes
    var minutes1 = parseTimeToMinutes('09:30');
    var expected1 = 9 * 60 + 30; // 570

    var minutes2 = parseTimeToMinutes('14:00');
    var expected2 = 14 * 60; // 840

    // Test minutesToTimeString
    var time1 = minutesToTimeString(570);
    var time2 = minutesToTimeString(840);

    var passed = minutes1 === expected1 &&
                   minutes2 === expected2 &&
                   time1 === '09:30' &&
                   time2 === '14:00';

    return {
      name: testName,
      passed: passed,
      message: passed
        ? 'Time conversions work correctly'
        : `Failed: ${minutes1}!=${expected1}, ${minutes2}!=${expected2}, ${time1}, ${time2}`
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: Date normalization
 */
function testDateNormalization() {
  var testName = 'Utils: Date normalization';

  try {
    // Test 1: Date object created with year, month, day (correct - local timezone)
    var date1 = normalizeDate(new Date(2024, 0, 15)); // Jan 15, 2024

    // Test 2: String input (our fix handles this correctly)
    var date2 = normalizeDate('2024-01-15');

    // Test 3: Date created via parseDateInTimezone (correct way to create from string)
    var date3 = normalizeDate(parseDateInTimezone('2024-01-15'));

    // Note: new Date('2024-01-15') parses as UTC midnight, which shifts to
    // previous day in western timezones. This is a JavaScript pitfall that
    // can't be fixed once the Date object is created. Always use
    // parseDateInTimezone() or new Date(year, month, day) instead.

    var allMatch = date1 === '2024-01-15' &&
                     date2 === '2024-01-15' &&
                     date3 === '2024-01-15';

    return {
      name: testName,
      passed: allMatch,
      message: allMatch
        ? 'Date normalization works correctly'
        : `Failed: ${date1}, ${date2}, ${date3}`
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: Time range overlap detection
 */
function testTimeRangeOverlap() {
  var testName = 'Utils: Time range overlap';

  try {
    // Overlapping ranges
    var overlap1 = timeRangesOverlap('09:00', '10:00', '09:30', '10:30'); // true
    var overlap2 = timeRangesOverlap('09:00', '11:00', '10:00', '10:30'); // true

    // Non-overlapping ranges
    var noOverlap1 = timeRangesOverlap('09:00', '10:00', '10:00', '11:00'); // false
    var noOverlap2 = timeRangesOverlap('09:00', '10:00', '11:00', '12:00'); // false

    var passed = overlap1 === true &&
                   overlap2 === true &&
                   noOverlap1 === false &&
                   noOverlap2 === false;

    return {
      name: testName,
      passed: passed,
      message: passed
        ? 'Overlap detection works correctly'
        : `Failed: ${overlap1}, ${overlap2}, ${noOverlap1}, ${noOverlap2}`
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: getProviderAvailability
 */
function testGetProviderAvailability() {
  var testName = 'Availability: getProviderAvailability()';

  try {
    // Test with a known provider and date
    var providers = getProviders(true);
    if (providers.length === 0) {
      return { name: testName, passed: false, message: 'No providers found - add sample data first' };
    }

    var providerId = providers[0].provider_id;
    var testDate = addDays(new Date(), 7); // Next week

    var availability = getProviderAvailability(providerId, testDate);

    // Availability should be an array
    var isArray = Array.isArray(availability);

    return {
      name: testName,
      passed: isArray,
      message: isArray
        ? `Found ${availability.length} availability window(s) for ${providerId}`
        : 'Failed: result is not an array'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: isSlotAvailable
 */
function testIsSlotAvailable() {
  var testName = 'Availability: isSlotAvailable()';

  try {
    var providers = getProviders(true);
    if (providers.length === 0) {
      return { name: testName, passed: false, message: 'No providers found' };
    }

    var providerId = providers[0].provider_id;
    var testDate = addDays(new Date(), 7);

    // This should return a boolean
    var result = isSlotAvailable(providerId, testDate, '10:00', 30);
    var isBoolean = typeof result === 'boolean';

    return {
      name: testName,
      passed: isBoolean,
      message: isBoolean
        ? `Slot availability check returned: ${result}`
        : 'Failed: result is not a boolean'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: getAvailableSlots
 */
function testGetAvailableSlots() {
  var testName = 'Availability: getAvailableSlots()';

  try {
    var providers = getProviders(true);
    if (providers.length === 0) {
      return { name: testName, passed: false, message: 'No providers found' };
    }

    var providerId = providers[0].provider_id;
    var testDate = addDays(new Date(), 7);

    var slots = getAvailableSlots(providerId, testDate, 30);

    var isArray = Array.isArray(slots);
    var hasCorrectFormat = slots.length === 0 || (slots[0].startTime && slots[0].endTime);

    return {
      name: testName,
      passed: isArray && hasCorrectFormat,
      message: isArray && hasCorrectFormat
        ? `Found ${slots.length} available slot(s)`
        : 'Failed: incorrect result format'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: Appointment data validation
 */
function testAppointmentValidation() {
  var testName = 'Appointments: Validation';

  try {
    // Test missing fields
    var result1 = validateAppointmentData({});
    var result2 = validateAppointmentData({ clientId: 'CLI001' });

    // Test valid data
    var validData = {
      clientId: 'CLI001',
      providerId: 'PROV001',
      serviceId: 'SERV001',
      date: '2024-12-20',
      startTime: '10:00',
      duration: 30
    };
    var result3 = validateAppointmentData(validData);

    // Test invalid time format
    var invalidTime = { ...validData, startTime: 'invalid' };
    var result4 = validateAppointmentData(invalidTime);

    var passed = !result1.valid &&
                   !result2.valid &&
                   result3.valid &&
                   !result4.valid;

    return {
      name: testName,
      passed: passed,
      message: passed
        ? 'Validation correctly identifies valid and invalid data'
        : `Failed: empty=${result1.valid}, partial=${result2.valid}, valid=${result3.valid}, badTime=${result4.valid}`
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: bookAppointment function (without actually creating)
 */
function testBookAppointment() {
  var testName = 'Appointments: bookAppointment()';

  try {
    // Test with invalid data - should fail gracefully
    var result1 = bookAppointment({});

    // Test with non-existent client
    var result2 = bookAppointment({
      clientId: 'NONEXISTENT',
      providerId: 'PROV001',
      serviceId: 'SERV001',
      date: normalizeDate(addDays(new Date(), 7)),
      startTime: '10:00',
      duration: 30,
      createCalendarEvent: false
    });

    var failsCorrectly = !result1.success && !result2.success;

    return {
      name: testName,
      passed: failsCorrectly,
      message: failsCorrectly
        ? 'bookAppointment correctly handles invalid inputs'
        : `Failed: empty=${result1.success}, badClient=${result2.success}`
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: getSheetData
 */
function testGetSheetData() {
  var testName = 'DataAccess: getSheetData()';

  try {
    var providers = getSheetData(SHEETS.PROVIDERS);
    var services = getSheetData(SHEETS.SERVICES);

    var providersIsArray = Array.isArray(providers);
    var servicesIsArray = Array.isArray(services);

    return {
      name: testName,
      passed: providersIsArray && servicesIsArray,
      message: providersIsArray && servicesIsArray
        ? `Providers: ${providers.length}, Services: ${services.length}`
        : 'Failed to get sheet data'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: findRecords
 */
function testFindRecords() {
  var testName = 'DataAccess: findRecords()';

  try {
    // Find all active providers
    var activeProviders = findRecords(SHEETS.PROVIDERS, { active_status: 'Active' });

    var isArray = Array.isArray(activeProviders);

    return {
      name: testName,
      passed: isArray,
      message: isArray
        ? `Found ${activeProviders.length} active provider(s)`
        : 'Failed: result is not an array'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

// ============================================================================
// MVP 3 TESTS: Client Management + Booking UI
// ============================================================================

/**
 * Test: searchClients function
 */
function testSearchClients() {
  var testName = 'ClientManagement: searchClients()';

  try {
    // Test empty search
    var emptyResult = searchClients('');

    // Test search by name (partial match)
    var nameResults = searchClients('john');

    // Test search by phone (if sample data exists)
    var phoneResults = searchClients('555');

    var emptyIsArray = Array.isArray(emptyResult);
    var nameIsArray = Array.isArray(nameResults);
    var phoneIsArray = Array.isArray(phoneResults);

    return {
      name: testName,
      passed: emptyIsArray && nameIsArray && phoneIsArray,
      message: emptyIsArray && nameIsArray && phoneIsArray
        ? `Empty: ${emptyResult.length}, Name: ${nameResults.length}, Phone: ${phoneResults.length}`
        : 'Failed: one or more results not an array'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: createClient function
 */
function testCreateClient() {
  var testName = 'ClientManagement: createClient()';

  try {
    // Test with missing required fields
    var result1 = createClient({});
    var result2 = createClient({ name: 'Test' }); // Missing phone

    // Both should fail
    var failsCorrectly = !result1.success && !result2.success;

    return {
      name: testName,
      passed: failsCorrectly,
      message: failsCorrectly
        ? 'createClient correctly validates required fields'
        : `Failed: empty=${result1.success}, noPhone=${result2.success}`
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: updateClientVisitHistory function
 */
function testUpdateClientVisitHistory() {
  var testName = 'ClientManagement: updateClientVisitHistory()';

  try {
    // Test with invalid inputs
    var result1 = updateClientVisitHistory(null, '2025-01-01');
    var result2 = updateClientVisitHistory('CLI999', null);
    var result3 = updateClientVisitHistory('NONEXISTENT', '2025-01-01');

    // All should return false or handle gracefully
    var failsCorrectly = !result1 && !result2 && !result3;

    return {
      name: testName,
      passed: failsCorrectly,
      message: failsCorrectly
        ? 'updateClientVisitHistory correctly handles invalid inputs'
        : 'Failed: should handle invalid inputs gracefully'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: getClientAppointmentHistory function
 */
function testGetClientAppointmentHistory() {
  var testName = 'ClientManagement: getClientAppointmentHistory()';

  try {
    // Test with invalid client ID
    var result1 = getClientAppointmentHistory(null);
    var result2 = getClientAppointmentHistory('NONEXISTENT');

    // Both should return empty arrays
    var handlesInvalid = Array.isArray(result1) && result1.length === 0 &&
                           Array.isArray(result2) && result2.length === 0;

    // Test with valid client (if sample data exists)
    var result3 = getClientAppointmentHistory('CLI001');
    var isArray = Array.isArray(result3);

    return {
      name: testName,
      passed: handlesInvalid && isArray,
      message: handlesInvalid && isArray
        ? `Returns arrays correctly. CLI001 has ${result3.length} appointment(s)`
        : 'Failed: should return empty arrays for invalid inputs'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: getClientStats function
 */
function testGetClientStats() {
  var testName = 'ClientManagement: getClientStats()';

  try {
    // Test with valid client (if exists)
    var stats = getClientStats('CLI001');

    var hasRequiredFields = stats &&
                              typeof stats.total_appointments === 'number' &&
                              typeof stats.completed === 'number' &&
                              typeof stats.cancelled === 'number' &&
                              typeof stats.no_shows === 'number' &&
                              typeof stats.upcoming === 'number';

    return {
      name: testName,
      passed: hasRequiredFields,
      message: hasRequiredFields
        ? `Stats: ${stats.total_appointments} total, ${stats.completed} completed`
        : 'Failed: missing required stat fields'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: getAvailableTimeSlots function
 */
function testGetAvailableTimeSlots() {
  var testName = 'BookingUI: getAvailableTimeSlots()';

  try {
    // Test with missing parameters
    var result1 = getAvailableTimeSlots(null, null, null);
    var result2 = getAvailableTimeSlots('PROV001', null, 30);

    // Should return error for missing params
    var failsCorrectly = !result1.success && !result2.success;

    return {
      name: testName,
      passed: failsCorrectly,
      message: failsCorrectly
        ? 'getAvailableTimeSlots correctly validates parameters'
        : 'Failed: should require all parameters'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Test: getBookingFormData function
 */
function testGetBookingFormData() {
  var testName = 'BookingUI: getBookingFormData()';

  try {
    var formData = getBookingFormData();

    var hasProviders = formData && Array.isArray(formData.providers);
    var hasServices = formData && Array.isArray(formData.services);

    return {
      name: testName,
      passed: hasProviders && hasServices,
      message: hasProviders && hasServices
        ? `Providers: ${formData.providers.length}, Services: ${formData.services.length}`
        : 'Failed: should return providers and services arrays'
    };
  } catch (error) {
    return { name: testName, passed: false, message: `Error: ${error.toString()}` };
  }
}

/**
 * Runs all MVP3 tests
 */
function runMvp3Tests() {
  var ui = SpreadsheetApp.getUi();

  ui.alert(
    'Running MVP3 Tests',
    'This will run tests for:\n' +
    '• Client management\n' +
    '• Client search\n' +
    '• Booking UI functions\n\n' +
    'This may take 15-30 seconds.',
    ui.ButtonSet.OK
  );

  Logger.log('========================================');
  Logger.log('Starting MVP3 Test Suite');
  Logger.log('========================================');

  var results = [];

  // Client management tests
  results.push(testSearchClients());
  results.push(testCreateClient());
  results.push(testUpdateClientVisitHistory());
  results.push(testGetClientAppointmentHistory());
  results.push(testGetClientStats());

  // Booking UI tests
  results.push(testGetAvailableTimeSlots());
  results.push(testGetBookingFormData());

  displayTestResults(results);

  Logger.log('========================================');
  Logger.log('MVP3 Test Suite Complete');
  Logger.log('========================================');
}

// ============================================================================
// MVP 4 TESTS: Appointment Management
// ============================================================================

/**
 * Helper: Creates a test appointment for management testing
 * @returns {string} Appointment ID
 */
function createTestAppointmentForManagement() {
  var providers = getProviders(true);
  var clients = getClients();
  var services = getServices(true);

  if (providers.length === 0 || clients.length === 0 || services.length === 0) {
    throw new Error('Sample data required for tests. Run "Add Sample Data" first.');
  }

  var futureDate = addDays(new Date(), 7);
  var appointmentData = {
    clientId: clients[0].client_id,
    providerId: providers[0].provider_id,
    serviceId: services[0].service_id,
    date: normalizeDate(futureDate),
    startTime: '10:00',
    duration: 30,
    status: 'Booked',
    createCalendarEvent: false
  };

  var result = bookAppointment(appointmentData);
  if (!result.success) {
    throw new Error('Failed to create test appointment: ' + (result.error || result.message));
  }

  return result.appointmentId;
}

/**
 * Test: Cancel appointment
 */
function testCancelAppointment() {
  var testName = 'AppointmentMgmt: cancelAppointment()';

  try {
    var appointmentId = createTestAppointmentForManagement();

    // Cancel the appointment
    var result = cancelAppointment(appointmentId, 'Test cancellation', 'test@example.com');

    // Verify success
    if (!result.success) {
      return { name: testName, passed: false, message: 'Failed to cancel: ' + result.message };
    }

    // Verify status changed
    var appointment = getAppointmentById(appointmentId);
    var statusChanged = appointment.status === 'Cancelled';

    // Cleanup
    deleteTestAppointment(appointmentId);

    return {
      name: testName,
      passed: statusChanged,
      message: statusChanged
        ? 'Appointment cancelled successfully'
        : 'Status not updated to Cancelled: ' + appointment.status
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Cannot cancel already cancelled appointment
 */
function testCancelAlreadyCancelled() {
  var testName = 'AppointmentMgmt: Cancel already cancelled';

  try {
    var appointmentId = createTestAppointmentForManagement();

    // Cancel once
    cancelAppointment(appointmentId, 'First cancellation');

    // Try to cancel again
    var result = cancelAppointment(appointmentId, 'Second cancellation');

    // Should fail
    var correctlyFailed = !result.success;

    // Cleanup
    deleteTestAppointment(appointmentId);

    return {
      name: testName,
      passed: correctlyFailed,
      message: correctlyFailed
        ? 'Correctly prevented double cancellation'
        : 'Should not allow cancelling already cancelled appointment'
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Reschedule appointment
 */
function testRescheduleAppointment() {
  var testName = 'AppointmentMgmt: rescheduleAppointment()';

  try {
    var appointmentId = createTestAppointmentForManagement();
    var originalAppointment = getAppointmentById(appointmentId);

    // Reschedule to different date/time
    var newDate = normalizeDate(addDays(new Date(), 10));
    var result = rescheduleAppointment(appointmentId, {
      newDate: newDate,
      newStartTime: '14:00',
      reason: 'Test reschedule'
    });

    // Verify success
    if (!result.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Failed to reschedule: ' + result.message };
    }

    // Verify changes applied
    var updatedAppointment = getAppointmentById(appointmentId);
    var dateChanged = updatedAppointment.appointment_date === newDate;
    var timeChanged = updatedAppointment.start_time === '14:00';
    var statusChanged = updatedAppointment.status === 'Rescheduled';

    // Cleanup
    deleteTestAppointment(appointmentId);

    var passed = dateChanged && timeChanged && statusChanged;

    return {
      name: testName,
      passed: passed,
      message: passed
        ? 'Appointment rescheduled successfully'
        : 'Date: ' + dateChanged + ', Time: ' + timeChanged + ', Status: ' + statusChanged
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Cannot reschedule to unavailable slot
 */
function testRescheduleToUnavailableSlot() {
  var testName = 'AppointmentMgmt: Reschedule to unavailable';

  try {
    // Create two appointments at different times
    var apt1 = createTestAppointmentForManagement();

    var providers = getProviders(true);
    var clients = getClients();
    var services = getServices(true);

    var futureDate = addDays(new Date(), 7);
    var apt2Result = bookAppointment({
      clientId: clients[1] ? clients[1].client_id : clients[0].client_id,
      providerId: providers[0].provider_id,
      serviceId: services[0].service_id,
      date: normalizeDate(futureDate),
      startTime: '11:00',
      duration: 60,
      status: 'Booked',
      createCalendarEvent: false
    });

    var apt2 = apt2Result.appointment_id;

    // Try to reschedule apt1 to overlap with apt2
    var result = rescheduleAppointment(apt1, {
      newDate: normalizeDate(futureDate),
      newStartTime: '11:30', // Overlaps with apt2 (11:00-12:00)
      reason: 'Test conflict'
    });

    // Should fail
    var correctlyFailed = !result.success;

    // Cleanup
    deleteTestAppointment(apt1);
    deleteTestAppointment(apt2);

    return {
      name: testName,
      passed: correctlyFailed,
      message: correctlyFailed
        ? 'Correctly prevented reschedule to unavailable slot'
        : 'Should not allow rescheduling to conflicting time'
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Check in appointment
 */
function testCheckInAppointment() {
  var testName = 'AppointmentMgmt: checkInAppointment()';

  try {
    // Create appointment for today
    var providers = getProviders(true);
    var clients = getClients();
    var services = getServices(true);

    var today = new Date();
    var result = bookAppointment({
      clientId: clients[0].client_id,
      providerId: providers[0].provider_id,
      serviceId: services[0].service_id,
      date: normalizeDate(today),
      startTime: minutesToTimeString(getCurrentMinutes()),
      duration: 30,
      status: 'Booked',
      createCalendarEvent: false
    });

    var appointmentId = result.appointment_id;

    // Check in
    var checkInResult = checkInAppointment(appointmentId, 'test@example.com');

    // Verify success
    if (!checkInResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Failed to check in: ' + checkInResult.message };
    }

    // Verify status changed
    var appointment = getAppointmentById(appointmentId);
    var statusChanged = appointment.status === 'Checked-in';

    // Cleanup
    deleteTestAppointment(appointmentId);

    return {
      name: testName,
      passed: statusChanged,
      message: statusChanged
        ? 'Client checked in successfully'
        : 'Status not updated: ' + appointment.status
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Cannot check in already checked-in appointment
 */
function testCheckInAlreadyCheckedIn() {
  var testName = 'AppointmentMgmt: Check in already checked-in';

  try {
    // Create appointment for today
    var providers = getProviders(true);
    var clients = getClients();
    var services = getServices(true);

    var today = new Date();
    var result = bookAppointment({
      clientId: clients[0].client_id,
      providerId: providers[0].provider_id,
      serviceId: services[0].service_id,
      date: normalizeDate(today),
      startTime: minutesToTimeString(getCurrentMinutes()),
      duration: 30,
      status: 'Booked',
      createCalendarEvent: false
    });

    var appointmentId = result.appointment_id;

    // Check in once
    checkInAppointment(appointmentId);

    // Try to check in again
    var secondCheckIn = checkInAppointment(appointmentId);

    // Should fail
    var correctlyFailed = !secondCheckIn.success;

    // Cleanup
    deleteTestAppointment(appointmentId);

    return {
      name: testName,
      passed: correctlyFailed,
      message: correctlyFailed
        ? 'Correctly prevented double check-in'
        : 'Should not allow checking in already checked-in appointment'
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Mark no-show
 */
function testMarkNoShow() {
  var testName = 'AppointmentMgmt: markNoShow()';

  try {
    // Create appointment in the past (beyond grace period)
    var providers = getProviders(true);
    var clients = getClients();
    var services = getServices(true);

    var pastDate = addDays(new Date(), -1); // Yesterday
    var result = bookAppointment({
      clientId: clients[0].client_id,
      providerId: providers[0].provider_id,
      serviceId: services[0].service_id,
      date: normalizeDate(pastDate),
      startTime: '10:00',
      duration: 30,
      status: 'Booked',
      createCalendarEvent: false
    });

    var appointmentId = result.appointment_id;
    var clientId = clients[0].client_id;

    // Get current no-show count
    var clientBefore = getClient(clientId);
    var noShowCountBefore = parseInt(clientBefore.no_show_count || 0);

    // Mark as no-show
    var noShowResult = markNoShow(appointmentId, 'test@example.com', 'Test no-show');

    // Verify success
    if (!noShowResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Failed to mark no-show: ' + noShowResult.message };
    }

    // Verify status changed
    var appointment = getAppointmentById(appointmentId);
    var statusChanged = appointment.status === 'No-show';

    // Verify client no-show count incremented
    invalidateClientsCache();
    var clientAfter = getClient(clientId);
    var noShowCountAfter = parseInt(clientAfter.no_show_count || 0);
    var countIncremented = noShowCountAfter === noShowCountBefore + 1;

    // Cleanup (restore no-show count)
    updateRecordById(SHEETS.CLIENTS, clientId, {
      no_show_count: noShowCountBefore
    });
    deleteTestAppointment(appointmentId);

    var passed = statusChanged && countIncremented;

    return {
      name: testName,
      passed: passed,
      message: passed
        ? 'No-show marked and client count updated'
        : 'Status: ' + statusChanged + ', Count: ' + countIncremented
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Cannot mark future appointment as no-show
 */
function testNoShowFutureAppointment() {
  var testName = 'AppointmentMgmt: No-show future appointment';

  try {
    var appointmentId = createTestAppointmentForManagement(); // Future appointment

    // Try to mark as no-show
    var result = markNoShow(appointmentId, 'test@example.com');

    // Should fail
    var correctlyFailed = !result.success;

    // Cleanup
    deleteTestAppointment(appointmentId);

    return {
      name: testName,
      passed: correctlyFailed,
      message: correctlyFailed
        ? 'Correctly prevented marking future appointment as no-show'
        : 'Should not allow marking future appointments as no-show'
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Status transitions
 */
function testStatusTransitions() {
  var testName = 'AppointmentMgmt: Status transitions';

  try {
    // Test valid transitions
    var validBooked = canTransitionTo('Booked', 'Cancelled');
    var validConfirmed = canTransitionTo('Confirmed', 'Checked-in');
    var validCheckedIn = canTransitionTo('Checked-in', 'Completed');

    // Test invalid transitions
    var invalidCancelled = !canTransitionTo('Cancelled', 'Booked');
    var invalidCompleted = !canTransitionTo('Completed', 'Cancelled');
    var invalidNoShow = !canTransitionTo('No-show', 'Checked-in');

    var allValid = validBooked && validConfirmed && validCheckedIn;
    var allInvalid = invalidCancelled && invalidCompleted && invalidNoShow;
    var passed = allValid && allInvalid;

    return {
      name: testName,
      passed: passed,
      message: passed
        ? 'Status transition rules enforced correctly'
        : 'Valid: ' + allValid + ', Invalid blocked: ' + allInvalid
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Test: Complete appointment
 */
function testCompleteAppointment() {
  var testName = 'AppointmentMgmt: completeAppointment()';

  try {
    // Create and check in appointment
    var providers = getProviders(true);
    var clients = getClients();
    var services = getServices(true);

    var today = new Date();
    var result = bookAppointment({
      clientId: clients[0].client_id,
      providerId: providers[0].provider_id,
      serviceId: services[0].service_id,
      date: normalizeDate(today),
      startTime: minutesToTimeString(getCurrentMinutes() - 30), // 30 min ago
      duration: 30,
      status: 'Booked',
      createCalendarEvent: false
    });

    var appointmentId = result.appointment_id;

    // Check in first (required for completion)
    checkInAppointment(appointmentId);

    // Complete
    var completeResult = completeAppointment(appointmentId, 'test@example.com', 'Test completion');

    // Verify success
    if (!completeResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Failed to complete: ' + completeResult.message };
    }

    // Verify status changed
    var appointment = getAppointmentById(appointmentId);
    var statusChanged = appointment.status === 'Completed';

    // Cleanup
    deleteTestAppointment(appointmentId);

    return {
      name: testName,
      passed: statusChanged,
      message: statusChanged
        ? 'Appointment completed successfully'
        : 'Status not updated: ' + appointment.status
    };

  } catch (error) {
    return { name: testName, passed: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Helper: Delete test appointment
 */
function deleteTestAppointment(appointmentId) {
  try {
    var sheet = getSheet(SHEETS.APPOINTMENTS);
    if (!sheet) return;

    var data = sheet.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === appointmentId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  } catch (error) {
    Logger.log('Error deleting test appointment: ' + error.toString());
  }
}

/**
 * Helper: Get current time in minutes since midnight
 */
function getCurrentMinutes() {
  var now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Runs all MVP4 tests
 */
function runMvp4Tests() {
  var ui = SpreadsheetApp.getUi();

  ui.alert(
    'Running MVP4 Tests',
    'This will run tests for:\n' +
    '• Appointment cancellation\n' +
    '• Appointment rescheduling\n' +
    '• Check-in functionality\n' +
    '• No-show tracking\n' +
    '• Status transitions\n\n' +
    'This may take 30-45 seconds.',
    ui.ButtonSet.OK
  );

  Logger.log('========================================');
  Logger.log('Starting MVP4 Test Suite');
  Logger.log('========================================');

  var results = [];

  // Cancel tests
  results.push(testCancelAppointment());
  results.push(testCancelAlreadyCancelled());

  // Reschedule tests
  results.push(testRescheduleAppointment());
  results.push(testRescheduleToUnavailableSlot());

  // Check-in tests
  results.push(testCheckInAppointment());
  results.push(testCheckInAlreadyCheckedIn());

  // No-show tests
  results.push(testMarkNoShow());
  results.push(testNoShowFutureAppointment());

  // Status transition tests
  results.push(testStatusTransitions());

  // Complete tests
  results.push(testCompleteAppointment());

  // Additional MVP4 tests based on issue #56
  results.push(testCheckInTooEarly());
  results.push(testCheckInTooLate());
  results.push(testCheckInWithinGracePeriod());
  results.push(testNoShowWithinGracePeriod());
  results.push(testRescheduleToProviderWithoutService());
  results.push(testRescheduleMultipleFields());
  results.push(testUISearchFunctions());
  results.push(testUIAppointmentDetails());
  results.push(testActivityLogging());

  displayTestResults(results);

  Logger.log('========================================');
  Logger.log('MVP4 Test Suite Complete');
  Logger.log('========================================');
}

// ============================================================================
// Additional MVP4 Tests (Based on Issue #56)
// ============================================================================

/**
 * Test check-in too early (>1 hour before appointment)
 */
function testCheckInTooEarly() {
  var testName = 'Check-in Too Early (>1hr before)';

  try {
    // Create test appointment (7 days in future by default)
    var appointmentId = createTestAppointmentForManagement();

    // Manually update to be 2 hours in future (too early to check in)
    var futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + 2);
    var dateStr = normalizeDate(futureTime);
    var hours = futureTime.getHours();
    var minutes = futureTime.getMinutes();
    var timeStr = padZero(hours) + ':' + padZero(minutes);

    updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      appointment_date: dateStr,
      start_time: timeStr
    });

    // Try to check in (should fail - more than 1 hour before)
    var checkInResult = checkInAppointment(appointmentId);

    if (checkInResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Check-in should have failed (too early)' };
    }

    if (!checkInResult.message || checkInResult.message.indexOf('early') === -1) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Wrong error message: ' + (checkInResult.message || checkInResult.error || '') };
    }

    deleteTestAppointment(appointmentId);
    return { name: testName, passed: true, message: 'Check-in correctly rejected (too early)' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}

/**
 * Test check-in too late (>30 min after appointment start)
 */
function testCheckInTooLate() {
  var testName = 'Check-in Too Late (>30min after start)';

  try {
    // Create test appointment
    var appointmentId = createTestAppointmentForManagement();

    // Manually update to be 45 minutes ago (too late to check in)
    var pastTime = new Date();
    pastTime.setMinutes(pastTime.getMinutes() - 45);
    var dateStr = normalizeDate(pastTime);
    var hours = pastTime.getHours();
    var minutes = pastTime.getMinutes();
    var timeStr = padZero(hours) + ':' + padZero(minutes);

    updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      appointment_date: dateStr,
      start_time: timeStr
    });

    // Try to check in (should fail - more than 30 min after start)
    var checkInResult = checkInAppointment(appointmentId);

    if (checkInResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Check-in should have failed (too late)' };
    }

    if (!checkInResult.message || checkInResult.message.indexOf('late') === -1) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Wrong error message: ' + (checkInResult.message || checkInResult.error || '') };
    }

    deleteTestAppointment(appointmentId);
    return { name: testName, passed: true, message: 'Check-in correctly rejected (too late)' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}

/**
 * Test check-in within grace period (1hr before to 30min after)
 */
function testCheckInWithinGracePeriod() {
  var testName = 'Check-in Within Grace Period';

  try {
    // Create test appointment
    var appointmentId = createTestAppointmentForManagement();

    // Manually update to be 30 minutes from now (within check-in window)
    var futureTime = new Date();
    futureTime.setMinutes(futureTime.getMinutes() + 30);
    var dateStr = normalizeDate(futureTime);
    var hours = futureTime.getHours();
    var minutes = futureTime.getMinutes();
    var timeStr = padZero(hours) + ':' + padZero(minutes);

    updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      appointment_date: dateStr,
      start_time: timeStr
    });

    // Try to check in (should succeed - within 1 hour before)
    var checkInResult = checkInAppointment(appointmentId);

    if (!checkInResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Check-in should have succeeded: ' + (checkInResult.message || checkInResult.error || '') };
    }

    // Verify status changed
    var appointment = getAppointmentById(appointmentId);
    if (appointment.status !== 'Checked-in') {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Status should be Checked-in, got: ' + appointment.status };
    }

    deleteTestAppointment(appointmentId);
    return { name: testName, passed: true, message: 'Check-in succeeded within grace period' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}

/**
 * Test marking no-show within grace period (should fail)
 */
function testNoShowWithinGracePeriod() {
  var testName = 'No-show Within Grace Period (should fail)';

  try {
    // Create test appointment
    var appointmentId = createTestAppointmentForManagement();

    // Manually update to be 15 minutes from now (within 30 min grace period)
    var futureTime = new Date();
    futureTime.setMinutes(futureTime.getMinutes() + 15);
    var dateStr = normalizeDate(futureTime);
    var hours = futureTime.getHours();
    var minutes = futureTime.getMinutes();
    var timeStr = padZero(hours) + ':' + padZero(minutes);

    updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      appointment_date: dateStr,
      start_time: timeStr
    });

    // Try to mark as no-show (should fail - within 30 min grace period)
    var noShowResult = markNoShow(appointmentId);

    if (noShowResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'No-show should have failed (within grace period)' };
    }

    var errorMsg = noShowResult.message || noShowResult.error || '';
    if (errorMsg.indexOf('grace period') === -1 && errorMsg.indexOf('30 minutes') === -1) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Wrong error message: ' + errorMsg };
    }

    deleteTestAppointment(appointmentId);
    return { name: testName, passed: true, message: 'No-show correctly rejected (within grace period)' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}

/**
 * Test rescheduling to provider who doesn't offer the service
 */
function testRescheduleToProviderWithoutService() {
  var testName = 'Reschedule to Provider Without Service';

  try {
    // Create test appointment
    var appointmentId = createTestAppointmentForManagement();
    var appointment = getAppointmentById(appointmentId);

    // Get all providers to find one who doesn't offer the current service
    var providers = getProviders(true);
    var currentServiceId = appointment.service_id;

    // Find a provider who doesn't offer the current service
    var differentProviderId = null;
    for (var i = 0; i < providers.length; i++) {
      var provider = providers[i];
      if (provider.provider_id !== appointment.provider_id) {
        var servicesOffered = provider.services_offered ? provider.services_offered.split(',') : [];
        var offersService = false;
        for (var j = 0; j < servicesOffered.length; j++) {
          if (servicesOffered[j].trim() === currentServiceId) {
            offersService = true;
            break;
          }
        }
        if (!offersService) {
          differentProviderId = provider.provider_id;
          break;
        }
      }
    }

    if (!differentProviderId) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Could not find provider without service ' + currentServiceId };
    }

    // Try to reschedule to provider who doesn't offer this service
    var rescheduleResult = rescheduleAppointment(appointmentId, {
      newProviderId: differentProviderId
    });

    if (rescheduleResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Reschedule should have failed (provider does not offer service)' };
    }

    var errorMsg = rescheduleResult.message || rescheduleResult.error || '';
    if (errorMsg.indexOf('does not offer') === -1) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Wrong error message: ' + errorMsg };
    }

    deleteTestAppointment(appointmentId);
    return { name: testName, passed: true, message: 'Reschedule correctly rejected (provider does not offer service)' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}

/**
 * Test rescheduling multiple fields at once (date + time + provider + service)
 */
function testRescheduleMultipleFields() {
  var testName = 'Reschedule Multiple Fields';

  try {
    // Create test appointment
    var appointmentId = createTestAppointmentForManagement();

    // Get providers and services for reschedule
    var providers = getProviders(true);
    var services = getServices(true);

    if (providers.length < 2 || services.length < 2) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Need at least 2 providers and 2 services for test' };
    }

    // Reschedule to different provider and service
    var newProviderId = providers[1].provider_id;
    var newServiceId = services[1].service_id;
    var newDate = normalizeDate(addDays(new Date(), 14));

    var rescheduleResult = rescheduleAppointment(appointmentId, {
      newDate: newDate,
      newStartTime: '14:00',
      newProviderId: newProviderId,
      newServiceId: newServiceId,
      newDuration: 30
    });

    if (!rescheduleResult.success) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Reschedule failed: ' + (rescheduleResult.message || rescheduleResult.error) };
    }

    // Verify all fields changed
    var appointment = getAppointmentById(appointmentId);

    var errors = [];
    if (appointment.appointment_date !== newDate) {
      errors.push('Date not updated: ' + appointment.appointment_date + ' vs ' + newDate);
    }
    if (appointment.start_time !== '14:00') {
      errors.push('Time not updated: ' + appointment.start_time);
    }
    if (appointment.provider_id !== newProviderId) {
      errors.push('Provider not updated: ' + appointment.provider_id);
    }
    if (appointment.service_id !== newServiceId) {
      errors.push('Service not updated: ' + appointment.service_id);
    }
    if (parseInt(appointment.duration) !== 30) {
      errors.push('Duration not updated: ' + appointment.duration);
    }

    deleteTestAppointment(appointmentId);

    if (errors.length > 0) {
      return { name: testName, passed: false, message: errors.join('; ') };
    }

    return { name: testName, passed: true, message: 'All fields updated correctly' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}

/**
 * Test UI search and filter functions
 */
function testUISearchFunctions() {
  var testName = 'UI Search Functions';

  try {
    // Test searchAppointmentsForUI
    var allResults = searchAppointmentsForUI({});
    if (!Array.isArray(allResults)) {
      return { name: testName, passed: false, message: 'searchAppointmentsForUI should return array' };
    }

    // Test search by query
    var queryResults = searchAppointmentsForUI({ query: 'CLI001' });
    if (!Array.isArray(queryResults)) {
      return { name: testName, passed: false, message: 'Search by query should return array' };
    }

    // Test search by status
    var statusResults = searchAppointmentsForUI({ status: 'Scheduled' });
    if (!Array.isArray(statusResults)) {
      return { name: testName, passed: false, message: 'Search by status should return array' };
    }

    // Verify results have required fields
    if (allResults.length > 0) {
      var firstResult = allResults[0];
      if (!firstResult.appointment_id || !firstResult.client || !firstResult.provider || !firstResult.service) {
        return { name: testName, passed: false, message: 'Search results missing required fields' };
      }
    }

    // Test getTodaysAppointmentsForUI
    var todayResults = getTodaysAppointmentsForUI();
    if (!Array.isArray(todayResults)) {
      return { name: testName, passed: false, message: 'getTodaysAppointmentsForUI should return array' };
    }

    return { name: testName, passed: true, message: 'All UI search functions work correctly' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}

/**
 * Test UI appointment details function
 */
function testUIAppointmentDetails() {
  var testName = 'UI Appointment Details';

  try {
    // Create test appointment
    var appointmentId = createTestAppointmentForManagement();

    // Get appointment details
    var details = getAppointmentDetailsForUI(appointmentId);

    if (!details) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'getAppointmentDetailsForUI returned null' };
    }

    // Verify structure
    if (!details.appointment || !details.client || !details.provider || !details.service) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Details missing required fields' };
    }

    // Verify action permissions included
    if (typeof details.canCancel === 'undefined' ||
        typeof details.canReschedule === 'undefined' ||
        typeof details.canCheckIn === 'undefined' ||
        typeof details.canMarkNoShow === 'undefined' ||
        typeof details.canComplete === 'undefined') {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Details missing action permissions' };
    }

    // For booked appointment, should be able to cancel and reschedule
    if (!details.canCancel || !details.canReschedule) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Booked appointment should allow cancel and reschedule' };
    }

    deleteTestAppointment(appointmentId);
    return { name: testName, passed: true, message: 'Appointment details include all required data and permissions' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}

/**
 * Test activity logging for appointment operations
 */
function testActivityLogging() {
  var testName = 'Activity Logging for Appointments';

  try {
    // Get initial log count
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName('Activity_Log');
    var initialLogCount = logSheet.getLastRow() - 1; // Exclude header

    // Create test appointment
    var appointmentId = createTestAppointmentForManagement();

    // Update to be 30 minutes from now so check-in works
    var futureTime = new Date();
    futureTime.setMinutes(futureTime.getMinutes() + 30);
    var dateStr = normalizeDate(futureTime);
    var hours = futureTime.getHours();
    var minutes = futureTime.getMinutes();
    var timeStr = padZero(hours) + ':' + padZero(minutes);

    updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      appointment_date: dateStr,
      start_time: timeStr
    });

    // Perform various operations that should log
    rescheduleAppointment(appointmentId, { newStartTime: '11:00' });

    // Update time again for check-in to work
    updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      appointment_date: dateStr,
      start_time: timeStr
    });

    checkInAppointment(appointmentId);
    completeAppointment(appointmentId);

    // Get final log count
    var finalLogCount = logSheet.getLastRow() - 1;

    // Should have at least 4 new log entries (book, reschedule, check-in, complete)
    var newLogs = finalLogCount - initialLogCount;
    if (newLogs < 4) {
      deleteTestAppointment(appointmentId);
      return { name: testName, passed: false, message: 'Expected at least 4 log entries, got: ' + newLogs };
    }

    // Verify log entries contain appointment ID
    var logData = logSheet.getRange(2, 1, finalLogCount, logSheet.getLastColumn()).getValues();
    var appointmentLogs = [];
    for (var i = logData.length - 1; i >= 0 && appointmentLogs.length < 4; i--) {
      var logEntry = logData[i];
      var logAppointmentId = logEntry[2]; // Assuming column C is appointment_id
      if (logAppointmentId === appointmentId) {
        appointmentLogs.push(logEntry);
      }
    }

    deleteTestAppointment(appointmentId);

    if (appointmentLogs.length < 4) {
      return { name: testName, passed: false, message: 'Expected 4 log entries with appointment ID, got: ' + appointmentLogs.length };
    }

    return { name: testName, passed: true, message: 'Activity logged correctly for all operations (' + newLogs + ' entries)' };

  } catch (error) {
    return { name: testName, passed: false, message: 'Exception: ' + error.message };
  }
}
