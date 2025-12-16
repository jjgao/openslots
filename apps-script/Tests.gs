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
