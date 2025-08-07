// slack-bot.js - Slack Bot Integration for Time Tracking
const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const express = require('express');
const config = require('./config');
const SlackTimeTracker = require('./slack-time-tracker');

class SlackTimeTrackerBot {
  constructor() {
    this.web = new WebClient(config.slackToken);
    this.tracker = new SlackTimeTracker(config);
    this.app = express();
    this.port = process.env.PORT || 3001;
    
    // Initialize Slack adapters
    this.slackEvents = createEventAdapter(config.slackSigningSecret);
    this.slackInteractions = createMessageAdapter(config.slackSigningSecret);
    
    this.setupRoutes();
    this.setupSlackEvents();
  }

  setupRoutes() {
    // Slack event endpoints
    this.app.use('/slack/events', this.slackEvents.expressMiddleware());
    this.app.use('/slack/interactions', this.slackInteractions.expressMiddleware());
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  setupSlackEvents() {
    // Handle app mention events
    this.slackEvents.on('app_mention', async (event) => {
      try {
        await this.handleAppMention(event);
      } catch (error) {
        console.error('Error handling app mention:', error);
      }
    });

    // Handle direct messages
    this.slackEvents.on('message', async (event) => {
      if (event.channel_type === 'im' && !event.bot_id) {
        try {
          await this.handleDirectMessage(event);
        } catch (error) {
          console.error('Error handling direct message:', error);
        }
      }
    });

    // Handle slash commands
    this.slackInteractions.action('start_tracking', async (payload) => {
      await this.handleStartTracking(payload);
    });

    this.slackInteractions.action('stop_tracking', async (payload) => {
      await this.handleStopTracking(payload);
    });

    this.slackInteractions.action('view_report', async (payload) => {
      await this.handleViewReport(payload);
    });

    this.slackInteractions.action('export_data', async (payload) => {
      await this.handleExportData(payload);
    });
  }

  async handleAppMention(event) {
    const text = event.text.toLowerCase();
    
    if (text.includes('start') || text.includes('begin')) {
      await this.startTracking(event.channel, event.user);
    } else if (text.includes('stop') || text.includes('end')) {
      await this.stopTracking(event.channel, event.user);
    } else if (text.includes('report') || text.includes('status')) {
      await this.showReport(event.channel, event.user);
    } else if (text.includes('help')) {
      await this.showHelp(event.channel);
    } else {
      await this.showDefaultResponse(event.channel);
    }
  }

  async handleDirectMessage(event) {
    const text = event.text.toLowerCase();
    
    if (text.includes('start')) {
      await this.startTracking(event.channel, event.user);
    } else if (text.includes('stop')) {
      await this.stopTracking(event.channel, event.user);
    } else if (text.includes('report')) {
      await this.showReport(event.channel, event.user);
    } else if (text.includes('help')) {
      await this.showHelp(event.channel);
    } else {
      await this.showWelcomeMessage(event.channel);
    }
  }

  async startTracking(channel, user) {
    try {
      await this.tracker.start();
      
      const message = {
        channel: channel,
        text: '🕐 Time tracking started!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Time tracking is now active!* 🚀\n\nI'll automatically track your Slack status and presence. Update your status with project information like:\n• \`[Project Name]\`\n• \`Client - Task\`\n• \`Working on Website\``
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Dashboard',
                  emoji: true
                },
                url: `${config.baseUrl || 'http://localhost:3000'}`,
                style: 'primary'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Stop Tracking',
                  emoji: true
                },
                action_id: 'stop_tracking',
                style: 'danger'
              }
            ]
          }
        ]
      };
      
      await this.web.chat.postMessage(message);
    } catch (error) {
      await this.web.chat.postMessage({
        channel: channel,
        text: '❌ Failed to start time tracking. Please try again.'
      });
    }
  }

  async stopTracking(channel, user) {
    try {
      this.tracker.stop();
      
      const message = {
        channel: channel,
        text: '⏹️ Time tracking stopped!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Time tracking stopped!* ⏹️\n\nYour session has been saved. You can view your data anytime.'
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Report',
                  emoji: true
                },
                action_id: 'view_report'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Start Again',
                  emoji: true
                },
                action_id: 'start_tracking',
                style: 'primary'
              }
            ]
          }
        ]
      };
      
      await this.web.chat.postMessage(message);
    } catch (error) {
      await this.web.chat.postMessage({
        channel: channel,
        text: '❌ Failed to stop time tracking. Please try again.'
      });
    }
  }

  async showReport(channel, user) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dayLogs = this.tracker.logs.filter(log => 
        log.timestamp.startsWith(today)
      );

      if (dayLogs.length === 0) {
        await this.web.chat.postMessage({
          channel: channel,
          text: '📊 No data found for today. Start tracking to see your report!'
        });
        return;
      }

      // Calculate report data
      const projectTime = {};
      const statusSummary = { active: 0, away: 0, offline: 0 };

      dayLogs.forEach(log => {
        const duration = log.duration_from_last || 0;
        
        if (!projectTime[log.project]) {
          projectTime[log.project] = 0;
        }
        projectTime[log.project] += duration;

        if (log.presence === 'active') statusSummary.active += duration;
        else if (log.presence === 'away') statusSummary.away += duration;
        else statusSummary.offline += duration;
      });

      const totalMinutes = Object.values(projectTime).reduce((sum, mins) => sum + mins, 0);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalMins = totalMinutes % 60;

      // Create report blocks
      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📊 Daily Report - ${today}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Time:*\n${totalHours}h ${totalMins}m`
            },
            {
              type: 'mrkdwn',
              text: `*Active Time:*\n${Math.floor(statusSummary.active / 60)}h ${statusSummary.active % 60}m`
            }
          ]
        }
      ];

      // Add project breakdown
      const projectEntries = Object.entries(projectTime)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Top 5 projects

      if (projectEntries.length > 0) {
        const projectText = projectEntries.map(([project, minutes]) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `• ${project}: ${hours}h ${mins}m`;
        }).join('\n');

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Top Projects:*\n${projectText}`
          }
        });
      }

      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Full Dashboard',
              emoji: true
            },
            url: `${config.baseUrl || 'http://localhost:3000'}`,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Export Data',
              emoji: true
            },
            action_id: 'export_data'
          }
        ]
      });

      await this.web.chat.postMessage({
        channel: channel,
        blocks: blocks
      });
    } catch (error) {
      await this.web.chat.postMessage({
        channel: channel,
        text: '❌ Failed to generate report. Please try again.'
      });
    }
  }

  async showHelp(channel) {
    const message = {
      channel: channel,
      text: '🤖 Slack Time Tracker Bot Help',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🤖 How to use Slack Time Tracker',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Commands:*\n• `@bot start` - Start time tracking\n• `@bot stop` - Stop time tracking\n• `@bot report` - View daily report\n• `@bot help` - Show this help\n\n*Status Format Examples:*\n• `[Project Alpha]` → Project: "Project Alpha"\n• `ACME - Client Meeting` → Project: "ACME"\n• `Working on Website` → Project: "Website"\n• `Meeting: Sprint Planning` → Project: "Sprint Planning"'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Features:*\n• 🕐 Automatic time tracking\n• 📊 Project recognition\n• 📈 Real-time reports\n• 💾 Data export\n• 🌐 Web dashboard'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Start Tracking',
                emoji: true
              },
              action_id: 'start_tracking',
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Dashboard',
                emoji: true
              },
              url: `${config.baseUrl || 'http://localhost:3000'}`
            }
          ]
        }
      ]
    };

    await this.web.chat.postMessage(message);
  }

  async showWelcomeMessage(channel) {
    const message = {
      channel: channel,
      text: '👋 Welcome to Slack Time Tracker!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '👋 Welcome to Slack Time Tracker!',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'I\'m here to help you track your time automatically! Just update your Slack status and I\'ll monitor your productivity.'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Quick Start:*\n1. Type `start` to begin tracking\n2. Update your status with project info\n3. Type `report` to see your progress\n4. Type `help` for more commands'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Start Tracking',
                emoji: true
              },
              action_id: 'start_tracking',
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Learn More',
                emoji: true
              },
              action_id: 'help'
            }
          ]
        }
      ]
    };

    await this.web.chat.postMessage(message);
  }

  async showDefaultResponse(channel) {
    await this.web.chat.postMessage({
      channel: channel,
      text: '👋 Hi! I\'m your time tracking assistant. Type `help` to see what I can do, or `start` to begin tracking your time!'
    });
  }

  async handleStartTracking(payload) {
    await this.startTracking(payload.channel.id, payload.user.id);
  }

  async handleStopTracking(payload) {
    await this.stopTracking(payload.channel.id, payload.user.id);
  }

  async handleViewReport(payload) {
    await this.showReport(payload.channel.id, payload.user.id);
  }

  async handleExportData(payload) {
    try {
      const csvContent = await this.tracker.exportToCSV();
      
      await this.web.chat.postMessage({
        channel: payload.channel.id,
        text: '📊 Your time data has been exported! Check your dashboard for the download link.'
      });
    } catch (error) {
      await this.web.chat.postMessage({
        channel: payload.channel.id,
        text: '❌ Failed to export data. Please try again.'
      });
    }
  }

  async start() {
    try {
      // Initialize the tracker
      await this.tracker.initialize();
      
      // Start the server
      this.app.listen(this.port, () => {
        console.log(`🤖 Slack Bot running on port ${this.port}`);
        console.log(`📊 Dashboard available at: ${config.baseUrl || 'http://localhost:3000'}`);
        console.log(`🔗 Bot endpoints:`);
        console.log(`   - Events: http://localhost:${this.port}/slack/events`);
        console.log(`   - Interactions: http://localhost:${this.port}/slack/interactions`);
      });
    } catch (error) {
      console.error('❌ Failed to start Slack bot:', error);
      process.exit(1);
    }
  }
}

module.exports = SlackTimeTrackerBot;

// Start the bot if this file is run directly
if (require.main === module) {
  const bot = new SlackTimeTrackerBot();
  bot.start().catch(console.error);
} 