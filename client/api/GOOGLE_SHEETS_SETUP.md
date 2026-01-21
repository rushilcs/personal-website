# Google Sheets Logging Setup

This guide explains how to set up Google Sheets API for logging user inputs and API outputs.

## Prerequisites

1. A Google account
2. A Google Sheet (we'll create this)

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Portfolio Logs" or "API Logs"
4. Create two sheets/tabs:
   - Name the first sheet: `Plan Generator Logs`
   - Name the second sheet: `Chatbot Logs`
5. Copy the Spreadsheet ID from the URL:
   - The URL will look like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

## Step 2: Create a Google Cloud Project and Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Give it a name (e.g., "portfolio-logs")
   - Click "Create and Continue"
   - Skip the optional steps and click "Done"

5. Create a Key for the Service Account:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON"
   - Download the JSON file (this contains your credentials)

6. Share the Google Sheet with the Service Account:
   - Open the JSON file you downloaded
   - Find the `client_email` field (looks like `portfolio-logs@project-id.iam.gserviceaccount.com`)
   - Open your Google Sheet
   - Click "Share" button
   - Paste the `client_email` address
   - Give it "Editor" permissions
   - Click "Send"

## Step 3: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Go to "Settings" > "Environment Variables"
3. Add the following variables:

### `GOOGLE_SHEET_ID`
- Value: The Spreadsheet ID you copied in Step 1
- Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`
- Value: The entire contents of the JSON file you downloaded
- **Important**: Paste the entire JSON as a single-line string, or use a JSON minifier
- Example format:
```json
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"portfolio-logs@project-id.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**Note**: For Vercel, you can paste the JSON directly. The newlines in the private key will be preserved.

## Step 4: Initialize the Sheets (Optional)

The sheets will automatically create headers on first write, but you can manually initialize them by:

1. Adding headers to your Google Sheet:
   - **Plan Generator Logs** sheet headers:
     - Timestamp | Company Name | Job Description | Job Description Length | Is URL | Plan | Plan Length | Job Fit | Job Fit Length | Metadata | Error
   - **Chatbot Logs** sheet headers:
     - Timestamp | Message | Message Length | Conversation History Length | Response | Response Length | Metadata | Error

2. Or, you can create a one-time setup script (not included, but you can call `initSheets()` from logger.js if needed)

## Step 5: Deploy and Test

1. Deploy your changes to Vercel
2. Test the plan generator or chatbot
3. Check your Google Sheet - you should see new rows appearing!

## Troubleshooting

### Logs not appearing
- Check that `GOOGLE_SHEET_ID` is set correctly
- Check that `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` is valid JSON
- Verify the service account email has "Editor" access to the sheet
- Check Vercel function logs for errors

### Permission errors
- Make sure the service account email is shared with the sheet
- Verify the service account has "Editor" permissions (not just "Viewer")

### JSON parsing errors
- Make sure the entire JSON file is pasted as the environment variable
- Check that there are no extra quotes or escaping issues
- Try using a JSON validator to ensure the format is correct

## Security Notes

- The service account credentials are stored as environment variables in Vercel
- Only you (and anyone with Vercel access) can see these credentials
- The Google Sheet is private by default - only you and the service account can access it
- Consider making the sheet read-only for the service account if you only need logging (not reading back)
