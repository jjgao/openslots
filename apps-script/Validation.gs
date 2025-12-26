/**
 * Appointment Booking System - Data Validation Helpers
 *
 * Reusable functions for adding data validation rules to sheets
 */

/**
 * Adds a dropdown validation rule to a range
 * @param {Sheet} sheet - The sheet to add validation to
 * @param {string} range - Range in A1 notation (e.g., 'F2:F1000')
 * @param {Array<string>} options - Array of dropdown options
 * @param {string} helpText - Optional help text shown on hover
 */
function addDropdownValidation(sheet, range, options, helpText) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options)
    .setAllowInvalid(false)
    .setHelpText(helpText || 'Select a value from the list')
    .build();

  sheet.getRange(range).setDataValidation(rule);
}

/**
 * Adds email validation to a range
 * @param {Sheet} sheet - The sheet to add validation to
 * @param {string} range - Range in A1 notation
 * @param {boolean} allowBlank - Whether to allow blank values (default: true)
 */
function addEmailValidation(sheet, range, allowBlank) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireTextIsEmail()
    .setAllowInvalid(allowBlank !== false)  // Default to true if not specified
    .setHelpText('Please enter a valid email address')
    .build();

  sheet.getRange(range).setDataValidation(rule);
}

/**
 * Adds date validation to a range
 * @param {Sheet} sheet - The sheet to add validation to
 * @param {string} range - Range in A1 notation
 * @param {boolean} allowBlank - Whether to allow blank values (default: true)
 */
function addDateValidation(sheet, range, allowBlank) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireDate()
    .setAllowInvalid(allowBlank !== false)
    .setHelpText('Please enter a valid date')
    .build();

  sheet.getRange(range).setDataValidation(rule);
}

/**
 * Adds time validation to a range (HH:MM format)
 * @param {Sheet} sheet - The sheet to add validation to
 * @param {string} range - Range in A1 notation
 */
function addTimeValidation(sheet, range) {
  // Simple validation: just require text contains ":"
  // This provides helpful hint without blocking valid time entries
  var rule = SpreadsheetApp.newDataValidation()
    .requireTextContains(':')
    .setAllowInvalid(true)  // Show warning but allow entry
    .setHelpText('Format: HH:MM (e.g., 09:00, 14:30)')
    .build();

  sheet.getRange(range).setDataValidation(rule);
}

/**
 * Adds phone number validation to a range
 * Accepts various phone formats: (555) 123-4567, 555-123-4567, 5551234567, +1-555-123-4567
 * @param {Sheet} sheet - The sheet to add validation to
 * @param {string} range - Range in A1 notation
 * @param {boolean} allowBlank - Whether to allow blank values (default: true)
 */
function addPhoneValidation(sheet, range, allowBlank) {
  // No strict validation - just set number format and help text
  // This avoids validation errors while still providing guidance
  sheet.getRange(range).setNumberFormat('@');  // Text format
  sheet.getRange(range).setNote('Enter phone number (any format)');

  // Note: We don't add actual validation to avoid blocking valid phone formats
}

/**
 * Adds number validation to a range
 * @param {Sheet} sheet - The sheet to add validation to
 * @param {string} range - Range in A1 notation
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 */
function addNumberValidation(sheet, range, min, max) {
  var rule = SpreadsheetApp.newDataValidation().requireNumberBetween(
    min !== undefined ? min : Number.MIN_SAFE_INTEGER,
    max !== undefined ? max : Number.MAX_SAFE_INTEGER
  );

  var helpText = 'Enter a number';
  if (min !== undefined && max !== undefined) {
    helpText = `Enter a number between ${min} and ${max}`;
  } else if (min !== undefined) {
    helpText = `Enter a number >= ${min}`;
  } else if (max !== undefined) {
    helpText = `Enter a number <= ${max}`;
  }

  rule = rule.setAllowInvalid(false).setHelpText(helpText).build();

  sheet.getRange(range).setDataValidation(rule);
}

/**
 * Adds text pattern validation
 * @param {Sheet} sheet - The sheet to add validation to
 * @param {string} range - Range in A1 notation
 * @param {string} pattern - Regular expression pattern
 * @param {string} helpText - Help text to display
 */
function addTextPatternValidation(sheet, range, pattern, helpText) {
  // Using custom formula with REGEXMATCH
  var firstCell = range.split(':')[0];
  var formula = `=REGEXMATCH(TO_TEXT(${firstCell}), "${pattern}")`;

  var rule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied(formula)
    .setAllowInvalid(false)
    .setHelpText(helpText)
    .build();

  sheet.getRange(range).setDataValidation(rule);
}

/**
 * Adds validation requiring text contains specific value
 * @param {Sheet} sheet - The sheet to add validation to
 * @param {string} range - Range in A1 notation
 * @param {string} text - Text that must be contained
 */
function addTextContainsValidation(sheet, range, text) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireTextContains(text)
    .setAllowInvalid(false)
    .setHelpText(`Must contain: ${text}`)
    .build();

  sheet.getRange(range).setDataValidation(rule);
}

/**
 * Clears all validation from a range
 * @param {Sheet} sheet - The sheet to clear validation from
 * @param {string} range - Range in A1 notation
 */
function clearValidation(sheet, range) {
  sheet.getRange(range).clearDataValidations();
}

/**
 * Helper function to convert column number to letter (A, B, C, etc.)
 * @param {number} column - Column number (1-based)
 * @return {string} Column letter
 */
function columnToLetter(column) {
  var temp;
  var letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

/**
 * Validates all system data and reports issues
 * This function checks:
 * - Sheet structures (correct columns)
 * - Data integrity (no missing references)
 * - Column naming consistency
 */
function validateSystemData() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var issues = [];

  ui.alert(
    'Validating Data',
    'Checking system data integrity...\n\nThis may take a few seconds.',
    ui.ButtonSet.OK
  );

  // Expected sheet structures
  var expectedStructures = {
    'Providers': ['provider_id', 'name', 'email', 'phone', 'services_offered', 'active_status', 'calendar_id'],
    'Services': ['service_id', 'name', 'default_duration_options', 'description'],
    'Clients': ['client_id', 'name', 'phone', 'email', 'notes', 'first_visit_date', 'last_visit_date'],
    'Appointments': ['appointment_id', 'client_id', 'provider_id', 'service_id', 'appointment_date', 'start_time', 'end_time', 'duration', 'status', 'created_date', 'notes', 'calendar_event_id']
  };

  // Check 1: Verify sheet structures
  for (var sheetName in expectedStructures) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      issues.push('CRITICAL: Sheet "' + sheetName + '" not found');
      continue;
    }

    var headers = sheet.getRange(1, 1, 1, expectedStructures[sheetName].length).getValues()[0];
    var expectedHeaders = expectedStructures[sheetName];

    for (var i = 0; i < expectedHeaders.length; i++) {
      if (headers[i] !== expectedHeaders[i]) {
        issues.push('Sheet "' + sheetName + '" column ' + (i + 1) + ': Expected "' + expectedHeaders[i] + '" but found "' + headers[i] + '"');
      }
    }
  }

  // Check 2: Verify Services sheet has 'name' column (not 'service_name')
  var servicesSheet = ss.getSheetByName('Services');
  if (servicesSheet) {
    var servicesHeaders = servicesSheet.getRange(1, 1, 1, 4).getValues()[0];
    if (servicesHeaders[1] !== 'name') {
      issues.push('CRITICAL: Services sheet column 2 should be "name" but is "' + servicesHeaders[1] + '"');
    }
  }

  // Check 3: Verify data integrity - all services have names
  try {
    var services = getServices();
    for (var i = 0; i < services.length; i++) {
      var service = services[i];
      if (!service.name || service.name === '') {
        issues.push('Service ' + service.service_id + ' has no name (row ' + (i + 2) + ')');
      }
      if (!service.service_id || service.service_id === '') {
        issues.push('Service at row ' + (i + 2) + ' has no ID');
      }
    }
  } catch (error) {
    issues.push('ERROR reading Services: ' + error.toString());
  }

  // Check 4: Verify appointments reference valid services
  try {
    var appointments = getAppointments();
    var serviceIds = {};
    var services = getServices();
    for (var i = 0; i < services.length; i++) {
      serviceIds[services[i].service_id] = true;
    }

    for (var i = 0; i < appointments.length; i++) {
      var apt = appointments[i];
      if (!serviceIds[apt.service_id]) {
        issues.push('Appointment ' + apt.appointment_id + ' references invalid service "' + apt.service_id + '"');
      }
    }
  } catch (error) {
    issues.push('ERROR checking appointment references: ' + error.toString());
  }

  // Check 5: Verify clients are referenced correctly
  try {
    var appointments = getAppointments();
    var clientIds = {};
    var clients = getClients();
    for (var i = 0; i < clients.length; i++) {
      clientIds[clients[i].client_id] = true;
    }

    for (var i = 0; i < appointments.length; i++) {
      var apt = appointments[i];
      if (!clientIds[apt.client_id]) {
        issues.push('Appointment ' + apt.appointment_id + ' references invalid client "' + apt.client_id + '"');
      }
    }
  } catch (error) {
    issues.push('ERROR checking client references: ' + error.toString());
  }

  // Check 6: Verify providers are referenced correctly
  try {
    var appointments = getAppointments();
    var providerIds = {};
    var providers = getProviders();
    for (var i = 0; i < providers.length; i++) {
      providerIds[providers[i].provider_id] = true;
    }

    for (var i = 0; i < appointments.length; i++) {
      var apt = appointments[i];
      if (!providerIds[apt.provider_id]) {
        issues.push('Appointment ' + apt.appointment_id + ' references invalid provider "' + apt.provider_id + '"');
      }
    }
  } catch (error) {
    issues.push('ERROR checking provider references: ' + error.toString());
  }

  // Report results
  if (issues.length === 0) {
    ui.alert(
      'Validation Complete',
      '✅ All data is valid!\n\n' +
      'All sheets have correct structure and all references are valid.',
      ui.ButtonSet.OK
    );
  } else {
    var message = '❌ Found ' + issues.length + ' issue(s):\n\n';

    // Show first 10 issues
    var displayIssues = issues.slice(0, 10);
    for (var i = 0; i < displayIssues.length; i++) {
      message += (i + 1) + '. ' + displayIssues[i] + '\n';
    }

    if (issues.length > 10) {
      message += '\n... and ' + (issues.length - 10) + ' more issues.';
    }

    message += '\n\nCheck Apps Script logs for full details.';

    // Log all issues
    Logger.log('=== DATA VALIDATION ISSUES ===');
    for (var i = 0; i < issues.length; i++) {
      Logger.log((i + 1) + '. ' + issues[i]);
    }
    Logger.log('=== END VALIDATION ===');

    ui.alert(
      'Validation Failed',
      message,
      ui.ButtonSet.OK
    );
  }
}
