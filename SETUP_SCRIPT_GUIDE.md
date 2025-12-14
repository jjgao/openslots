# Automated Setup Script Guide

This guide explains how to set up the entire Appointment Booking System using an automated Apps Script instead of manual creation.

## Quick Start

### Step 1: Create Blank Google Sheet
1. Go to https://sheets.google.com
2. Click "Blank" to create a new spreadsheet
3. Rename it to "Appointment Booking System"

### Step 2: Open Apps Script
1. In the menu: **Extensions → Apps Script**
2. Delete the default `myFunction()` code

### Step 3: Create Setup Files
You'll create these files in Apps Script (see MVP 1 issues for complete code):

1. **Setup.gs** - Main setup orchestration (Issue #1)
2. **Validation.gs** - Data validation helpers (Issue #2)
3. **SampleData.gs** - Test data generation (Issue #4)

### Step 4: Run the Setup
1. In Apps Script, select `initializeSystem` function from dropdown
2. Click "Run" ▶️
3. Authorize the script when prompted
4. Wait for completion (should take 10-30 seconds)
5. Return to your Google Sheet - all tabs are created!

### Step 5: Add Sample Data (Optional)
1. In Google Sheet menu: **Appointment System → Add Sample Data**
2. Click "Yes" to confirm
3. Sample data populates all sheets for testing

## What the Script Does

### initializeSystem() Function
Creates and configures:
- ✅ 9 sheets with proper column structure
- ✅ Formatted headers (bold, colored, frozen)
- ✅ Data validation (dropdowns, email, dates)
- ✅ Auto-increment ID formulas
- ✅ Appropriate column widths
- ✅ System_Config with default settings

### addSampleData() Function
Populates sheets with:
- ✅ 5 sample providers
- ✅ 7 sample services
- ✅ 10+ sample clients
- ✅ 10+ sample appointments (past and future)
- ✅ Provider availability schedules
- ✅ Provider exceptions (time off)
- ✅ Sample activity logs

## File Structure

```
Apps Script Project
├── Setup.gs              # Main setup functions (Issue #1)
│   ├── onOpen()          # Custom menu
│   ├── initializeSystem()
│   ├── createProvidersSheet()
│   ├── createServicesSheet()
│   ├── createClientsSheet()
│   ├── createAppointmentsSheet()
│   ├── createProviderAvailabilitySheet()
│   ├── createProviderExceptionsSheet()
│   ├── createActivityLogSheet()
│   ├── createConfirmationTrackingSheet()
│   └── createSystemConfigSheet()
│
├── Helpers.gs            # Reusable utilities (Issues #2, #3)
│   ├── deleteSheetIfExists()
│   ├── formatHeaderRow()
│   ├── addAutoIncrementFormula()
│   └── addDropdownValidation()
│
└── SampleData.gs         # Test data generation (Issue #4)
    ├── addSampleData()
    ├── addSampleProviders()
    ├── addSampleServices()
    ├── addSampleClients()
    ├── addSampleAppointments()
    ├── addSampleProviderAvailability()
    └── addSampleProviderExceptions()
```

## Custom Menu

After setup, you'll see a new menu in Google Sheets:

```
Appointment System
├── Initialize System      (Re-run full setup)
├── Add Sample Data        (Populate test data)
├── ──────────────
└── Clear All Data         (Remove all data, keep structure)
```

## Benefits of Scripted Setup

### ✅ Speed
- Manual setup: 2-4 hours
- Script setup: 30 seconds

### ✅ Consistency
- No typos or missed columns
- Same structure every time
- Validation rules always correct

### ✅ Repeatability
- Create test environments instantly
- Reset to clean state anytime
- Share exact same setup with team

### ✅ Version Control
- Script code is in Git
- Track changes to data structure
- Document structure in code

### ✅ Easy Updates
- Modify script to add new columns
- Re-run to update structure
- No manual find-and-replace

## Testing Your Setup

After running the script:

1. **Check all sheets exist**: 9 tabs should appear
2. **Test dropdowns**: Try selecting from status, day_of_week, etc.
3. **Test auto-increment IDs**: Add a row with data, ID should appear
4. **Test validation**: Try entering invalid email/date
5. **Add sample data**: Use custom menu
6. **Book test appointment**: Manually add to Appointments sheet

## Troubleshooting

### "Authorization required"
- First time running: Google asks for permission
- Click "Review Permissions" → Select your account → Allow

### "Exception: Service Sheets failed"
- Check you're in the correct Google Sheet
- Verify you have edit permissions
- Try refreshing the page

### IDs not generating
- Make sure you entered data in the "trigger" column (usually column B - name)
- Formula in column A should be: `=IF(B2<>"", "PREFIX"&TEXT(ROW()-1,"000"), "")`

### Dropdowns not working
- Re-run `initializeSystem()` to recreate validation
- Check if correct range applied (A2:A1000, not A2)

### Sample data fails
- Make sure `initializeSystem()` completed first
- Check for referential integrity (valid provider/client/service IDs)

## Next Steps

After setup is complete:

1. **Review the structure** - Open each sheet and check columns
2. **Customize System_Config** - Update business name, hours, etc.
3. **Test manual booking** - Add a real appointment to Appointments sheet
4. **Move to MVP 2** - Set up calendar integration (Issue #5-10)

## Reference

- **Complete code**: See Issues #1, #2, #3, #4 on GitHub
- **MVP 1 Plan**: See MVP_PLAN.md
- **Requirements**: See REQUIREMENTS.md

---

💡 **Tip**: Keep the Apps Script project open. You'll add more functions in MVP 2 for calendar sync and booking automation!
