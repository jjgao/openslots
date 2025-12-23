/**
 * Appointment Booking System - Configuration Module
 *
 * Provides functions to read and manage system configuration from System_Config sheet.
 * Configuration values are cached in memory for performance.
 */

/**
 * Configuration cache to avoid repeated sheet reads
 * @type {Object|null}
 */
var configCache_ = null;

/**
 * Timestamp of when config was last loaded
 * @type {number}
 */
var configCacheTime_ = 0;

/**
 * Cache duration in milliseconds (5 minutes)
 * @const {number}
 */
var CONFIG_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Sheet name for system configuration
 * @const {string}
 */
var CONFIG_SHEET_NAME = 'System_Config';

/**
 * Default configuration values used when settings are not found
 * @const {Object}
 */
var DEFAULT_CONFIG = {
  'business_name': 'OpenSlots Appointment Center',
  'business_hours_start': '09:00',
  'business_hours_end': '17:00',
  'business_days': 'Monday,Tuesday,Wednesday,Thursday,Friday',
  'default_appointment_duration': '30',
  'appointment_slot_increment': '15',
  'timezone': 'America/New_York',
  'enable_email_notifications': 'No',
  'enable_sms_notifications': 'No',
  'max_advance_booking_days': '90',
  'min_cancellation_notice_hours': '24',
  'late_arrival_threshold_minutes': '15',
  'calendar_color_booked': '9',
  'calendar_color_confirmed': '10',
  'calendar_color_checked_in': '5',
  'calendar_color_completed': '2',
  'calendar_color_cancelled': '11',
  'calendar_color_no_show': '6'
};

/**
 * Gets a single configuration value by name
 * @param {string} settingName - The name of the setting to retrieve
 * @param {*} [defaultValue] - Optional default value if setting not found
 * @returns {string} The setting value, default value, or empty string
 */
function getConfig(settingName, defaultValue) {
  var config = getAllConfig();

  if (config.hasOwnProperty(settingName)) {
    return config[settingName];
  }

  // Return provided default, or check DEFAULT_CONFIG, or empty string
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  if (DEFAULT_CONFIG.hasOwnProperty(settingName)) {
    return DEFAULT_CONFIG[settingName];
  }

  return '';
}

/**
 * Sets a configuration value
 * @param {string} settingName - The name of the setting to update
 * @param {string} settingValue - The new value for the setting
 * @returns {boolean} True if successful, false otherwise
 */
function setConfig(settingName, settingValue) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);

    if (!sheet) {
      Logger.log('Error: System_Config sheet not found');
      return false;
    }

    // Get all data to find if setting exists
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;

    // Skip header row (index 0)
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === settingName) {
        rowIndex = i + 1; // Convert to 1-based row number
        break;
      }
    }

    if (rowIndex > 0) {
      // Update existing setting
      sheet.getRange(rowIndex, 2).setValue(settingValue);
    } else {
      // Add new setting
      var newRow = sheet.getLastRow() + 1;
      sheet.getRange(newRow, 1, 1, 2).setValues([[settingName, settingValue]]);
    }

    // Invalidate cache
    invalidateConfigCache();

    Logger.log(`Config updated: ${settingName} = ${settingValue}`);
    return true;

  } catch (error) {
    Logger.log(`Error setting config: ${error.toString()}`);
    return false;
  }
}

/**
 * Gets all configuration settings as an object
 * Uses caching for performance
 * @returns {Object} Object with setting names as keys and values
 */
function getAllConfig() {
  var now = Date.now();

  // Return cached config if still valid
  if (configCache_ && (now - configCacheTime_) < CONFIG_CACHE_DURATION) {
    return configCache_;
  }

  // Load fresh config from sheet
  configCache_ = loadConfigFromSheet_();
  configCacheTime_ = now;

  return configCache_;
}

/**
 * Loads configuration from the System_Config sheet
 * @private
 * @returns {Object} Configuration object
 */
function loadConfigFromSheet_() {
  var config = {};

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);

    if (!sheet) {
      Logger.log('Warning: System_Config sheet not found, using defaults');
      return Object.assign({}, DEFAULT_CONFIG);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      // Only header row, no data
      Logger.log('Warning: System_Config sheet is empty, using defaults');
      return Object.assign({}, DEFAULT_CONFIG);
    }

    // Get all data (skip header row)
    var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();

    for (var i = 0; i < data.length; i++) {
      var name = data[i][0];
      var value = data[i][1];

      if (name && name.toString().trim() !== '') {
        config[name.toString().trim()] = value !== null && value !== undefined
          ? value.toString()
          : '';
      }
    }

    Logger.log(`Loaded ${Object.keys(config).length} config settings from sheet`);

  } catch (error) {
    Logger.log(`Error loading config: ${error.toString()}`);
    return Object.assign({}, DEFAULT_CONFIG);
  }

  return config;
}

/**
 * Invalidates the configuration cache, forcing a reload on next access
 */
function invalidateConfigCache() {
  configCache_ = null;
  configCacheTime_ = 0;
}

/**
 * Gets business days as an array
 * @returns {Array<string>} Array of day names
 */
function getBusinessDays() {
  var days = getConfig('business_days');
  return days.split(',').map(d => d.trim());
}

/**
 * Gets business hours as an object
 * @returns {Object} Object with start and end times
 */
function getBusinessHours() {
  return {
    start: getConfig('business_hours_start'),
    end: getConfig('business_hours_end')
  };
}

/**
 * Checks if a given day is a business day
 * @param {string} dayName - Day name (e.g., 'Monday')
 * @returns {boolean} True if business day
 */
function isBusinessDay(dayName) {
  var businessDays = getBusinessDays();
  return businessDays.includes(dayName);
}

/**
 * Gets the appointment slot increment in minutes
 * @returns {number} Slot increment in minutes
 */
function getSlotIncrement() {
  return parseInt(getConfig('appointment_slot_increment'), 10) || 15;
}

/**
 * Gets the default appointment duration in minutes
 * @returns {number} Default duration in minutes
 */
function getDefaultDuration() {
  return parseInt(getConfig('default_appointment_duration'), 10) || 30;
}

/**
 * Gets the maximum advance booking days
 * @returns {number} Maximum days in advance that appointments can be booked
 */
function getMaxAdvanceBookingDays() {
  return parseInt(getConfig('max_advance_booking_days'), 10) || 90;
}

/**
 * Gets the minimum cancellation notice hours
 * @returns {number} Minimum hours notice required for cancellation
 */
function getMinCancellationNoticeHours() {
  return parseInt(getConfig('min_cancellation_notice_hours'), 10) || 24;
}

/**
 * Gets the calendar event color for a given status
 * @param {string} status - Appointment status
 * @returns {string} Calendar color ID
 */
function getCalendarColorForStatus(status) {
  var colorKey = `calendar_color_${status.toLowerCase().replace('-', '_')}`;
  return getConfig(colorKey, '9'); // Default to blue
}
