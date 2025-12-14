# GitHub Issues for Appointment Booking System

This document contains GitHub issues organized by implementation phase. Copy each issue into your GitHub repository.

---

## Epic: Phase 1 - Core Data Structure

### Issue #1: Set up Google Sheets data structure

**Labels**: `setup`, `phase-1`, `database`

**Description**:
Create the main Google Sheets workbook with all required tabs and basic structure.

**Acceptance Criteria**:
- [ ] Create new Google Sheets workbook named "Appointment Booking System"
- [ ] Create sheet: Providers (columns: provider_id, name, email, phone, services_offered, active_status)
- [ ] Create sheet: Services (columns: service_id, service_name, default_duration_options, description)
- [ ] Create sheet: Clients (columns: client_id, name, phone, email, is_member, notes, first_visit_date, last_visit_date)
- [ ] Create sheet: Appointments (columns: appointment_id, client_id, provider_id, service_id, appointment_date, start_time, end_time, duration, status, created_date, notes, calendar_event_id)
- [ ] Create sheet: Provider_Availability (columns: availability_id, provider_id, day_of_week, start_time, end_time, effective_date_start, effective_date_end, is_recurring)
- [ ] Create sheet: Provider_Exceptions (columns: exception_id, provider_id, exception_date, start_time, end_time, reason)
- [ ] Create sheet: Activity_Log (columns: log_id, timestamp, action_type, appointment_id, client_id, provider_id, user, previous_value, new_value, notes)
- [ ] Create sheet: Confirmation_Tracking (columns: confirmation_id, appointment_id, confirmation_date, method, status, notes)
- [ ] Create sheet: System_Config (columns: setting_name, setting_value)
- [ ] Add header row with proper formatting (bold, frozen)
- [ ] Set appropriate column widths for readability

**Technical Notes**:
- Use consistent naming convention (snake_case for column names)
- Consider using named ranges for easier Apps Script access later

---

### Issue #2: Add data validation and dropdowns

**Labels**: `phase-1`, `data-validation`, `ux`

**Description**:
Add data validation rules and dropdown menus to ensure data integrity and ease of use.

**Acceptance Criteria**:
- [ ] Providers sheet:
  - active_status: dropdown (Active, Inactive)
  - services_offered: data validation for comma-separated service IDs
- [ ] Services sheet:
  - default_duration_options: dropdown or comma-separated (15, 30, 45, 60, 90, 120)
- [ ] Clients sheet:
  - is_member: dropdown (Yes, No)
  - phone: format validation (phone number)
  - email: format validation (email)
- [ ] Appointments sheet:
  - status: dropdown (Booked, Confirmed, Checked-in, Completed, No-show, Cancelled, Rescheduled)
  - client_id: validate against Clients sheet
  - provider_id: validate against Providers sheet
  - service_id: validate against Services sheet
- [ ] Provider_Availability sheet:
  - day_of_week: dropdown (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
  - is_recurring: dropdown (Yes, No)
- [ ] Activity_Log sheet:
  - action_type: dropdown (book, cancel, reschedule, check-in, no-show, late, confirmation-call, confirmation-text, confirmation-email)
- [ ] Confirmation_Tracking sheet:
  - method: dropdown (Call, Text, Email)
  - status: dropdown (Confirmed, Declined, Rescheduled, No-response)

**Technical Notes**:
- Use INDIRECT() or named ranges for dynamic dropdowns where needed
- Test all validation rules with sample data

---

### Issue #3: Create auto-increment ID formulas

**Labels**: `phase-1`, `formulas`, `automation`

**Description**:
Implement auto-incrementing ID columns for all primary keys.

**Acceptance Criteria**:
- [ ] Providers sheet: provider_id auto-increments (format: PROV001, PROV002, etc.)
- [ ] Services sheet: service_id auto-increments (format: SERV001, SERV002, etc.)
- [ ] Clients sheet: client_id auto-increments (format: CLI001, CLI002, etc.)
- [ ] Appointments sheet: appointment_id auto-increments (format: APT001, APT002, etc.)
- [ ] Provider_Availability sheet: availability_id auto-increments (format: AVL001, AVL002, etc.)
- [ ] Provider_Exceptions sheet: exception_id auto-increments (format: EXC001, EXC002, etc.)
- [ ] Activity_Log sheet: log_id auto-increments (format: LOG001, LOG002, etc.)
- [ ] Confirmation_Tracking sheet: confirmation_id auto-increments (format: CNF001, CNF002, etc.)
- [ ] IDs persist correctly when rows are added
- [ ] No duplicate IDs generated

**Technical Notes**:
- Use formulas like: `="PROV"&TEXT(ROW()-1,"000")`
- Consider using Apps Script for more robust ID generation if formulas are insufficient
- Document formula logic in System_Config or separate documentation

---

### Issue #4: Populate System_Config with default settings

**Labels**: `phase-1`, `configuration`, `setup`

**Description**:
Add default system configuration values.

**Acceptance Criteria**:
- [ ] Add row: setting_name="business_name", setting_value="[Your Business Name]"
- [ ] Add row: setting_name="business_hours_start", setting_value="09:00"
- [ ] Add row: setting_name="business_hours_end", setting_value="17:00"
- [ ] Add row: setting_name="default_time_slot_minutes", setting_value="30"
- [ ] Add row: setting_name="available_time_slots", setting_value="15,30,60"
- [ ] Add row: setting_name="daily_list_generation_time", setting_value="18:00"
- [ ] Add row: setting_name="daily_list_days_ahead", setting_value="2"
- [ ] Add row: setting_name="timezone", setting_value="America/New_York" (adjust as needed)
- [ ] Add row: setting_name="receptionist_email", setting_value="[email]"
- [ ] Document what each setting controls

**Technical Notes**:
- These values will be read by Apps Script functions
- Consider creating a helper function `getConfig(settingName)` in Apps Script

---

### Issue #5: Add sample data for testing

**Labels**: `phase-1`, `testing`, `sample-data`

**Description**:
Populate sheets with sample data for testing and demonstration.

**Acceptance Criteria**:
- [ ] Add 3-5 sample providers with different service types
- [ ] Add 5-10 sample services (consultation, treatment, follow-up, etc.)
- [ ] Add 10-15 sample clients (mix of members and non-members)
- [ ] Add sample provider availability (weekly schedules)
- [ ] Add 2-3 sample provider exceptions (time off)
- [ ] Add 10-20 sample appointments (various statuses)
- [ ] Add sample activity log entries
- [ ] Add sample confirmation tracking entries
- [ ] Ensure referential integrity (valid IDs across sheets)

**Technical Notes**:
- Use realistic data for better testing
- Include edge cases (same-day appointments, overlapping times, etc.)
- Mark sample data clearly so it can be deleted later

---

## Epic: Phase 2 - Basic Booking

### Issue #6: Set up Apps Script project

**Labels**: `phase-2`, `setup`, `apps-script`

**Description**:
Initialize Google Apps Script project and set up basic structure.

**Acceptance Criteria**:
- [ ] Create new Apps Script project bound to the Google Sheets
- [ ] Create file: `Config.gs` for configuration and constants
- [ ] Create file: `DataAccess.gs` for database operations
- [ ] Create file: `Appointments.gs` for appointment-related functions
- [ ] Create file: `Validation.gs` for validation logic
- [ ] Create file: `Calendar.gs` for Google Calendar integration
- [ ] Create file: `Utils.gs` for utility/helper functions
- [ ] Create file: `Logging.gs` for activity logging
- [ ] Add JSDoc comments for main files
- [ ] Set up script properties for sensitive configuration

**Technical Notes**:
- Follow modular design for maintainability
- Use `const` for constants (sheet names, column indices)
- Document all functions with JSDoc

---

### Issue #7: Implement configuration helper functions

**Labels**: `phase-2`, `apps-script`, `configuration`

**Description**:
Create helper functions to read from System_Config sheet.

**Acceptance Criteria**:
- [ ] Function: `getConfig(settingName)` - returns setting value
- [ ] Function: `setConfig(settingName, settingValue)` - updates setting
- [ ] Function: `getAllConfig()` - returns all settings as object
- [ ] Cache configuration in memory for performance
- [ ] Handle missing settings gracefully (return defaults or throw error)
- [ ] Unit tests for config functions

**Technical Notes**:
```javascript
// Example usage:
const businessHoursStart = getConfig('business_hours_start');
```

---

### Issue #8: Implement client search and creation

**Labels**: `phase-2`, `apps-script`, `feature`

**Description**:
Create functions to search for existing clients and create new ones.

**Acceptance Criteria**:
- [ ] Function: `searchClientByPhone(phoneNumber)` - returns client data or null
- [ ] Function: `searchClientByName(name)` - returns array of matching clients
- [ ] Function: `createClient(name, phone, email, isMember, notes)` - creates new client and returns client_id
- [ ] Function: `updateClient(clientId, updateData)` - updates client information
- [ ] Function: `getClientHistory(clientId)` - returns all appointments for client
- [ ] Validate required fields (name, phone)
- [ ] Normalize phone numbers (strip formatting)
- [ ] Update first_visit_date on creation, last_visit_date on appointments

**Technical Notes**:
- Use `SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients')`
- Consider using `getDataRange()` and filtering in memory for performance
- Phone normalization: remove spaces, dashes, parentheses

---

### Issue #9: Implement provider and service data access

**Labels**: `phase-2`, `apps-script`, `feature`

**Description**:
Create functions to retrieve provider and service information.

**Acceptance Criteria**:
- [ ] Function: `getAllProviders(activeOnly = true)` - returns array of providers
- [ ] Function: `getProvider(providerId)` - returns provider data
- [ ] Function: `getProvidersByService(serviceId)` - returns providers offering service
- [ ] Function: `getAllServices()` - returns array of services
- [ ] Function: `getService(serviceId)` - returns service data
- [ ] Function: `getServiceDurations(serviceId)` - returns available durations
- [ ] Cache results for performance (with cache invalidation)

**Technical Notes**:
- Filter inactive providers unless explicitly requested
- Parse comma-separated services_offered field

---

### Issue #10: Implement availability checking logic

**Labels**: `phase-2`, `apps-script`, `feature`, `complex`

**Description**:
Create functions to check provider availability and find open time slots.

**Acceptance Criteria**:
- [ ] Function: `getProviderAvailability(providerId, date)` - returns available hours for date
- [ ] Function: `getAvailableSlots(providerId, date, duration)` - returns array of available time slots
- [ ] Function: `isSlotAvailable(providerId, date, startTime, duration)` - boolean check
- [ ] Check against recurring availability schedule
- [ ] Check against provider exceptions (time off)
- [ ] Check against existing appointments (no double-booking)
- [ ] Handle edge cases (overnight shifts, partial availability)
- [ ] Consider time slot granularity from config

**Technical Notes**:
- Complex logic - break into smaller functions
- Use moment.js or careful date arithmetic
- Consider provider's weekly schedule + exceptions + existing bookings
```javascript
// Example logic:
1. Get recurring availability for day of week
2. Subtract any exceptions for specific date
3. Subtract existing booked appointments
4. Return remaining slots divided by time slot granularity
```

---

### Issue #11: Implement appointment booking function

**Labels**: `phase-2`, `apps-script`, `feature`, `core`

**Description**:
Create the core function to book appointments with full validation.

**Acceptance Criteria**:
- [ ] Function: `bookAppointment(appointmentData)` - creates appointment and returns appointment_id
- [ ] Validate all required fields (client_id, provider_id, service_id, date, time, duration)
- [ ] Validate client, provider, service exist
- [ ] Validate time slot is available (no conflicts)
- [ ] Validate date/time is in the future (or same day if allowed)
- [ ] Create appointment record in Appointments sheet
- [ ] Create Google Calendar event (call calendar integration)
- [ ] Log activity (call logging function)
- [ ] Return appointment confirmation data
- [ ] Handle errors gracefully with clear error messages

**Technical Notes**:
```javascript
// Example appointmentData object:
{
  clientId: 'CLI001',
  providerId: 'PROV001',
  serviceId: 'SERV001',
  date: '2024-01-15',
  startTime: '10:00',
  duration: 60,
  notes: 'First visit'
}
```

---

### Issue #12: Implement Google Calendar integration

**Labels**: `phase-2`, `apps-script`, `calendar`, `integration`

**Description**:
Create functions to sync appointments with Google Calendar.

**Acceptance Criteria**:
- [ ] Function: `createCalendarEvent(appointmentId)` - creates calendar event, returns event_id
- [ ] Function: `updateCalendarEvent(appointmentId)` - updates existing event
- [ ] Function: `deleteCalendarEvent(appointmentId)` - removes event
- [ ] Create one calendar per provider (or use provider's existing calendar)
- [ ] Event title format: "[Service] - [Client Name]"
- [ ] Event description includes: client phone, service type, notes
- [ ] Event time matches appointment exactly
- [ ] Color-code by appointment status (booked=blue, confirmed=green, etc.)
- [ ] Store calendar_event_id in Appointments sheet
- [ ] Handle calendar API errors gracefully

**Technical Notes**:
- Use `CalendarApp.getCalendarById()` or `CalendarApp.createCalendar()`
- May need to create provider calendars on first use
- Consider storing calendar IDs in Providers sheet or System_Config
```javascript
const calendar = CalendarApp.getCalendarById(providerEmail);
const event = calendar.createEvent(title, startTime, endTime, {description: details});
```

---

### Issue #13: Create booking UI (Apps Script Web App or Sidebar)

**Labels**: `phase-2`, `ui`, `apps-script`, `frontend`

**Description**:
Build user interface for receptionists to book appointments.

**Acceptance Criteria**:
- [ ] Create HTML/CSS/JavaScript for booking form
- [ ] Fields: Client search/create, Service selection, Provider selection, Date picker, Time slot selection
- [ ] Client search with autocomplete (search by name or phone)
- [ ] "New Client" option to create client on the fly
- [ ] Service dropdown populated from Services sheet
- [ ] Provider dropdown filtered by selected service
- [ ] Date picker (Calendar UI)
- [ ] Time slot dropdown showing available slots only
- [ ] Duration selection based on service defaults
- [ ] Notes field (optional)
- [ ] Submit button triggers `bookAppointment()`
- [ ] Show success/error messages
- [ ] Clear form after successful booking
- [ ] Mobile-friendly responsive design

**Technical Notes**:
- Use `HtmlService.createHtmlOutputFromFile()`
- Can use Google Apps Script sidebar or standalone web app
- Consider using `google.script.run` for async calls to backend
- Example: https://developers.google.com/apps-script/guides/html

**Alternative**: Create a simpler Google Form that triggers Apps Script on submit

---

### Issue #14: Add manual entry fallback (direct sheet editing)

**Labels**: `phase-2`, `documentation`, `ux`

**Description**:
Document process for manual appointment entry directly in Appointments sheet.

**Acceptance Criteria**:
- [ ] Create documentation for manual entry workflow
- [ ] Create onEdit() trigger to validate manual entries
- [ ] Trigger creates calendar event when row manually added
- [ ] Trigger logs activity when row manually added
- [ ] Trigger validates required fields
- [ ] Show error message if validation fails
- [ ] Prevent duplicate appointment_ids
- [ ] Update created_date automatically

**Technical Notes**:
- Use `function onEdit(e)` installable trigger
- Validate only Appointments sheet edits
- Be careful with infinite loops (trigger calling itself)

---

## Epic: Phase 3 - Activity Logging

### Issue #15: Implement centralized logging function

**Labels**: `phase-3`, `apps-script`, `logging`

**Description**:
Create robust activity logging system.

**Acceptance Criteria**:
- [ ] Function: `logActivity(actionType, appointmentId, clientId, providerId, previousValue, newValue, notes)` - creates log entry
- [ ] Auto-generate log_id
- [ ] Auto-capture timestamp
- [ ] Auto-capture user (Session.getActiveUser().getEmail())
- [ ] Validate action_type against allowed values
- [ ] Handle null/missing values gracefully
- [ ] Function is called by all appointment operations (book/cancel/reschedule/check-in/etc.)
- [ ] Performance: batch logging if needed (don't slow down operations)

**Technical Notes**:
```javascript
logActivity('book', 'APT001', 'CLI001', 'PROV001', null, 'Booked', 'Client requested morning slot');
logActivity('reschedule', 'APT001', 'CLI001', 'PROV001', '2024-01-15 10:00', '2024-01-16 14:00', 'Client conflict');
```

---

### Issue #16: Implement check-in functionality

**Labels**: `phase-3`, `apps-script`, `feature`

**Description**:
Create functions to check in clients for appointments.

**Acceptance Criteria**:
- [ ] Function: `checkInClient(appointmentId, checkInTime, isLate, minutesLate)` - updates appointment status
- [ ] Update appointment status to "Checked-in"
- [ ] Record check-in time in activity log
- [ ] If client is late, log minutes late
- [ ] Update calendar event color (optional)
- [ ] Return success confirmation
- [ ] Handle errors (appointment not found, already checked in, etc.)

**Technical Notes**:
- `checkInTime` defaults to current time if not provided
- Consider adding a separate "Late Check-ins" tracking

---

### Issue #17: Implement cancellation functionality

**Labels**: `phase-3`, `apps-script`, `feature`

**Description**:
Create functions to cancel appointments.

**Acceptance Criteria**:
- [ ] Function: `cancelAppointment(appointmentId, reason)` - cancels appointment
- [ ] Update appointment status to "Cancelled"
- [ ] Log activity with cancellation reason
- [ ] Delete Google Calendar event
- [ ] Check if daily list already sent for appointment date
- [ ] If daily list sent, trigger provider notification
- [ ] Return success confirmation

**Technical Notes**:
- Don't delete appointment record (keep for history)
- Add `cancelled_date` field to Appointments sheet (optional)

---

### Issue #18: Implement reschedule functionality

**Labels**: `phase-3`, `apps-script`, `feature`, `complex`

**Description**:
Create functions to reschedule appointments.

**Acceptance Criteria**:
- [ ] Function: `rescheduleAppointment(appointmentId, newDate, newTime, newProviderId, reason)` - reschedules appointment
- [ ] Validate new time slot is available
- [ ] Update appointment record with new date/time/provider
- [ ] Update Google Calendar event (or delete old and create new)
- [ ] Log activity with old and new values
- [ ] Check if daily list already sent
- [ ] If daily list sent, trigger provider notifications (both old and new provider)
- [ ] Update appointment status to "Rescheduled" or back to "Booked"
- [ ] Return success confirmation

**Technical Notes**:
- Complex: affects two providers if provider changes
- Consider whether to create new appointment record vs. updating existing
- Recommendation: update existing for continuity, but log old values

---

### Issue #19: Implement no-show tracking

**Labels**: `phase-3`, `apps-script`, `feature`

**Description**:
Create functions to mark appointments as no-shows.

**Acceptance Criteria**:
- [ ] Function: `markNoShow(appointmentId, notes)` - marks appointment as no-show
- [ ] Update appointment status to "No-show"
- [ ] Log activity
- [ ] Update calendar event (optional: mark as cancelled or change color)
- [ ] Track no-show count per client (for reporting)
- [ ] Return success confirmation

**Technical Notes**:
- Consider adding `no_show_count` to Clients sheet
- Could trigger automated follow-up or flag high no-show clients

---

### Issue #20: Implement confirmation tracking

**Labels**: `phase-3`, `apps-script`, `feature`

**Description**:
Create functions to log client confirmation calls/texts.

**Acceptance Criteria**:
- [ ] Function: `logConfirmation(appointmentId, method, status, notes)` - records confirmation attempt
- [ ] Create entry in Confirmation_Tracking sheet
- [ ] Log activity
- [ ] method: "Call", "Text", "Email"
- [ ] status: "Confirmed", "Declined", "Rescheduled", "No-response"
- [ ] If status is "Declined", trigger cancellation workflow
- [ ] If status is "Rescheduled", prompt for reschedule workflow
- [ ] Update appointment status to "Confirmed" if client confirmed

**Technical Notes**:
- This is manual process in v1 (receptionist logs after making call)
- Can be part of booking UI or separate UI

---

### Issue #21: Create activity log viewer

**Labels**: `phase-3`, `ui`, `reporting`

**Description**:
Build interface to view and filter activity logs.

**Acceptance Criteria**:
- [ ] Create UI (sidebar or web app) to view activity logs
- [ ] Filter by: date range, action type, provider, client
- [ ] Show most recent logs first
- [ ] Display: timestamp, action, appointment details, user, notes
- [ ] Export to CSV option
- [ ] Search functionality
- [ ] Pagination for large log sets

**Technical Notes**:
- Can be built into main booking UI or separate
- Consider using Google Sheets native filtering as simpler alternative

---

## Epic: Phase 4 - Automation

### Issue #22: Implement daily list generation

**Labels**: `phase-4`, `automation`, `apps-script`, `core`

**Description**:
Create automated daily appointment list generation and email to providers.

**Acceptance Criteria**:
- [ ] Function: `generateDailyLists()` - main function triggered daily
- [ ] Read config: daily_list_days_ahead (default: 2)
- [ ] Calculate target date (today + X days)
- [ ] For each active provider:
  - Query appointments for target date
  - Format email with appointment details (time, client name, service, notes)
  - Send email to provider
  - Mark appointments with "daily_list_sent_date" field
- [ ] Email template: professional, clear, includes all relevant details
- [ ] Handle providers with no appointments (send "No appointments" email or skip)
- [ ] Log generation in activity log or separate automation log
- [ ] Handle errors (provider email invalid, etc.)

**Technical Notes**:
```javascript
// Email format example:
Subject: Your Appointments for [Date]

Hello [Provider Name],

Here are your scheduled appointments for [Day of Week], [Date]:

9:00 AM - 10:00 AM
Client: John Doe
Service: Consultation
Phone: 555-1234
Notes: First visit

10:30 AM - 11:30 AM
Client: Jane Smith
Service: Follow-up
Phone: 555-5678
Notes: Follow-up from last week

Total appointments: 2

Thank you!
```

- Use `MailApp.sendEmail()` or `GmailApp.sendEmail()`
- May need to add "daily_list_sent_date" column to Appointments sheet

---

### Issue #23: Set up time-based trigger for daily lists

**Labels**: `phase-4`, `automation`, `setup`

**Description**:
Configure Apps Script time-based trigger to run daily list generation.

**Acceptance Criteria**:
- [ ] Create installable time-based trigger
- [ ] Trigger executes `generateDailyLists()` daily
- [ ] Execution time based on config: daily_list_generation_time (default: 6 PM)
- [ ] Handle trigger failures gracefully
- [ ] Set up failure notifications (email script owner)
- [ ] Document how to modify/disable trigger

**Technical Notes**:
- Use `ScriptApp.newTrigger('generateDailyLists').timeBased().atHour(18).everyDays(1).create()`
- Monitor trigger executions in Apps Script dashboard
- Consider retry logic if generation fails

---

### Issue #24: Implement provider change notifications

**Labels**: `phase-4`, `automation`, `apps-script`

**Description**:
Send email notifications to providers when appointments change after daily list sent.

**Acceptance Criteria**:
- [ ] Function: `notifyProviderOfChange(appointmentId, changeType, details)` - sends notification email
- [ ] Trigger on: cancel, reschedule, new booking (after daily list sent)
- [ ] Check if daily_list_sent_date exists for appointment date
- [ ] Only send if daily list already sent
- [ ] Email format: clearly indicate what changed (cancelled, rescheduled, new)
- [ ] Include appointment details and new information
- [ ] Log notification in activity log
- [ ] Handle multiple changes (batch if many changes at once)

**Technical Notes**:
```javascript
// Example email for cancellation:
Subject: Appointment CANCELLED - [Date] [Time]

Hello [Provider Name],

The following appointment has been CANCELLED:

Date: [Date]
Time: [Time]
Client: [Name]
Service: [Service]
Reason: [Cancellation reason]

Please update your schedule accordingly.
```

---

### Issue #25: Implement automatic calendar sync

**Labels**: `phase-4`, `automation`, `calendar`

**Description**:
Ensure Google Calendar stays in sync with Appointments sheet.

**Acceptance Criteria**:
- [ ] Function: `syncCalendarEvents()` - reconciles calendars with sheet data
- [ ] Run periodically (daily or weekly)
- [ ] Find orphaned calendar events (exist in calendar but not sheet)
- [ ] Find missing calendar events (exist in sheet but not calendar)
- [ ] Create missing events
- [ ] Option to delete orphaned events (or flag for review)
- [ ] Update event details if changed in sheet
- [ ] Log sync results
- [ ] Handle errors gracefully

**Technical Notes**:
- This is a safety mechanism for data integrity
- Could be triggered manually or time-based
- Be careful with bulk deletions

---

### Issue #26: Add automatic client history updates

**Labels**: `phase-4`, `automation`, `apps-script`

**Description**:
Automatically update client first_visit_date and last_visit_date.

**Acceptance Criteria**:
- [ ] On appointment creation: if client has no first_visit_date, set it
- [ ] On appointment completion: update last_visit_date
- [ ] Calculate total_visits count (optional)
- [ ] Calculate no_show_count (from completed no-show appointments)
- [ ] Update these fields automatically via triggers or within appointment functions

**Technical Notes**:
- Add fields to Clients sheet: total_visits, no_show_count
- Can be calculated on-the-fly or stored

---

## Epic: Phase 5 - Reporting

### Issue #27: Create daily schedule report

**Labels**: `phase-5`, `reporting`, `feature`

**Description**:
Build report showing daily schedule for all providers.

**Acceptance Criteria**:
- [ ] New sheet: "Report_Daily_Schedule"
- [ ] Input: Date selector (cell or dropdown)
- [ ] Output: Table showing all appointments for selected date
- [ ] Columns: Time, Provider, Client, Service, Status, Notes
- [ ] Sort by time
- [ ] Color-code by status
- [ ] Show provider utilization (booked hours / available hours)
- [ ] Auto-refresh when date changed
- [ ] Print-friendly format

**Technical Notes**:
- Use QUERY() or FILTER() formulas
- Or create Apps Script function to generate report
- Consider using conditional formatting for status colors

---

### Issue #28: Create weekly schedule overview

**Labels**: `phase-5`, `reporting`, `feature`

**Description**:
Build report showing weekly schedule overview for all providers.

**Acceptance Criteria**:
- [ ] New sheet: "Report_Weekly_Schedule"
- [ ] Input: Week start date
- [ ] Output: Grid with days as columns, providers as rows
- [ ] Show appointment count per provider per day
- [ ] Click cell to see appointment details (optional: data validation comment or separate detail sheet)
- [ ] Highlight fully booked days
- [ ] Show weekly totals per provider
- [ ] Auto-refresh when week changed

**Technical Notes**:
- Use QUERY() with pivot or create custom Apps Script function
- Consider using pivot tables

---

### Issue #29: Create provider utilization report

**Labels**: `phase-5`, `reporting`, `analytics`

**Description**:
Build report analyzing provider utilization rates.

**Acceptance Criteria**:
- [ ] New sheet: "Report_Provider_Utilization"
- [ ] Input: Date range (start, end)
- [ ] For each provider, calculate:
  - Total available hours (based on availability schedule)
  - Total booked hours
  - Utilization rate (booked / available)
  - Number of appointments
  - Average appointment duration
  - Revenue (if pricing added later)
- [ ] Sort by utilization rate
- [ ] Visualize with charts (bar chart or gauge)
- [ ] Filter by service type (optional)

**Technical Notes**:
- Complex calculation - may need Apps Script
- Consider caching results for performance

---

### Issue #30: Create cancellation and no-show report

**Labels**: `phase-5`, `reporting`, `analytics`

**Description**:
Build report analyzing cancellations and no-shows.

**Acceptance Criteria**:
- [ ] New sheet: "Report_Cancellations_NoShows"
- [ ] Input: Date range
- [ ] Metrics:
  - Total appointments
  - Total cancellations (count and %)
  - Total no-shows (count and %)
  - Cancellation rate by provider
  - No-show rate by provider
  - No-show rate by client (identify repeat offenders)
  - Cancellation reasons (if tracked)
- [ ] Charts: pie chart for appointment outcomes, bar chart by provider
- [ ] Highlight clients with high no-show rates

**Technical Notes**:
- Use COUNTIF() and QUERY() formulas
- May need Apps Script for complex grouping

---

### Issue #31: Create client visit history report

**Labels**: `phase-5`, `reporting`, `feature`

**Description**:
Build report showing complete appointment history for a client.

**Acceptance Criteria**:
- [ ] New sheet: "Report_Client_History"
- [ ] Input: Client ID or name search
- [ ] Output: List of all appointments for client
- [ ] Columns: Date, Time, Provider, Service, Status, Notes
- [ ] Sort by date (most recent first)
- [ ] Summary statistics:
  - First visit date
  - Last visit date
  - Total visits
  - No-shows count
  - Cancellations count
  - Preferred provider (if pattern exists)
- [ ] Print-friendly format

**Technical Notes**:
- Use FILTER() or QUERY()
- Or leverage `getClientHistory()` function from earlier

---

### Issue #32: Create activity log report

**Labels**: `phase-5`, `reporting`, `feature`

**Description**:
Build filterable report for activity logs.

**Acceptance Criteria**:
- [ ] New sheet: "Report_Activity_Log"
- [ ] Input: Date range, action type filter, provider filter
- [ ] Output: Filtered activity log entries
- [ ] Columns: Timestamp, Action, Appointment ID, Client, Provider, User, Details
- [ ] Sort by timestamp (most recent first)
- [ ] Search functionality
- [ ] Export to CSV button (Apps Script)
- [ ] Show statistics (total actions, actions by type)

**Technical Notes**:
- Can simply reference Activity_Log sheet with filters
- Or create dynamic report with Apps Script

---

### Issue #33: Set up Google Data Studio dashboard (optional)

**Labels**: `phase-5`, `reporting`, `analytics`, `optional`

**Description**:
Create interactive dashboard in Google Looker Studio (formerly Data Studio).

**Acceptance Criteria**:
- [ ] Connect Google Sheets as data source
- [ ] Create dashboard with:
  - Daily appointments chart (time series)
  - Provider utilization gauges
  - Top services pie chart
  - Cancellation/no-show trend line
  - Client membership breakdown
- [ ] Interactive date range filter
- [ ] Provider filter
- [ ] Service type filter
- [ ] Auto-refresh data
- [ ] Share with stakeholders

**Technical Notes**:
- Use Looker Studio: https://lookerstudio.google.com/
- Free tool, connects directly to Google Sheets
- More advanced than sheet-based reports

---

## Epic: Phase 6 - Testing & Training

### Issue #34: Create test plan and test cases

**Labels**: `phase-6`, `testing`, `qa`

**Description**:
Document comprehensive test plan covering all functionality.

**Acceptance Criteria**:
- [ ] Create test plan document
- [ ] Test cases for: booking, cancellation, rescheduling, check-in, no-show
- [ ] Test cases for: availability checking, conflict detection
- [ ] Test cases for: calendar sync, daily list generation, notifications
- [ ] Test cases for: data validation, error handling
- [ ] Test cases for: all reports
- [ ] Edge cases: same-day bookings, overlapping appointments, time zone issues
- [ ] Performance tests: 100+ appointments, multiple concurrent users
- [ ] Define expected results for each test

**Technical Notes**:
- Use spreadsheet or document format
- Include test data setup instructions

---

### Issue #35: Perform user acceptance testing (UAT)

**Labels**: `phase-6`, `testing`, `qa`

**Description**:
Conduct UAT with actual receptionists and collect feedback.

**Acceptance Criteria**:
- [ ] Recruit 2-3 receptionist testers
- [ ] Provide UAT environment (copy of system with test data)
- [ ] Walk through test scenarios from test plan
- [ ] Collect feedback on:
  - Ease of use
  - UI clarity
  - Missing features
  - Pain points
  - Performance issues
- [ ] Document all issues found
- [ ] Prioritize issues (critical, high, medium, low)
- [ ] Fix critical and high priority issues
- [ ] Retest after fixes

**Technical Notes**:
- Use separate Google Sheet for UAT (don't test in production)
- Consider using Google Forms for feedback collection

---

### Issue #36: Create user documentation

**Labels**: `phase-6`, `documentation`, `training`

**Description**:
Write comprehensive user guide for receptionists.

**Acceptance Criteria**:
- [ ] Create Google Doc: "Appointment System User Guide"
- [ ] Sections:
  - Overview and introduction
  - Booking an appointment (step-by-step with screenshots)
  - Searching for clients
  - Creating new clients
  - Checking in clients
  - Cancelling appointments
  - Rescheduling appointments
  - Logging confirmation calls
  - Marking no-shows
  - Viewing reports
  - Managing provider availability
  - Troubleshooting common issues
- [ ] Include screenshots and examples
- [ ] FAQ section
- [ ] Contact for support

**Technical Notes**:
- Use Google Docs for easy sharing and updates
- Include video tutorials (Loom or Google Meet recordings) if possible

---

### Issue #37: Create admin documentation

**Labels**: `phase-6`, `documentation`

**Description**:
Write technical documentation for system administrators.

**Acceptance Criteria**:
- [ ] Create Google Doc: "Appointment System Admin Guide"
- [ ] Sections:
  - System architecture overview
  - Data structure (all sheets explained)
  - Apps Script functions reference
  - Configuration settings
  - Adding/removing providers
  - Adding/removing services
  - Managing triggers
  - Backup and restore procedures
  - Troubleshooting script errors
  - Monitoring system health
  - Upgrading the system
- [ ] Code comments and inline documentation
- [ ] Deployment checklist

**Technical Notes**:
- Include Apps Script code snippets
- Document all configuration options

---

### Issue #38: Conduct receptionist training sessions

**Labels**: `phase-6`, `training`

**Description**:
Train all receptionists on using the system.

**Acceptance Criteria**:
- [ ] Schedule training sessions (1-2 hours each)
- [ ] Prepare training materials (slides, handouts)
- [ ] Cover all core workflows:
  - Booking appointments
  - Managing appointments (cancel/reschedule/check-in)
  - Searching clients
  - Logging confirmations
  - Viewing reports
- [ ] Hands-on practice with test data
- [ ] Q&A session
- [ ] Provide user guide after training
- [ ] Follow-up support in first week of use

**Technical Notes**:
- Record training session for future reference
- Consider creating quick reference card (1-page cheat sheet)

---

### Issue #39: Set up backup and disaster recovery

**Labels**: `phase-6`, `setup`, `critical`

**Description**:
Implement backup strategy to prevent data loss.

**Acceptance Criteria**:
- [ ] Enable Google Sheets version history (already enabled by default)
- [ ] Create manual backup procedure documentation
- [ ] Apps Script function: `backupToGoogleDrive()` - copies entire sheet to Drive
- [ ] Schedule weekly automatic backups (time-based trigger)
- [ ] Store backups in dedicated Google Drive folder
- [ ] Test restore procedure
- [ ] Document backup locations and retention policy
- [ ] Set up notification for backup failures

**Technical Notes**:
```javascript
// Backup function example:
function backupToGoogleDrive() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const destFolder = DriveApp.getFolderById('FOLDER_ID');
  const timestamp = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd_HH-mm');
  const backupFile = ss.copy('Appointment_Backup_' + timestamp);
  destFolder.addFile(DriveApp.getFileById(backupFile.getId()));
}
```

---

### Issue #40: Launch system and monitor

**Labels**: `phase-6`, `deployment`, `launch`

**Description**:
Go live with the system and monitor for issues.

**Acceptance Criteria**:
- [ ] Final review of all functionality
- [ ] Migrate sample data or start fresh
- [ ] Share Google Sheet with all receptionists (edit access)
- [ ] Share provider calendars with receptionist account
- [ ] Enable all triggers (daily lists, sync, backups)
- [ ] Send launch announcement to staff
- [ ] Monitor for first week:
  - Script execution logs
  - User feedback
  - Error reports
  - Performance issues
- [ ] Daily check-ins with receptionists
- [ ] Quick fixes for any critical issues
- [ ] Document lessons learned

**Technical Notes**:
- Use Apps Script execution logs to monitor: `console.log()` statements
- Set up error notifications to admin email
- Consider "soft launch" with limited users first

---

## Additional Issues (Enhancements & Nice-to-Have)

### Issue #41: Add appointment reminder system (future)

**Labels**: `enhancement`, `future`, `automation`

**Description**:
Automate appointment reminders via email/SMS (requires external service).

**Acceptance Criteria**:
- [ ] Research: Free SMS services (Twilio free tier, etc.)
- [ ] Implement: Send reminder X hours/days before appointment
- [ ] Configurable reminder timing
- [ ] Track reminder sent status
- [ ] Include appointment details and cancellation instructions
- [ ] Handle client communication preferences

**Technical Notes**:
- This requires external service (not purely Google)
- Consider email-to-SMS gateways as free alternative

---

### Issue #42: Add waitlist management (future)

**Labels**: `enhancement`, `future`, `feature`

**Description**:
Allow clients to join waitlist for fully booked time slots.

**Acceptance Criteria**:
- [ ] New sheet: Waitlist
- [ ] Add client to waitlist for specific provider/date/time
- [ ] When appointment cancelled, notify waitlist clients
- [ ] First-come-first-served or priority-based
- [ ] Auto-remove from waitlist when booked

---

### Issue #43: Add recurring appointments (future)

**Labels**: `enhancement`, `future`, `feature`

**Description**:
Support booking recurring appointments (weekly, bi-weekly, monthly).

**Acceptance Criteria**:
- [ ] UI to create recurring appointment pattern
- [ ] Create multiple appointment records at once
- [ ] Validate all slots are available
- [ ] Option to cancel entire series or single instance
- [ ] Track series in database

---

### Issue #44: Add client self-service booking (future)

**Labels**: `enhancement`, `future`, `feature`

**Description**:
Allow clients to book appointments via public Google Form or web app.

**Acceptance Criteria**:
- [ ] Public-facing booking form
- [ ] Real-time availability checking
- [ ] Prevent double-booking
- [ ] Email confirmation to client
- [ ] Security: prevent spam, validate inputs

**Technical Notes**:
- Major enhancement, requires careful design
- Security concerns with public access

---

### Issue #45: Integrate payment tracking (future)

**Labels**: `enhancement`, `future`, `integration`

**Description**:
Track appointment pricing and payment status.

**Acceptance Criteria**:
- [ ] Add pricing to Services sheet
- [ ] Add payment_status to Appointments
- [ ] Track amount paid, payment method
- [ ] Revenue reports
- [ ] Integration with payment processors (optional)

---

## Summary

**Total Issues**: 45
- Phase 1 (Core Data Structure): 5 issues
- Phase 2 (Basic Booking): 9 issues
- Phase 3 (Activity Logging): 7 issues
- Phase 4 (Automation): 5 issues
- Phase 5 (Reporting): 7 issues
- Phase 6 (Testing & Training): 7 issues
- Future Enhancements: 5 issues

**Estimated Complexity**:
- Phase 1: Low (mostly setup)
- Phase 2: Medium-High (core logic)
- Phase 3: Medium (straightforward CRUD)
- Phase 4: Medium-High (triggers and email)
- Phase 5: Medium (reporting logic)
- Phase 6: Low-Medium (testing and docs)

**Recommended Sprint Planning**:
- Sprint 1: Issues #1-5 (Phase 1)
- Sprint 2: Issues #6-10 (Phase 2 setup)
- Sprint 3: Issues #11-14 (Phase 2 core booking)
- Sprint 4: Issues #15-21 (Phase 3 logging)
- Sprint 5: Issues #22-26 (Phase 4 automation)
- Sprint 6: Issues #27-33 (Phase 5 reporting)
- Sprint 7: Issues #34-40 (Phase 6 launch)

**Priority Labels**:
- `critical`: Must-have for MVP
- `high`: Important for v1
- `medium`: Nice-to-have for v1
- `low`: Post-v1 enhancement
