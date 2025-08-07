#!/usr/bin/env node

// setup.js - Interactive setup script for Slack Time Tracker
const fs = require('fs').promises;
const readline = require('readline');
const config = require('./config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🕐 Slack Time Tracker Setup');
  console.log('============================\n');

  console.log('This script will help you configure your Slack Time Tracker.\n');

  // Check if config already exists
  try {
    const currentConfig = require('./config');
    if (currentConfig.slackToken !== 'xoxb-your-token-here') {
      console.log('⚠️  Configuration already exists. Do you want to update it? (y/N)');
      const update = await question('> ');
      if (update.toLowerCase() !== 'y' && update.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }
  } catch (error) {
    // Config doesn't exist, continue with setup
  }

  console.log('\n📋 Prerequisites:');
  console.log('1. Create a Slack App at https://api.slack.com/apps');
  console.log('2. Add scopes: users:read, users.profile:read');
  console.log('3. Install the app to your workspace');
  console.log('4. Get your Bot User OAuth Token (starts with xoxb-)');
  console.log('5. Get your User ID from your Slack profile\n');

  const token = await question('Enter your Slack Bot Token (xoxb-...): ');
  const userId = await question('Enter your Slack User ID (U...): ');
  const pollInterval = await question('Polling interval in minutes (default 5): ') || '5';

  // Validate inputs
  if (!token.startsWith('xoxb-')) {
    console.log('❌ Invalid bot token format. Should start with xoxb-');
    rl.close();
    return;
  }

  if (!userId.startsWith('U')) {
    console.log('❌ Invalid user ID format. Should start with U');
    rl.close();
    return;
  }

  // Create new config
  const newConfig = `// config.js - Configuration file for Slack Time Tracker
const config = {
  // Your Slack Bot User OAuth Token (starts with xoxb-)
  slackToken: process.env.SLACK_TOKEN || '${token}',
  
  // Your Slack User ID (you can find this in your Slack profile)
  userId: process.env.SLACK_USER_ID || '${userId}',
  
  // How often to check status (in milliseconds)
  // ${pollInterval}000 = ${pollInterval} minutes
  pollInterval: ${parseInt(pollInterval) * 60000},
  
  // Where to save the time logs
  dataFile: 'time_logs.json'
};

module.exports = config;
`;

  try {
    await fs.writeFile('config.js', newConfig);
    console.log('\n✅ Configuration saved successfully!');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Test connection: npm run test');
    console.log('3. Start tracking: npm start');
    console.log('4. View dashboard: npm run web');
    
    console.log('\n📊 Status Format Examples:');
    console.log('- [Project Alpha] → Project: "Project Alpha"');
    console.log('- ACME - Client Meeting → Project: "ACME"');
    console.log('- Working on Website → Project: "Website"');
    
    console.log('\n🚀 Ready to track your time!');
    
  } catch (error) {
    console.log('❌ Failed to save configuration:', error.message);
  }

  rl.close();
}

setup().catch(console.error); 