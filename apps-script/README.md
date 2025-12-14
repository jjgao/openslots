# Apps Script Files

This folder contains Google Apps Script files for the Appointment Booking System.

## Setup Instructions

### Step 1: Create a Blank Google Sheet
1. Go to https://sheets.google.com
2. Click "Blank" to create a new spreadsheet
3. Rename it to "Appointment Booking System"

### Step 2: Open Apps Script Editor
1. In the Google Sheet menu: **Extensions → Apps Script**
2. Delete the default `myFunction()` code

### Step 3: Copy Script Files

Copy the contents of these files into your Apps Script project:

#### Current Files (MVP 1):
- **Setup.gs** - Main setup script (Issue #1)
- **Validation.gs** - Data validation helpers (Issue #2)
- **SampleData.gs** - Sample data generation (Issue #4)
- **Tests.gs** - Automated unit tests

#### Coming Soon (MVP 2+):
- **Config.gs** - Configuration helpers (MVP 2)
- **DataAccess.gs** - Database operations (MVP 2)
- **Appointments.gs** - Appointment functions (MVP 2)
- **Calendar.gs** - Google Calendar integration (MVP 2)
- **Logging.gs** - Activity logging (MVP 4)
- **Utils.gs** - Utility functions (MVP 2)

### Step 4: Run the Setup

1. In Apps Script editor, select `initializeSystem` from the function dropdown
2. Click the "Run" button (▶️)
3. **First time only**: Click "Review Permissions" → Select your account → Click "Advanced" → "Go to Appointment Booking System" → "Allow"
4. Wait for the script to complete (10-30 seconds)
5. Return to your Google Sheet - all 9 tabs should be created!

### Step 5: Verify Setup

Check that these sheets were created:
- ✅ Providers
- ✅ Services
- ✅ Clients
- ✅ Appointments
- ✅ Provider_Availability
- ✅ Provider_Exceptions
- ✅ Activity_Log
- ✅ Confirmation_Tracking
- ✅ System_Config

Each sheet should have:
- Formatted header row (blue background, white text, bold)
- Frozen header row
- Auto-increment formula in column A (for IDs)
- Appropriate column widths

## Using the Custom Menu

After setup, you'll see a new menu in Google Sheets:

```
Appointment System
├── Initialize System       (Re-run setup if needed)
├── Add Sample Data        (Populate test data)
├── ──────────────
├── Clear All Data         (Remove all data, keep structure)
├── ──────────────
├── Tests                  (Automated testing)
│   ├── Run All Tests      (Full test suite ~60 sec)
│   ├── Run Quick Tests    (Essential tests ~15 sec)
│   └── Cleanup Test Sheets (Remove leftover test sheets)
├── ──────────────
└── About                  (Show version info)
```

## File Descriptions

### Setup.gs

**Purpose**: Creates and configures all Google Sheets for the system

**Main Functions**:
- `onOpen()` - Creates custom menu when sheet opens
- `initializeSystem()` - Main setup function (creates all sheets)
- `createProvidersSheet()` - Creates Providers sheet
- `createServicesSheet()` - Creates Services sheet
- `createClientsSheet()` - Creates Clients sheet
- `createAppointmentsSheet()` - Creates Appointments sheet
- `createProviderAvailabilitySheet()` - Creates Provider_Availability sheet
- `createProviderExceptionsSheet()` - Creates Provider_Exceptions sheet
- `createActivityLogSheet()` - Creates Activity_Log sheet
- `createConfirmationTrackingSheet()` - Creates Confirmation_Tracking sheet
- `createSystemConfigSheet()` - Creates System_Config sheet

**Helper Functions**:
- `deleteSheetIfExists(sheetName)` - Removes existing sheet before recreating
- `formatHeaderRow(sheet, numColumns)` - Formats header with blue background
- `addAutoIncrementFormula(sheet, prefix, triggerColumn)` - Adds ID formulas
- `deleteDefaultSheet()` - Removes empty Sheet1 if present

## Auto-Increment ID Formulas

Each sheet has an auto-increment formula in column A:

```javascript
=IF(B2<>"", "PREFIX"&TEXT(ROW()-1,"000"), "")
```

**How it works**:
- ID only appears when data is entered in the trigger column (usually column B - name)
- IDs are formatted as: PREFIX001, PREFIX002, etc.
- Formula is copied to row 100 for easier manual entry

**ID Prefixes**:
- Providers: PROV001, PROV002...
- Services: SERV001, SERV002...
- Clients: CLI001, CLI002...
- Appointments: APT001, APT002...
- Provider_Availability: AVL001, AVL002...
- Provider_Exceptions: EXC001, EXC002...
- Activity_Log: LOG001, LOG002...
- Confirmation_Tracking: CNF001, CNF002...

## Troubleshooting

### "Authorization required"
- **First time running**: Google asks for permission
- Click "Review Permissions" → Select your account → "Allow"
- This is normal and only happens once

### "Exception: Service Sheets failed"
- Verify you're in the correct Google Sheet
- Check you have edit permissions
- Try refreshing the page and running again

### IDs not generating
- Make sure you entered data in the trigger column (usually column B)
- Formula should be in column A: `=IF(B2<>"", "PROV"&TEXT(ROW()-1,"000"), "")`
- Check that the formula exists in row 2

### Can't find "Appointment System" menu
- Refresh the Google Sheet page
- Menu appears after running `onOpen()` or reopening the sheet
- If still missing, check that Setup.gs is saved in Apps Script

### Want to start fresh?
- Run `initializeSystem()` again
- It will delete existing sheets and recreate them
- **Warning**: This will delete all data!

## Next Steps

After successful setup:

1. **Verify structure** - Open each sheet and check columns
2. **Test manual entry** - Try adding a row to Providers sheet
3. **Check auto-increment** - Verify ID appears automatically
4. **Continue to Issue #2** - Add data validation
5. **Continue to Issue #4** - Add sample data

## Resources

- **GitHub Issues**: https://github.com/jjgao/openslots/issues
- **Setup Guide**: ../SETUP_SCRIPT_GUIDE.md
- **Requirements**: ../REQUIREMENTS.md
- **MVP Plan**: ../MVP_PLAN.md

## Development

### Adding New Sheets

To add a new sheet to the system:

1. Create a new function following the pattern:
```javascript
function createNewSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'NewSheet';

  deleteSheetIfExists(sheetName);
  const sheet = ss.insertSheet(sheetName);

  const headers = ['id', 'name', 'value'];
  sheet.appendRow(headers);

  formatHeaderRow(sheet, headers.length);
  addAutoIncrementFormula(sheet, 'NEW', 'B');

  // Set column widths...

  Logger.log('NewSheet created');
}
```

2. Add call to `initializeSystem()`:
```javascript
createNewSheet();
```

3. Re-run `initializeSystem()` to test

### Modifying Existing Sheets

To change sheet structure:

1. Update the corresponding `createXXXSheet()` function
2. Run `initializeSystem()` to recreate sheets
3. **Warning**: This deletes existing data!
4. For production, write migration script instead

## Testing

### Running Tests

The system includes automated tests to verify functionality:

**Run All Tests** (recommended after setup):
1. Click **Appointment System → Tests → Run All Tests**
2. Wait 30-60 seconds
3. View results in dialog

**Tests included:**
- ✅ Sheet creation and deletion
- ✅ Header formatting (bold, blue, frozen)
- ✅ Auto-increment ID formulas
- ✅ Email validation
- ✅ Phone validation
- ✅ Date validation
- ✅ Time validation
- ✅ Dropdown validation
- ✅ Number validation
- ✅ Sample data presence

**Quick Tests** (faster smoke test):
- Click **Appointment System → Tests → Run Quick Tests**
- Runs 3 essential tests in ~15 seconds
- Good for quick verification

**Cleanup Test Sheets:**
- Tests create temporary sheets (named "Test...")
- These are auto-deleted after each test
- Use **Cleanup Test Sheets** if any get left behind

### Test Results

Tests display results in a dialog showing:
- ✅ Number passed
- ❌ Number failed
- Detailed error messages for failures

All test results are also logged to the Apps Script console:
1. Apps Script editor → **View → Logs**
2. Or use `Logger.log()` output

### Writing New Tests

To add new tests, edit `Tests.gs`:

```javascript
function testMyNewFeature() {
  const testName = 'My New Feature';

  try {
    // Create test sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.insertSheet('TestMyFeature_' + Date.now());

    // Run your test
    // ... test code here ...

    // Cleanup
    ss.deleteSheet(testSheet);

    return {
      name: testName,
      passed: true,  // or false
      message: 'Test passed!'  // or error message
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: `Error: ${error.toString()}`
    };
  }
}
```

Then add it to `runAllTests()`:
```javascript
results.push(testMyNewFeature());
```

## Version History

- **MVP 1.0** (Issue #1) - Initial setup script with 9 sheets
- **MVP 1.1** (Issue #2) - Add data validation
- **MVP 1.2** (Issue #4) - Add sample data generation
- **MVP 1.3** - Add automated tests
