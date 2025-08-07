// analytics.js - Advanced Analytics and Insights
const fs = require('fs').promises;

class TimeTrackerAnalytics {
  constructor(logs = []) {
    this.logs = logs;
  }

  // Load logs from file
  async loadLogs(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      this.logs = JSON.parse(data);
      return true;
    } catch (error) {
      console.error('Error loading logs:', error);
      return false;
    }
  }

  // Get productivity insights
  getProductivityInsights(dateRange = 'week') {
    const filteredLogs = this.filterLogsByDateRange(dateRange);
    
    if (filteredLogs.length === 0) {
      return {
        message: 'No data available for analysis',
        insights: []
      };
    }

    const insights = [];

    // Calculate total time
    const totalMinutes = filteredLogs.reduce((sum, log) => 
      sum + (log.duration_from_last || 0), 0
    );
    const totalHours = Math.floor(totalMinutes / 60);

    // Active vs Away ratio
    const activeMinutes = filteredLogs.filter(log => 
      log.presence === 'active'
    ).reduce((sum, log) => sum + (log.duration_from_last || 0), 0);
    
    const awayMinutes = filteredLogs.filter(log => 
      log.presence === 'away'
    ).reduce((sum, log) => sum + (log.duration_from_last || 0), 0);

    const productivityRatio = totalMinutes > 0 ? (activeMinutes / totalMinutes) * 100 : 0;

    // Project distribution
    const projectTime = {};
    filteredLogs.forEach(log => {
      const project = log.project || 'General Work';
      projectTime[project] = (projectTime[project] || 0) + (log.duration_from_last || 0);
    });

    const topProjects = Object.entries(projectTime)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Time patterns
    const hourlyPatterns = this.getHourlyPatterns(filteredLogs);
    const peakHours = this.getPeakProductivityHours(hourlyPatterns);

    // Generate insights
    if (productivityRatio < 70) {
      insights.push({
        type: 'warning',
        title: 'Low Productivity Ratio',
        message: `Your active time is ${productivityRatio.toFixed(1)}% of total time. Consider reducing distractions.`,
        metric: `${productivityRatio.toFixed(1)}%`,
        recommendation: 'Try using focus mode or setting specific work blocks.'
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Great Productivity!',
        message: `You're maintaining a ${productivityRatio.toFixed(1)}% active time ratio.`,
        metric: `${productivityRatio.toFixed(1)}%`,
        recommendation: 'Keep up the excellent work!'
      });
    }

    if (totalHours < 30 && dateRange === 'week') {
      insights.push({
        type: 'info',
        title: 'Low Work Hours',
        message: `You've tracked ${totalHours} hours this week.`,
        metric: `${totalHours}h`,
        recommendation: 'Consider if this reflects your actual work schedule.'
      });
    }

    if (topProjects.length > 0) {
      const topProject = topProjects[0];
      const topProjectHours = Math.floor(topProject[1] / 60);
      insights.push({
        type: 'info',
        title: 'Top Project',
        message: `You spent most time on "${topProject[0]}"`,
        metric: `${topProjectHours}h`,
        recommendation: 'This project is your main focus area.'
      });
    }

    if (peakHours.length > 0) {
      insights.push({
        type: 'success',
        title: 'Peak Productivity Hours',
        message: `Your most productive hours are ${peakHours.join(', ')}`,
        metric: peakHours.join(', '),
        recommendation: 'Schedule important tasks during these hours.'
      });
    }

    return {
      totalTime: totalMinutes,
      totalHours: totalHours,
      activeMinutes: activeMinutes,
      awayMinutes: awayMinutes,
      productivityRatio: productivityRatio,
      topProjects: topProjects,
      peakHours: peakHours,
      insights: insights
    };
  }

  // Get hourly patterns
  getHourlyPatterns(logs) {
    const hourlyData = new Array(24).fill(0);
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyData[hour] += log.duration_from_last || 0;
    });

    return hourlyData;
  }

  // Get peak productivity hours
  getPeakProductivityHours(hourlyPatterns) {
    const maxTime = Math.max(...hourlyPatterns);
    const threshold = maxTime * 0.7; // 70% of max time
    
    return hourlyPatterns
      .map((time, hour) => ({ time, hour }))
      .filter(({ time }) => time >= threshold)
      .sort((a, b) => b.time - a.time)
      .map(({ hour }) => `${hour}:00`);
  }

  // Filter logs by date range
  filterLogsByDateRange(range) {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return this.logs;
    }

    return this.logs.filter(log => 
      new Date(log.timestamp) >= startDate
    );
  }

  // Get project efficiency
  getProjectEfficiency(projectName, dateRange = 'week') {
    const filteredLogs = this.filterLogsByDateRange(dateRange);
    const projectLogs = filteredLogs.filter(log => 
      log.project === projectName
    );

    if (projectLogs.length === 0) {
      return null;
    }

    const totalMinutes = projectLogs.reduce((sum, log) => 
      sum + (log.duration_from_last || 0), 0
    );

    const activeMinutes = projectLogs.filter(log => 
      log.presence === 'active'
    ).reduce((sum, log) => sum + (log.duration_from_last || 0), 0);

    const efficiency = totalMinutes > 0 ? (activeMinutes / totalMinutes) * 100 : 0;

    return {
      project: projectName,
      totalMinutes: totalMinutes,
      activeMinutes: activeMinutes,
      efficiency: efficiency,
      sessions: projectLogs.length
    };
  }

  // Get time trends
  getTimeTrends(days = 30) {
    const trends = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayLogs = this.logs.filter(log => 
        log.timestamp.startsWith(dateStr)
      );

      const totalMinutes = dayLogs.reduce((sum, log) => 
        sum + (log.duration_from_last || 0), 0
      );

      const activeMinutes = dayLogs.filter(log => 
        log.presence === 'active'
      ).reduce((sum, log) => sum + (log.duration_from_last || 0), 0);

      trends.push({
        date: dateStr,
        totalMinutes: totalMinutes,
        activeMinutes: activeMinutes,
        productivity: totalMinutes > 0 ? (activeMinutes / totalMinutes) * 100 : 0
      });
    }

    return trends;
  }

  // Get work patterns
  getWorkPatterns() {
    const patterns = {
      averageDailyHours: 0,
      mostProductiveDay: '',
      leastProductiveDay: '',
      averageSessionLength: 0,
      longestSession: 0,
      totalSessions: 0
    };

    if (this.logs.length === 0) return patterns;

    // Calculate daily averages
    const dailyStats = {};
    this.logs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, active: 0, sessions: 0 };
      }
      dailyStats[date].total += log.duration_from_last || 0;
      if (log.presence === 'active') {
        dailyStats[date].active += log.duration_from_last || 0;
      }
      dailyStats[date].sessions++;
    });

    const dailyEntries = Object.entries(dailyStats);
    const totalDays = dailyEntries.length;

    if (totalDays > 0) {
      const totalMinutes = dailyEntries.reduce((sum, [, stats]) => sum + stats.total, 0);
      patterns.averageDailyHours = Math.round((totalMinutes / totalDays) / 60 * 10) / 10;

      // Find most/least productive days
      const sortedDays = dailyEntries.sort(([,a], [,b]) => b.active - a.active);
      patterns.mostProductiveDay = sortedDays[0][0];
      patterns.leastProductiveDay = sortedDays[sortedDays.length - 1][0];

      // Session statistics
      const allSessions = dailyEntries.reduce((sum, [, stats]) => sum + stats.sessions, 0);
      patterns.totalSessions = allSessions;
      patterns.averageSessionLength = totalMinutes > 0 ? Math.round(totalMinutes / allSessions) : 0;

      // Find longest session
      const sessionLengths = this.logs.map(log => log.duration_from_last || 0);
      patterns.longestSession = Math.max(...sessionLengths);
    }

    return patterns;
  }

  // Generate recommendations
  getRecommendations() {
    const insights = this.getProductivityInsights();
    const patterns = this.getWorkPatterns();
    const recommendations = [];

    // Productivity recommendations
    if (insights.productivityRatio < 60) {
      recommendations.push({
        type: 'productivity',
        title: 'Improve Focus Time',
        description: 'Your active time is below 60%. Try using the Pomodoro technique or setting specific work blocks.',
        priority: 'high'
      });
    }

    if (patterns.averageDailyHours < 6) {
      recommendations.push({
        type: 'workload',
        title: 'Increase Work Hours',
        description: `You're averaging ${patterns.averageDailyHours} hours per day. Consider if this reflects your intended workload.`,
        priority: 'medium'
      });
    }

    if (patterns.averageSessionLength < 30) {
      recommendations.push({
        type: 'focus',
        title: 'Extend Work Sessions',
        description: 'Your average session is short. Try working in longer, focused blocks.',
        priority: 'medium'
      });
    }

    // Time management recommendations
    const trends = this.getTimeTrends(7);
    const recentProductivity = trends.slice(-3).reduce((sum, day) => sum + day.productivity, 0) / 3;
    
    if (recentProductivity < 70) {
      recommendations.push({
        type: 'trend',
        title: 'Recent Productivity Decline',
        description: 'Your productivity has been lower recently. Consider what might be causing distractions.',
        priority: 'high'
      });
    }

    return recommendations;
  }

  // Export analytics report
  async exportAnalyticsReport(filename = `analytics_report_${Date.now()}.json`) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalLogs: this.logs.length,
        dateRange: {
          start: this.logs.length > 0 ? this.logs[0].timestamp : null,
          end: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null
        }
      },
      insights: this.getProductivityInsights(),
      patterns: this.getWorkPatterns(),
      trends: this.getTimeTrends(),
      recommendations: this.getRecommendations(),
      projectBreakdown: this.getProjectBreakdown()
    };

    await fs.writeFile(filename, JSON.stringify(report, null, 2));
    return filename;
  }

  // Get project breakdown
  getProjectBreakdown() {
    const projectStats = {};
    
    this.logs.forEach(log => {
      const project = log.project || 'General Work';
      if (!projectStats[project]) {
        projectStats[project] = {
          totalMinutes: 0,
          activeMinutes: 0,
          sessions: 0,
          lastActivity: null
        };
      }
      
      projectStats[project].totalMinutes += log.duration_from_last || 0;
      if (log.presence === 'active') {
        projectStats[project].activeMinutes += log.duration_from_last || 0;
      }
      projectStats[project].sessions++;
      projectStats[project].lastActivity = log.timestamp;
    });

    // Calculate efficiency for each project
    Object.keys(projectStats).forEach(project => {
      const stats = projectStats[project];
      stats.efficiency = stats.totalMinutes > 0 ? 
        (stats.activeMinutes / stats.totalMinutes) * 100 : 0;
      stats.totalHours = Math.floor(stats.totalMinutes / 60);
      stats.activeHours = Math.floor(stats.activeMinutes / 60);
    });

    return projectStats;
  }
}

module.exports = TimeTrackerAnalytics; 