#!/bin/bash

# MVP3 Testing Helper Script
# This script helps deploy and test the MVP3 booking UI

set -e

echo "🚀 OpenSlots MVP3 Testing Helper"
echo "=================================="
echo ""

# Check if clasp is installed
if ! command -v clasp &> /dev/null; then
    echo "❌ Error: clasp is not installed"
    echo "Install with: npm install -g @google/clasp"
    exit 1
fi

# Change to apps-script directory
cd "$(dirname "$0")"

echo "📦 Step 1: Deploying code to Apps Script..."
clasp push
echo "✅ Code deployed successfully!"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Open your Google Sheet with OpenSlots"
echo "   https://script.google.com/d/1TatusZXZMTBV0iui3fwYmG28wFYOkPNfB2d-5dQNvfB_JPq9QSF_sZhu/edit"
echo ""
echo "2. Refresh the Google Sheet (press F5)"
echo ""
echo "3. Run initialization (first time only):"
echo "   • Go to: Appointment System → Initialize System"
echo "   • Click Yes to confirm"
echo "   • Wait 10-30 seconds"
echo ""
echo "4. Add sample data (recommended):"
echo "   • Go to: Appointment System → Add Sample Data"
echo "   • Click Yes to confirm"
echo ""
echo "5. Run MVP3 tests:"
echo "   • Go to: Appointment System → Tests → Run MVP3 Tests"
echo "   • Should see: ✅ Passed: 7/7"
echo ""
echo "6. Test the booking UI:"
echo "   • Go to: Appointment System → Book Appointment"
echo "   • Try these workflows:"
echo "     - Search for existing client (e.g., 'John')"
echo "     - Create new client"
echo "     - Select provider and service"
echo "     - Choose date and time slot"
echo "     - Book appointment"
echo ""
echo "📊 Test Checklist:"
echo "=================="
echo "□ Initialize System completed"
echo "□ Sample data added"
echo "□ MVP3 tests pass (7/7)"
echo "□ Booking sidebar opens"
echo "□ Client search works"
echo "□ New client creation works"
echo "□ Time slots display correctly"
echo "□ Appointment booking succeeds"
echo "□ Client history updates automatically"
echo ""
echo "🎉 Happy testing!"
