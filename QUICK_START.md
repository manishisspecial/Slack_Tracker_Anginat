# Quick Start Guide

Get your Slack Time Tracker running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Setup Script
```bash
npm run setup
```
This will guide you through the configuration process.

### 3. Test Connection
```bash
npm run test
```

### 4. Start Tracking
```bash
npm start
```

### 5. View Dashboard
```bash
npm run web
```
Then visit `http://localhost:3000`

## 📊 How to Use

1. **Update your Slack status** with project information:
   - `[Project Alpha]` 
   - `ACME - Client Meeting`
   - `Working on Website`

2. **The tracker will automatically**:
   - Poll your status every 5 minutes
   - Extract project names
   - Log time spent on each activity
   - Calculate daily totals

3. **View your data**:
   - Console reports: `npm run report`
   - Web dashboard: `npm run web`
   - Export to CSV: `npm run export`

## 🔧 Troubleshooting

**"Initialization failed"**
- Check your bot token starts with `xoxb-`
- Ensure bot has `users:read` permission
- Verify your user ID starts with `U`

**"No data found"**
- Update your Slack status with project info
- Wait for the next polling cycle (5 minutes)

**Dashboard not loading**
- Check if port 3000 is available
- Try: `npm run web:dev`

## 📈 Example Workflow

1. Set status: `[Website Redesign] Working on homepage`
2. Work for 2 hours
3. Set status: `[Client Call] ACME - Q4 Planning`
4. Work for 1 hour
5. Set status: `Lunch Break`
6. Check dashboard: `npm run web`

Your dashboard will show:
- Website Redesign: 2h 0m
- ACME: 1h 0m
- Lunch Break: 30m

## 🎯 Pro Tips

- Use consistent project names: `[ProjectName]`
- Set status when switching tasks
- Check dashboard daily for insights
- Export data weekly for analysis

---

**Need help?** Check the full README.md for detailed instructions. 