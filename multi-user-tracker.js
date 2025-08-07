require('dotenv').config(); // Load environment variables from .env file
const { WebClient } = require('@slack/web-api');
const fs = require('fs').promises;
const path = require('path');

class MultiUserSlackTimeTracker {
  constructor(config) {
    this.web = new WebClient(config.slackToken);
    this.users = config.users || [];
    this.pollInterval = config.pollInterval || 300000; // 5 minutes default
    this.isRunning = false;
    this.userTrackers = new Map();
    this.logs = new Map(); // userId -> logs array
  }

  async initialize() {
    try {
      // Verify Slack connection
      const authTest = await this.web.auth.test();
      console.log(`✓ Connected to Slack as: ${authTest.user}`);
      
      // Initialize each user tracker
      for (const user of this.users) {
        await this.initializeUser(user);
      }
      
      console.log(`✓ Initialized tracking for ${this.users.length} users`);
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  async initializeUser(user) {
    try {
      // Load existing data for this user
      await this.loadExistingData(user);
      
      // Get user info from Slack
      const userInfo = await this.web.users.info({ user: user.id });
      console.log(`✓ Tracking user: ${userInfo.user.real_name} (${user.id})`);
      
      // Store user info
      this.userTrackers.set(user.id, {
        ...user,
        realName: userInfo.user.real_name,
        lastStatus: null
      });
      
    } catch (error) {
      console.error(`❌ Failed to initialize user ${user.name}:`, error.message);
    }
  }

  async loadExistingData(user) {
    try {
      const data = await fs.readFile(user.dataFile, 'utf8');
      this.logs.set(user.id, JSON.parse(data));
      console.log(`✓ Loaded ${this.logs.get(user.id).length} existing log entries for ${user.name}`);
    } catch (error) {
      console.log(`ℹ No existing data file found for ${user.name}, starting fresh`);
      this.logs.set(user.id, []);
    }
  }

  async saveData(userId) {
    try {
      const user = this.users.find(u => u.id === userId);
      const userLogs = this.logs.get(userId) || [];
      await fs.writeFile(user.dataFile, JSON.stringify(userLogs, null, 2));
      console.log(`✓ Data saved for ${user.name} (${userLogs.length} entries)`);
    } catch (error) {
      console.error(`❌ Failed to save data for user ${userId}:`, error.message);
    }
  }

  async getCurrentStatus(userId) {
    try {
      const [presence, profile] = await Promise.all([
        this.web.users.getPresence({ user: userId }),
        this.web.users.profile.get({ user: userId })
      ]);

      return {
        presence: presence.presence,
        online: presence.online,
        auto_away: presence.auto_away,
        manual_away: presence.manual_away,
        last_activity: presence.last_activity,
        status_text: profile.profile.status_text || '',
        status_emoji: profile.profile.status_emoji || '',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to get status for user ${userId}:`, error.message);
      return null;
    }
  }

  parseStatusForProject(statusText) {
    // Extract project info from status text
    const patterns = [
      /\[([^\]]+)\]/,  // [PROJECT NAME]
      /^([A-Z]{2,})\s-/,  // CLIENT - Task
      /Working on (.+)/i,  // Working on Something
      /Meeting:\s*(.+)/i   // Meeting: Project Name
    ];

    for (const pattern of patterns) {
      const match = statusText.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return statusText || 'General Work';
  }

  shouldLogEntry(currentStatus, lastStatus) {
    if (!lastStatus) return true;
    
    // Log if presence changed
    if (currentStatus.presence !== lastStatus.presence) return true;
    
    // Log if status text changed
    if (currentStatus.status_text !== lastStatus.status_text) return true;
    
    // Log if online status changed
    if (currentStatus.online !== lastStatus.online) return true;
    
    return false;
  }

  async trackTime() {
    const promises = this.users.map(async (user) => {
      try {
        const currentStatus = await this.getCurrentStatus(user.id);
        if (!currentStatus) return;

        const userTracker = this.userTrackers.get(user.id);
        const lastStatus = userTracker.lastStatus;
        const userLogs = this.logs.get(user.id) || [];

        if (this.shouldLogEntry(currentStatus, lastStatus)) {
          // Calculate duration from last entry
          let durationFromLast = 0;
          if (lastStatus && userLogs.length > 0) {
            const lastEntry = userLogs[userLogs.length - 1];
            const lastTime = new Date(lastEntry.timestamp);
            const currentTime = new Date(currentStatus.timestamp);
            durationFromLast = Math.floor((currentTime - lastTime) / 1000 / 60); // minutes
          }

          // Create new log entry
          const logEntry = {
            timestamp: currentStatus.timestamp,
            presence: currentStatus.presence,
            online: currentStatus.online,
            status_text: currentStatus.status_text,
            status_emoji: currentStatus.status_emoji,
            project: this.parseStatusForProject(currentStatus.status_text),
            duration_from_last: durationFromLast,
            user_id: user.id,
            user_name: user.name
          };

          userLogs.push(logEntry);
          this.logs.set(user.id, userLogs);
          
          // Save data immediately
          await this.saveData(user.id);

          console.log(`📝 ${user.name}: ${currentStatus.presence} - ${logEntry.project} (${durationFromLast}m)`);
        } else {
          console.log(`⏱ No change for ${user.name} (${currentStatus.presence} - ${this.parseStatusForProject(currentStatus.status_text)})`);
        }

        // Update last status
        userTracker.lastStatus = currentStatus;
        this.userTrackers.set(user.id, userTracker);

      } catch (error) {
        console.error(`❌ Error tracking ${user.name}:`, error.message);
      }
    });

    await Promise.all(promises);
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Tracker is already running');
      return;
    }

    console.log(`🚀 Starting time tracker for ${this.users.length} users (polling every ${this.pollInterval/1000}s)`);
    this.isRunning = true;

    // Initial tracking
    await this.trackTime();

    // Set up interval
    this.interval = setInterval(async () => {
      if (this.isRunning) {
        await this.trackTime();
      }
    }, this.pollInterval);
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Tracker is not running');
      return;
    }

    console.log('🛑 Stopping time tracker');
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async generateDailyReport(date = new Date().toISOString().split('T')[0]) {
    const reports = {};
    
    for (const user of this.users) {
      const userLogs = this.logs.get(user.id) || [];
      const dayLogs = userLogs.filter(log => log.timestamp.startsWith(date));
      
      const totalMinutes = dayLogs.reduce((sum, log) => sum + (log.duration_from_last || 0), 0);
      const activeMinutes = dayLogs.filter(log => log.presence === 'active')
        .reduce((sum, log) => sum + (log.duration_from_last || 0), 0);
      
      const projects = {};
      dayLogs.forEach(log => {
        const project = log.project;
        projects[project] = (projects[project] || 0) + (log.duration_from_last || 0);
      });

      reports[user.id] = {
        user_name: user.name,
        date: date,
        total_minutes: totalMinutes,
        active_minutes: activeMinutes,
        productivity_percentage: totalMinutes > 0 ? Math.round((activeMinutes / totalMinutes) * 100) : 0,
        projects: projects,
        entries: dayLogs.length
      };
    }

    return reports;
  }

  async exportToCSV(filename = `slack_time_export_${Date.now()}.csv`) {
    const csvRows = ['timestamp,user_id,user_name,presence,status_text,project,duration_from_last'];
    
    for (const user of this.users) {
      const userLogs = this.logs.get(user.id) || [];
      userLogs.forEach(log => {
        const row = [
          log.timestamp,
          log.user_id,
          `"${log.user_name}"`,
          log.presence,
          `"${(log.status_text || '').replace(/"/g, '""')}"`,
          `"${log.project.replace(/"/g, '""')}"`,
          log.duration_from_last || 0
        ];
        csvRows.push(row.join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    await fs.writeFile(filename, csvContent);
    console.log(`✓ Exported data to ${filename}`);
    return filename;
  }

  getStatus() {
    return {
      is_running: this.isRunning,
      users_tracked: this.users.length,
      total_entries: Array.from(this.logs.values()).reduce((sum, userLogs) => sum + userLogs.length, 0)
    };
  }
}

module.exports = MultiUserSlackTimeTracker; 