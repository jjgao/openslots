/**
 * Appointment Booking System - Booking UI
 *
 * Provides sidebar UI for easy appointment booking.
 * Part of MVP 3: Client Management + Booking UI
 */

/**
 * Shows the booking sidebar
 */
function showBookingSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('BookingSidebar')
    .setTitle('Book Appointment')
    .setWidth(400);

  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Shows the appointment management sidebar
 */
function showAppointmentManagementSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('AppointmentManagementSidebar')
    .setTitle('Manage Appointments')
    .setWidth(400);

  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Gets data for booking form (providers, services)
 * @returns {Object} Form data with providers and services
 */
function getBookingFormData() {
  var providers = getProviders(true); // Active only
  var services = getServices();

  return {
    providers: providers,
    services: services
  };
}

/**
 * Searches for clients (called from UI)
 * @param {string} searchTerm - Search term
 * @returns {Array<Object>} Array of matching clients
 */
function searchClientsForUI(searchTerm) {
  return searchClients(searchTerm);
}

/**
 * Creates a new client from the UI
 * @param {Object} clientData - Client data
 * @returns {Object} Result with success status and client info
 */
function createClientFromUI(clientData) {
  return createClient(clientData);
}

/**
 * Gets available time slots for a provider on a date
 * @param {string} providerId - Provider ID
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} duration - Appointment duration in minutes
 * @returns {Object} Result with available slots or error
 */
function getAvailableTimeSlots(providerId, dateStr, duration) {
  if (!providerId || !dateStr || !duration) {
    return {
      success: false,
      error: 'Provider, date, and duration are required'
    };
  }

  try {
    var date = parseDateInTimezone(dateStr);

    // Get available time windows for this provider on this date
    // This already subtracts holidays, exceptions, and existing appointments
    var timeBlocks = getProviderAvailability(providerId, date);

    if (timeBlocks.length === 0) {
      return {
        success: false,
        error: 'Provider not available on this date (may be holiday, day off, or fully booked)'
      };
    }

    // Generate available slots from time blocks
    // Note: getProviderAvailability already subtracts existing appointments,
    // so we pass empty array for existingAppointments
    var slots = generateTimeSlots(timeBlocks, [], duration, date);

    if (slots.length === 0) {
      return {
        success: false,
        error: 'No available time slots for this duration on this date'
      };
    }

    return {
      success: true,
      slots: slots,
      timeBlocks: timeBlocks
    };

  } catch (error) {
    Logger.log('Error getting available time slots: ' + error.toString());
    return {
      success: false,
      error: 'Error calculating available slots: ' + error.message
    };
  }
}

/**
 * Generates time slots from available time blocks
 * @param {Array<Object>} timeBlocks - Available time blocks
 * @param {Array<Object>} existingAppointments - Existing appointments
 * @param {number} duration - Desired duration in minutes
 * @param {Date} date - The appointment date
 * @returns {Array<string>} Array of available time slots in HH:MM format
 */
function generateTimeSlots(timeBlocks, existingAppointments, duration, date) {
  var slots = [];
  var slotInterval = 30; // Generate slots every 30 minutes

  // Check if the date is today - if so, filter out past times
  var now = new Date();
  var isToday = date &&
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate();

  var currentMinutes = isToday ? (now.getHours() * 60 + now.getMinutes()) : 0;

  for (var i = 0; i < timeBlocks.length; i++) {
    var block = timeBlocks[i];
    // Note: block.start and block.end are already in minutes (from getProviderAvailability)
    var startMinutes = typeof block.start === 'number' ? block.start : timeToMinutes(block.start);
    var endMinutes = typeof block.end === 'number' ? block.end : timeToMinutes(block.end);

    // Generate slots within this time block
    for (var minutes = startMinutes; minutes + duration <= endMinutes; minutes += slotInterval) {
      // Skip past time slots if booking for today
      if (isToday && minutes <= currentMinutes) {
        continue;
      }

      var slotTime = minutesToTime(minutes);

      // Check if this slot conflicts with existing appointments
      if (!hasConflict(slotTime, duration, existingAppointments)) {
        slots.push(slotTime);
      }
    }
  }

  return slots;
}

/**
 * Converts time string to minutes since midnight
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(timeStr) {
  var parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/**
 * Converts minutes since midnight to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
function minutesToTime(minutes) {
  var hours = Math.floor(minutes / 60);
  var mins = minutes % 60;
  return padZero(hours) + ':' + padZero(mins);
}

/**
 * Pads single digit with leading zero
 * @param {number} num - Number to pad
 * @returns {string} Padded string
 */
function padZero(num) {
  return num < 10 ? '0' + num : '' + num;
}

/**
 * Checks if a time slot conflicts with existing appointments
 * @param {string} slotTime - Start time of slot in HH:MM
 * @param {number} duration - Duration in minutes
 * @param {Array<Object>} appointments - Existing appointments
 * @returns {boolean} True if there's a conflict
 */
function hasConflict(slotTime, duration, appointments) {
  var slotStart = timeToMinutes(slotTime);
  var slotEnd = slotStart + duration;

  for (var i = 0; i < appointments.length; i++) {
    var apt = appointments[i];

    // Skip cancelled or no-show appointments
    if (apt.status === 'Cancelled' || apt.status === 'No-show') {
      continue;
    }

    var aptStart = timeToMinutes(apt.start_time);
    var aptEnd = timeToMinutes(apt.end_time);

    // Check for overlap
    if (slotStart < aptEnd && slotEnd > aptStart) {
      return true; // Conflict found
    }
  }

  return false; // No conflict
}

/**
 * Books an appointment from the UI
 * @param {Object} bookingData - Booking data
 * @returns {Object} Result with success status and appointment info
 */
function bookAppointmentFromUI(bookingData) {
  try {
    // Validate required fields
    if (!bookingData.clientId || !bookingData.providerId ||
        !bookingData.serviceId || !bookingData.duration ||
        !bookingData.date || !bookingData.startTime) {
      return {
        success: false,
        error: 'All fields are required'
      };
    }

    // Get service to validate it exists
    var service = getService(bookingData.serviceId);
    if (!service) {
      return {
        success: false,
        error: 'Service not found'
      };
    }

    // Use the duration from booking data (user selected)
    var duration = parseInt(bookingData.duration);

    // Calculate end time
    var startMinutes = timeToMinutes(bookingData.startTime);
    var endTime = minutesToTime(startMinutes + duration);

    // Create appointment data
    var appointmentData = {
      clientId: bookingData.clientId,
      providerId: bookingData.providerId,
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      startTime: bookingData.startTime,
      duration: duration,
      notes: bookingData.notes || ''
    };

    // Book the appointment
    var result = bookAppointment(appointmentData);

    if (result.success) {
      // Update client visit history
      updateClientVisitHistory(bookingData.clientId, bookingData.date);
    }

    return result;

  } catch (error) {
    Logger.log('Error booking appointment from UI: ' + error.toString());
    return {
      success: false,
      error: 'Error booking appointment: ' + error.message
    };
  }
}

/**
 * Gets client details including appointment history
 * @param {string} clientId - Client ID
 * @returns {Object} Client details with history and stats
 */
function getClientDetails(clientId) {
  var client = getClient(clientId);
  if (!client) {
    return null;
  }

  var history = getClientAppointmentHistory(clientId);
  var stats = getClientStats(clientId);

  return {
    client: client,
    history: history,
    stats: stats
  };
}

// ============================================================================
// MVP 4: Appointment Management UI Functions
// ============================================================================

/**
 * Search appointments by various criteria
 * @param {Object} searchParams - Search parameters
 * @param {string} [searchParams.query] - General search query (client name, appointment ID)
 * @param {string} [searchParams.startDate] - Start date for range (YYYY-MM-DD)
 * @param {string} [searchParams.endDate] - End date for range (YYYY-MM-DD)
 * @param {string} [searchParams.providerId] - Provider ID
 * @param {string} [searchParams.status] - Appointment status
 * @returns {Array<Object>} Array of matching appointments with client/provider details
 */
function searchAppointmentsForUI(searchParams) {
  try {
    Logger.log('searchAppointmentsForUI: Starting with params: ' + JSON.stringify(searchParams));

    var appointments = getAppointments();
    Logger.log('searchAppointmentsForUI: Got ' + appointments.length + ' appointments');

    var clients = getClients();
    Logger.log('searchAppointmentsForUI: Got ' + clients.length + ' clients');

    var providers = getProviders();
    Logger.log('searchAppointmentsForUI: Got ' + providers.length + ' providers');

    var services = getServices();
    Logger.log('searchAppointmentsForUI: Got ' + services.length + ' services');

    // Create lookup maps
    var clientMap = {};
    clients.forEach(function(c) { clientMap[c.client_id] = c; });
    Logger.log('searchAppointmentsForUI: Created clientMap with ' + Object.keys(clientMap).length + ' entries');

    var providerMap = {};
    providers.forEach(function(p) { providerMap[p.provider_id] = p; });
    Logger.log('searchAppointmentsForUI: Created providerMap with ' + Object.keys(providerMap).length + ' entries');

    var serviceMap = {};
    services.forEach(function(s) { serviceMap[s.service_id] = s; });
    Logger.log('searchAppointmentsForUI: Created serviceMap with ' + Object.keys(serviceMap).length + ' entries');
    Logger.log('searchAppointmentsForUI: Service IDs in map: ' + Object.keys(serviceMap).join(', '));

    // Filter appointments
    var results = appointments.filter(function(apt) {
      // Filter by query (client name, phone number, or appointment ID)
      if (searchParams.query) {
        var query = searchParams.query.toLowerCase();
        var client = clientMap[apt.client_id];
        var clientName = client ? client.name.toLowerCase() : '';
        var clientPhone = client && client.phone ? client.phone.toLowerCase() : '';
        var aptId = apt.appointment_id.toLowerCase();

        if (clientName.indexOf(query) === -1 &&
            clientPhone.indexOf(query) === -1 &&
            aptId.indexOf(query) === -1) {
          return false;
        }
      }

      // Filter by date range
      var aptDate = normalizeDate(apt.appointment_date);

      // Filter by start date (from)
      if (searchParams.startDate) {
        if (aptDate < searchParams.startDate) {
          return false;
        }
      }

      // Filter by end date (to)
      if (searchParams.endDate) {
        if (aptDate > searchParams.endDate) {
          return false;
        }
      }

      // Filter by provider
      if (searchParams.providerId && apt.provider_id !== searchParams.providerId) {
        return false;
      }

      // Filter by status
      if (searchParams.status) {
        // Handle special status filter values
        if (searchParams.status === 'ALL_OPEN') {
          var openStatuses = ['Booked', 'Confirmed', 'Checked-in'];
          if (openStatuses.indexOf(apt.status) === -1) {
            return false;
          }
        } else if (searchParams.status === 'ALL_CLOSED') {
          var closedStatuses = ['Rescheduled', 'Cancelled', 'Completed', 'No-show'];
          if (closedStatuses.indexOf(apt.status) === -1) {
            return false;
          }
        } else {
          // Regular status filter
          if (apt.status !== searchParams.status) {
            return false;
          }
        }
      }

      return true;
    });
    Logger.log('searchAppointmentsForUI: After filter, have ' + results.length + ' results');

    // Enhance results with related data
    var enhancedResults = results.map(function(apt) {
      // Normalize date to string for sorting
      var aptDate = normalizeDate(apt.appointment_date);

      // Normalize start_time to string (HH:MM format)
      var startTime = apt.start_time;
      if (apt.start_time instanceof Date) {
        var hours = apt.start_time.getHours();
        var minutes = apt.start_time.getMinutes();
        startTime = padZero(hours) + ':' + padZero(minutes);
      }

      // Debug service lookup
      var service = serviceMap[apt.service_id];
      if (!service) {
        Logger.log('searchAppointmentsForUI: Service NOT FOUND for appointment ' + apt.appointment_id +
                   ' with service_id: "' + apt.service_id + '" (type: ' + typeof apt.service_id + ')');
      }

      return {
        appointment_id: apt.appointment_id,
        appointment_date: aptDate,
        start_time: startTime,
        duration: apt.duration,
        status: apt.status,
        notes: apt.notes || '',
        client_id: apt.client_id,
        provider_id: apt.provider_id,
        service_id: apt.service_id,
        client: clientMap[apt.client_id] || {},
        provider: providerMap[apt.provider_id] || {},
        service: service || {}
      };
    });

    // Sort by date and time (most recent first)
    enhancedResults.sort(function(a, b) {
      if (a.appointment_date !== b.appointment_date) {
        return b.appointment_date.localeCompare(a.appointment_date);
      }
      return b.start_time.localeCompare(a.start_time);
    });

    Logger.log('searchAppointmentsForUI: Returning ' + enhancedResults.length + ' enhanced results');
    return enhancedResults;

  } catch (error) {
    Logger.log('ERROR in searchAppointmentsForUI: ' + error.toString());
    Logger.log('ERROR stack: ' + error.stack);
    return [];
  }
}

/**
 * Gets today's appointments for quick access
 * @returns {Array<Object>} Today's appointments with details
 */
function getTodaysAppointmentsForUI() {
  var today = normalizeDate(new Date());
  return searchAppointmentsForUI({ date: today });
}

/**
 * Cancels an appointment from UI
 * @param {string} appointmentId - Appointment ID
 * @param {string} reason - Cancellation reason
 * @returns {Object} Result object
 */
function cancelAppointmentFromUI(appointmentId, reason) {
  return cancelAppointment(appointmentId, reason);
}

/**
 * Reschedules an appointment from UI
 * @param {string} appointmentId - Appointment ID
 * @param {Object} options - Reschedule options
 * @returns {Object} Result object
 */
function rescheduleAppointmentFromUI(appointmentId, options) {
  return rescheduleAppointment(appointmentId, options);
}

/**
 * Checks in an appointment from UI
 * @param {string} appointmentId - Appointment ID
 * @returns {Object} Result object
 */
function checkInAppointmentFromUI(appointmentId) {
  return checkInAppointment(appointmentId);
}

/**
 * Marks appointment as no-show from UI
 * @param {string} appointmentId - Appointment ID
 * @param {string} [notes] - Optional notes
 * @returns {Object} Result object
 */
function markNoShowFromUI(appointmentId, notes) {
  return markNoShow(appointmentId, null, notes);
}

/**
 * Completes an appointment from UI
 * @param {string} appointmentId - Appointment ID
 * @param {string} [notes] - Optional completion notes
 * @returns {Object} Result object
 */
function completeAppointmentFromUI(appointmentId, notes) {
  return completeAppointment(appointmentId, null, notes);
}

/**
 * Gets full appointment details for management
 * @param {string} appointmentId - Appointment ID
 * @returns {Object} Appointment with all related data
 */
function getAppointmentDetailsForUI(appointmentId) {
  try {
    Logger.log('getAppointmentDetailsForUI: Looking for appointment: ' + appointmentId);

    var appointment = getAppointmentById(appointmentId);
    Logger.log('getAppointmentDetailsForUI: getAppointmentById returned: ' + (appointment ? 'found' : 'NULL'));

    if (!appointment) {
      Logger.log('getAppointmentDetailsForUI: Appointment not found, returning null');
      return null;
    }

    Logger.log('getAppointmentDetailsForUI: Appointment status: ' + appointment.status);

    var client = getClient(appointment.client_id);
    Logger.log('getAppointmentDetailsForUI: Client found: ' + (client ? client.name : 'NULL'));

    var provider = getProvider(appointment.provider_id);
    Logger.log('getAppointmentDetailsForUI: Provider found: ' + (provider ? provider.name : 'NULL'));

    var service = getService(appointment.service_id);
    Logger.log('getAppointmentDetailsForUI: Service found: ' + (service ? service.name : 'NULL'));

    // Check if appointment is in the past
    var today = normalizeDate(new Date());
    var aptDate = normalizeDate(appointment.appointment_date);
    var isPastAppointment = aptDate < today;
    Logger.log('getAppointmentDetailsForUI: Is past appointment: ' + isPastAppointment + ' (apt=' + aptDate + ', today=' + today + ')');

    var result = {
      appointment: appointment,
      client: client,
      provider: provider,
      service: service,
      canCancel: canTransitionTo(appointment.status, 'Cancelled'),
      canReschedule: !isPastAppointment && canTransitionTo(appointment.status, 'Rescheduled'),
      canCheckIn: !isPastAppointment && canTransitionTo(appointment.status, 'Checked-in'),
      canMarkNoShow: canTransitionTo(appointment.status, 'No-show'),
      canComplete: canTransitionTo(appointment.status, 'Completed')
    };

    Logger.log('getAppointmentDetailsForUI: Returning result with canCancel=' + result.canCancel);
    return result;

  } catch (error) {
    Logger.log('ERROR in getAppointmentDetailsForUI: ' + error.toString());
    Logger.log('ERROR stack: ' + error.stack);
    return null;
  }
}

/**
 * Gets past appointments with open statuses that need review
 * Returns appointments where date < today AND status is Booked, Confirmed, or Checked-in
 * Note: Rescheduled is now a finalized status (creates new appointment, closes old one)
 * @returns {Array<Object>} Array of past open appointments with details
 */
function getPastOpenAppointmentsForUI() {
  try {
    Logger.log('getPastOpenAppointmentsForUI: Starting...');

    var today = normalizeDate(new Date());
    Logger.log('getPastOpenAppointmentsForUI: Today is ' + today);

    var appointments = getAppointments();
    var clients = getClients();
    var providers = getProviders();
    var services = getServices();

    // Create lookup maps
    var clientMap = {};
    clients.forEach(function(c) { clientMap[c.client_id] = c; });

    var providerMap = {};
    providers.forEach(function(p) { providerMap[p.provider_id] = p; });

    var serviceMap = {};
    services.forEach(function(s) { serviceMap[s.service_id] = s; });

    // Define open statuses that need closure (Rescheduled is now finalized)
    var openStatuses = ['Booked', 'Confirmed', 'Checked-in'];

    // Filter appointments: past date AND open status
    var results = appointments.filter(function(apt) {
      var aptDate = normalizeDate(apt.appointment_date);

      // Check if date is in the past (before today)
      if (aptDate >= today) {
        return false;
      }

      // Check if status is open (needs closure)
      if (openStatuses.indexOf(apt.status) === -1) {
        return false;
      }

      return true;
    });

    Logger.log('getPastOpenAppointmentsForUI: Found ' + results.length + ' past open appointments');

    // Enhance results with related data
    var enhancedResults = results.map(function(apt) {
      var aptDate = normalizeDate(apt.appointment_date);

      // Normalize start_time to string (HH:MM format)
      var startTime = apt.start_time;
      if (apt.start_time instanceof Date) {
        var hours = apt.start_time.getHours();
        var minutes = apt.start_time.getMinutes();
        startTime = padZero(hours) + ':' + padZero(minutes);
      }

      return {
        appointment_id: apt.appointment_id,
        appointment_date: aptDate,
        start_time: startTime,
        duration: apt.duration,
        status: apt.status,
        notes: apt.notes || '',
        client_id: apt.client_id,
        provider_id: apt.provider_id,
        service_id: apt.service_id,
        client: clientMap[apt.client_id] || {},
        provider: providerMap[apt.provider_id] || {},
        service: serviceMap[apt.service_id] || {}
      };
    });

    // Sort by date (oldest first) so user can work through them chronologically
    enhancedResults.sort(function(a, b) {
      if (a.appointment_date !== b.appointment_date) {
        return a.appointment_date.localeCompare(b.appointment_date);
      }
      return a.start_time.localeCompare(b.start_time);
    });

    Logger.log('getPastOpenAppointmentsForUI: Returning ' + enhancedResults.length + ' enhanced results');
    return enhancedResults;

  } catch (error) {
    Logger.log('ERROR in getPastOpenAppointmentsForUI: ' + error.toString());
    Logger.log('ERROR stack: ' + error.stack);
    return [];
  }
}

/**
 * Shows the appointment management sidebar for reviewing past open appointments
 * This is called from the menu: Appointment System → Review Past Appointments
 */
function reviewPastAppointments() {
  showAppointmentManagementSidebar();
}

// ============================================================================
// Provider Availability Indicators for Booking UI
// ============================================================================

/**
 * Gets list of providers who have previously served this client for this service
 * Used to show "★ Returning" indicators in the booking UI dropdown
 * @param {string} clientId - The client ID
 * @param {string} serviceId - Optional service ID to filter by
 * @returns {Array<string>} Array of provider IDs who have served this client
 */
function getReturningProviders(clientId, serviceId) {
  try {
    if (!clientId) {
      return [];
    }

    // Get all appointments for this client
    var appointments = findRecords(SHEETS.APPOINTMENTS, { client_id: clientId });

    if (appointments.length === 0) {
      return [];
    }

    // Filter to appointments where service was actually rendered
    var completedStatuses = ['Completed', 'Checked-in'];
    var serviceRendered = appointments.filter(function(apt) {
      // Must be completed or checked-in (actual service provided)
      if (completedStatuses.indexOf(apt.status) === -1) {
        return false;
      }

      // If serviceId provided, must match
      if (serviceId && apt.service_id !== serviceId) {
        return false;
      }

      return true;
    });

    // Extract unique provider IDs
    var providerIds = {};
    serviceRendered.forEach(function(apt) {
      providerIds[apt.provider_id] = true;
    });

    return Object.keys(providerIds);

  } catch (error) {
    Logger.log('Error in getReturningProviders: ' + error.toString());
    return [];
  }
}

/**
 * Filters providers who offer a specific service
 * @param {Array<Object>} providers - Array of provider objects
 * @param {string} serviceId - Service ID to filter by
 * @returns {Array<Object>} Filtered providers who offer this service
 */
function filterProvidersByService(providers, serviceId) {
  if (!serviceId) {
    return providers;
  }

  Logger.log('filterProvidersByService: Filtering ' + providers.length + ' providers for service ' + serviceId);

  return providers.filter(function(p) {
    // services_offered is pipe-separated (e.g., "SERV001|SERV002|SERV003")
    if (!p.services_offered) {
      Logger.log('  Provider ' + p.name + ' (' + p.provider_id + '): NO services_offered field');
      return false;
    }

    var services = p.services_offered.split('|').map(function(s) { return s.trim(); });
    var offers = services.indexOf(serviceId) !== -1;
    Logger.log('  Provider ' + p.name + ' (' + p.provider_id + '): services_offered=' + p.services_offered + ' -> ' + (offers ? 'MATCH' : 'NO MATCH'));
    return offers;
  });
}

/**
 * Gets availability summary for all active providers
 * Used by booking UI to show slot counts and returning provider indicators in provider dropdown
 * @param {string} serviceId - Optional service ID to filter providers
 * @param {string} dateStr - Optional date in YYYY-MM-DD format
 * @param {number} duration - Optional duration in minutes
 * @param {string} clientId - Optional client ID to check for returning provider relationships
 * @returns {Object} Result with provider availability data
 */
function getAllProvidersAvailability(serviceId, dateStr, duration, clientId) {
  try {
    // Get ALL active providers (don't filter by service)
    var providers = getProviders(true);
    Logger.log('getAllProvidersAvailability: Found ' + providers.length + ' active providers');
    Logger.log('getAllProvidersAvailability: serviceId=' + serviceId + ', dateStr=' + dateStr + ', duration=' + duration + ', clientId=' + clientId);

    // Get returning providers if client and service specified
    var returningProviderIds = [];
    if (clientId && serviceId) {
      returningProviderIds = getReturningProviders(clientId, serviceId);
    }

    // If date or duration not provided, return placeholder state
    if (!dateStr || !duration) {
      return {
        success: true,
        providers: providers.map(function(p) {
          // Check if provider offers the service
          var offersService = !serviceId || providerOffersServiceCheck(p, serviceId);

          return {
            provider_id: p.provider_id,
            name: p.name,
            slot_count: offersService ? -1 : 0,
            is_available: false,
            is_returning_provider: returningProviderIds.indexOf(p.provider_id) !== -1
          };
        })
      };
    }

    // Calculate actual availability for each provider
    var date = parseDateInTimezone(dateStr);
    var durationNum = parseInt(duration);

    var results = providers.map(function(p) {
      // Check if provider offers the service
      if (serviceId && !providerOffersServiceCheck(p, serviceId)) {
        Logger.log('  Provider ' + p.name + ' does NOT offer service ' + serviceId + ' -> 0 slots');
        return {
          provider_id: p.provider_id,
          name: p.name,
          slot_count: 0,
          is_available: false,
          is_returning_provider: returningProviderIds.indexOf(p.provider_id) !== -1
        };
      }

      // Get available time windows
      var timeBlocks = getProviderAvailability(p.provider_id, date);

      if (timeBlocks.length === 0) {
        return {
          provider_id: p.provider_id,
          name: p.name,
          slot_count: 0,
          is_available: false,
          is_returning_provider: returningProviderIds.indexOf(p.provider_id) !== -1
        };
      }

      // Generate slots and count them
      var slots = generateTimeSlots(timeBlocks, [], durationNum, date);

      return {
        provider_id: p.provider_id,
        name: p.name,
        slot_count: slots.length,
        is_available: slots.length > 0,
        is_returning_provider: returningProviderIds.indexOf(p.provider_id) !== -1
      };
    });

    return {
      success: true,
      providers: results
    };

  } catch (error) {
    Logger.log('Error in getAllProvidersAvailability: ' + error.toString());
    return {
      success: false,
      error: 'Error calculating provider availability: ' + error.message
    };
  }
}

/**
 * Helper function to check if a provider offers a specific service
 * @param {Object} provider - Provider object
 * @param {string} serviceId - Service ID to check
 * @returns {boolean} True if provider offers the service
 */
function providerOffersServiceCheck(provider, serviceId) {
  if (!provider.services_offered) {
    return false;
  }
  var services = provider.services_offered.split('|').map(function(s) { return s.trim(); });
  return services.indexOf(serviceId) !== -1;
}
