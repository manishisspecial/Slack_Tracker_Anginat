# Multi-User Slack Time Tracker Setup Guide

## 🎯 Overview

This system now supports tracking multiple Slack users simultaneously. Each user's data is stored in separate files and can be viewed individually or as a team.

## 👥 Configured Users

The following users are currently configured for tracking:

1. **Taran** (U083UEN46P8) - `time_logs_taran.json`
2. **Ravneet Singh** (U071V3GDRQ9) - `time_logs_ravneet.json`
3. **Satyam Vatsa** (U06CQAKLWG4) - `time_logs_satyam.json`
4. **Manish Kumar Shah** (U0927DWEX1Q) - `time_logs_manish.json`

## 🚀 How to Start

### Option 1: Start Everything (Recommended)
```bash
npm run dev
```
This starts both the web dashboard and multi-user tracking.

### Option 2: Start Individually
```bash
# Start multi-user tracking only
npm run multi-start

# Start web dashboard only
npm run web:dev
```

## 📊 Available Commands

### Multi-User Commands
```bash
npm run multi-start      # Start tracking all users
npm run multi-status     # Check tracking status
npm run multi-report     # Generate daily report
npm run multi-export     # Export all data to CSV
npm run multi-test       # Test Slack connection for all users
```

### Web Dashboard
- **Main Dashboard**: `http://localhost:3000/` (Enhanced with charts)
- **Simple Dashboard**: `http://localhost:3000/simple` (Basic interface)

## 🔧 API Endpoints

### User Management
- `GET /api/users` - List all configured users
- `GET /api/user/{userId}/data` - Get data for specific user

### Data & Reports
- `GET /api/data` - Get all data from all users
- `GET /api/status` - Get tracking status
- `GET /api/report?date=YYYY-MM-DD` - Generate daily report
- `POST /api/start-tracking` - Start tracking
- `POST /api/stop-tracking` - Stop tracking

## 🎨 Dashboard Features

### Enhanced Dashboard (`/`)
- **User Selector**: Switch between different users
- **Real-time Charts**: Time distribution and presence status
- **Period Filtering**: Today, Week, Month views
- **Interactive Timeline**: Recent activity feed
- **Export Functionality**: Download data as CSV

### Simple Dashboard (`/simple`)
- Clean, reliable interface
- Basic statistics and timeline
- Guaranteed to work in all environments

## 📈 How It Works

1. **Status Monitoring**: Polls each user's Slack presence every 30 seconds
2. **Project Detection**: Extracts project names from status text using patterns:
   - `[PROJECT NAME]`
   - `CLIENT - Task`
   - `Working on Something`
   - `Meeting: Project Name`
3. **Data Storage**: Each user's data is stored in separate JSON files
4. **Real-time Updates**: Dashboard refreshes automatically every 30 seconds

## 🔍 Adding New Users

To add a new user, edit `config.js`:

```javascript
users: [
  // ... existing users ...
  {
    id: 'U_NEW_USER_ID',
    name: 'New User Name',
    dataFile: 'time_logs_newuser.json'
  }
]
```

## 📊 Data Structure

Each log entry contains:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "presence": "active",
  "online": true,
  "status_text": "Working on [Project Alpha]",
  "status_emoji": ":computer:",
  "project": "Project Alpha",
  "duration_from_last": 30,
  "user_id": "U06CQAKLWG4",
  "user_name": "Satyam Vatsa"
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Failed to get status for user"**
   - Check if the Slack token has proper permissions
   - Verify the user ID is correct

2. **"No existing data file found"**
   - This is normal for new users
   - Data will be created automatically

3. **Dashboard not loading**
   - Ensure both web server and tracker are running
   - Check browser console for errors

### Logs Location
- User data files are in the project root
- Check console output for real-time tracking status

## 🎯 Best Practices

1. **Status Updates**: Encourage users to update their Slack status with project information
2. **Regular Monitoring**: Check the dashboard regularly for insights
3. **Data Backup**: Export data periodically for backup
4. **Team Reports**: Use the report API for team productivity analysis

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify Slack API permissions
3. Ensure all users are accessible with the current token
4. Test individual user connections with `npm run multi-test`

---

**Happy Tracking! 🕐✨** 