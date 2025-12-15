#!/bin/bash

# OpenSlots Apps Script Deployment Script
#
# This script pushes code from GitHub to Google Apps Script using clasp

set -e  # Exit on error

echo "🚀 OpenSlots Apps Script Deployment"
echo "===================================="
echo ""

# Check if clasp is installed
if ! command -v clasp &> /dev/null; then
    echo "❌ Error: clasp is not installed"
    echo ""
    echo "Install clasp with:"
    echo "  npm install -g @google/clasp"
    echo ""
    exit 1
fi

# Check if logged in to clasp
if ! clasp login --status &> /dev/null; then
    echo "❌ Error: Not logged in to clasp"
    echo ""
    echo "Login with:"
    echo "  clasp login"
    echo ""
    exit 1
fi

# Check if .clasp.json has scriptId
if ! grep -q '"scriptId".*[^"]' .clasp.json; then
    echo "⚠️  Warning: No scriptId found in .clasp.json"
    echo ""
    echo "You need to either:"
    echo "  1. Create a new Apps Script project:"
    echo "     clasp create --title 'OpenSlots Appointment System' --type sheets"
    echo ""
    echo "  2. Or clone an existing project:"
    echo "     clasp clone <your-script-id>"
    echo ""
    echo "Your script ID can be found in the Apps Script editor URL:"
    echo "https://script.google.com/d/{SCRIPT_ID}/edit"
    echo ""
    exit 1
fi

echo "📤 Pushing files to Google Apps Script..."
echo ""

# Push files
clasp push

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your Apps Script project has been updated with:"
echo "  • Setup.gs"
echo "  • Validation.gs"
echo "  • SampleData.gs"
echo "  • Tests.gs"
echo ""
echo "Next steps:"
echo "  1. Open your Google Sheet"
echo "  2. Refresh the page (F5)"
echo "  3. The 'Appointment System' menu should appear"
echo ""
