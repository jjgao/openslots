/**
 * Appointment Booking System - Data Access Layer
 *
 * Provides standardized functions for reading and writing data to all sheets.
 * This module abstracts sheet operations for easier maintenance and testing.
 */

/**
 * Sheet names as constants
 * @const {Object}
 */
const SHEETS = {
  PROVIDERS: 'Providers',
  SERVICES: 'Services',
  CLIENTS: 'Clients',
  APPOINTMENTS: 'Appointments',
  PROVIDER_AVAILABILITY: 'Provider_Availability',
  PROVIDER_EXCEPTIONS: 'Provider_Exceptions',
  ACTIVITY_LOG: 'Activity_Log',
  CONFIRMATION_TRACKING: 'Confirmation_Tracking',
  SYSTEM_CONFIG: 'System_Config',
  BUSINESS_HOLIDAYS: 'Business_Holidays',
  BUSINESS_EXCEPTIONS: 'Business_Exceptions'
};

/**
 * Column indices for each sheet (0-based)
 * @const {Object}
 */
const COLUMNS = {
  PROVIDERS: {
    ID: 0,
    NAME: 1,
    EMAIL: 2,
    PHONE: 3,
    SERVICES_OFFERED: 4,
    ACTIVE_STATUS: 5
  },
  SERVICES: {
    ID: 0,
    NAME: 1,
    DURATION_OPTIONS: 2,
    DESCRIPTION: 3
  },
  CLIENTS: {
    ID: 0,
    NAME: 1,
    PHONE: 2,
    EMAIL: 3,
    IS_MEMBER: 4,
    NOTES: 5,
    FIRST_VISIT: 6,
    LAST_VISIT: 7
  },
  APPOINTMENTS: {
    ID: 0,
    CLIENT_ID: 1,
    PROVIDER_ID: 2,
    SERVICE_ID: 3,
    DATE: 4,
    START_TIME: 5,
    END_TIME: 6,
    DURATION: 7,
    STATUS: 8,
    CREATED_DATE: 9,
    NOTES: 10,
    CALENDAR_EVENT_ID: 11
  },
  PROVIDER_AVAILABILITY: {
    ID: 0,
    PROVIDER_ID: 1,
    DAY_OF_WEEK: 2,
    START_TIME: 3,
    END_TIME: 4,
    EFFECTIVE_START: 5,
    EFFECTIVE_END: 6,
    IS_RECURRING: 7
  },
  PROVIDER_EXCEPTIONS: {
    ID: 0,
    PROVIDER_ID: 1,
    EXCEPTION_DATE: 2,
    START_TIME: 3,
    END_TIME: 4,
    REASON: 5
  }
};

/**
 * Gets a sheet by name
 * @param {string} sheetName - Name of the sheet
 * @returns {Sheet|null} The sheet object or null if not found
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(sheetName);
}

/**
 * Gets all data from a sheet as an array of objects
 * @param {string} sheetName - Name of the sheet
 * @returns {Array<Object>} Array of row objects with header names as keys
 */
function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) {
    Logger.log(`Sheet not found: ${sheetName}`);
    return [];
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return []; // Only header row
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];

  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    result.push(row);
  }

  return result;
}

/**
 * Gets a record by ID from a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - The ID to search for
 * @returns {Object|null} The row object or null if not found
 */
function getRecordById(sheetName, id) {
  const data = getSheetData(sheetName);
  const idColumn = getIdColumnName(sheetName);

  for (let i = 0; i < data.length; i++) {
    if (data[i][idColumn] === id) {
      return data[i];
    }
  }

  return null;
}

/**
 * Gets the ID column name for a sheet
 * @param {string} sheetName - Name of the sheet
 * @returns {string} The ID column name
 */
function getIdColumnName(sheetName) {
  const idMap = {
    'Providers': 'provider_id',
    'Services': 'service_id',
    'Clients': 'client_id',
    'Appointments': 'appointment_id',
    'Provider_Availability': 'availability_id',
    'Provider_Exceptions': 'exception_id',
    'Activity_Log': 'log_id',
    'Confirmation_Tracking': 'confirmation_id',
    'Business_Holidays': 'holiday_id',
    'Business_Exceptions': 'exception_id'
  };

  return idMap[sheetName] || 'id';
}

/**
 * Finds records matching criteria
 * @param {string} sheetName - Name of the sheet
 * @param {Object} criteria - Object with column names as keys and values to match
 * @returns {Array<Object>} Array of matching row objects
 */
function findRecords(sheetName, criteria) {
  const data = getSheetData(sheetName);
  const results = [];

  for (let i = 0; i < data.length; i++) {
    let matches = true;
    for (const key in criteria) {
      if (data[i][key] !== criteria[key]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      results.push(data[i]);
    }
  }

  return results;
}

/**
 * Adds a new row to a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {Array} rowData - Array of values for the new row (excluding auto-generated ID)
 * @returns {number} The row number of the new record, or -1 if failed
 */
function addRow(sheetName, rowData) {
  try {
    const sheet = getSheet(sheetName);
    if (!sheet) {
      Logger.log(`Sheet not found: ${sheetName}`);
      return -1;
    }

    // Simply use getLastRow() + 1 since we no longer pre-fill formulas
    const newRow = sheet.getLastRow() + 1;

    // Copy the ID formula from row above if it exists
    if (newRow > 2) {
      var formulaCell = sheet.getRange(newRow - 1, 1);
      var formula = formulaCell.getFormula();
      if (formula) {
        sheet.getRange(newRow, 1).setFormula(formula);
      }
    }

    // Start from column B (column 2) - add the data
    sheet.getRange(newRow, 2, 1, rowData.length).setValues([rowData]);

    SpreadsheetApp.flush(); // Ensure formulas recalculate

    Logger.log(`Added row ${newRow} to ${sheetName}`);
    return newRow;

  } catch (error) {
    Logger.log(`Error adding row to ${sheetName}: ${error.toString()}`);
    return -1;
  }
}

/**
 * Updates a cell value in a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {number} rowNum - Row number (1-based)
 * @param {number} colNum - Column number (1-based)
 * @param {*} value - New value
 * @returns {boolean} True if successful
 */
function updateCell(sheetName, rowNum, colNum, value) {
  try {
    const sheet = getSheet(sheetName);
    if (!sheet) {
      return false;
    }

    sheet.getRange(rowNum, colNum).setValue(value);
    return true;

  } catch (error) {
    Logger.log(`Error updating cell: ${error.toString()}`);
    return false;
  }
}

/**
 * Updates a record by ID
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - The ID of the record to update
 * @param {Object} updates - Object with column names as keys and new values
 * @returns {boolean} True if successful
 */
function updateRecordById(sheetName, id, updates) {
  try {
    const sheet = getSheet(sheetName);
    if (!sheet) {
      return false;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColumn = getIdColumnName(sheetName);
    const idColIndex = headers.indexOf(idColumn);

    if (idColIndex === -1) {
      Logger.log(`ID column not found: ${idColumn}`);
      return false;
    }

    // Find the row with matching ID
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColIndex] === id) {
        rowIndex = i + 1; // Convert to 1-based
        break;
      }
    }

    if (rowIndex === -1) {
      Logger.log(`Record not found with ID: ${id}`);
      return false;
    }

    // Update each field
    for (const key in updates) {
      const colIndex = headers.indexOf(key);
      if (colIndex !== -1) {
        sheet.getRange(rowIndex, colIndex + 1).setValue(updates[key]);
      }
    }

    return true;

  } catch (error) {
    Logger.log(`Error updating record: ${error.toString()}`);
    return false;
  }
}

/**
 * Gets the row number for a record by ID
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - The ID to search for
 * @returns {number} Row number (1-based) or -1 if not found
 */
function getRowNumberById(sheetName, id) {
  const sheet = getSheet(sheetName);
  if (!sheet) {
    return -1;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumn = getIdColumnName(sheetName);
  const idColIndex = headers.indexOf(idColumn);

  if (idColIndex === -1) {
    return -1;
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][idColIndex] === id) {
      return i + 1; // Convert to 1-based
    }
  }

  return -1;
}

/**
 * Gets all providers
 * @param {boolean} [activeOnly=false] - If true, only return active providers
 * @returns {Array<Object>} Array of provider objects
 */
function getProviders(activeOnly) {
  const providers = getSheetData(SHEETS.PROVIDERS);

  if (activeOnly) {
    return providers.filter(p => p.active_status === 'Active');
  }

  return providers;
}

/**
 * Gets a provider by ID
 * @param {string} providerId - The provider ID
 * @returns {Object|null} Provider object or null
 */
function getProvider(providerId) {
  return getRecordById(SHEETS.PROVIDERS, providerId);
}

/**
 * Gets all services
 * @returns {Array<Object>} Array of service objects
 */
function getServices() {
  return getSheetData(SHEETS.SERVICES);
}

/**
 * Gets a service by ID
 * @param {string} serviceId - The service ID
 * @returns {Object|null} Service object or null
 */
function getService(serviceId) {
  return getRecordById(SHEETS.SERVICES, serviceId);
}

/**
 * Gets all clients
 * @returns {Array<Object>} Array of client objects
 */
function getClients() {
  return getSheetData(SHEETS.CLIENTS);
}

/**
 * Gets a client by ID
 * @param {string} clientId - The client ID
 * @returns {Object|null} Client object or null
 */
function getClient(clientId) {
  return getRecordById(SHEETS.CLIENTS, clientId);
}

/**
 * Gets all appointments
 * @returns {Array<Object>} Array of appointment objects
 */
function getAppointments() {
  return getSheetData(SHEETS.APPOINTMENTS);
}

/**
 * Gets an appointment by ID
 * @param {string} appointmentId - The appointment ID
 * @returns {Object|null} Appointment object or null
 */
function getAppointment(appointmentId) {
  return getRecordById(SHEETS.APPOINTMENTS, appointmentId);
}

/**
 * Gets appointments for a specific date
 * @param {Date|string} date - The date to filter by
 * @returns {Array<Object>} Array of appointment objects
 */
function getAppointmentsByDate(date) {
  const appointments = getAppointments();
  const targetDate = normalizeDate(date);

  return appointments.filter(apt => {
    const aptDate = normalizeDate(apt.appointment_date);
    return aptDate === targetDate;
  });
}

/**
 * Gets appointments for a provider on a specific date
 * @param {string} providerId - The provider ID
 * @param {Date|string} date - The date to filter by
 * @returns {Array<Object>} Array of appointment objects
 */
function getProviderAppointments(providerId, date) {
  const appointments = getAppointmentsByDate(date);
  return appointments.filter(apt =>
    apt.provider_id === providerId &&
    !['Cancelled', 'No-show'].includes(apt.status)
  );
}

/**
 * Gets provider availability records
 * @param {string} providerId - The provider ID
 * @returns {Array<Object>} Array of availability records
 */
function getProviderAvailabilityRecords(providerId) {
  return findRecords(SHEETS.PROVIDER_AVAILABILITY, { provider_id: providerId });
}

/**
 * Gets provider exceptions for a date
 * @param {string} providerId - The provider ID
 * @param {Date|string} date - The date to check
 * @returns {Array<Object>} Array of exception records
 */
function getProviderExceptionsForDate(providerId, date) {
  const exceptions = getSheetData(SHEETS.PROVIDER_EXCEPTIONS);
  const targetDate = normalizeDate(date);

  return exceptions.filter(exc =>
    exc.provider_id === providerId &&
    normalizeDate(exc.exception_date) === targetDate
  );
}

/**
 * Gets business holidays
 * @returns {Array<Object>} Array of holiday records
 */
function getBusinessHolidays() {
  return getSheetData(SHEETS.BUSINESS_HOLIDAYS);
}

/**
 * Gets business exceptions for a date
 * @param {Date|string} date - The date to check
 * @returns {Array<Object>} Array of exception records
 */
function getBusinessExceptionsForDate(date) {
  const exceptions = getSheetData(SHEETS.BUSINESS_EXCEPTIONS);
  const targetDate = normalizeDate(date);

  return exceptions.filter(exc => normalizeDate(exc.date) === targetDate);
}

/**
 * Checks if a date is a business holiday
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if it's a holiday
 */
function isBusinessHoliday(date) {
  const holidays = getBusinessHolidays();
  const targetDate = normalizeDate(date);
  // Parse date in timezone to get correct month/day
  const parsedDate = typeof date === 'string' ? parseDateInTimezone(date) : date;
  const targetMonth = parsedDate.getMonth();
  const targetDay = parsedDate.getDate();

  for (let i = 0; i < holidays.length; i++) {
    const holiday = holidays[i];
    const holidayDate = typeof holiday.date === 'string'
      ? parseDateInTimezone(holiday.date)
      : holiday.date;

    // For recurring holidays, check month and day
    if (holiday.recurring === 'Yes') {
      if (holidayDate.getMonth() === targetMonth &&
          holidayDate.getDate() === targetDay) {
        return true;
      }
    } else {
      // For non-recurring, check exact date
      if (normalizeDate(holiday.date) === targetDate) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Normalizes a date to YYYY-MM-DD string format
 * Uses timezone-aware parsing to avoid date shifting issues.
 * @param {Date|string} date - The date to normalize
 * @returns {string} Date in YYYY-MM-DD format
 */
function normalizeDate(date) {
  if (!date) {
    return '';
  }

  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      return date.trim();
    }
    // Parse in timezone to avoid UTC midnight shift
    date = parseDateInTimezone(date);
    if (isNaN(date.getTime())) {
      return ''; // Return empty if can't parse
    }
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Gets the generated ID from the last added row
 * @param {string} sheetName - Name of the sheet
 * @param {number} rowNum - Row number to get ID from
 * @returns {string|null} The generated ID or null
 */
function getGeneratedId(sheetName, rowNum) {
  try {
    const sheet = getSheet(sheetName);
    if (!sheet) {
      return null;
    }

    SpreadsheetApp.flush(); // Ensure formula has calculated

    // Retry up to 5 times with delays to let formula calculate
    var maxRetries = 5;
    for (var i = 0; i < maxRetries; i++) {
      var id = sheet.getRange(rowNum, 1).getValue();
      if (id) {
        return id;
      }
      // Wait longer on each retry
      Utilities.sleep(300 * (i + 1));
      SpreadsheetApp.flush();
    }

    // If still no ID, manually generate one as fallback
    Logger.log('Warning: ID not generated by formula for row ' + rowNum + ', generating manually');

    // Get prefix from sheet name
    var prefix = getIdPrefix(sheetName);
    var manualId = prefix + padNumber(rowNum - 1, 3);

    // Set it manually
    sheet.getRange(rowNum, 1).setValue(manualId);

    return manualId;

  } catch (error) {
    Logger.log(`Error getting generated ID: ${error.toString()}`);
    return null;
  }
}

/**
 * Gets ID prefix for a sheet
 * @param {string} sheetName - Name of the sheet
 * @returns {string} ID prefix
 */
function getIdPrefix(sheetName) {
  var prefixMap = {
    'Providers': 'PROV',
    'Services': 'SERV',
    'Clients': 'CLI',
    'Appointments': 'APT',
    'Provider_Availability': 'AVAIL',
    'Provider_Exceptions': 'EXC',
    'Activity_Log': 'LOG',
    'Confirmation_Tracking': 'CONF',
    'Business_Holidays': 'HOL',
    'Business_Exceptions': 'BEXC'
  };
  return prefixMap[sheetName] || 'ID';
}

/**
 * Pads a number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} size - Total size
 * @returns {string} Padded string
 */
function padNumber(num, size) {
  var s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}
