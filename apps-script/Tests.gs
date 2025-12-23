/**
 * Appointment Booking System - Automated Tests
 *
 * Simple unit tests for MVP 1 functionality
 */

/**
 * Main test runner - executes all tests and displays results
 */
function runAllTests() {
  const ui = SpreadsheetApp.getUi();

  ui.alert(
    'Running Tests',
    'This will run all automated tests. A temporary test sheet will be created and deleted.\n\nThis may take 30-60 seconds.',
    ui.ButtonSet.OK
  );

  Logger.log('========================================');
  Logger.log('Starting Test Suite');
  Logger.log('========================================');

  const results = [];

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
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  let message = `Test Results:\n\n`;
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
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
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
  const testName = 'Sheet Creation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestSheet_' + Date.now());

    if (!testSheet) {
      return { name: testName, passed: false, message: 'Failed to create sheet' };
    }

    const sheetName = testSheet.getName();
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
  const testName = 'Header Formatting';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestHeader_' + Date.now());

    testSheet.appendRow(['Col1', 'Col2', 'Col3']);
    formatHeaderRow(testSheet, 3);

    const headerRange = testSheet.getRange(1, 1, 1, 3);
    const fontWeight = headerRange.getFontWeight();
    const background = headerRange.getBackground();
    const frozenRows = testSheet.getFrozenRows();

    ss.deleteSheet(testSheet);

    const isFormatted = fontWeight === 'bold' &&
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
 * Test: Auto-increment formula
 */
function testAutoIncrementFormula() {
  const testName = 'Auto-increment Formula';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestAutoInc_' + Date.now());

    testSheet.appendRow(['id', 'name']);
    addAutoIncrementFormula(testSheet, 'TEST', 'B');

    // Add test data
    testSheet.getRange('B2').setValue('First Item');
    testSheet.getRange('B3').setValue('Second Item');
    testSheet.getRange('B4').setValue('Third Item');

    // Force recalculation
    SpreadsheetApp.flush();

    const id1 = testSheet.getRange('A2').getValue();
    const id2 = testSheet.getRange('A3').getValue();
    const id3 = testSheet.getRange('A4').getValue();

    ss.deleteSheet(testSheet);

    const isCorrect = id1 === 'TEST001' && id2 === 'TEST002' && id3 === 'TEST003';

    return {
      name: testName,
      passed: isCorrect,
      message: isCorrect
        ? 'IDs generated correctly: TEST001, TEST002, TEST003'
        : `IDs incorrect: ${id1}, ${id2}, ${id3}`
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
 * Test: Email validation
 */
function testEmailValidation() {
  const testName = 'Email Validation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestEmail_' + Date.now());

    testSheet.appendRow(['email']);
    addEmailValidation(testSheet, 'A2:A10', true);

    const validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    const hasValidation = validation !== null;

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
  const testName = 'Phone Validation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestPhone_' + Date.now());

    testSheet.appendRow(['phone']);
    addPhoneValidation(testSheet, 'A2:A10', false);

    // Check for text format (no actual validation rule, just formatting)
    const numberFormat = testSheet.getRange('A2').getNumberFormat();
    const note = testSheet.getRange('A2').getNote();

    ss.deleteSheet(testSheet);

    const hasTextFormat = numberFormat === '@';
    const hasNote = note.includes('phone number');

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
  const testName = 'Date Validation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestDate_' + Date.now());

    testSheet.appendRow(['date']);
    addDateValidation(testSheet, 'A2:A10', false);

    const validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    const hasValidation = validation !== null;

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
  const testName = 'Time Validation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestTime_' + Date.now());

    testSheet.appendRow(['time']);
    addTimeValidation(testSheet, 'A2:A10');

    const validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    const hasValidation = validation !== null;

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
  const testName = 'Dropdown Validation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestDropdown_' + Date.now());

    testSheet.appendRow(['status']);
    addDropdownValidation(testSheet, 'A2:A10', ['Option1', 'Option2', 'Option3'], 'Select option');

    const validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    const hasValidation = validation !== null;

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
  const testName = 'Number Validation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestNumber_' + Date.now());

    testSheet.appendRow(['duration']);
    addNumberValidation(testSheet, 'A2:A10', 1, 480);

    const validation = testSheet.getRange('A2').getDataValidation();

    ss.deleteSheet(testSheet);

    const hasValidation = validation !== null;

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
  const testName = 'Sample Data Creation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Check if Providers sheet has sample data
    const providersSheet = ss.getSheetByName('Providers');
    if (!providersSheet) {
      return {
        name: testName,
        passed: false,
        message: 'Providers sheet not found - run Initialize System first'
      };
    }

    const providerCount = providersSheet.getLastRow() - 1; // Subtract header row

    // Check if we have at least some data (either sample or real)
    const hasData = providerCount > 0;

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
  const ui = SpreadsheetApp.getUi();

  Logger.log('Running quick smoke tests...');

  const results = [];
  results.push(testSheetCreation());
  results.push(testAutoIncrementFormula());
  results.push(testDropdownValidation());

  displayTestResults(results);
}

/**
 * Test: Business sheets exist and have correct structure
 */
function testBusinessSheetsCreation() {
  const testName = 'Business Sheets Creation';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Check Business_Holidays sheet
    const holidaysSheet = ss.getSheetByName('Business_Holidays');
    if (!holidaysSheet) {
      return { name: testName, passed: false, message: 'Business_Holidays sheet not found' };
    }

    const holidaysHeaders = holidaysSheet.getRange(1, 1, 1, 5).getValues()[0];
    const expectedHolidaysHeaders = ['holiday_id', 'date', 'name', 'recurring', 'notes'];
    if (JSON.stringify(holidaysHeaders) !== JSON.stringify(expectedHolidaysHeaders)) {
      return { name: testName, passed: false, message: `Business_Holidays headers incorrect: ${holidaysHeaders}` };
    }

    // Check Business_Exceptions sheet
    const exceptionsSheet = ss.getSheetByName('Business_Exceptions');
    if (!exceptionsSheet) {
      return { name: testName, passed: false, message: 'Business_Exceptions sheet not found' };
    }

    const exceptionsHeaders = exceptionsSheet.getRange(1, 1, 1, 6).getValues()[0];
    const expectedExceptionsHeaders = ['exception_id', 'date', 'start_time', 'end_time', 'reason', 'notes'];
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  let deletedCount = 0;

  sheets.forEach(sheet => {
    const name = sheet.getName();
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
  const ui = SpreadsheetApp.getUi();

  const confirm = ui.alert(
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
  const calResult = deleteAllProviderCalendars();

  // Clear calendar_event_id from all appointments
  let appointmentsCleared = 0;
  const appointments = getAppointments();
  for (let i = 0; i < appointments.length; i++) {
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
  const ui = SpreadsheetApp.getUi();

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

  const results = [];

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
  const testName = 'Config: getConfig()';

  try {
    // Test getting existing config
    const businessName = getConfig('business_name');

    // Test getting non-existent config with default
    const notFound = getConfig('nonexistent_setting', 'default_value');

    const hasBusinessName = businessName && businessName.length > 0;
    const hasDefault = notFound === 'default_value';

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
  const testName = 'Config: setConfig()';

  try {
    const testKey = 'test_setting_' + Date.now();
    const testValue = 'test_value_123';

    // Set a test config
    const setResult = setConfig(testKey, testValue);

    // Read it back
    invalidateConfigCache();
    const readValue = getConfig(testKey);

    // Clean up - delete the test row
    const sheet = getSheet(CONFIG_SHEET_NAME);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][0] === testKey) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }

    const passed = setResult && readValue === testValue;

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
  const testName = 'Config: getAllConfig()';

  try {
    const config = getAllConfig();

    const isObject = typeof config === 'object';
    const hasKeys = Object.keys(config).length > 0;

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
  const testName = 'Utils: Time conversion';

  try {
    // Test parseTimeToMinutes
    const minutes1 = parseTimeToMinutes('09:30');
    const expected1 = 9 * 60 + 30; // 570

    const minutes2 = parseTimeToMinutes('14:00');
    const expected2 = 14 * 60; // 840

    // Test minutesToTimeString
    const time1 = minutesToTimeString(570);
    const time2 = minutesToTimeString(840);

    const passed = minutes1 === expected1 &&
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
  const testName = 'Utils: Date normalization';

  try {
    // Test 1: Date object created with year, month, day (correct - local timezone)
    const date1 = normalizeDate(new Date(2024, 0, 15)); // Jan 15, 2024

    // Test 2: String input (our fix handles this correctly)
    const date2 = normalizeDate('2024-01-15');

    // Test 3: Date created via parseDateInTimezone (correct way to create from string)
    const date3 = normalizeDate(parseDateInTimezone('2024-01-15'));

    // Note: new Date('2024-01-15') parses as UTC midnight, which shifts to
    // previous day in western timezones. This is a JavaScript pitfall that
    // can't be fixed once the Date object is created. Always use
    // parseDateInTimezone() or new Date(year, month, day) instead.

    const allMatch = date1 === '2024-01-15' &&
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
  const testName = 'Utils: Time range overlap';

  try {
    // Overlapping ranges
    const overlap1 = timeRangesOverlap('09:00', '10:00', '09:30', '10:30'); // true
    const overlap2 = timeRangesOverlap('09:00', '11:00', '10:00', '10:30'); // true

    // Non-overlapping ranges
    const noOverlap1 = timeRangesOverlap('09:00', '10:00', '10:00', '11:00'); // false
    const noOverlap2 = timeRangesOverlap('09:00', '10:00', '11:00', '12:00'); // false

    const passed = overlap1 === true &&
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
  const testName = 'Availability: getProviderAvailability()';

  try {
    // Test with a known provider and date
    const providers = getProviders(true);
    if (providers.length === 0) {
      return { name: testName, passed: false, message: 'No providers found - add sample data first' };
    }

    const providerId = providers[0].provider_id;
    const testDate = addDays(new Date(), 7); // Next week

    const availability = getProviderAvailability(providerId, testDate);

    // Availability should be an array
    const isArray = Array.isArray(availability);

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
  const testName = 'Availability: isSlotAvailable()';

  try {
    const providers = getProviders(true);
    if (providers.length === 0) {
      return { name: testName, passed: false, message: 'No providers found' };
    }

    const providerId = providers[0].provider_id;
    const testDate = addDays(new Date(), 7);

    // This should return a boolean
    const result = isSlotAvailable(providerId, testDate, '10:00', 30);
    const isBoolean = typeof result === 'boolean';

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
  const testName = 'Availability: getAvailableSlots()';

  try {
    const providers = getProviders(true);
    if (providers.length === 0) {
      return { name: testName, passed: false, message: 'No providers found' };
    }

    const providerId = providers[0].provider_id;
    const testDate = addDays(new Date(), 7);

    const slots = getAvailableSlots(providerId, testDate, 30);

    const isArray = Array.isArray(slots);
    const hasCorrectFormat = slots.length === 0 || (slots[0].startTime && slots[0].endTime);

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
  const testName = 'Appointments: Validation';

  try {
    // Test missing fields
    const result1 = validateAppointmentData({});
    const result2 = validateAppointmentData({ clientId: 'CLI001' });

    // Test valid data
    const validData = {
      clientId: 'CLI001',
      providerId: 'PROV001',
      serviceId: 'SERV001',
      date: '2024-12-20',
      startTime: '10:00',
      duration: 30
    };
    const result3 = validateAppointmentData(validData);

    // Test invalid time format
    const invalidTime = { ...validData, startTime: 'invalid' };
    const result4 = validateAppointmentData(invalidTime);

    const passed = !result1.valid &&
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
  const testName = 'Appointments: bookAppointment()';

  try {
    // Test with invalid data - should fail gracefully
    const result1 = bookAppointment({});

    // Test with non-existent client
    const result2 = bookAppointment({
      clientId: 'NONEXISTENT',
      providerId: 'PROV001',
      serviceId: 'SERV001',
      date: normalizeDate(addDays(new Date(), 7)),
      startTime: '10:00',
      duration: 30,
      createCalendarEvent: false
    });

    const failsCorrectly = !result1.success && !result2.success;

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
  const testName = 'DataAccess: getSheetData()';

  try {
    const providers = getSheetData(SHEETS.PROVIDERS);
    const services = getSheetData(SHEETS.SERVICES);

    const providersIsArray = Array.isArray(providers);
    const servicesIsArray = Array.isArray(services);

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
  const testName = 'DataAccess: findRecords()';

  try {
    // Find all active providers
    const activeProviders = findRecords(SHEETS.PROVIDERS, { active_status: 'Active' });

    const isArray = Array.isArray(activeProviders);

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
  const testName = 'ClientManagement: searchClients()';

  try {
    // Test empty search
    const emptyResult = searchClients('');

    // Test search by name (partial match)
    const nameResults = searchClients('john');

    // Test search by phone (if sample data exists)
    const phoneResults = searchClients('555');

    const emptyIsArray = Array.isArray(emptyResult);
    const nameIsArray = Array.isArray(nameResults);
    const phoneIsArray = Array.isArray(phoneResults);

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
  const testName = 'ClientManagement: createClient()';

  try {
    // Test with missing required fields
    const result1 = createClient({});
    const result2 = createClient({ name: 'Test' }); // Missing phone

    // Both should fail
    const failsCorrectly = !result1.success && !result2.success;

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
  const testName = 'ClientManagement: updateClientVisitHistory()';

  try {
    // Test with invalid inputs
    const result1 = updateClientVisitHistory(null, '2025-01-01');
    const result2 = updateClientVisitHistory('CLI999', null);
    const result3 = updateClientVisitHistory('NONEXISTENT', '2025-01-01');

    // All should return false or handle gracefully
    const failsCorrectly = !result1 && !result2 && !result3;

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
  const testName = 'ClientManagement: getClientAppointmentHistory()';

  try {
    // Test with invalid client ID
    const result1 = getClientAppointmentHistory(null);
    const result2 = getClientAppointmentHistory('NONEXISTENT');

    // Both should return empty arrays
    const handlesInvalid = Array.isArray(result1) && result1.length === 0 &&
                           Array.isArray(result2) && result2.length === 0;

    // Test with valid client (if sample data exists)
    const result3 = getClientAppointmentHistory('CLI001');
    const isArray = Array.isArray(result3);

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
  const testName = 'ClientManagement: getClientStats()';

  try {
    // Test with valid client (if exists)
    const stats = getClientStats('CLI001');

    const hasRequiredFields = stats &&
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
  const testName = 'BookingUI: getAvailableTimeSlots()';

  try {
    // Test with missing parameters
    const result1 = getAvailableTimeSlots(null, null, null);
    const result2 = getAvailableTimeSlots('PROV001', null, 30);

    // Should return error for missing params
    const failsCorrectly = !result1.success && !result2.success;

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
  const testName = 'BookingUI: getBookingFormData()';

  try {
    const formData = getBookingFormData();

    const hasProviders = formData && Array.isArray(formData.providers);
    const hasServices = formData && Array.isArray(formData.services);

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
  const ui = SpreadsheetApp.getUi();

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

  const results = [];

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
    throw new Error('Failed to create test appointment: ' + result.message);
  }

  return result.appointment_id;
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

  displayTestResults(results);

  Logger.log('========================================');
  Logger.log('MVP4 Test Suite Complete');
  Logger.log('========================================');
}
