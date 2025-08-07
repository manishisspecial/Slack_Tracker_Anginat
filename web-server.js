// web-server.js - Simple web server for the dashboard
require('dotenv').config(); // Load environment variables from .env file
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const MultiUserSlackTimeTracker = require('./multi-user-tracker');
const config = require('./config');

class TimeTrackerWebServer {
  constructor(port = 3000) {
    this.port = port;
    this.tracker = new MultiUserSlackTimeTracker(config);
  }

  async start() {
    await this.tracker.initialize();
    
    const server = http.createServer(async (req, res) => {
      await this.handleRequest(req, res);
    });

    server.listen(this.port, () => {
      console.log(`🌐 Dashboard available at: http://localhost:${this.port}`);
      console.log(`📊 Time tracker web interface is running`);
    });

    // Enable CORS for all requests
    this.setCorsHeaders = (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    };
  }

  async handleRequest(req, res) {
    this.setCorsHeaders(res);
    
    const url = new URL(req.url, `http://localhost:${this.port}`);
    const pathname = url.pathname;

    try {
      if (pathname === '/') {
        await this.serveAllUsersDashboard(res);
      } else if (pathname === '/individual') {
        await this.serveDashboard(res);
      } else if (pathname === '/test') {
        await this.serveTestPage(res);
      } else if (pathname === '/debug') {
        await this.serveDebugPage(res);
      } else if (pathname === '/simple') {
        await this.serveSimplePage(res);
      } else if (pathname === '/api/data') {
        await this.serveTimeData(res);
      } else if (pathname === '/api/status') {
        await this.serveCurrentStatus(res);
      } else if (pathname === '/api/report') {
        await this.serveReport(res, url.searchParams);
      } else if (pathname === '/api/start-tracking') {
        await this.startTracking(res);
      } else if (pathname === '/api/stop-tracking') {
        await this.stopTracking(res);
      } else if (pathname === '/api/users') {
        await this.serveUsers(res);
      } else if (pathname.startsWith('/api/user/')) {
        await this.serveUserData(res, pathname);
      } else if (pathname === '/debug-users') {
        await this.serveDebugUsers(res);
      } else if (pathname === '/test-dashboard') {
        await this.serveTestDashboard(res);
      } else if (pathname === '/test-simple') {
        await this.serveTestSimple(res);
      } else if (pathname === '/all-users') {
        await this.serveAllUsersDashboard(res);
      } else if (pathname === '/status') {
        await this.serveStatusPage(res);
      } else if (pathname === '/mobile') {
        await this.serveMobileDashboard(res);
      } else {
        this.serve404(res);
      }
    } catch (error) {
      console.error('Server error:', error);
      this.serveError(res, error);
    }
  }

  async serveDashboard(res) {
    try {
      // Serve the individual dashboard (tracker.html)
      const htmlPath = path.join(__dirname, 'tracker.html');
      
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveTestPage(res) {
    try {
      const htmlPath = path.join(__dirname, 'test-dashboard.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveDebugPage(res) {
    try {
      const htmlPath = path.join(__dirname, 'debug-dashboard.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveSimplePage(res) {
    try {
      const htmlPath = path.join(__dirname, 'dashboard-simple.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveTimeData(res) {
    try {
      // Get all data from all users
      const allData = [];
      for (const user of config.users) {
        const userLogs = this.tracker.logs.get(user.id) || [];
        allData.push(...userLogs);
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(allData));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveCurrentStatus(res) {
    try {
      const status = this.tracker.getStatus();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        current_status: null, // Multi-user doesn't have single current status
        is_tracking: status.is_running,
        total_entries: status.total_entries,
        users_tracked: status.users_tracked
      }));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveReport(res, params) {
    try {
      const date = params.get('date') || new Date().toISOString().split('T')[0];
      
      // Get all logs for the date from all users
      const allDayLogs = [];
      for (const user of config.users) {
        const userLogs = this.tracker.logs.get(user.id) || [];
        const dayLogs = userLogs.filter(log => log.timestamp.startsWith(date));
        allDayLogs.push(...dayLogs);
      }

      // Calculate report data
      const projectTime = {};
      const statusSummary = { active: 0, away: 0, offline: 0 };
      const userSummary = {};

      allDayLogs.forEach(log => {
        const duration = log.duration_from_last || 0;
        
        // Project breakdown
        if (!projectTime[log.project]) {
          projectTime[log.project] = 0;
        }
        projectTime[log.project] += duration;

        // Status summary
        if (log.presence === 'active') statusSummary.active += duration;
        else if (log.presence === 'away') statusSummary.away += duration;
        else statusSummary.offline += duration;

        // User summary
        if (!userSummary[log.user_name]) {
          userSummary[log.user_name] = { total: 0, active: 0, projects: {} };
        }
        userSummary[log.user_name].total += duration;
        if (log.presence === 'active') userSummary[log.user_name].active += duration;
        
        if (!userSummary[log.user_name].projects[log.project]) {
          userSummary[log.user_name].projects[log.project] = 0;
        }
        userSummary[log.user_name].projects[log.project] += duration;
      });

      const totalMinutes = Object.values(projectTime).reduce((sum, mins) => sum + mins, 0);

      const report = {
        date: date,
        total_minutes: totalMinutes,
        project_breakdown: projectTime,
        presence_summary: statusSummary,
        user_summary: userSummary,
        entries: allDayLogs.length,
        logs: allDayLogs
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(report));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async startTracking(res) {
    try {
      if (this.tracker.isRunning) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Tracking already running' }));
        return;
      }

      await this.tracker.start();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Time tracking started',
        is_running: this.tracker.isRunning 
      }));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async stopTracking(res) {
    try {
      if (!this.tracker.isRunning) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Tracking not running' }));
        return;
      }

      this.tracker.stop();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Time tracking stopped',
        is_running: this.tracker.isRunning 
      }));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveUsers(res) {
    try {
      const users = config.users.map(user => ({
        id: user.id,
        name: user.name,
        dataFile: user.dataFile
      }));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ users }));
    } catch (error) {
      console.error('Error serving users:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to get users' }));
    }
  }

  async serveUserData(res, pathname) {
    try {
      const userId = pathname.split('/')[3]; // /api/user/{userId}/data
      const user = config.users.find(u => u.id === userId);
      
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      const dataPath = path.join(__dirname, user.dataFile);
      let data = [];
      
      try {
        const fileContent = await fs.readFile(dataPath, 'utf8');
        data = JSON.parse(fileContent);
      } catch (error) {
        // File doesn't exist or is empty, start with empty array
        data = [];
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error serving user data:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to get user data' }));
    }
  }

  async serveDebugUsers(res) {
    try {
      const htmlPath = path.join(__dirname, 'debug-users.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveTestDashboard(res) {
    try {
      const htmlPath = path.join(__dirname, 'test-dashboard.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveTestSimple(res) {
    try {
      const htmlPath = path.join(__dirname, 'test-simple.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveAllUsersDashboard(res) {
    try {
      const htmlPath = path.join(__dirname, 'all-users-dashboard.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveStatusPage(res) {
    try {
      const htmlPath = path.join(__dirname, 'status.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  async serveMobileDashboard(res) {
    try {
      const htmlPath = path.join(__dirname, 'dashboard-mobile-enhanced.html');
      const html = await fs.readFile(htmlPath, 'utf8');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serveError(res, error);
    }
  }

  serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>404 - Not Found</h1>
      <p>Available endpoints:</p>
      <ul>
        <li><a href="/">Team Dashboard</a></li>
        <li><a href="/individual">Individual Dashboard</a></li>
        <li><a href="/status">Status Page</a></li>
        <li><a href="/api/data">Time data (JSON)</a></li>
        <li><a href="/api/status">Current status</a></li>
        <li><a href="/api/report">Daily report</a></li>
        <li>POST /api/start-tracking</li>
        <li>POST /api/stop-tracking</li>
      </ul>
    `);
  }

  serveError(res, error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }));
  }
}

// Enhanced runner with web server option
const TimeTrackerCLI = require('./runner');

class EnhancedTimeTrackerCLI extends TimeTrackerCLI {
  showHelp() {
    console.log(`
Usage: node web-server.js <command> [options]

Commands:
  start                    Start time tracking (console mode)
  web [port]              Start web dashboard (default port 3000)
  report [YYYY-MM-DD]     Generate daily report
  export [filename.csv]   Export all data to CSV
  test                    Test Slack connection

Web Dashboard Endpoints:
  GET  /                  Dashboard interface
  GET  /api/data         Get all time data (JSON)
  GET  /api/status       Get current status
  GET  /api/report?date= Get daily report
  POST /api/start-tracking  Start tracking via API
  POST /api/stop-tracking   Stop tracking via API

Examples:
  node web-server.js web       # Start web dashboard on port 3000
  node web-server.js web 8080  # Start on custom port
  node web-server.js start     # Console mode
  node web-server.js test      # Test connection
`);
  }

  async start() {
    console.log('🕐 Slack Time Tracker with Web Dashboard');
    console.log('==========================================');
    
    const initialized = await this.tracker.initialize();
    if (!initialized) {
      process.exit(1);
    }

    const command = process.argv[2];
    
    switch (command) {
      case 'web':
        const port = parseInt(process.argv[3]) || 3000;
        const webServer = new TimeTrackerWebServer(port);
        await webServer.start();
        console.log('Press Ctrl+C to stop the server');
        break;
        
      default:
        // Fall back to parent class behavior
        return super.start();
    }
  }
}

// Start the enhanced CLI if this file is run directly
if (require.main === module) {
  const cli = new EnhancedTimeTrackerCLI();
  cli.start().catch(console.error);
}

module.exports = TimeTrackerWebServer;