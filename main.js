const { WebClient } = require('@slack/web-api');
const fs = require('fs').promises;
const path = require('path');

class SlackTimeTracker {
  constructor(config) {
    this.web = new WebClient(config.slackToken);
    this.userId = config.userId;
    this.pollInterval = config.pollInterval || 300000; // 5 minutes default
    this.dataFile = config.dataFile || 'time_logs.json';
    this.isRunning = false;
    this.currentSession = null;
    this.logs = [];
  }

  async initialize() {
    try {
      // Load existing data
      await this.loadExistingData();
      
      // Verify Slack connection
      const authTest = await this.web.auth.test();
      console.log(`✓ Connected to Slack as: ${authTest.user}`);
      
      // Get user info
      const userInfo = await this.web.users.info({ user: this.userId });
      console.log(`✓ Tracking user: ${userInfo.user.real_name}`);
      
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  async loadExistingData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      this.logs = JSON.parse(data);
      console.log(`✓ Loaded ${this.logs.length} existing log entries`);
    } catch (error) {
      console.log('ℹ No existing data file found, starting fresh');
      this.logs = [];
    }
  }

  async saveData() {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(this.logs, null, 2));
      console.log(`✓ Data saved (${this.logs.length} entries)`);
    } catch (error) {
      console.error('❌ Failed to save data:', error.message);
    }
  }

  async getCurrentStatus() {
    try {
      const [presence, profile] = await Promise.all([
        this.web.users.getPresence({ user: this.userId }),
        this.web.users.profile.get({ user: this.userId })
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
      console.error('❌ Failed to get status:', error.message);
      return null;
    }
  }

  parseStatusForProject(statusText) {
    // Extract project info from status text
    // Patterns: "Working on [PROJECT]", "[CLIENT] - Task", etc.
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
    const currentStatus = await this.getCurrentStatus();
    if (!currentStatus) return;

    const lastStatus = this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
    
    if (this.shouldLogEntry(currentStatus, lastStatus)) {
      // Calculate duration if there was a previous entry
      let duration = null;
      if (lastStatus) {
        const lastTime = new Date(lastStatus.timestamp);
        const currentTime = new Date(currentStatus.timestamp);
        duration = Math.round((currentTime - lastTime) / 1000 / 60); // minutes
      }

      const logEntry = {
        ...currentStatus,
        project: this.parseStatusForProject(currentStatus.status_text),
        duration_from_last: duration,
        entry_id: Date.now()
      };

      this.logs.push(logEntry);
      
      console.log(`📝 Status change logged:`, {
        presence: currentStatus.presence,
        status: currentStatus.status_text || '(no status)',
        project: logEntry.project,
        duration_from_last: duration ? `${duration}m` : 'N/A'
      });

      await this.saveData();
    } else {
      console.log(`⏱ No change (${currentStatus.presence} - ${currentStatus.status_text || 'no status'})`);
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠ Tracker is already running');
      return;
    }

    console.log(`🚀 Starting time tracker (polling every ${this.pollInterval / 1000}s)`);
    this.isRunning = true;

    // Initial tracking
    await this.trackTime();

    // Set up polling
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.trackTime();
      }
    }, this.pollInterval);
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠ Tracker is not running');
      return;
    }

    console.log('🛑 Stopping time tracker');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async generateDailyReport(date = new Date().toISOString().split('T')[0]) {
    const dayLogs = this.logs.filter(log => 
      log.timestamp.startsWith(date)
    );

    if (dayLogs.length === 0) {
      console.log(`📊 No data found for ${date}`);
      return;
    }

    console.log(`\n📊 Daily Report for ${date}`);
    console.log('=' .repeat(50));

    // Group by project
    const projectTime = {};
    const statusSummary = {
      active: 0,
      away: 0,
      offline: 0
    };

    for (let i = 0; i < dayLogs.length; i++) {
      const log = dayLogs[i];
      const duration = log.duration_from_last || 0;
      
      // Project time
      if (!projectTime[log.project]) {
        projectTime[log.project] = 0;
      }
      projectTime[log.project] += duration;

      // Status summary
      if (log.presence === 'active') statusSummary.active += duration;
      else if (log.presence === 'away') statusSummary.away += duration;
      else statusSummary.offline += duration;
    }

    // Display project breakdown
    console.log('\nProject Time Breakdown:');
    Object.entries(projectTime)
      .sort(([,a], [,b]) => b - a)
      .forEach(([project, minutes]) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        console.log(`  ${project}: ${hours}h ${mins}m`);
      });

    // Display presence summary
    console.log('\nPresence Summary:');
    Object.entries(statusSummary).forEach(([status, minutes]) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      console.log(`  ${status}: ${hours}h ${mins}m`);
    });

    const totalMinutes = Object.values(projectTime).reduce((sum, mins) => sum + mins, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;
    console.log(`\nTotal Tracked Time: ${totalHours}h ${totalMins}m`);
    console.log('=' .repeat(50));
  }

  async exportToCSV(filename = `slack_time_export_${Date.now()}.csv`) {
    const headers = [
      'timestamp',
      'presence',
      'online',
      'status_text',
      'status_emoji',
      'project',
      'duration_from_last_minutes'
    ];

    const csvContent = [
      headers.join(','),
      ...this.logs.map(log => [
        log.timestamp,
        log.presence,
        log.online,
        `"${(log.status_text || '').replace(/"/g, '""')}"`,
        log.status_emoji,
        `"${log.project.replace(/"/g, '""')}"`,
        log.duration_from_last || 0
      ].join(','))
    ].join('\n');

    await fs.writeFile(filename, csvContent);
    console.log(`✓ Data exported to ${filename}`);
  }
}

module.exports = SlackTimeTracker;