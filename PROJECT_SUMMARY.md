# Slack Time Tracker - Project Summary

## 🎯 What We Built

A comprehensive time tracking system that automatically monitors your Slack presence and status to log your work activities. The system uses Slack's `users.getPresence` API to track when you're active, away, or offline, and extracts project information from your status messages.

## 🏗 Architecture

### Core Components

1. **`slack-time-tracker.js`** - Main tracking engine
   - Polls Slack API every 5 minutes
   - Extracts project names from status text
   - Calculates time durations
   - Saves data to JSON file

2. **`runner.js`** - Command-line interface
   - Start/stop tracking
   - Generate reports
   - Export to CSV
   - Test connections

3. **`web-server.js`** - Web dashboard server
   - Serves HTML dashboard
   - REST API endpoints
   - Real-time data updates

4. **`tracker.html`** - Beautiful web interface
   - Interactive charts (Chart.js)
   - Real-time statistics
   - Project breakdown
   - Activity timeline

5. **`config.js`** - Configuration management
   - Slack tokens and user IDs
   - Polling intervals
   - Data file paths

## 🔧 Key Features

### Automated Tracking
- **Smart Polling**: Checks status every 5 minutes (configurable)
- **Change Detection**: Only logs when status actually changes
- **Project Extraction**: Automatically identifies projects from status text
- **Duration Calculation**: Tracks time between status changes

### Project Recognition Patterns
```javascript
// Supported patterns:
"[Project Alpha]" → Project: "Project Alpha"
"ACME - Client Meeting" → Project: "ACME"  
"Working on Website" → Project: "Website"
"Meeting: Sprint Planning" → Project: "Sprint Planning"
```

### Data Storage
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "presence": "active",
  "status_text": "[Project Alpha] Working on features",
  "project": "Project Alpha",
  "duration_from_last": 5,
  "entry_id": 1705312200000
}
```

## 🌐 Web Dashboard Features

### Live Statistics
- Total tracked time
- Active vs away time
- Top project
- Daily breakdown

### Interactive Charts
- **Project Pie Chart**: Shows time distribution across projects
- **Presence Donut**: Active/away/offline breakdown
- **Hourly Timeline**: Activity throughout the day

### Real-time Updates
- Auto-refresh every 30 seconds
- Live status monitoring
- Instant data visualization

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Dashboard interface |
| `/api/data` | GET | All time data (JSON) |
| `/api/status` | GET | Current status |
| `/api/report?date=YYYY-MM-DD` | GET | Daily report |
| `/api/start-tracking` | POST | Start tracking |
| `/api/stop-tracking` | POST | Stop tracking |

## 🚀 Usage Modes

### Console Mode
```bash
# Start tracking
npm start

# Generate report
npm run report 2024-01-15

# Export data
npm run export my_data.csv

# Test connection
npm run test
```

### Web Dashboard
```bash
# Start web interface
npm run web

# Visit http://localhost:3000
```

## 🔐 Security & Privacy

- **Local Storage**: All data stored locally in JSON files
- **No Cloud Dependencies**: Works completely offline
- **Slack Permissions**: Only requires `users:read` and `users.profile:read`
- **Environment Variables**: Supports secure token storage

## 📈 Reporting & Analytics

### Daily Reports
- Project time breakdown
- Presence summary (active/away/offline)
- Total tracked time
- Activity timeline

### Export Options
- **CSV Export**: For external analysis
- **JSON Data**: Raw time logs
- **API Access**: For integrations

## 🛠 Technical Stack

- **Node.js**: Runtime environment
- **@slack/web-api**: Slack API client
- **Chart.js**: Interactive charts
- **Vanilla JavaScript**: Frontend (no framework)
- **HTTP Server**: Built-in Node.js server

## 🎯 Benefits

1. **Automatic**: No manual time entry required
2. **Accurate**: Based on actual Slack activity
3. **Insightful**: Provides detailed analytics
4. **Flexible**: Multiple interfaces (CLI, Web, API)
5. **Private**: All data stays local
6. **Extensible**: Easy to add new features

## 🔮 Future Enhancements

- **Slack Integration**: Direct status updates from dashboard
- **Calendar Sync**: Import meetings from Google Calendar
- **Team Tracking**: Track multiple team members
- **Advanced Analytics**: Productivity insights and trends
- **Mobile App**: React Native dashboard
- **Cloud Storage**: Optional cloud backup

## 📝 Setup Process

1. **Create Slack App** → Get bot token
2. **Configure Permissions** → Add required scopes
3. **Install Dependencies** → `npm install`
4. **Run Setup** → `npm run setup`
5. **Test Connection** → `npm run test`
6. **Start Tracking** → `npm start`

## 🎉 Success Metrics

- ✅ **Automated Tracking**: No manual intervention needed
- ✅ **Project Recognition**: Smart extraction from status
- ✅ **Visual Dashboard**: Beautiful, interactive interface
- ✅ **Data Export**: CSV and API access
- ✅ **Real-time Updates**: Live status monitoring
- ✅ **Local Storage**: Privacy-focused design

---

**The Slack Time Tracker is now ready to help you track your productivity automatically! 🚀** 