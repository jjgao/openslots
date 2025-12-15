# Apps Script Deployment Guide

This guide explains how to deploy OpenSlots code from GitHub to Google Apps Script using `clasp`.

## One-Time Setup

### 1. Install clasp

```bash
npm install -g @google/clasp
```

### 2. Login to Google

```bash
clasp login
```

This opens a browser window to authorize clasp to access your Google account.

### 3. Create or Link Apps Script Project

**Option A: Create a new Apps Script project**

```bash
cd apps-script
clasp create --title "OpenSlots Appointment System" --type sheets
```

This creates a new Apps Script project and updates `.clasp.json` with the script ID.

**Option B: Link to existing Apps Script project**

If you already created an Apps Script project in Google Sheets:

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Copy the Script ID from the URL: `https://script.google.com/d/{SCRIPT_ID}/edit`
4. Update `.clasp.json`:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "."
}
```

## Deploying Updates

Whenever you update code in GitHub and want to push to Apps Script:

### Method 1: Use the deployment script (Recommended)

```bash
cd apps-script
./deploy.sh
```

The script will:
- Check if clasp is installed
- Check if you're logged in
- Check if scriptId is configured
- Push all files to Apps Script
- Show deployment status

### Method 2: Use clasp directly

```bash
cd apps-script
clasp push
```

### Method 3: Watch for changes (auto-deploy on save)

```bash
cd apps-script
clasp push --watch
```

This watches for file changes and automatically pushes to Apps Script when you save.

## What Gets Deployed

Files pushed to Apps Script:
- ✅ `Setup.gs`
- ✅ `Validation.gs`
- ✅ `SampleData.gs`
- ✅ `Tests.gs`
- ✅ `appsscript.json`

Files ignored (see `.claspignore`):
- ❌ `README.md`
- ❌ `.clasp.json`
- ❌ `.claspignore`
- ❌ `DEPLOYMENT.md`
- ❌ `deploy.sh`

## Workflow

1. **Make changes** to `.gs` files in GitHub
2. **Commit and push** to GitHub
3. **Pull changes** locally: `git pull`
4. **Deploy to Apps Script**: `./deploy.sh`
5. **Refresh Google Sheet** to see changes

## Common Issues

### "Not logged in"

```bash
clasp login
```

### "No scriptId found"

Edit `.clasp.json` and add your script ID:

```json
{
  "scriptId": "your-script-id-here",
  "rootDir": "."
}
```

### "clasp: command not found"

```bash
npm install -g @google/clasp
```

### Changes not appearing in Google Sheets

1. Refresh the Google Sheet (F5)
2. Close and reopen the sheet
3. Check Apps Script editor to verify files were updated

## Advanced: GitHub Actions (Optional)

You can automate deployment with GitHub Actions. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Apps Script

on:
  push:
    branches: [main]
    paths:
      - 'apps-script/*.gs'
      - 'apps-script/appsscript.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install clasp
        run: npm install -g @google/clasp

      - name: Authenticate clasp
        run: echo "$CLASPRC_JSON" > ~/.clasprc.json
        env:
          CLASPRC_JSON: ${{ secrets.CLASPRC_JSON }}

      - name: Deploy to Apps Script
        run: |
          cd apps-script
          clasp push
```

To set this up:
1. Run `cat ~/.clasprc.json` to get your credentials
2. Add as GitHub secret named `CLASPRC_JSON`
3. Push to GitHub and deployment happens automatically!

## Resources

- [clasp Documentation](https://github.com/google/clasp)
- [Apps Script API](https://developers.google.com/apps-script/api/reference/rest)
- [OpenSlots GitHub](https://github.com/jjgao/openslots)
