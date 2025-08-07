// config.js - Configuration file for Slack Time Tracker
const config = {
  // Your Slack Bot User OAuth Token (starts with xoxb-)
  slackToken: process.env.SLACK_TOKEN,
  
  // Multiple users configuration
  users: [
    {
      id: 'U06CQAKLWG4',
      name: 'Satyam Vatsa',
      dataFile: 'time_logs_satyam.json'
    },
    {
      id: 'U093DD1BKAB',
      name: 'Himani',
      dataFile: 'time_logs_himani.json'
    },
    {
      id: 'U083UEN46P8',
      name: 'Taran',
      dataFile: 'time_logs_taran.json'
    },
    {
      id: 'U071V3GDRQ9',
      name: 'Ravneet Singh',
      dataFile: 'time_logs_ravneet.json'
    },
    {
      id: 'U0927DWEX1Q',
      name: 'Manish Kumar Shah',
      dataFile: 'time_logs_manish.json'
    }
  ],
  
  // Default user ID (for backward compatibility)
  userId: process.env.SLACK_USER_ID || 'U093DD1BKAB',
  
  // How often to check status (in milliseconds)
  // 30000 = 30 seconds (for testing)
  // 300000 = 5 minutes (for production)
  pollInterval: 30000,
  
  // Where to save the time logs (legacy, now uses user-specific files)
  dataFile: 'time_logs.json'
};

module.exports = config;
