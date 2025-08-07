#!/usr/bin/env node

const MultiUserSlackTimeTracker = require('./multi-user-tracker');
const config = require('./config');

class MultiUserTimeTrackerCLI {
  constructor() {
    this.tracker = new MultiUserSlackTimeTracker(config);
  }

  showHelp() {
    console.log(`
🕐 Multi-User Slack Time Tracker
=====================================

Usage: node multi-user-runner.js <command> [options]

Commands:
  start                    Start time tracking for all users
  stop                     Stop time tracking
  status                   Show current status
  report [YYYY-MM-DD]     Generate daily report
  export [filename.csv]   Export all data to CSV
  test                     Test Slack connection for all users

Examples:
  node multi-user-runner.js start
  node multi-user-runner.js report 2024-01-15
  node multi-user-runner.js export team_report.csv

Users configured: ${config.users.map(u => u.name).join(', ')}
`);
  }

  async start() {
    console.log('🕐 Multi-User Slack Time Tracker');
    console.log('=====================================');
    
    const initialized = await this.tracker.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize tracker');
      process.exit(1);
    }

    const command = process.argv[2];
    
    switch (command) {
      case 'start':
        await this.tracker.start();
        console.log('Press Ctrl+C to stop tracking');
        break;
        
      case 'stop':
        this.tracker.stop();
        console.log('✅ Tracking stopped');
        process.exit(0);
        break;
        
      case 'status':
        const status = this.tracker.getStatus();
        console.log('📊 Current Status:');
        console.log(`  Running: ${status.is_running ? 'Yes' : 'No'}`);
        console.log(`  Users tracked: ${status.users_tracked}`);
        console.log(`  Total entries: ${status.total_entries}`);
        break;
        
      case 'report':
        const date = process.argv[3] || new Date().toISOString().split('T')[0];
        const report = await this.tracker.generateDailyReport(date);
        console.log(`📊 Daily Report for ${date}:`);
        console.log(JSON.stringify(report, null, 2));
        break;
        
      case 'export':
        const filename = process.argv[3] || `multi_user_export_${Date.now()}.csv`;
        await this.tracker.exportToCSV(filename);
        console.log(`✅ Data exported to ${filename}`);
        break;
        
      case 'test':
        console.log('🔍 Testing Slack connection for all users...');
        for (const user of config.users) {
          try {
            const status = await this.tracker.getCurrentStatus(user.id);
            if (status) {
              console.log(`✅ ${user.name}: Connected (${status.presence})`);
            } else {
              console.log(`❌ ${user.name}: Failed to get status`);
            }
          } catch (error) {
            console.log(`❌ ${user.name}: ${error.message}`);
          }
        }
        break;
        
      default:
        this.showHelp();
        break;
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Gracefully shutting down...');
  if (global.tracker) {
    global.tracker.stop();
  }
  process.exit(0);
});

// Run the CLI
const cli = new MultiUserTimeTrackerCLI();
global.tracker = cli.tracker;
cli.start().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
}); 