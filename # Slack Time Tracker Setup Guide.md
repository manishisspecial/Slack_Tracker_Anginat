# Slack Time Tracker Setup Guide

## Prerequisites

- Node.js 14+ installed
- A Slack workspace where you have admin access (to create a bot)
- Your Slack User ID

## Step 1: Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name it "Time Tracker" and select your workspace
4. Go to "OAuth & Permissions" in the left sidebar
5. Add these Bot Token Scopes:
   - `users:read`
   - `users:read.email`
   - `users:profile:read`
6. Click "Install to Workspace"
7. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Step 2: Get Your User ID

### Method 1: From Slack App
1. In Slack, click your profile picture
2. Go to "Profile" 
3. Click "More" → "Copy member ID"

### Method 2: Using the test command
1. Set up the app first with any User ID
2. Run `npm run test` - it will show you the correct User ID in the error

## Step 3: Project Setup

1. Create a new folder for your project:
```bash
mkdir slack-time-tracker
cd slack-time-tracker
```

2. Save the provided code files:
   - `slack-time-tracker.js` (main application)
   - `config.js` (configuration)  
   - `runner.js` (CLI runner)
   - `package.json` (dependencies)

3. Install dependencies:
```bash
npm install
```

4. Create `.env` file (optional):
```bash
SLACK_TOKEN=xoxb-your-actual-token-here
SLACK_USER_ID=U1234567890
```

5. Update `config.js` with your tokens:
```javascript
const config = {
  slackToken: 'xoxb-your-actual-token-here',
  userId: 'U1234567890',  // Your actual user ID
  pollInterval: 300000,   // 5 minutes
  dataFile: 'time_logs.json'
};
```

## Step 4: Test the Setup

```bash
npm run test
```

You should see something like:
```
✓ Connected to Slack as: your-bot-name
✓ Tracking user: Your Name
Current Status: { presence: 'active', online: true, ... }
```

## Step 5: Start Tracking

```bash
npm run start
```

The tracker will now:
- Poll your Slack status every 5 minutes
- Log changes to `time_logs.json`
- Show real-time updates in the console

Press `Ctrl+C` to stop tracking.

## Usage Commands

### Start Tracking
```bash
npm run start
# or
node runner.js start
```

### Generate Daily Report
```bash
npm run report
# or for specific date
node runner.js report 2024-01-15
```

### Export to CSV
```bash
npm run export
# or specify filename
node runner.js export my_timesheet.csv
```

### Test Connection
```bash
npm run test
```

## Status Format Tips

For better project tracking, use consistent status formats:

- `[PROJECT] Working on feature X`
- `CLIENT - Meeting with team`
- `🔴 Deep Work - [Important Project]`
- `📞 Call: [Client Name]`
- `📧 Admin tasks`

The tracker will automatically extract project names from brackets `[]` or from patterns like `CLIENT -`.

## File Structure

```
slack-time-tracker/
├── slack-time-tracker.js  # Main application class
├── config.js             # Configuration settings
├── runner.js             # CLI interface
├── package.json          # Dependencies
├── .env                  # Environment variables (optional)
└── time_logs.json        # Generated time logs
```

## Troubleshooting

### "Invalid token" error
- Double-check your bot token starts with `xoxb-`
- Make sure the app is installed in your workspace

### "User not found" error  
- Verify your User ID is correct
- Run the test command to see the correct format

### Permission errors
- Check that your bot has the required scopes in Slack app settings
- Reinstall the app to workspace if you added new scopes

### Data not logging
- Check console output for errors
- Verify you're changing your Slack status to trigger logs
- Try reducing poll interval for testing

## Privacy & Security

- Time logs are stored locally in JSON format
- No data is sent to external servers
- Bot only reads your own status (requires your User ID)
- You can delete `time_logs.json` anytime to clear history

## Advanced Configuration

You can modify `config.js` to:
- Change polling frequency (minimum 60 seconds recommended)
- Customize data file location
- Add multiple users (requires code modification)

Let me know if you need help with any step!