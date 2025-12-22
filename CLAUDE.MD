# CLAUDE.MD - AI Assistant Project Guide

## Project Overview

**OpenSlots** is a free, Google Sheets-based appointment booking system designed for small businesses with multiple service providers (5-10 providers). It uses Google Apps Script to automate scheduling, prevent conflicts, and manage client data.

**Tech Stack:**
- Google Apps Script (JavaScript ES5)
- Google Sheets (data storage)
- Google Drive API (planned for MVP 2)
- Google Calendar API (planned for MVP 2)

**Current Status:** MVP 1 (Foundation) - Complete
- 11 pre-configured sheets with validation
- Auto-generated IDs and audit trails
- 10 automated tests
- Sample data generation

## Project Structure

```
openslots/
├── apps-script/           # Google Apps Script files
│   ├── Setup.gs          # Sheet initialization & structure
│   ├── Validation.gs     # Data validation & formulas
│   ├── SampleData.gs     # Sample data generation
│   ├── Tests.gs          # Automated unit tests
│   └── appsscript.json   # Apps Script configuration
├── README.md             # User-facing documentation
├── REQUIREMENTS.md       # Detailed specifications
├── MVP_PLAN.md          # Development roadmap
└── CLAUDE.MD            # This file
```

## Key Files & Their Purpose

### apps-script/Setup.gs
- `initializeSystem()` - Creates all 11 sheets with proper structure
- `onOpen()` - Creates custom menu in Google Sheets UI
- `clearAllData()` - Removes all data while preserving structure
- Sheet definitions with headers, column widths, frozen rows

**Important Sheets:**
- `Appointments` - Core booking data
- `Clients` - Client database with ID auto-generation
- `Providers` - Service provider info
- `Provider_Availability` - Recurring weekly schedules
- `Provider_Exceptions` - One-time schedule changes (vacations, etc.)
- `Business_Holidays` - Full-day business closures (recurring or one-time)
- `Business_Exceptions` - Partial-day closures (meetings, maintenance)
- `Activity_Log` - Complete audit trail
- `System_Config` - System settings (business hours, etc.)

### apps-script/Validation.gs
- `setupValidation()` - Applies all data validation rules
- Email validation: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
- Phone validation: Flexible format supporting (XXX) XXX-XXXX, XXX-XXX-XXXX, etc.
- Time validation: HH:MM format (00:00 to 23:59)
- Auto-increment ID formulas (e.g., PROV001, CLI001, APT001)

### apps-script/SampleData.gs
- `addSampleData()` - Populates system with realistic test data
- 5 providers (Massage, Acupuncture, Physical Therapy)
- 7 services with varying durations
- 10 clients with complete contact info
- 15 appointments spanning current week
- Sample schedules, holidays, and exceptions

### apps-script/Tests.gs
- 10 comprehensive unit tests
- `runAllTests()` - Full test suite (~30-60 seconds)
- `runQuickTests()` - Fast essential tests (~15 seconds)
- Tests cover: sheet structure, validation, formulas, sample data

## Development Guidelines

### Code Style
- **JavaScript ES5** - Apps Script doesn't support ES6+
- Use `var` not `let/const`
- No arrow functions - use `function() {}`
- No template literals - use string concatenation
- Logger.log() for debugging (not console.log)

### Apps Script Limitations
- 6-minute execution timeout
- 30-minute daily execution quota (free accounts)
- No npm packages or external libraries
- No async/await (but can use Utilities.sleep())
- Date handling uses JavaScript Date object

### Testing Approach
- Always run tests after making changes
- Tests are in the UI: **Appointment System → Tests → Run All Tests**
- Quick tests available for rapid iteration
- Tests verify both structure and data validation

### Common Patterns

#### Creating New Sheets
```javascript
function createSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  return sheet;
}
```

#### Auto-increment IDs (Code-Calculated)
IDs are generated automatically when using:
- The booking UI (Appointment System → Book Appointment)
- Sample data generation (Appointment System → Add Sample Data)
- Any code that calls `addRow()` from DataAccess.gs

**Important:** If you manually add rows to sheets, you must provide IDs yourself:
- Format: PREFIX + 3-digit number (e.g., PROV001, CLI002, APT015)
- Prefixes: PROV (Providers), SERV (Services), CLI (Clients), APT (Appointments)
- Without valid IDs, on-edit triggers won't create calendar events or logs

Example manual entry:
```
Row 2: APT001 | CLI001 | PROV001 | SERV001 | 2025-12-25 | 09:00 | 09:30 | 30 | Scheduled
```

#### Data Validation
```javascript
var range = sheet.getRange(2, colIndex, 1000);
var rule = SpreadsheetApp.newDataValidation()
  .requireFormulaSatisfied('=REGEXMATCH(TO_TEXT(A2),"pattern")')
  .setAllowInvalid(false)
  .setHelpText("Validation message")
  .build();
range.setDataValidation(rule);
```

## Current MVP Status

### MVP 1 - Foundation (COMPLETE)
✅ 11 pre-configured sheets
✅ Auto-generated IDs
✅ Email/phone/date/time validation
✅ Sample data with 5 providers, 10 clients, 15 appointments
✅ Activity logging
✅ 10 automated tests
✅ Business hours configuration
✅ Business holidays (recurring and one-time)
✅ Business exceptions (partial day closures)

### MVP 2 - Google Calendar Integration (PLANNED)
- Sync appointments to provider calendars
- Visual schedule view
- Real-time conflict detection

### MVP 3 - Booking Interface (PLANNED)
- Easy-to-use booking form
- Client search functionality
- Available time slot detection

See `MVP_PLAN.md` for complete roadmap.

## Common Tasks

### Adding a New Sheet
1. Update `initializeSystem()` in Setup.gs
2. Define headers and structure
3. Add validation rules in Validation.gs
4. Update sample data if needed
5. Add test coverage in Tests.gs

### Adding New Validation Rules
1. Add to `setupValidation()` in Validation.gs
2. Use Apps Script's DataValidation API
3. Provide clear help text for users
4. Add corresponding test in Tests.gs

### Modifying Sample Data
1. Edit `addSampleData()` in SampleData.gs
2. Keep data realistic and representative
3. Ensure data follows validation rules
4. Update tests if data structure changes

## Important Considerations

### Data Integrity
- IDs are auto-generated in column A (never manually edit)
- Activity_Log tracks all changes (planned)
- Validation prevents invalid data entry
- Sample data must pass all validation rules

### Performance
- Batch operations when possible (setValues vs setValue)
- Avoid excessive API calls in loops
- Use getDataRange() instead of full range when possible
- Clear old logs periodically (future enhancement)

### User Experience
- Clear error messages in validation
- Helpful column headers
- Sample data demonstrates best practices
- Tests provide clear pass/fail feedback

## Debugging Tips

### Check Apps Script Logs
1. Apps Script Editor → Executions
2. View recent runs and errors
3. Logger.log() statements appear here

### Test Individual Functions
```javascript
function testMyFunction() {
  Logger.log("Testing...");
  var result = myFunction();
  Logger.log("Result: " + result);
}
```

### Common Issues
- **Quota exceeded:** Reduce batch size or wait
- **Timeout:** Break into smaller operations
- **Permission denied:** Check sharing settings
- **Formula errors:** Check sheet names and ranges

## Key Business Logic

### Appointment Booking Rules
- Must have valid Client ID, Provider ID, Service ID
- Date must be in future (enforced in UI, not yet in script)
- Time must fall within business hours
- Duration must match service definition
- No double-booking (future: automatic conflict detection)

### Provider Availability
- Recurring weekly schedule (Provider_Availability)
- One-time exceptions override recurring (Provider_Exceptions)
- Business holidays close entire business
- Business exceptions block time for all providers

### ID Generation Pattern
- PROV001, PROV002... for Providers
- CLI001, CLI002... for Clients
- APT001, APT002... for Appointments
- SERV001, SERV002... for Services
- **Generated by code:** IDs are calculated in `DataAccess.gs addRow()` function
- **Pattern:** `PREFIX + padNumber(rowNumber - 1, 3)`
- **Manual entries:** Must provide IDs in the same format to work with triggers

## Future Considerations

### MVP 2 Integration Points
- Calendar API will need OAuth scopes
- Sync should be bidirectional (Sheets ↔ Calendar)
- Handle deleted/modified appointments
- Batch calendar updates to avoid quota issues

### Scalability
- Current design: 5-10 providers
- Thousands of appointments possible
- Archive old appointments periodically
- Consider BigQuery for analytics (way later)

## Questions to Ask When Making Changes

1. Does this affect existing validation rules?
2. Do tests need to be updated?
3. Will sample data still work?
4. Is this change backward compatible?
5. Does documentation need updating?
6. Are there Apps Script API limitations to consider?
7. How does this impact the user workflow?

## Useful References

- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
- [Data Validation](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder)
- Project README.md for user-facing docs
- REQUIREMENTS.md for detailed specifications

## Contact & Collaboration

- Git worktree: sad-jang
- Main branch: main
- Current branch: sad-jang
- Always run tests before committing
- Follow commit message conventions from git log

---

**Last Updated:** 2025-12-21
**Current MVP:** 1 (Foundation Complete)
**Next MVP:** 2 (Google Calendar Integration)
