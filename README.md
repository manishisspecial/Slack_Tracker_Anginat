# 🚀 Slack Time Tracker Pro

A world-class Slack time tracking application with advanced analytics, multi-user support, and premium UI/UX design.

## ✨ Features

### 🎯 Core Functionality
- **Multi-User Time Tracking**: Track time for multiple Slack users simultaneously
- **Real-time Presence Monitoring**: Monitor user presence and status changes
- **Advanced Analytics**: Comprehensive productivity insights and performance metrics
- **Date-based Filtering**: Filter data by specific dates or date ranges
- **Export Capabilities**: Export data to CSV format for further analysis

### 🎨 Premium UI/UX
- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Fade-in effects, hover animations, and loading states
- **Interactive Elements**: Dynamic charts, real-time updates, and intuitive navigation

### 📊 Advanced Analytics
- **Productivity Trends**: Track productivity patterns over time
- **Team Performance Metrics**: Comprehensive team analytics
- **Work Pattern Analysis**: Deep insights into work habits
- **Real-time Insights**: Live updates and notifications

## 🛠️ Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Slack Integration**: Slack Web API
- **Charts**: Chart.js (for advanced visualizations)
- **Styling**: Modern CSS with Flexbox and Grid
- **Icons**: Font Awesome

## 📋 Prerequisites

- Node.js (version 14.0.0 or higher)
- npm or yarn package manager
- Slack Bot Token with appropriate permissions
- Slack workspace with users to track

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-new-repository-url>
cd slack-time-tracker-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit .env file with your Slack token
# Replace xoxb-your-bot-token-here with your actual Slack Bot Token
```

### 4. Configure Users
Edit `config.js` to add the Slack users you want to track:
```javascript
users: [
  {
    id: 'U083UEN46P8',
    name: 'Taran',
    dataFile: 'time_logs_taran.json'
  },
  // Add more users as needed
]
```

### 5. Start the Application
```bash
# Start the web dashboard
npm run web

# Or start both web server and time tracking
npm run dev
```

### 6. Access the Dashboard
Open your browser and navigate to:
- **Team Overview**: `http://localhost:3000/`
- **Individual Dashboard**: `http://localhost:3000/individual`

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Your Slack Bot User OAuth Token (starts with xoxb-)
SLACK_TOKEN=xoxb-your-bot-token-here

# Your Slack User ID (optional, for backward compatibility)
SLACK_USER_ID=U06CQAKLWG4

# Node environment
NODE_ENV=development
```

### User Configuration (config.js)
```javascript
{
  id: 'SLACK_USER_ID',
  name: 'Display Name',
  dataFile: 'time_logs_username.json'
}
```

## 📊 Available Scripts

- `npm start` - Start time tracking
- `npm run web` - Start web dashboard
- `npm run dev` - Start both web server and tracking
- `npm run multi-start` - Start multi-user tracking
- `npm run multi-status` - Check tracking status
- `npm run multi-report` - Generate reports
- `npm run multi-export` - Export data to CSV

## 🔒 Security Best Practices

### ✅ What's Secured
- **Environment Variables**: All sensitive data stored in `.env` file
- **Git Ignore**: `.env` file is properly ignored by git
- **Token Protection**: No hardcoded tokens in source code
- **Example Files**: `env.example` contains only placeholder values

### ⚠️ Important Security Notes
1. **Never commit your `.env` file** - It contains sensitive tokens
2. **Keep your Slack token secure** - Don't share it publicly
3. **Use environment variables** - Always use `process.env` for sensitive data
4. **Regular token rotation** - Rotate your Slack tokens periodically

## 🎯 Dashboard Features

### Team Overview Dashboard
- **Welcome Section**: Project overview and quick actions
- **Statistics Grid**: Total users, active users, total time, average productivity
- **Data Grid**: Project breakdown and daily summary
- **Timeline Section**: Recent team activity
- **Advanced Analytics**: Productivity trends and performance metrics

### Individual Dashboard
- **Personal Statistics**: Individual productivity metrics
- **Project Breakdown**: Time spent on different projects
- **Daily Summary**: Daily activity overview
- **Real-time Status**: Current presence and status
- **Date Filtering**: Filter data by specific dates

## 📈 Analytics & Insights

### Productivity Metrics
- **Active Time Tracking**: Monitor actual work time
- **Project Distribution**: Time allocation across projects
- **Status Analysis**: Presence patterns and status changes
- **Trend Analysis**: Productivity trends over time

### Team Analytics
- **Team Performance**: Overall team productivity metrics
- **User Comparison**: Compare individual performances
- **Work Patterns**: Analyze team work habits
- **Real-time Monitoring**: Live team activity tracking

## 🔄 Data Management

### Data Storage
- **JSON Files**: User-specific time logs stored in JSON format
- **Automatic Backups**: Data is automatically saved
- **Export Options**: CSV export for external analysis

### Data Structure
```json
{
  "timestamp": "2024-01-15T09:00:00.000Z",
  "presence": "active",
  "status_text": "Working on project tasks",
  "project": "General Work",
  "duration_from_last": 0
}
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set up environment variables on your server
2. Install dependencies: `npm install --production`
3. Start the application: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review the configuration files
3. Ensure your Slack token has proper permissions
4. Verify your environment variables are set correctly

## 🔄 Updates & Maintenance

- **Regular Updates**: Keep dependencies updated
- **Token Rotation**: Rotate Slack tokens periodically
- **Backup Data**: Regularly backup your time log files
- **Monitor Logs**: Check application logs for issues

---

**⚠️ Security Reminder**: Always keep your Slack tokens secure and never commit them to version control! 