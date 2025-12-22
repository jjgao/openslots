# OpenSlots - Appointment Booking System

A free, easy-to-use appointment booking system built with Google Sheets. Perfect for small businesses with multiple service providers.

## ✨ What You Get

- 📅 **Multi-provider scheduling** - Manage appointments for 5-10 providers
- 🎨 **Google Calendar Integration** - Color-coded provider calendars
- 📝 **Easy booking interface** - Search clients and book in seconds
- ⏰ **Conflict prevention** - Automatic double-booking detection
- 🔍 **Client search** - Find clients by name or phone instantly
- 🕒 **Smart time slots** - Only shows available times
- 💯 **100% Free** - Uses only free Google Workspace tools

## 🚀 Quick Start (30 seconds!)

### Step 1: Create Your Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it "Appointment Booking System"

### Step 2: Install the Scripts
1. In your spreadsheet, click **Extensions → Apps Script**
2. Delete any default code
3. Copy the 4 script files from the [`apps-script/`](apps-script/) folder:
   - `Setup.gs`
   - `Validation.gs`
   - `SampleData.gs`
   - `Tests.gs`
4. Create a new file for each and paste the code
5. Click **Save** (💾 icon)

### Step 3: Initialize the System
1. Refresh your Google Sheet (press F5)
2. You'll see a new menu: **Appointment System**
3. Click **Appointment System → Initialize System**
4. Click **Yes** to confirm
5. Wait 10-30 seconds for setup to complete

### Step 4: Verify Setup (Recommended)
1. Click **Appointment System → Tests → Run All Tests**
2. Wait 30-60 seconds for tests to complete
3. You should see: **"✅ Passed: 10/10"**
4. If any tests fail, check the error messages

### Step 5: Add Sample Data (Optional)
1. Click **Appointment System → Add Sample Data**
2. Click **Yes** to confirm
3. Your system now has sample providers, clients, and appointments!

**That's it! Your appointment booking system is ready to use.**

## 📖 How to Use

### For Receptionists

#### Booking an Appointment (Easy Way - MVP3)
1. Click **Appointment System → Book Appointment** in the menu
2. Search for a client by name or phone (or create a new one)
3. Select provider, service, duration, date, and time slot
4. Click **Book Appointment**
5. The appointment is automatically created and synced to the provider's calendar!

#### Booking an Appointment (Manual Way)
1. Go to the **Clients** sheet
2. Find the client or add a new row with their information
3. Go to the **Appointments** sheet
4. Add a new row:
   - Client ID (e.g., CLI001)
   - Provider ID (e.g., PROV001)
   - Service ID (e.g., SERV001)
   - Date, time, and duration
   - Status: "Booked"
5. The appointment ID will generate automatically!

#### Managing Providers
1. Go to the **Providers** sheet
2. Add providers with their name, email, phone
3. List which services they offer (e.g., "SERV001,SERV002")
4. Set status to "Active" or "Inactive"

#### Setting Provider Schedules
1. Go to the **Provider_Availability** sheet
2. Add rows for each day the provider works:
   - Provider ID
   - Day of week (Monday, Tuesday, etc.)
   - Start time and end time
   - Set "is_recurring" to "Yes"

#### Blocking Time Off
1. Go to the **Provider_Exceptions** sheet
2. Add a row for vacation/time off:
   - Provider ID
   - Date
   - Start time and end time (use 00:00 to 23:59 for all day)
   - Reason (e.g., "Vacation")

#### Managing Business Holidays
1. Go to the **Business_Holidays** sheet
2. Add business closure dates:
   - Date (e.g., 2026-12-25)
   - Name (e.g., "Christmas Day")
   - Recurring: "Yes" for annual holidays, "No" for one-time closures
   - Notes (optional explanation)

Examples in sample data:
- Recurring: New Year's Day, Christmas, Independence Day, Thanksgiving
- One-time: Summer Break, Staff Training Day

#### Managing Business Exceptions (Partial Closures)
1. Go to the **Business_Exceptions** sheet
2. Add time blocks when business is partially closed:
   - Date (e.g., 2026-05-05)
   - Start time (e.g., 10:00)
   - End time (e.g., 12:00)
   - Reason (e.g., "All-Staff Meeting")
   - Notes (optional details)

Examples in sample data:
- All-Staff Meeting (10:00-12:00)
- Building Maintenance (14:00-17:00)
- IT System Upgrade (09:00-11:00)
- Safety Training (13:00-14:30)

### For Providers

You'll automatically receive:
- **Daily email** with tomorrow's appointments (sent at 6 PM)
- **Change notifications** when appointments are booked/cancelled after the daily list is sent

## 📊 Available Reports

All reports are coming in future updates (MVP 7):
- Daily schedule view
- Weekly overview
- Provider utilization
- Cancellation rates
- No-show tracking
- Client visit history

For now, you can use Google Sheets' built-in filtering and sorting to view your data.

## 🎯 What's Included

### MVP 1 - Foundation ✅
- **11 Pre-configured Sheets** with auto-generated IDs
- **Smart Validation** for emails, phones, dates, and times
- **Sample Data** (5 providers, 7 services, 10 clients, 15 appointments)
- **Automated Testing** (10+ unit tests)
- **Business Hours Configuration**
- **Business Holidays** (recurring and one-time closures)
- **Business Exceptions** (partial day closures for meetings, etc.)

### MVP 2 - Google Calendar Integration ✅
- **Automatic Calendar Sync** - Appointments sync to provider calendars
- **Provider-Based Colors** - Each provider has a unique color
- **Conflict Detection** - Prevents double-booking
- **Real-time Updates** - Changes sync immediately
- **Calendar Management** - Menu commands for sync and cleanup

### MVP 3 - Booking Interface ✅
- **Easy Booking Form** - Sidebar UI for quick appointment booking
- **Client Search** - Find clients by name or phone
- **Create New Clients** - Add clients directly from booking form
- **Available Time Slots** - See only available times for selected provider/date
- **Duration Selection** - Choose from service duration options
- **Smart Filtering** - Prevents booking in the past or during holidays
- **30-minute Slot Increments** - Configurable in System_Config

### Testing
- **MVP1 Tests** (10 tests) - Foundation, validation, data
- **MVP2 Tests** (12 tests) - Config, availability, appointments
- **MVP3 Tests** (7 tests) - Client management, booking UI
- Run via **Appointment System → Tests** menu

## 🔧 Customization

### Change Business Hours
1. Go to the **System_Config** sheet
2. Update `business_hours_start` and `business_hours_end`

### Add More Services
1. Go to the **Services** sheet
2. Add a new row with service name and duration options
3. The service ID will generate automatically

### Add More Providers
1. Go to the **Providers** sheet
2. Add a new row with provider information
3. Set up their schedule in **Provider_Availability**

## 🧪 Testing Your System

The system includes automated tests to verify everything works correctly.

### Running Tests

**Full Test Suite** (recommended after setup):
1. Click **Appointment System → Tests → Run All Tests**
2. Wait 30-60 seconds
3. View results: "✅ Passed: X/10" or "❌ Failed: X/10"

**Quick Verification** (3 essential tests, ~15 seconds):
1. Click **Appointment System → Tests → Run Quick Tests**
2. Good for quick health checks

**What Gets Tested:**
- ✅ Sheet creation and deletion
- ✅ Header formatting (bold, blue, frozen)
- ✅ Auto-increment ID formulas (PROV001, CLI001, etc.)
- ✅ Email validation
- ✅ Phone validation
- ✅ Date validation
- ✅ Time validation (HH:MM format)
- ✅ Dropdown validation
- ✅ Number validation
- ✅ Sample data presence

### When to Run Tests

- **After initial setup** - Verify everything installed correctly
- **After making changes** - Ensure nothing broke
- **Before going live** - Final verification
- **Troubleshooting** - Identify what's not working

### Test Results

**All tests passed:**
```
✅ Passed: 10/10
🎉 All tests passed!
```

**Some tests failed:**
```
✅ Passed: 8/10
❌ Failed: 2/10

Failed Tests:
❌ Time Validation
   Error: ...
```

If tests fail, check the error message for guidance. Common issues:
- Script files not saved properly
- Missing validation formulas
- Sheet structure incorrect

## 🆘 Troubleshooting

### The custom menu doesn't appear
- Refresh the page (F5)
- Make sure you copied all 4 script files (Setup.gs, Validation.gs, SampleData.gs, Tests.gs)
- Check that you saved the scripts

### IDs aren't generating automatically
- Make sure you entered data in the second column (name field)
- The ID formula is in column A
- Don't delete or modify column A

### I want to start over
1. Click **Appointment System → Clear All Data**
2. This removes all data but keeps the structure
3. Or click **Appointment System → Initialize System** to completely reset

### Script authorization required
- First time running: Google asks for permission
- Click "Review Permissions" → Select your account
- Click "Advanced" → "Go to Appointment Booking System" → "Allow"
- This is normal and only happens once

### Tests are failing
1. Run **Appointment System → Tests → Run All Tests** to see which tests fail
2. Check the error messages for specific issues
3. Common fixes:
   - Re-run **Initialize System** to recreate sheets
   - Make sure all 4 script files are saved
   - Check that formulas exist in column A (IDs)

## 🚦 What's Next?

**MVP 1, 2, and 3 are complete!** ✅

Your booking system now has:
- ✅ Foundation with 11 pre-configured sheets
- ✅ Google Calendar integration with provider colors
- ✅ Easy booking interface with client search

**Coming Next:**

**MVP 4** - Advanced Management
- Cancel and reschedule appointments
- Check-in tracking
- No-show logging
- Status updates via sidebar

**MVP 5** - Client Self-Booking
- Public booking page
- Client portal
- Email confirmations

See [MVP_PLAN.md](MVP_PLAN.md) for the complete roadmap.

## 💡 Tips

- **Back up your data**: Make a copy of your spreadsheet regularly
- **Share with your team**: Click "Share" to give edit access to receptionists
- **Use filters**: Click the filter icon to sort and filter appointments
- **Color code**: Use conditional formatting to highlight today's appointments
- **Print schedules**: Use File → Print to create paper schedules

## 🤝 Support

Need help?
- Check the [Setup Guide](apps-script/README.md) for detailed instructions
- See [REQUIREMENTS.md](REQUIREMENTS.md) for full system specifications
- Create an issue on [GitHub](https://github.com/jjgao/openslots/issues)

## 📝 License

Free to use for your business. Internal use only.

---

Made with ❤️ using Google Sheets and Apps Script

🤖 Built with [Claude Code](https://claude.com/claude-code)
