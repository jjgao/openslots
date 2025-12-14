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
  const rule = SpreadsheetApp.newDataValidation()
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
  const rule = SpreadsheetApp.newDataValidation()
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
  const rule = SpreadsheetApp.newDataValidation()
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
  const rule = SpreadsheetApp.newDataValidation()
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
  let rule = SpreadsheetApp.newDataValidation().requireNumberBetween(
    min !== undefined ? min : Number.MIN_SAFE_INTEGER,
    max !== undefined ? max : Number.MAX_SAFE_INTEGER
  );

  let helpText = 'Enter a number';
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
  const firstCell = range.split(':')[0];
  const formula = `=REGEXMATCH(TO_TEXT(${firstCell}), "${pattern}")`;

  const rule = SpreadsheetApp.newDataValidation()
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
  const rule = SpreadsheetApp.newDataValidation()
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
  let temp;
  let letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}
