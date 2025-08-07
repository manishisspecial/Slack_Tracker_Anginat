// runner.js - Main application runner for Slack Time Tracker
const SlackTimeTracker = require('./slack-time-tracker');
const config = require('./config');

class TimeTrackerCLI {
  constructor() {
    this.tracker = new SlackTimeTracker(config);
  }

  async start() {
    console.log('🕐 Slack Time Tracker');
    console.log('=====================================');
    
    const initialized = await this.tracker.initialize();
    if (!initialized) {
      process.exit(1);
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Gracefully shutting down...');
      this.tracker.stop();
      process.exit(0);
    });

    // Parse command line arguments
    const command = process.argv[2];
    
    switch (command) {
      case 'start':
        await this.tracker.start();
        console.log('Press Ctrl+C to stop tracking');
        break;
        
      case 'report':
        const date = process.argv[3] || new Date().toISOString().split('T')[0];
        await this.tracker.generateDailyReport(date);
        process.exit(0);
        break;
        
      case 'export':
        const filename = process.argv[3];
        await this.tracker.exportToCSV(filename);
        process.exit(0);
        break;
        
      case 'test':
        const status = await this.tracker.getCurrentStatus();
        console.log('Current Status:', status);
        process.exit(0);
        break;
        
      default:
        this.showHelp();
        process.exit(0);
    }
  }

  showHelp() {
    console.log(`
Usage: node runner.js <command> [options]

Commands:
  start                    Start time tracking
  report [YYYY-MM-DD]     Generate daily report (defaults to today)
  export [filename.csv]   Export all data to CSV
  test                    Test Slack connection and get current status

Examples:
  node runner.js start
  node runner.js report 2024-01-15
  node runner.js export my_time_data.csv
  node runner.js test
`);
  }
}

// Start the CLI if this file is run directly
if (require.main === module) {
  const cli = new TimeTrackerCLI();
  cli.start().catch(console.error);
}

module.exports = TimeTrackerCLI; 