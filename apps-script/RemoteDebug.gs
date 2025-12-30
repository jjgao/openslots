/**
 * Remote debug script that can be run via clasp
 */

function remoteDebugSearch() {
  try {
    var output = [];

    // Get data
    var appointments = getAppointments();
    output.push('Appointments: ' + appointments.length);

    var clients = getClients();
    output.push('Clients: ' + clients.length);

    var providers = getProviders();
    output.push('Providers: ' + providers.length);

    var services = getServices();
    output.push('Services: ' + services.length);

    // Run search
    var searchResults = searchAppointmentsForUI({});
    output.push('Search results: ' + searchResults.length);

    // If we have appointments but no results, dig deeper
    if (appointments.length > 0 && searchResults.length === 0) {
      output.push('\nDEBUG: Filtering issue detected');
      output.push('First appointment: ' + JSON.stringify(appointments[0]));

      // Check if client exists for first appointment
      var firstApt = appointments[0];
      output.push('First apt client_id: ' + firstApt.client_id);
      output.push('Client exists in map: ' + (clients.some(function(c) { return c.client_id === firstApt.client_id; })));
    }

    // Output results
    var result = output.join('\n');
    Logger.log(result);
    return result;

  } catch (error) {
    var errorMsg = 'ERROR: ' + error.toString() + '\nStack: ' + error.stack;
    Logger.log(errorMsg);
    return errorMsg;
  }
}

/**
 * Debug function to check appointment details and cancel button visibility
 */
function remoteDebugAppointmentDetails() {
  try {
    var output = [];
    output.push('=== APPOINTMENT DETAILS DEBUG ===\n');

    // Get all appointments
    var appointments = getAppointments();
    output.push('Total appointments: ' + appointments.length);

    if (appointments.length === 0) {
      output.push('No appointments found!');
      return output.join('\n');
    }

    // Check details for first few appointments
    var checkCount = Math.min(5, appointments.length);
    output.push('Checking first ' + checkCount + ' appointments:\n');

    for (var i = 0; i < checkCount; i++) {
      var apt = appointments[i];
      output.push('--- Appointment ' + (i + 1) + ' ---');
      output.push('ID: ' + apt.appointment_id);
      output.push('Status: ' + apt.status);
      output.push('Date: ' + apt.appointment_date);

      // Get appointment details as UI would
      var details = getAppointmentDetailsForUI(apt.appointment_id);

      if (details) {
        output.push('canCancel: ' + details.canCancel);
        output.push('canReschedule: ' + details.canReschedule);
        output.push('canCheckIn: ' + details.canCheckIn);
        output.push('canMarkNoShow: ' + details.canMarkNoShow);
        output.push('canComplete: ' + details.canComplete);

        // Check what transitions are valid for this status
        var allowedTransitions = VALID_STATUS_TRANSITIONS[apt.status];
        output.push('Allowed transitions from "' + apt.status + '": ' +
                   (allowedTransitions ? JSON.stringify(allowedTransitions) : 'NONE'));
      } else {
        output.push('ERROR: getAppointmentDetailsForUI returned null!');
      }

      output.push('');
    }

    // Output results
    var result = output.join('\n');
    Logger.log(result);
    return result;

  } catch (error) {
    var errorMsg = 'ERROR: ' + error.toString() + '\nStack: ' + error.stack;
    Logger.log(errorMsg);
    return errorMsg;
  }
}

/**
 * Debug function to investigate service lookup failure for APT006
 */
function remoteDebugServiceLookup() {
  try {
    var output = [];
    output.push('=== SERVICE LOOKUP DEBUG ===\n');

    // Get APT006 appointment
    var apt = getAppointmentById('APT006');
    if (!apt) {
      output.push('ERROR: APT006 not found!');
      return output.join('\n');
    }

    output.push('APT006 Details:');
    output.push('  client_id: ' + apt.client_id + ' (type: ' + typeof apt.client_id + ')');
    output.push('  provider_id: ' + apt.provider_id + ' (type: ' + typeof apt.provider_id + ')');
    output.push('  service_id: ' + apt.service_id + ' (type: ' + typeof apt.service_id + ')');
    output.push('  service_id value: "' + apt.service_id + '"');
    output.push('  service_id length: ' + (apt.service_id ? apt.service_id.length : 'N/A'));
    output.push('');

    // Get all services
    var services = getServices();
    output.push('Total services: ' + services.length);
    output.push('');

    // Show all service IDs
    output.push('All service IDs in Services sheet:');
    for (var i = 0; i < services.length; i++) {
      var svc = services[i];
      output.push('  ' + i + ': "' + svc.service_id + '" (type: ' + typeof svc.service_id + ', name: ' + svc.name + ')');
    }
    output.push('');

    // Try to get the service
    var service = getService(apt.service_id);
    output.push('getService(apt.service_id) result: ' + (service ? service.name : 'NULL'));
    output.push('');

    // Manual comparison
    output.push('Manual comparison test:');
    for (var j = 0; j < services.length; j++) {
      var s = services[j];
      var strictMatch = s.service_id === apt.service_id;
      var looseMatch = s.service_id == apt.service_id;
      output.push('  ' + s.service_id + ' === ' + apt.service_id + ': ' + strictMatch);
      output.push('  ' + s.service_id + ' == ' + apt.service_id + ': ' + looseMatch);
      if (strictMatch || looseMatch) {
        output.push('  MATCH FOUND: ' + s.name);
      }
    }

    // Output results
    var result = output.join('\n');
    Logger.log(result);
    return result;

  } catch (error) {
    var errorMsg = 'ERROR: ' + error.toString() + '\nStack: ' + error.stack;
    Logger.log(errorMsg);
    return errorMsg;
  }
}
