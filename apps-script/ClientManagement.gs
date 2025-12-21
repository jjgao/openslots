/**
 * Appointment Booking System - Client Management
 *
 * Provides functions for searching, creating, and managing clients.
 * Part of MVP 3: Client Management + Booking UI
 */

/**
 * Searches for clients by name or phone
 * @param {string} searchTerm - Search term (name or phone)
 * @returns {Array<Object>} Array of matching client objects
 */
function searchClients(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }

  const clients = getClients();
  const term = searchTerm.trim().toLowerCase();
  const results = [];

  for (var i = 0; i < clients.length; i++) {
    var client = clients[i];

    // Skip if client_id is empty (incomplete rows)
    if (!client.client_id) {
      continue;
    }

    var name = (client.name || '').toLowerCase();
    var phone = normalizePhoneForSearch(client.phone || '');
    var searchPhone = normalizePhoneForSearch(term);

    // Match by name (contains) or phone (exact or partial match)
    if (name.indexOf(term) !== -1 ||
        (searchPhone && phone.indexOf(searchPhone) !== -1)) {
      results.push(client);
    }
  }

  return results;
}

/**
 * Normalizes phone number for searching (removes formatting)
 * @param {string} phone - Phone number to normalize
 * @returns {string} Phone with only digits
 */
function normalizePhoneForSearch(phone) {
  if (!phone) {
    return '';
  }
  return phone.replace(/\D/g, ''); // Remove all non-digits
}

/**
 * Creates a new client
 * @param {Object} clientData - Client data object
 * @param {string} clientData.name - Client name (required)
 * @param {string} clientData.phone - Client phone (required)
 * @param {string} [clientData.email] - Client email (optional)
 * @param {string} [clientData.notes] - Client notes (optional)
 * @returns {Object} Result object with success status and client_id or error
 */
function createClient(clientData) {
  // Validate required fields
  if (!clientData.name || clientData.name.trim() === '') {
    return {
      success: false,
      error: 'Client name is required'
    };
  }

  if (!clientData.phone || clientData.phone.trim() === '') {
    return {
      success: false,
      error: 'Client phone is required'
    };
  }

  // Check if client already exists
  var existingClients = searchClients(clientData.phone);
  if (existingClients.length > 0) {
    return {
      success: false,
      error: 'Client with this phone number already exists',
      existingClient: existingClients[0]
    };
  }

  // Prepare row data (excluding auto-generated ID in column A)
  var rowData = [
    clientData.name.trim(),           // name
    clientData.phone.trim(),           // phone
    clientData.email ? clientData.email.trim() : '',  // email
    clientData.notes ? clientData.notes.trim() : '',  // notes
    '',                                // first_visit (will be set on first appointment)
    ''                                 // last_visit (will be set on appointments)
  ];

  // Add row to Clients sheet
  var rowNum = addRow(SHEETS.CLIENTS, rowData);

  if (rowNum === -1) {
    return {
      success: false,
      error: 'Failed to add client to sheet'
    };
  }

  // Get the auto-generated client ID
  SpreadsheetApp.flush();
  Utilities.sleep(500); // Small delay to ensure formula calculation
  var clientId = getGeneratedId(SHEETS.CLIENTS, rowNum);

  if (!clientId) {
    return {
      success: false,
      error: 'Failed to generate client ID'
    };
  }

  // Log the action
  logActivity('CLIENT_CREATED', 'Client', clientId,
    'Created new client: ' + clientData.name);

  return {
    success: true,
    client_id: clientId,
    message: 'Client created successfully'
  };
}

/**
 * Gets client by phone number (exact match)
 * @param {string} phone - Phone number to search for
 * @returns {Object|null} Client object or null if not found
 */
function getClientByPhone(phone) {
  if (!phone) {
    return null;
  }

  var clients = getClients();
  var searchPhone = normalizePhoneForSearch(phone);

  for (var i = 0; i < clients.length; i++) {
    var client = clients[i];
    if (client.client_id &&
        normalizePhoneForSearch(client.phone) === searchPhone) {
      return client;
    }
  }

  return null;
}

/**
 * Updates client information
 * @param {string} clientId - Client ID to update
 * @param {Object} updates - Fields to update
 * @returns {Object} Result object with success status
 */
function updateClient(clientId, updates) {
  if (!clientId) {
    return {
      success: false,
      error: 'Client ID is required'
    };
  }

  var client = getClient(clientId);
  if (!client) {
    return {
      success: false,
      error: 'Client not found'
    };
  }

  // Prepare update object with proper column names
  var updateData = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  var success = updateRecordById(SHEETS.CLIENTS, clientId, updateData);

  if (success) {
    logActivity('CLIENT_UPDATED', 'Client', clientId,
      'Updated client: ' + client.name);

    return {
      success: true,
      message: 'Client updated successfully'
    };
  } else {
    return {
      success: false,
      error: 'Failed to update client'
    };
  }
}

/**
 * Updates client visit history (first_visit and last_visit)
 * This is called automatically when appointments are created
 * @param {string} clientId - Client ID
 * @param {Date|string} appointmentDate - Date of the appointment
 * @returns {boolean} True if successful
 */
function updateClientVisitHistory(clientId, appointmentDate) {
  if (!clientId || !appointmentDate) {
    return false;
  }

  var client = getClient(clientId);
  if (!client) {
    return false;
  }

  var dateStr = normalizeDate(appointmentDate);
  var updates = {};

  // Set first_visit if not already set
  if (!client.first_visit) {
    updates.first_visit = dateStr;
  }

  // Always update last_visit to the most recent appointment
  // Compare dates to ensure we're setting the latest
  if (!client.last_visit || dateStr > normalizeDate(client.last_visit)) {
    updates.last_visit = dateStr;
  }

  if (Object.keys(updates).length > 0) {
    return updateRecordById(SHEETS.CLIENTS, clientId, updates);
  }

  return true; // No updates needed
}

/**
 * Gets client appointment history
 * @param {string} clientId - Client ID
 * @returns {Array<Object>} Array of appointment objects for this client
 */
function getClientAppointmentHistory(clientId) {
  if (!clientId) {
    return [];
  }

  var appointments = getAppointments();
  var clientAppointments = [];

  for (var i = 0; i < appointments.length; i++) {
    if (appointments[i].client_id === clientId) {
      clientAppointments.push(appointments[i]);
    }
  }

  // Sort by date descending (most recent first)
  clientAppointments.sort(function(a, b) {
    var dateA = normalizeDate(a.appointment_date);
    var dateB = normalizeDate(b.appointment_date);
    return dateB.localeCompare(dateA);
  });

  return clientAppointments;
}

/**
 * Gets client statistics
 * @param {string} clientId - Client ID
 * @returns {Object} Statistics object with counts and dates
 */
function getClientStats(clientId) {
  var appointments = getClientAppointmentHistory(clientId);

  var stats = {
    total_appointments: appointments.length,
    completed: 0,
    cancelled: 0,
    no_shows: 0,
    upcoming: 0
  };

  var today = normalizeDate(new Date());

  for (var i = 0; i < appointments.length; i++) {
    var apt = appointments[i];
    var status = apt.status;
    var aptDate = normalizeDate(apt.appointment_date);

    if (status === 'Completed' || status === 'Checked-in') {
      stats.completed++;
    } else if (status === 'Cancelled') {
      stats.cancelled++;
    } else if (status === 'No-show') {
      stats.no_shows++;
    } else if (aptDate >= today) {
      stats.upcoming++;
    }
  }

  return stats;
}
