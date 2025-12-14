# OpenSlots - Appointment Booking System

A free, easy-to-use appointment booking system built with Google Sheets. Perfect for small businesses with multiple service providers.

## ✨ What You Get

- 📅 **Multi-provider scheduling** - Manage appointments for 5-10 providers
- 📝 **Client database** - Track client history and preferences
- ⏰ **Conflict prevention** - Automatic double-booking detection
- 📊 **Built-in reports** - Track utilization, cancellations, no-shows
- 🔔 **Daily notifications** - Providers get their schedule via email
- 💯 **100% Free** - Uses only free Google Workspace tools

## 🚀 Quick Start (30 seconds!)

### Step 1: Create Your Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it "Appointment Booking System"

### Step 2: Install the Scripts
1. In your spreadsheet, click **Extensions → Apps Script**
2. Delete any default code
3. Copy the 3 script files from the [`apps-script/`](apps-script/) folder:
   - `Setup.gs`
   - `Validation.gs`
   - `SampleData.gs`
4. Create a new file for each and paste the code
5. Click **Save** (💾 icon)

### Step 3: Initialize the System
1. Refresh your Google Sheet (press F5)
2. You'll see a new menu: **Appointment System**
3. Click **Appointment System → Initialize System**
4. Click **Yes** to confirm
5. Wait 10-30 seconds for setup to complete

### Step 4: Add Sample Data (Optional)
1. Click **Appointment System → Add Sample Data**
2. Click **Yes** to confirm
3. Your system now has sample providers, clients, and appointments!

**That's it! Your appointment booking system is ready to use.**

## 📖 How to Use

### For Receptionists

#### Booking an Appointment
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

## 🎯 What's Included (MVP 1)

✅ **9 Pre-configured Sheets**
- Providers - Service provider information
- Services - Service types and durations
- Clients - Client database with history
- Appointments - All bookings
- Provider_Availability - Weekly schedules
- Provider_Exceptions - Time off and vacations
- Activity_Log - Complete audit trail
- Confirmation_Tracking - Track confirmation calls
- System_Config - System settings

✅ **Smart Features**
- Auto-generated IDs (PROV001, CLI001, APT001, etc.)
- Dropdown menus for easy data entry
- Email and phone validation
- Date and time validation
- Prevent invalid entries

✅ **Sample Data**
- 5 sample providers
- 7 sample services
- 10 sample clients
- 15 sample appointments
- Ready-to-use schedules

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

## 🆘 Troubleshooting

### The custom menu doesn't appear
- Refresh the page (F5)
- Make sure you copied all 3 script files
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

## 🚦 What's Next?

This is **MVP 1** - the foundation of your booking system. Coming soon:

**MVP 2** (2-3 days) - Google Calendar Integration
- Automatic calendar sync
- Visual schedule view
- Booking conflict detection

**MVP 3** (3-4 days) - Booking Interface
- Easy booking form
- Client search
- Available time slots

**MVP 4** (2-3 days) - Full Management
- Cancel and reschedule
- Check-in tracking
- No-show logging

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
