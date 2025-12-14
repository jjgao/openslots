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
  // Accept formats like: 09:00, 9:00, 14:30, 23:59
  const rule = SpreadsheetApp.newDataValidation()
    .requireTextMatchesPattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    .setAllowInvalid(false)
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
  const rule = SpreadsheetApp.newDataValidation()
    .requireTextMatchesPattern('^[\\d\\s\\-\\(\\)\\+]+$')
    .setAllowInvalid(allowBlank !== false)
    .setHelpText('Enter phone number (any format)')
    .build();

  sheet.getRange(range).setDataValidation(rule);
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
  const rule = SpreadsheetApp.newDataValidation()
    .requireTextMatchesPattern(pattern)
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
