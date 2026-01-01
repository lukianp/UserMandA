#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple CLI interface
const args = process.argv.slice(2);
const command = args[0];

function showUsage() {
  console.log(`
Debug Log Analyzer

Usage:
  node analyze-debug-logs.js <category> [options]

Analyzes debug logs for patterns, errors, and performance issues.

Arguments:
  category    Log category to analyze (ui, functionality, errors, performance, etc.)

Options:
  --since <date>      Analyze logs since date (ISO format)
  --until <date>      Analyze logs until date (ISO format)
  --json              Output in JSON format instead of formatted text
  --export <file>     Export analysis to file

Examples:
  node analyze-debug-logs.js errors
  node analyze-debug-logs.js performance --since 2025-01-01
  node analyze-debug-logs.js ui --json
`);
}

if (!args[0]) {
  showUsage();
  process.exit(1);
}

const category = args[0];
const logDir = path.join(process.env.DISCOVERY_DATA || 'C:\\discoverydata', 'logs');
const categoryPath = path.join(logDir, category);

if (!fs.existsSync(categoryPath)) {
  console.error(`Log category '${category}' not found.`);
  process.exit(1);
}

// Parse options
const sinceIndex = args.indexOf('--since');
const untilIndex = args.indexOf('--until');
const jsonIndex = args.indexOf('--json');
const exportIndex = args.indexOf('--export');

const since = sinceIndex !== -1 ? new Date(args[sinceIndex + 1]) : null;
const until = untilIndex !== -1 ? new Date(args[untilIndex + 1]) : null;
const json = jsonIndex !== -1;
const exportFile = exportIndex !== -1 ? args[exportIndex + 1] : null;

// Read all log entries
function readLogEntries() {
  const logFiles = fs.readdirSync(categoryPath)
    .filter(file => file.endsWith('.log'))
    .sort((a, b) => {
      const statA = fs.statSync(path.join(categoryPath, a));
      const statB = fs.statSync(path.join(categoryPath, b));
      return statB.mtime - statA.mtime;
    });

  let allEntries = [];

  for (const logFile of logFiles) {
    const filePath = path.join(categoryPath, logFile);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const entry = JSON.parse(line);

          // Apply date filters
          if (since && new Date(entry.timestamp) < since) continue;
          if (until && new Date(entry.timestamp) > until) continue;

          allEntries.push(entry);
        } catch (parseError) {
          // Skip malformed lines
          continue;
        }
      }
    } catch (error) {
      console.error(`Error reading log file ${filePath}:`, error.message);
    }
  }

  return allEntries;
}

// Analyze error patterns
function analyzeErrors(entries) {
  const errorEntries = entries.filter(entry =>
    entry.level === 'ERROR' || entry.level === 'FATAL'
  );

  const errorMap = new Map();

  errorEntries.forEach(entry => {
    const errorKey = entry.error ?
      `${entry.error.name || 'Unknown'}: ${entry.error.message}` :
      entry.message;

    if (errorMap.has(errorKey)) {
      errorMap.get(errorKey).count++;
      errorMap.get(errorKey).lastOccurrence = entry.timestamp;
    } else {
      errorMap.set(errorKey, {
        count: 1,
        firstOccurrence: entry.timestamp,
        lastOccurrence: entry.timestamp,
        module: entry.module,
        component: entry.component
      });
    }
  });

  const recurringErrors = Array.from(errorMap.entries())
    .map(([error, data]) => ({
      error,
      count: data.count,
      firstOccurrence: data.firstOccurrence,
      lastOccurrence: data.lastOccurrence,
      module: data.module,
      component: data.component
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalErrors: errorEntries.length,
    uniqueErrors: errorMap.size,
    recurringErrors: recurringErrors.filter(e => e.count > 1)
  };
}

// Analyze performance patterns
function analyzePerformance(entries) {
  const perfEntries = entries.filter(entry =>
    entry.category === 'performance' || entry.data?.renderTime || entry.data?.apiResponseTime
  );

  const slowOperations = [];
  const operationTimes = new Map();

  perfEntries.forEach(entry => {
    const operation = entry.data?.operation || entry.component || 'unknown';
    const renderTime = entry.data?.renderTime || 0;
    const apiTime = entry.data?.apiResponseTime || 0;
    const time = Math.max(renderTime, apiTime);

    if (time > 50) { // Threshold for "slow"
      slowOperations.push({
        operation,
        time,
        timestamp: entry.timestamp,
        component: entry.component,
        module: entry.module
      });
    }

    // Collect operation statistics
    if (!operationTimes.has(operation)) {
      operationTimes.set(operation, { times: [], count: 0 });
    }
    operationTimes.get(operation).times.push(time);
    operationTimes.get(operation).count++;
  });

  const operationStats = Array.from(operationTimes.entries())
    .map(([operation, data]) => ({
      operation,
      averageTime: data.times.reduce((a, b) => a + b, 0) / data.times.length,
      maxTime: Math.max(...data.times),
      minTime: Math.min(...data.times),
      count: data.count
    }))
    .sort((a, b) => b.averageTime - a.averageTime);

  return {
    totalPerformanceEntries: perfEntries.length,
    slowOperations: slowOperations.sort((a, b) => b.time - a.time),
    operationStats
  };
}

// Analyze UI interaction patterns
function analyzeUIInteractions(entries) {
  const uiEntries = entries.filter(entry =>
    entry.category === 'ui' || entry.data?.type === 'keystroke' || entry.data?.type === 'mouse'
  );

  const keystrokes = uiEntries.filter(entry => entry.data?.type === 'keystroke');
  const mouseEvents = uiEntries.filter(entry => entry.data?.type === 'mouse');

  // Most active components
  const componentActivity = new Map();
  uiEntries.forEach(entry => {
    const component = entry.component || 'unknown';
    componentActivity.set(component, (componentActivity.get(component) || 0) + 1);
  });

  const topComponents = Array.from(componentActivity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    totalUIEvents: uiEntries.length,
    keystrokeCount: keystrokes.length,
    mouseEventCount: mouseEvents.length,
    topComponents
  };
}

// Generate recommendations
function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.errors.recurringErrors.length > 0) {
    recommendations.push({
      type: 'error',
      priority: 'high',
      message: `${analysis.errors.recurringErrors.length} recurring errors detected. Focus on the most frequent errors first.`,
      details: analysis.errors.recurringErrors.slice(0, 3).map(e =>
        `${e.error} (${e.count} occurrences)`
      )
    });
  }

  if (analysis.performance.slowOperations.length > 0) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: `${analysis.performance.slowOperations.length} slow operations detected.`,
      details: analysis.performance.slowOperations.slice(0, 3).map(op =>
        `${op.operation}: ${op.time}ms`
      )
    });
  }

  if (analysis.errors.totalErrors > analysis.entries.length * 0.1) {
    recommendations.push({
      type: 'error_rate',
      priority: 'high',
      message: `High error rate detected (${(analysis.errors.totalErrors / analysis.entries.length * 100).toFixed(1)}%). Consider reviewing error handling.`,
      details: []
    });
  }

  return recommendations;
}

// Main analysis
const entries = readLogEntries();

const analysis = {
  summary: {
    category,
    totalEntries: entries.length,
    dateRange: {
      from: entries.length > 0 ? new Date(Math.min(...entries.map(e => new Date(e.timestamp).getTime()))).toISOString() : null,
      to: entries.length > 0 ? new Date(Math.max(...entries.map(e => new Date(e.timestamp).getTime()))).toISOString() : null
    },
    timeSpan: since && until ? `${since.toISOString()} to ${until.toISOString()}` : 'all time'
  },
  errors: analyzeErrors(entries),
  performance: analyzePerformance(entries),
  ui: analyzeUIInteractions(entries),
  entries: entries // Include raw entries for detailed analysis
};

analysis.recommendations = generateRecommendations(analysis);

// Output results
const output = json ? JSON.stringify(analysis, null, 2) : formatTextAnalysis(analysis);

if (exportFile) {
  fs.writeFileSync(exportFile, output);
  console.log(`Analysis exported to ${exportFile}`);
} else {
  console.log(output);
}

function formatTextAnalysis(analysis) {
  let output = '';

  output += `=== DEBUG LOG ANALYSIS: ${analysis.summary.category.toUpperCase()} ===\n\n`;

  // Summary
  output += `SUMMARY:\n`;
  output += `- Total Entries: ${analysis.summary.totalEntries}\n`;
  if (analysis.summary.dateRange.from && analysis.summary.dateRange.to) {
    output += `- Date Range: ${new Date(analysis.summary.dateRange.from).toLocaleString()} to ${new Date(analysis.summary.dateRange.to).toLocaleString()}\n`;
  }
  output += `\n`;

  // Errors
  output += `ERRORS:\n`;
  output += `- Total Errors: ${analysis.errors.totalErrors}\n`;
  output += `- Unique Errors: ${analysis.errors.uniqueErrors}\n`;
  if (analysis.errors.recurringErrors.length > 0) {
    output += `- Recurring Errors:\n`;
    analysis.errors.recurringErrors.slice(0, 5).forEach(error => {
      output += `  • ${error.error} (${error.count} times)\n`;
      output += `    First: ${new Date(error.firstOccurrence).toLocaleString()}\n`;
      output += `    Last: ${new Date(error.lastOccurrence).toLocaleString()}\n`;
      output += `    Module: ${error.module}\n\n`;
    });
  }
  output += `\n`;

  // Performance
  output += `PERFORMANCE:\n`;
  output += `- Performance Entries: ${analysis.performance.totalPerformanceEntries}\n`;
  output += `- Slow Operations (>50ms): ${analysis.performance.slowOperations.length}\n`;
  if (analysis.performance.slowOperations.length > 0) {
    output += `- Top Slow Operations:\n`;
    analysis.performance.slowOperations.slice(0, 5).forEach(op => {
      output += `  • ${op.operation}: ${op.time}ms (${new Date(op.timestamp).toLocaleString()})\n`;
    });
  }
  if (analysis.performance.operationStats.length > 0) {
    output += `\n- Operation Statistics:\n`;
    analysis.performance.operationStats.slice(0, 5).forEach(stat => {
      output += `  • ${stat.operation}: avg ${stat.averageTime.toFixed(2)}ms, max ${stat.maxTime}ms (${stat.count} calls)\n`;
    });
  }
  output += `\n`;

  // UI Interactions
  output += `UI INTERACTIONS:\n`;
  output += `- Total UI Events: ${analysis.ui.totalUIEvents}\n`;
  output += `- Keystrokes: ${analysis.ui.keystrokeCount}\n`;
  output += `- Mouse Events: ${analysis.ui.mouseEventCount}\n`;
  if (analysis.ui.topComponents.length > 0) {
    output += `- Most Active Components:\n`;
    analysis.ui.topComponents.forEach(([component, count]) => {
      output += `  • ${component}: ${count} interactions\n`;
    });
  }
  output += `\n`;

  // Recommendations
  output += `RECOMMENDATIONS:\n`;
  if (analysis.recommendations.length === 0) {
    output += `No specific recommendations. System appears healthy.\n`;
  } else {
    analysis.recommendations.forEach(rec => {
      output += `[${rec.priority.toUpperCase()}] ${rec.message}\n`;
      if (rec.details.length > 0) {
        rec.details.forEach(detail => output += `  - ${detail}\n`);
      }
      output += `\n`;
    });
  }

  return output;
}