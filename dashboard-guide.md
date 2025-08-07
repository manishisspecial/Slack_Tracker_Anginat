# 🚀 Slack Time Tracker - Complete Dashboard Guide

## 📊 Available Dashboards

### 1. **Team Overview Dashboard** (`/`) - **MAIN PAGE**
- **Purpose**: View all users simultaneously in one dashboard
- **Features**:
  - Team overview statistics
  - Individual user cards with real-time status
  - Team activity distribution charts
  - Recent activity for each user
  - Auto-refresh every 30 seconds
  - Navigation to individual user view
- **URL**: `http://localhost:3000/`

### 2. **Individual User Dashboard** (`/individual`)
- **Purpose**: Track and view data for individual users
- **Features**: 
  - User selection dropdown
  - Individual user statistics
  - Personal charts and timeline
  - Start/Stop tracking controls
  - Navigation back to team overview
- **URL**: `http://localhost:3000/individual`

### 3. **Simple Dashboard** (`/simple`)
- **Purpose**: Basic dashboard for individual tracking
- **Features**: Simple interface with basic functionality
- **URL**: `http://localhost:3000/simple`

## 🔄 How to Track All Users Simultaneously

### **Method 1: Using the Dev Script (Recommended)**
```bash
npm run dev
```
This starts both:
- Web server on port 3000
- Multi-user tracking for all 4 users

### **Method 2: Manual Start**
```bash
# Start web server
npm start

# In another terminal, start multi-user tracking
npm run multi-start
```

### **Method 3: Individual Commands**
```bash
# Start web server
node web-server.js

# Start multi-user tracking
node multi-user-runner.js start
```

## 👥 Current Users Being Tracked

1. **Taran** (U083UEN46P8) - `time_logs_taran.json`
2. **Ravneet Singh** (U071V3GDRQ9) - `time_logs_ravneet.json`
3. **Satyam Vatsa** (U06CQAKLWG4) - `time_logs_satyam.json`
4. **Manish Kumar Shah** (U0927DWEX1Q) - `time_logs_manish.json`

## 📈 Dashboard Features

### **Team Dashboard (`/`) - MAIN PAGE**
- ✅ Team overview statistics
- ✅ Individual user cards
- ✅ Real-time presence status
- ✅ Team activity charts
- ✅ Recent activity timeline
- ✅ Auto-refresh functionality
- ✅ Manual refresh button
- ✅ Navigation to individual view

### **Individual Dashboard (`/individual`)**
- ✅ User selection dropdown
- ✅ Real-time status updates
- ✅ Personal time tracking
- ✅ Charts (Today/Week/Month)
- ✅ Export data functionality
- ✅ Start/Stop tracking controls
- ✅ Navigation back to team view

## 🎯 Key Features

### **Real-Time Tracking**
- All 4 users tracked simultaneously
- Status updates every 30 seconds
- Presence detection (active/away/offline)
- Project-based time tracking

### **Data Visualization**
- Doughnut charts for time distribution
- Presence status charts
- Individual user statistics
- Team productivity metrics

### **Data Management**
- CSV export functionality
- Individual user data files
- Historical data tracking
- Real-time data aggregation

## 🔧 API Endpoints

### **User Management**
- `GET /api/users` - List all configured users
- `GET /api/user/{userId}/data` - Get data for specific user

### **Tracking Control**
- `POST /api/start-tracking` - Start tracking
- `POST /api/stop-tracking` - Stop tracking
- `GET /api/status` - Get current tracking status

### **Data Access**
- `GET /api/data` - Get aggregated data
- `GET /api/report` - Generate reports
- `GET /api/export` - Export data

## 🚀 Quick Start Guide

1. **Start the Application**:
   ```bash
   npm run dev
   ```

2. **Access Team Dashboard (Main Page)**:
   - Open: `http://localhost:3000/`
   - View all users simultaneously
   - Monitor team productivity
   - Click "View Individual Users" to access individual tracking

3. **Access Individual Dashboard**:
   - Open: `http://localhost:3000/individual`
   - Select user from dropdown
   - View individual statistics and charts
   - Click "Team Overview" to go back to team view

4. **Monitor Tracking**:
   - Check terminal for real-time updates
   - See status changes for all users
   - Data automatically saved to individual files

## 📊 Dashboard URLs Summary

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| **Team Overview** | `http://localhost:3000/` | **All users simultaneously (MAIN PAGE)** |
| Individual | `http://localhost:3000/individual` | Single user tracking |
| Simple | `http://localhost:3000/simple` | Basic interface |
| Test | `http://localhost:3000/test-simple` | Testing functionality |
| Debug | `http://localhost:3000/debug-users` | Debug user loading |

## 🎉 Success Indicators

✅ **All Users Tracking**: Terminal shows status updates for all 4 users
✅ **Team Dashboard**: Main page loads with all users visible
✅ **Individual Dashboard**: User selection and personal tracking works
✅ **Navigation**: Easy switching between team and individual views
✅ **Charts Working**: Time distribution and presence charts display
✅ **Auto Refresh**: Data updates automatically every 30 seconds

## 🔍 Troubleshooting

### **If Users Not Showing**:
1. Check if tracking is running: `npm run multi-status`
2. Restart tracking: `npm run multi-start`
3. Refresh dashboard and click "Refresh Users"

### **If Charts Not Loading**:
1. Check browser console for errors
2. Ensure Chart.js is loading properly
3. Try refreshing the page

### **If Data Not Updating**:
1. Check terminal for tracking status
2. Verify Slack API connection
3. Restart the application: `npm run dev`

## 🎯 Navigation Flow

```
Team Dashboard (/) 
    ↓ "View Individual Users"
Individual Dashboard (/individual)
    ↓ "Team Overview"
Team Dashboard (/)
```

---

**🎯 You now have a complete Slack Time Tracker with the team dashboard as the main page and easy navigation to individual user tracking!** 