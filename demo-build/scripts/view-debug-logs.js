#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple CLI interface
const args = process.argv.slice(2);
const command = args[0];

function showUsage() {
  console.log(`
Debug Log Viewer

Usage:
  node view-debug-logs.js <command> [options]

Commands:
  list                    List all available log files
  view <category>         View logs for a specific category
    Options:
      --limit <number>    Limit number of entries (default: 50)
      --filter <pattern>  Filter by message pattern
      --since <date>      Show entries since date (ISO format)
      --until <date>      Show entries until date (ISO format)
      --json              Output in JSON format
  tail <category>         Monitor logs in real-time (like tail -f)
    Options:
      --filter <pattern>  Filter by message pattern

Examples:
  node view-debug-logs.js list
  node view-debug-logs.js view ui --limit 100
  node view-debug-logs.js view errors --filter "timeout"
  node view-debug-logs.js tail performance
`);
}

if (!command) {
  showUsage();
  process.exit(1);
}

const logDir = path.join(process.env.DISCOVERY_DATA || 'C:\\discoverydata', 'logs');

function listLogs() {
  if (!fs.existsSync(logDir)) {
    console.log('No log directory found. Debug logging may not be enabled.');
    return;
  }

  const categories = fs.readdirSync(logDir).filter(item => {
    const itemPath = path.join(logDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  console.log('Available log categories:');
  categories.forEach(category => {
    const categoryPath = path.join(logDir, category);
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.log') || file.endsWith('.log.gz'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(categoryPath, a));
        const statB = fs.statSync(path.join(categoryPath, b));
        return statB.mtime - statA.mtime;
      });

    console.log(`\n${category.toUpperCase()}:`);
    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      console.log(`  ${file} (${size} KB) - ${stats.mtime.toISOString()}`);
    });
  });
}

function viewLogs(category) {
  const categoryPath = path.join(logDir, category);

  if (!fs.existsSync(categoryPath)) {
    console.error(`Log category '${category}' not found.`);
    return;
  }

  // Parse options
  const limitIndex = args.indexOf('--limit');
  const filterIndex = args.indexOf('--filter');
  const sinceIndex = args.indexOf('--since');
  const untilIndex = args.indexOf('--until');
  const jsonIndex = args.indexOf('--json');

  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 50;
  const filter = filterIndex !== -1 ? args[filterIndex + 1] : null;
  const since = sinceIndex !== -1 ? args[sinceIndex + 1] : null;
  const until = untilIndex !== -1 ? args[untilIndex + 1] : null;
  const json = jsonIndex !== -1;

  const logFiles = fs.readdirSync(categoryPath)
    .filter(file => file.endsWith('.log'))
    .sort((a, b) => {
      const statA = fs.statSync(path.join(categoryPath, a));
      const statB = fs.statSync(path.join(categoryPath, b));
      return statB.mtime - statA.mtime;
    });

  if (logFiles.length === 0) {
    console.log(`No log files found for category '${category}'.`);
    return;
  }

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

          // Apply filters
          if (filter && !entry.message.toLowerCase().includes(filter.toLowerCase())) {
            continue;
          }

          if (since && new Date(entry.timestamp) < new Date(since)) {
            continue;
          }

          if (until && new Date(entry.timestamp) > new Date(until)) {
            continue;
          }

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

  // Sort by timestamp (most recent first)
  allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply limit
  const limitedEntries = allEntries.slice(0, limit);

  if (json) {
    console.log(JSON.stringify(limitedEntries, null, 2));
  } else {
    console.log(`\n=== ${category.toUpperCase()} LOGS ===\n`);
    console.log(`Showing ${limitedEntries.length} of ${allEntries.length} entries\n`);

    limitedEntries.forEach((entry, index) => {
      const timestamp = new Date(entry.timestamp).toLocaleString();
      const level = entry.level.padEnd(8);
      const module = entry.module.padEnd(20);
      const message = entry.message;

      console.log(`${index + 1}. [${timestamp}] ${level} ${module} ${message}`);

      if (entry.error) {
        console.log(`   Error: ${entry.error.message}`);
        if (entry.error.context) {
          console.log(`   Context: ${JSON.stringify(entry.error.context, null, 2)}`);
        }
      }

      if (entry.data) {
        console.log(`   Data: ${JSON.stringify(entry.data, null, 2)}`);
      }

      console.log('');
    });
  }
}

function tailLogs(category) {
  const categoryPath = path.join(logDir, category);

  if (!fs.existsSync(categoryPath)) {
    console.error(`Log category '${category}' not found.`);
    return;
  }

  // Parse options
  const filterIndex = args.indexOf('--filter');
  const filter = filterIndex !== -1 ? args[filterIndex + 1] : null;

  console.log(`Monitoring ${category} logs... Press Ctrl+C to stop.\n`);

  const logFiles = fs.readdirSync(categoryPath)
    .filter(file => file.endsWith('.log'))
    .sort((a, b) => {
      const statA = fs.statSync(path.join(categoryPath, a));
      const statB = fs.statSync(path.join(categoryPath, b));
      return statB.mtime - statA.mtime;
    });

  if (logFiles.length === 0) {
    console.log(`No log files found for category '${category}'.`);
    return;
  }

  const latestFile = path.join(categoryPath, logFiles[0]);
  let lastPosition = fs.statSync(latestFile).size;

  const printNewEntries = () => {
    try {
      const stats = fs.statSync(latestFile);
      if (stats.size > lastPosition) {
        const stream = fs.createReadStream(latestFile, {
          start: lastPosition,
          encoding: 'utf8'
        });

        let buffer = '';
        stream.on('data', (chunk) => {
          buffer += chunk;
        });

        stream.on('end', () => {
          const lines = buffer.trim().split('\n');
          lines.forEach(line => {
            if (!line.trim()) return;

            try {
              const entry = JSON.parse(line);

              if (filter && !entry.message.toLowerCase().includes(filter.toLowerCase())) {
                return;
              }

              const timestamp = new Date(entry.timestamp).toLocaleString();
              const level = entry.level.padEnd(8);
              const module = entry.module.padEnd(20);
              const message = entry.message;

              console.log(`[${timestamp}] ${level} ${module} ${message}`);

              if (entry.error) {
                console.log(`  Error: ${entry.error.message}`);
              }
            } catch (parseError) {
              // Skip malformed lines
            }
          });

          lastPosition = stats.size;
        });
      }
    } catch (error) {
      console.error('Error reading log file:', error.message);
    }
  };

  // Initial read
  printNewEntries();

  // Watch for changes
  const watcher = fs.watch(latestFile, (eventType) => {
    if (eventType === 'change') {
      setTimeout(printNewEntries, 100); // Small delay to ensure file is written
    }
  });

  process.on('SIGINT', () => {
    watcher.close();
    console.log('\nStopped monitoring logs.');
    process.exit(0);
  });
}

// Execute command
switch (command) {
  case 'list':
    listLogs();
    break;
  case 'view':
    if (!args[1]) {
      console.error('Please specify a category to view');
      showUsage();
      process.exit(1);
    }
    viewLogs(args[1]);
    break;
  case 'tail':
    if (!args[1]) {
      console.error('Please specify a category to tail');
      showUsage();
      process.exit(1);
    }
    tailLogs(args[1]);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    showUsage();
    process.exit(1);
}