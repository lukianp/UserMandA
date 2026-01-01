/**
 * Real-time log monitor for guiv2 debugging
 * Watches for errors, warnings, and important events
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.cyan.bold('\n=== GuiV2 Log Monitor Started ===\n'));
console.log(chalk.gray('Monitoring for:'));
console.log(chalk.red('  ✗ Errors'));
console.log(chalk.yellow('  ⚠ Warnings'));
console.log(chalk.blue('  ℹ Info messages'));
console.log(chalk.green('  ✓ Success events\n'));

let lastLogTime = Date.now();

// Categories to highlight
const patterns = {
  error: /error|exception|failed|crash/i,
  warning: /warning|warn|deprecated/i,
  success: /success|complete|initialized|loaded/i,
  ipc: /\[IPC\]/i,
  powershell: /PowerShell|ps1|pwsh/i,
  discovery: /discovery|scan|discover/i,
  migration: /migration|migrate|execute/i,
  profile: /Profile|ljpops/i,
};

function formatLog(line, timestamp = true) {
  const prefix = timestamp ? chalk.gray(`[${new Date().toLocaleTimeString()}] `) : '';

  // Error patterns
  if (patterns.error.test(line)) {
    return prefix + chalk.red.bold(line);
  }

  // Warning patterns
  if (patterns.warning.test(line)) {
    return prefix + chalk.yellow(line);
  }

  // Success patterns
  if (patterns.success.test(line)) {
    return prefix + chalk.green(line);
  }

  // IPC activity
  if (patterns.ipc.test(line)) {
    return prefix + chalk.magenta(line);
  }

  // PowerShell activity
  if (patterns.powershell.test(line)) {
    return prefix + chalk.cyan(line);
  }

  // Discovery activity
  if (patterns.discovery.test(line)) {
    return prefix + chalk.blue(line);
  }

  // Migration activity
  if (patterns.migration.test(line)) {
    return prefix + chalk.blueBright(line);
  }

  // Profile activity
  if (patterns.profile.test(line)) {
    return prefix + chalk.greenBright(line);
  }

  // Default
  return prefix + chalk.white(line);
}

// Track stats
const stats = {
  errors: 0,
  warnings: 0,
  ipcCalls: 0,
  psExecutions: 0,
};

function updateStats(line) {
  if (patterns.error.test(line)) stats.errors++;
  if (patterns.warning.test(line)) stats.warnings++;
  if (patterns.ipc.test(line)) stats.ipcCalls++;
  if (patterns.powershell.test(line)) stats.psExecutions++;
}

function printStats() {
  console.log(chalk.gray('\n─────────────────────────────────'));
  console.log(chalk.cyan.bold('Session Statistics:'));
  console.log(chalk.red(`  Errors: ${stats.errors}`));
  console.log(chalk.yellow(`  Warnings: ${stats.warnings}`));
  console.log(chalk.magenta(`  IPC Calls: ${stats.ipcCalls}`));
  console.log(chalk.cyan(`  PowerShell Executions: ${stats.psExecutions}`));
  console.log(chalk.gray('─────────────────────────────────\n'));
}

// Print stats every 30 seconds
setInterval(printStats, 30000);

// Monitor stdin for user input
process.stdin.on('data', (data) => {
  const input = data.toString().trim().toLowerCase();

  if (input === 'stats') {
    printStats();
  } else if (input === 'clear') {
    console.clear();
    console.log(chalk.cyan.bold('\n=== GuiV2 Log Monitor (cleared) ===\n'));
  } else if (input === 'help') {
    console.log(chalk.cyan.bold('\nAvailable commands:'));
    console.log('  stats  - Show session statistics');
    console.log('  clear  - Clear screen');
    console.log('  help   - Show this help');
    console.log('  quit   - Exit monitor\n');
  } else if (input === 'quit' || input === 'exit') {
    console.log(chalk.green('\nExiting log monitor...'));
    process.exit(0);
  }
});

console.log(chalk.gray('Type "help" for commands, "quit" to exit\n'));
console.log(chalk.cyan.bold('=== Live Logs ===\n'));

// Process logs from stdin
process.stdin.setEncoding('utf8');
const readline = require('readline');

// Read from a log file or pipe
if (process.argv[2]) {
  const logFile = process.argv[2];
  const tail = spawn('tail', ['-f', logFile]);

  tail.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        updateStats(line);
        console.log(formatLog(line));
      }
    });
  });

  tail.stderr.on('data', (data) => {
    console.error(chalk.red('TAIL ERROR:'), data.toString());
  });
} else {
  console.log(chalk.yellow('No log file specified. Reading from stdin...'));
  console.log(chalk.gray('Usage: node monitor-logs.js <logfile>\n'));
}

// Handle exit
process.on('SIGINT', () => {
  printStats();
  console.log(chalk.green('\n\nLog monitor stopped.'));
  process.exit(0);
});
