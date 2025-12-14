# Appointment Booking System - Requirements Document

## 1. Executive Summary

A Google Sheets/Forms/Calendar-based appointment booking system for managing appointments across multiple service providers, operated by receptionists with comprehensive activity logging and reporting.

## 2. System Overview

### 2.1 Core Technologies
- **Google Sheets**: Data storage (appointments, clients, providers, availability, logs)
- **Google Forms**: Data entry interface for booking
- **Google Calendar**: Visual schedule management
- **Google Apps Script**: Automation and business logic
- **Google Data Studio/Looker Studio**: Reporting and analytics (optional)

### 2.2 Users
- **Receptionists**:
  - Primary system users (shared computer/Google account)
  - Book/cancel/reschedule appointments
  - Manage provider availability
  - Check-in clients
  - Log all activities
  - Make confirmation calls/texts manually
- **Service Providers**: 5-10 providers
  - Receive daily appointment lists
  - Get notified of changes after list generation
- **Clients**: End users receiving services
  - No direct system access (receptionist-mediated)

## 3. Functional Requirements

### 3.1 Provider Management

#### 3.1.1 Provider Information
- Provider ID (unique)
- Name
- Service types offered (multiple)
- Contact information
- Active/inactive status

#### 3.1.2 Availability Management
- **Overall Business Hours**: System-wide default schedule
- **Provider-specific Schedule**:
  - Weekly recurring availability
  - Override specific dates (vacations, time off)
  - Configurable time slot granularity (15min, 30min, 60min - default options)
- **Managed by**: Receptionist

### 3.2 Service Type Management

#### 3.2.1 Service Attributes
- Service ID (unique)
- Service name/category
- Default duration options (30min, 60min, 90min, etc.)
- Description (optional)

### 3.3 Client Management

#### 3.3.1 Client Information (Required)
- Client ID (auto-generated)
- Name (required)
- Phone number (required)
- Membership status (yes/no)

#### 3.3.2 Client Information (Optional)
- Email
- Notes/preferences

#### 3.3.3 Client History
- Track all past appointments
- View appointment history by client
- Track patterns (no-shows, cancellations, etc.)

### 3.4 Appointment Management

#### 3.4.1 Booking Requirements
- **Required Fields**:
  - Client information (name, phone, membership status)
  - Provider selection
  - Service type
  - Date and time
  - Duration
- **Optional Fields**:
  - Email
  - Reason for visit
  - Special notes
- **Business Rules**:
  - Same-day appointments supported
  - Prevent double-booking
  - Validate against provider availability
  - Auto-create Google Calendar events

#### 3.4.2 Appointment States
1. **Booked**: Initial state
2. **Confirmed**: Receptionist confirmed with client
3. **Checked-in**: Client arrived
4. **Completed**: Service finished
5. **No-show**: Client didn't arrive
6. **Cancelled**: Appointment cancelled
7. **Rescheduled**: Moved to different time

#### 3.4.3 Appointment Operations
- **Book**: Create new appointment
- **Cancel**: Cancel existing appointment
- **Reschedule**: Change date/time/provider
- **Check-in**: Mark client as arrived
- **Mark as no-show**: Client didn't arrive
- **Mark as late**: Client arrived late

### 3.5 Activity Logging

#### 3.5.1 Logged Activities
All activities must be logged with:
- Timestamp
- Action type (book/cancel/reschedule/check-in/no-show/late/confirmation-call)
- Appointment ID
- User (receptionist account)
- Previous state (for changes)
- New state
- Notes/reason (optional)

#### 3.5.2 Specific Logged Events
- Appointment booked
- Appointment cancelled (with reason)
- Appointment rescheduled (old → new details)
- Client checked in
- Client marked as no-show
- Client marked as late (with minutes late)
- Confirmation call made
- Confirmation text/email sent
- Any manual notes added

### 3.6 Notifications & Communication

#### 3.6.1 Provider Daily Lists (v1)
- Generate appointment list X days in advance (default: 2 days)
- Email to provider with:
  - Date
  - All appointments for that day
  - Client names, times, service types
  - Special notes
- Automated daily generation

#### 3.6.2 Provider Change Notifications
- Notify provider when appointments are:
  - Cancelled (after daily list sent)
  - Rescheduled (after daily list sent)
  - New booking added (after daily list sent)

#### 3.6.3 Client Communication (v1 - Manual)
- Receptionist manually calls/texts clients
- Receptionist logs confirmation status in system
- Fields to track:
  - Confirmation call made (date/time)
  - Confirmation method (call/text/email)
  - Client response (confirmed/declined/rescheduled)

### 3.7 Reporting & Analytics

#### 3.7.1 Required Reports
- **Daily Schedule**: By provider, by date
- **Weekly Schedule**: All providers overview
- **Provider Utilization**: Booked vs available slots
- **Cancellation Rates**: By provider, by service type, by client
- **No-show Rates**: By client, by service type
- **Client Visit History**: All appointments for a client
- **Activity Log Report**: Filterable by date, provider, action type
- **Revenue Tracking** (if pricing added): By provider, service type, time period

#### 3.7.2 Report Formats
- Google Sheets with formulas/pivot tables
- Google Data Studio dashboards (optional)
- Exportable to PDF/Excel

### 3.8 Configuration

#### 3.8.1 System Settings
- Business name
- Overall business hours (Mon-Sun, start-end times)
- Default time slot granularity (15/30/60 min)
- Daily list generation timing (e.g., 6 PM for +2 days)
- Provider notification email settings

## 4. Non-Functional Requirements

### 4.1 Technology Constraints
- **Google Services Only**: Sheets, Forms, Calendar, Apps Script, Gmail
- **Free Tier Only**: No paid services
- **Google Workspace Account**: Available for use

### 4.2 Usability
- No-code/low-code interface where possible
- Google Apps Script for automation (JavaScript)
- Intuitive for receptionists with basic computer skills
- Mobile-friendly (Google Sheets mobile app)

### 4.3 Performance
- Support 5-10 providers
- Handle 50-100 appointments per day
- Keep within Google Apps Script quotas:
  - Script runtime: 6 min/execution
  - Triggers: 20/user/hour for time-based
  - Email: 100/day (free Gmail), 1500/day (Workspace)

### 4.4 Data Integrity
- Prevent double-booking through validation
- Maintain referential integrity (appointments → clients, providers)
- Automatic backup (Google Sheets version history)

### 4.5 Security
- Shared Google account access for receptionists
- No public access to sheets (private to organization)
- Activity logging for accountability

## 5. System Architecture

### 5.1 Data Structure (Google Sheets)

#### Sheet 1: Providers
- provider_id, name, email, phone, services_offered, active_status

#### Sheet 2: Services
- service_id, service_name, default_duration_options, description

#### Sheet 3: Clients
- client_id, name, phone, email, is_member, notes, first_visit_date, last_visit_date

#### Sheet 4: Appointments
- appointment_id, client_id, provider_id, service_id, appointment_date, start_time, end_time, duration, status, created_date, notes, calendar_event_id

#### Sheet 5: Provider Availability
- availability_id, provider_id, day_of_week, start_time, end_time, effective_date_start, effective_date_end, is_recurring

#### Sheet 6: Provider Exceptions (Time Off)
- exception_id, provider_id, exception_date, start_time, end_time, reason

#### Sheet 7: Activity Log
- log_id, timestamp, action_type, appointment_id, client_id, provider_id, user, previous_value, new_value, notes

#### Sheet 8: Confirmation Tracking
- confirmation_id, appointment_id, confirmation_date, method, status, notes

#### Sheet 9: System Config
- setting_name, setting_value (key-value pairs)

### 5.2 Google Forms

#### Form 1: Book Appointment
- Client name, phone, email (optional), membership status
- Service type (dropdown)
- Provider (dropdown - filtered by service)
- Preferred date and time
- Reason/notes (optional)

#### Form 2: Quick Actions (Alternative: Apps Script UI)
- Appointment ID
- Action (check-in/cancel/no-show/mark-late)
- Notes

### 5.3 Google Calendar Integration
- One calendar per provider
- Auto-create events on booking
- Update events on reschedule
- Delete events on cancellation
- Color-code by appointment status

### 5.4 Google Apps Script Functions

#### Core Functions
- `bookAppointment()`: Create appointment, validate availability, create calendar event
- `cancelAppointment()`: Update status, log activity, delete calendar event
- `rescheduleAppointment()`: Move appointment, update calendar
- `checkInClient()`: Update status, log activity
- `markNoShow()`: Update status, log activity
- `validateAvailability()`: Check provider schedule and existing appointments

#### Automation Functions
- `generateDailyLists()`: Time-triggered (daily)
- `sendProviderNotifications()`: On-change triggered
- `syncCalendarEvents()`: Keep calendars updated
- `backupData()`: Periodic backup to Drive (optional)

#### Helper Functions
- `getAvailableSlots()`: Return open slots for provider/date
- `getClientHistory()`: Fetch all appointments for client
- `logActivity()`: Centralized logging function

## 6. User Workflows

### 6.1 Book Appointment Workflow
1. Receptionist receives call/walk-in from client
2. Search for existing client or create new
3. Select service type
4. View available providers for that service
5. Check provider availability (view open slots)
6. Select date/time slot
7. Enter appointment details
8. System validates (no conflicts)
9. System creates appointment record
10. System creates Google Calendar event
11. System logs booking activity
12. Receptionist confirms details with client

### 6.2 Check-in Workflow
1. Client arrives
2. Receptionist searches for appointment
3. Marks as checked-in
4. System logs check-in time
5. System updates appointment status
6. (Optional) Note if client is late

### 6.3 Cancellation Workflow
1. Client calls to cancel
2. Receptionist searches for appointment
3. Selects cancel action
4. Enters cancellation reason
5. System updates appointment status
6. System logs cancellation
7. System deletes calendar event
8. System checks if daily list already sent
9. If yes, send provider notification email

### 6.4 Daily List Generation Workflow
1. Time trigger executes (e.g., 6 PM)
2. Script calculates target date (today + X days)
3. For each provider:
   - Query appointments for target date
   - Format email with appointment details
   - Send email to provider
4. Mark appointments as "daily list sent" (for change tracking)

## 7. Future Enhancements (Post-v1)

### 7.1 Client Self-Service
- Public booking form
- Client portal to view/manage appointments
- Automated email/SMS confirmations

### 7.2 Advanced Automation
- Automated reminder emails/SMS (via Twilio free tier or similar)
- Waitlist management
- Recurring appointments

### 7.3 Payment Integration
- Track pricing per service
- Payment status tracking
- Integration with payment processors (Stripe, Square)

### 7.4 Advanced Analytics
- Predictive analytics for no-shows
- Revenue forecasting
- Client retention metrics

## 8. Success Metrics

### 8.1 System Adoption
- 100% of appointments logged in system
- All receptionists trained and using system
- Zero double-bookings

### 8.2 Operational Efficiency
- Reduced time to book appointments (target: <2 min)
- Accurate provider schedules (100% calendar sync)
- Complete activity logs for audit trail

### 8.3 Service Quality
- Reduced no-show rates through tracking and follow-up
- Improved provider preparation (daily lists)
- Better client experience through history tracking

## 9. Risks & Mitigation

### 9.1 Google Services Quotas
- **Risk**: Exceed free tier limits
- **Mitigation**: Monitor usage, optimize scripts, batch operations

### 9.2 Data Loss
- **Risk**: Accidental deletion or corruption
- **Mitigation**: Google Sheets version history, periodic backups to Drive

### 9.3 User Adoption
- **Risk**: Receptionists continue using old methods
- **Mitigation**: Training, make system easier than alternatives

### 9.4 Shared Account Issues
- **Risk**: Can't track individual receptionist actions
- **Mitigation**: Activity logging still provides timestamp and action tracking

## 10. Implementation Phases

### Phase 1: Core Data Structure
- Set up Google Sheets with all tabs
- Configure basic formulas and data validation

### Phase 2: Basic Booking
- Create booking form or Apps Script UI
- Implement booking function
- Calendar integration

### Phase 3: Activity Logging
- Implement comprehensive logging
- Create log viewing/filtering

### Phase 4: Automation
- Daily list generation
- Change notifications
- Calendar sync

### Phase 5: Reporting
- Create standard reports
- Set up dashboards

### Phase 6: Testing & Training
- User acceptance testing
- Receptionist training
- Documentation

## 11. Appendices

### 11.1 Glossary
- **Provider**: Service provider (generic term for practitioner/stylist/consultant/etc.)
- **Client**: Person receiving service
- **Receptionist**: Staff member managing bookings
- **Time slot**: Bookable time interval (15/30/60 min)
- **Daily list**: Email sent to provider with day's appointments

### 11.2 References
- Google Apps Script Documentation: https://developers.google.com/apps-script
- Google Sheets API: https://developers.google.com/sheets/api
- Google Calendar API: https://developers.google.com/calendar
