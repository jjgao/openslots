/**
 * Appointment Booking System - Google Calendar Integration
 *
 * Functions to create, update, and delete Google Calendar events
 * synchronized with appointment data.
 */

/**
 * Calendar color hex codes for CalendarApp.setColor()
 * These are the actual hex values Google Calendar uses
 * @const {Object}
 */
const CALENDAR_COLORS = {
  LAVENDER: '#9fc6e7',    // Light blue
  SAGE: '#42d692',        // Light green
  GRAPE: '#9e69af',       // Purple
  FLAMINGO: '#ff887c',    // Coral/pink
  BANANA: '#fbd75b',      // Yellow
  TANGERINE: '#ffb878',   // Orange
  PEACOCK: '#16a765',     // Teal/green
  GRAPHITE: '#92e1c0',    // Mint
  BLUEBERRY: '#9fc6e7',   // Blue
  BASIL: '#42d692',       // Green
  TOMATO: '#ff6961'       // Red
};

/**
 * Status to color mapping (legacy, now using provider colors)
 * @const {Object}
 */
const STATUS_COLORS = {
  'Booked': CALENDAR_COLORS.BLUEBERRY,
  'Confirmed': CALENDAR_COLORS.BASIL,
  'Checked-in': CALENDAR_COLORS.BANANA,
  'Completed': CALENDAR_COLORS.SAGE,
  'Cancelled': CALENDAR_COLORS.TOMATO,
  'No-show': CALENDAR_COLORS.TANGERINE,
  'Rescheduled': CALENDAR_COLORS.GRAPE
};

/**
 * Available colors for provider assignment (cycling through these)
 * @const {Array}
 */
const PROVIDER_COLOR_PALETTE = [
  CALENDAR_COLORS.BLUEBERRY,  // Blue
  CALENDAR_COLORS.BASIL,      // Green
  CALENDAR_COLORS.FLAMINGO,   // Pink
  CALENDAR_COLORS.TANGERINE,  // Orange
  CALENDAR_COLORS.GRAPE,      // Purple
  CALENDAR_COLORS.PEACOCK,    // Teal
  CALENDAR_COLORS.TOMATO,     // Red
  CALENDAR_COLORS.BANANA,     // Yellow
  CALENDAR_COLORS.LAVENDER,   // Lavender
  CALENDAR_COLORS.SAGE        // Sage
];

/**
 * Gets a color for a provider based on their position in the provider list
 * @param {string} providerId - The provider ID
 * @returns {string} Calendar color ID
 */
function getProviderColor(providerId) {
  try {
    // Get all providers to determine index
    var providers = getProviders();
    var providerIndex = -1;

    for (var i = 0; i < providers.length; i++) {
      if (providers[i].provider_id === providerId) {
        providerIndex = i;
        break;
      }
    }

    if (providerIndex === -1) {
      return CALENDAR_COLORS.BLUEBERRY; // Default color
    }

    // Cycle through color palette
    return PROVIDER_COLOR_PALETTE[providerIndex % PROVIDER_COLOR_PALETTE.length];

  } catch (error) {
    Logger.log('Error getting provider color: ' + error.toString());
    return CALENDAR_COLORS.BLUEBERRY;
  }
}

/**
 * Creates a calendar event for an appointment
 * @param {string} appointmentId - The appointment ID
 * @returns {Object} Result object with success status and eventId or error
 */
function createCalendarEvent(appointmentId) {
  try {
    // Get appointment details
    const appointment = getAppointment(appointmentId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    // Get related records
    const client = getClient(appointment.client_id);
    const provider = getProvider(appointment.provider_id);
    const service = getService(appointment.service_id);

    if (!client || !provider || !service) {
      return { success: false, error: 'Related records not found (client, provider, or service)' };
    }

    // Get or create calendar for provider
    const calendar = getOrCreateProviderCalendar(provider);
    if (!calendar) {
      return { success: false, error: 'Could not access or create provider calendar' };
    }

    // Build event details
    const eventTitle = buildEventTitle(service.service_name, client.name);
    const eventDescription = buildEventDescription(appointment, client, service);
    const startTime = combineDateAndTime(appointment.appointment_date, appointment.start_time);
    const endTime = combineDateAndTime(appointment.appointment_date, appointment.end_time);

    // Create the event
    const event = calendar.createEvent(eventTitle, startTime, endTime, {
      description: eventDescription,
      location: getConfig('business_name', 'Office')
    });

    // Event color is inherited from calendar color (no need to set individually)

    // Store event ID in appointment
    const eventId = event.getId();
    updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
      calendar_event_id: eventId
    });

    // Log the calendar creation
    logCalendarCreate(appointmentId, eventId);

    Logger.log(`Calendar event created: ${eventId} for appointment ${appointmentId}`);

    return {
      success: true,
      eventId: eventId,
      calendarId: calendar.getId()
    };

  } catch (error) {
    Logger.log(`Error creating calendar event: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Updates an existing calendar event for an appointment
 * @param {string} appointmentId - The appointment ID
 * @returns {Object} Result object with success status
 */
function updateCalendarEvent(appointmentId) {
  try {
    // Get appointment details
    const appointment = getAppointment(appointmentId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    if (!appointment.calendar_event_id) {
      // No existing event, create a new one
      return createCalendarEvent(appointmentId);
    }

    // Get related records
    const client = getClient(appointment.client_id);
    const provider = getProvider(appointment.provider_id);
    const service = getService(appointment.service_id);

    if (!client || !provider || !service) {
      return { success: false, error: 'Related records not found' };
    }

    // Get the calendar and event
    const calendar = getOrCreateProviderCalendar(provider);
    if (!calendar) {
      return { success: false, error: 'Could not access provider calendar' };
    }

    const event = calendar.getEventById(appointment.calendar_event_id);
    if (!event) {
      // Event was deleted externally, create a new one
      Logger.log('Calendar event not found, creating new one');
      return createCalendarEvent(appointmentId);
    }

    // Update event details
    const eventTitle = buildEventTitle(service.service_name, client.name);
    const eventDescription = buildEventDescription(appointment, client, service);
    const startTime = combineDateAndTime(appointment.appointment_date, appointment.start_time);
    const endTime = combineDateAndTime(appointment.appointment_date, appointment.end_time);

    event.setTitle(eventTitle);
    event.setDescription(eventDescription);
    event.setTime(startTime, endTime);

    // Event color is inherited from calendar color (no need to set individually)

    // Log the update
    logCalendarUpdate(appointmentId, appointment.calendar_event_id);

    Logger.log(`Calendar event updated: ${appointment.calendar_event_id}`);

    return { success: true, eventId: appointment.calendar_event_id };

  } catch (error) {
    Logger.log(`Error updating calendar event: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Deletes a calendar event for an appointment
 * @param {string} appointmentId - The appointment ID
 * @returns {Object} Result object with success status
 */
function deleteCalendarEvent(appointmentId) {
  try {
    // Get appointment details
    const appointment = getAppointment(appointmentId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    if (!appointment.calendar_event_id) {
      return { success: true, message: 'No calendar event to delete' };
    }

    // Get provider to access their calendar
    const provider = getProvider(appointment.provider_id);
    if (!provider) {
      return { success: false, error: 'Provider not found' };
    }

    // Get the calendar
    const calendar = getOrCreateProviderCalendar(provider);
    if (!calendar) {
      return { success: false, error: 'Could not access provider calendar' };
    }

    // Find and delete the event
    const event = calendar.getEventById(appointment.calendar_event_id);
    if (event) {
      const eventId = appointment.calendar_event_id;
      event.deleteEvent();

      // Clear the event ID from appointment
      updateRecordById(SHEETS.APPOINTMENTS, appointmentId, {
        calendar_event_id: ''
      });

      // Log the deletion
      logCalendarDelete(appointmentId, eventId);

      Logger.log(`Calendar event deleted: ${eventId}`);
    }

    return { success: true };

  } catch (error) {
    Logger.log(`Error deleting calendar event: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Gets or creates a calendar for a provider
 * Creates a dedicated calendar named "OpenSlots - [Provider Name]" for each provider.
 * Stores the calendar ID in the provider record for future lookups.
 *
 * @param {Object} provider - Provider object
 * @returns {Calendar|null} Calendar object or null
 */
function getOrCreateProviderCalendar(provider) {
  try {
    // Check if provider already has a calendar ID stored
    if (provider.calendar_id) {
      const existingCalendar = CalendarApp.getCalendarById(provider.calendar_id);
      if (existingCalendar) {
        // Set calendar color using CalendarApp method (for owned calendars)
        try {
          const colorId = getProviderColor(provider.provider_id);
          CalendarApp.setColor(provider.calendar_id, colorId);
        } catch (e) {
          Logger.log('Could not set calendar color: ' + e.toString());
        }
        return existingCalendar;
      }
      // Calendar was deleted externally, clear the stored ID and create new one
      Logger.log(`Stored calendar not found, creating new one for ${provider.name}`);
    }

    // Create a dedicated calendar for this provider
    const calendarName = `OpenSlots - ${provider.name}`;

    // Check if calendar with this name already exists
    const allCalendars = CalendarApp.getAllCalendars();
    for (let i = 0; i < allCalendars.length; i++) {
      if (allCalendars[i].getName() === calendarName) {
        // Found existing calendar, store the ID and set color
        const calId = allCalendars[i].getId();
        const colorId = getProviderColor(provider.provider_id);
        try {
          CalendarApp.setColor(calId, colorId);
        } catch (e) {
          Logger.log('Could not set calendar color: ' + e.toString());
        }

        updateRecordById(SHEETS.PROVIDERS, provider.provider_id, {
          calendar_id: calId
        });
        Logger.log(`Found existing calendar for ${provider.name}: ${calId}, set color ${colorId}`);
        return allCalendars[i];
      }
    }

    // Create new calendar
    const newCalendar = CalendarApp.createCalendar(calendarName, {
      summary: `Appointments for ${provider.name}`,
      timeZone: Session.getScriptTimeZone()
    });

    // Store the calendar ID in the provider record
    const newCalId = newCalendar.getId();
    updateRecordById(SHEETS.PROVIDERS, provider.provider_id, {
      calendar_id: newCalId
    });

    // Set calendar color to match provider color (after calendar is created)
    const colorId = getProviderColor(provider.provider_id);
    try {
      CalendarApp.setColor(newCalId, colorId);
      Logger.log(`Created new calendar for ${provider.name}: ${newCalId} with color ${colorId}`);
    } catch (e) {
      Logger.log(`Created calendar ${newCalId}, but could not set color: ${e.toString()}`);
    }

    return newCalendar;

  } catch (error) {
    Logger.log(`Error getting/creating calendar: ${error.toString()}`);
    // Fall back to default calendar if calendar creation fails
    return CalendarApp.getDefaultCalendar();
  }
}

/**
 * Deletes all events from a provider's calendar (for cleanup)
 * Does not delete the calendar itself, just clears events.
 *
 * @param {string} providerId - The provider ID
 * @returns {Object} Result object with count of deleted events
 */
function clearProviderCalendarEvents(providerId) {
  try {
    const provider = getProvider(providerId);
    if (!provider || !provider.calendar_id) {
      return { success: true, deleted: 0 };
    }

    const calendar = CalendarApp.getCalendarById(provider.calendar_id);
    if (!calendar) {
      return { success: true, deleted: 0 };
    }

    // Get all events from today onwards
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // Look ahead 1 year

    const events = calendar.getEvents(startDate, endDate);
    let deleted = 0;

    for (let i = 0; i < events.length; i++) {
      // Only delete OpenSlots events (check description)
      const desc = events[i].getDescription() || '';
      if (desc.includes('Managed by OpenSlots') || desc.includes('Appointment ID:')) {
        events[i].deleteEvent();
        deleted++;
      }
    }

    Logger.log(`Cleared ${deleted} calendar events for provider ${providerId}`);
    return { success: true, deleted: deleted };

  } catch (error) {
    Logger.log(`Error clearing calendar events: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Deletes a provider's dedicated calendar entirely
 * Uses the Calendar Advanced Service to delete the calendar.
 *
 * @param {string} providerId - The provider ID
 * @returns {Object} Result object with success status
 */
function deleteProviderCalendar(providerId) {
  try {
    const provider = getProvider(providerId);
    if (!provider || !provider.calendar_id) {
      return { success: true, message: 'No calendar to delete' };
    }

    // Use Calendar Advanced Service to delete the calendar
    try {
      Calendar.Calendars.remove(provider.calendar_id);
      Logger.log(`Deleted calendar for provider ${provider.name}: ${provider.calendar_id}`);
    } catch (e) {
      // Calendar might already be deleted or not accessible
      Logger.log(`Could not delete calendar: ${e.toString()}`);
    }

    // Clear the calendar_id from provider record
    updateRecordById(SHEETS.PROVIDERS, providerId, {
      calendar_id: ''
    });

    return { success: true };

  } catch (error) {
    Logger.log(`Error deleting provider calendar: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Deletes all OpenSlots provider calendars
 * Useful for complete cleanup/reset.
 *
 * @returns {Object} Result with count of deleted calendars
 */
function deleteAllProviderCalendars() {
  const providers = getProviders();
  let deleted = 0;
  let failed = 0;

  for (let i = 0; i < providers.length; i++) {
    if (providers[i].calendar_id) {
      const result = deleteProviderCalendar(providers[i].provider_id);
      if (result.success) {
        deleted++;
      } else {
        failed++;
      }
    }
  }

  Logger.log(`Deleted ${deleted} provider calendars, ${failed} failed`);
  return { deleted: deleted, failed: failed };
}

/**
 * Builds the event title
 * @param {string} serviceName - Name of the service
 * @param {string} clientName - Name of the client
 * @returns {string} Event title
 */
function buildEventTitle(serviceName, clientName) {
  return `[${serviceName}] - ${clientName}`;
}

/**
 * Builds the event description
 * @param {Object} appointment - Appointment object
 * @param {Object} client - Client object
 * @param {Object} service - Service object
 * @returns {string} Event description
 */
function buildEventDescription(appointment, client, service) {
  const lines = [];

  lines.push(`Client: ${client.name}`);

  if (client.phone) {
    lines.push(`Phone: ${client.phone}`);
  }

  if (client.email) {
    lines.push(`Email: ${client.email}`);
  }

  lines.push('');
  lines.push(`Service: ${service.service_name}`);
  lines.push(`Duration: ${appointment.duration} minutes`);
  lines.push(`Status: ${appointment.status}`);

  if (appointment.notes) {
    lines.push('');
    lines.push(`Notes: ${appointment.notes}`);
  }

  lines.push('');
  lines.push(`Appointment ID: ${appointment.appointment_id}`);
  lines.push('---');
  lines.push('Managed by OpenSlots Appointment System');

  return lines.join('\n');
}

/**
 * Legacy function - no longer needed since event colors inherit from calendar color
 * Calendar color is set per provider, not per event status
 * @param {string} appointmentId - The appointment ID (unused)
 * @param {string} newStatus - The new status (unused)
 * @returns {Object} Result object
 */
function syncCalendarEventColor(appointmentId, newStatus) {
  // Event colors now inherit from calendar color (provider-based)
  // No need to update individual event colors
  return { success: true };
}

/**
 * Gets calendar events for a provider on a specific date
 * @param {string} providerId - The provider ID
 * @param {Date|string} date - The date to check
 * @returns {Array} Array of calendar events
 */
function getProviderCalendarEvents(providerId, date) {
  try {
    const provider = getProvider(providerId);
    if (!provider) {
      return [];
    }

    const calendar = getOrCreateProviderCalendar(provider);
    if (!calendar) {
      return [];
    }

    const startOfDay = typeof date === 'string' ? parseDateInTimezone(date) : new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = typeof date === 'string' ? parseDateInTimezone(date) : new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return calendar.getEvents(startOfDay, endOfDay);

  } catch (error) {
    Logger.log(`Error getting calendar events: ${error.toString()}`);
    return [];
  }
}

/**
 * Creates calendar events for all appointments that don't have them
 * Useful for initial setup or recovering from sync issues
 * @returns {Object} Result with counts
 */
function syncAllMissingCalendarEvents() {
  const appointments = getAppointments();
  let created = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < appointments.length; i++) {
    const apt = appointments[i];

    // Skip if already has calendar event or is cancelled/no-show
    if (apt.calendar_event_id ||
        apt.status === 'Cancelled' ||
        apt.status === 'No-show') {
      skipped++;
      continue;
    }

    // Skip past appointments
    if (!isTodayOrFuture(apt.appointment_date)) {
      skipped++;
      continue;
    }

    const result = createCalendarEvent(apt.appointment_id);
    if (result.success) {
      created++;
    } else {
      failed++;
      Logger.log(`Failed to create event for ${apt.appointment_id}: ${result.error}`);
    }
  }

  Logger.log(`Calendar sync complete: ${created} created, ${failed} failed, ${skipped} skipped`);

  return {
    created: created,
    failed: failed,
    skipped: skipped
  };
}
