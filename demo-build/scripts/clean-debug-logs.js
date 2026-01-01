#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple CLI interface
const args = process.argv.slice(2);

function showUsage() {
  console.log(`
Debug Log Cleaner

Usage:
  node clean-debug-logs.js [options]

Cleans up old debug log files based on retention policy.

Options:
  --dry-run             Show what would be deleted without actually deleting
  --days <number>       Delete logs older than specified days (default: 30)
  --max-size <size>     Delete logs if total size exceeds (e.g., 100MB, 1GB)
  --category <name>     Clean only specific category
  --force               Skip confirmation prompts

Examples:
  node clean-debug-logs.js --dry-run
  node clean-debug-logs.js --days 7
  node clean-debug-logs.js --max-size 500MB --category errors
`);
}

// Parse options
const dryRunIndex = args.indexOf('--dry-run');
const daysIndex = args.indexOf('--days');
const maxSizeIndex = args.indexOf('--max-size');
const categoryIndex = args.indexOf('--category');
const forceIndex = args.indexOf('--force');

const dryRun = dryRunIndex !== -1;
const days = daysIndex !== -1 ? parseInt(args[daysIndex + 1]) : 30;
const maxSizeStr = maxSizeIndex !== -1 ? args[maxSizeIndex + 1] : null;
const specificCategory = categoryIndex !== -1 ? args[categoryIndex + 1] : null;
const force = forceIndex !== -1;

function parseSize(sizeStr) {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  switch (unit) {
    case 'KB': return value * 1024;
    case 'MB': return value * 1024 * 1024;
    case 'GB': return value * 1024 * 1024 * 1024;
    default: return null;
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const logDir = path.join(process.env.DISCOVERY_DATA || 'C:\\discoverydata', 'logs');

if (!fs.existsSync(logDir)) {
  console.log('No log directory found. Nothing to clean.');
  process.exit(0);
}

const categories = specificCategory
  ? [specificCategory]
  : fs.readdirSync(logDir).filter(item => {
      const itemPath = path.join(logDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

let totalDeleted = 0;
let totalSizeFreed = 0;
const filesToDelete = [];

const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - days);

console.log(`${dryRun ? 'DRY RUN: ' : ''}Cleaning debug logs...`);
console.log(`Retention period: ${days} days`);
console.log(`Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`);
if (maxSizeStr) {
  const maxSize = parseSize(maxSizeStr);
  console.log(`Max size limit: ${maxSizeStr} (${formatSize(maxSize)})`);
}
console.log('');

// Process each category
categories.forEach(category => {
  const categoryPath = path.join(logDir, category);
  if (!fs.existsSync(categoryPath)) {
    console.log(`Category '${category}' not found, skipping.`);
    return;
  }

  console.log(`Processing category: ${category}`);

  const files = fs.readdirSync(categoryPath)
    .filter(file => file.endsWith('.log') || file.endsWith('.log.gz'))
    .map(file => {
      const filePath = path.join(categoryPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
        isOld: stats.mtime < cutoffDate
      };
    })
    .sort((a, b) => a.mtime - b.mtime); // Sort by modification time (oldest first)

  if (files.length === 0) {
    console.log('  No log files found.');
    return;
  }

  // Filter files to delete
  let categoryFilesToDelete = files.filter(file => file.isOld);

  // Apply size-based cleanup if specified
  if (maxSizeStr) {
    const maxSize = parseSize(maxSizeStr);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > maxSize) {
      const sizeToFree = totalSize - maxSize;
      let freedSize = 0;

      // Delete oldest files until we free enough space
      const sizeBasedFiles = files
        .filter(file => !categoryFilesToDelete.includes(file)) // Don't double-count already flagged files
        .sort((a, b) => a.mtime - b.mtime); // Oldest first

      for (const file of sizeBasedFiles) {
        if (freedSize >= sizeToFree) break;
        categoryFilesToDelete.push(file);
        freedSize += file.size;
      }
    }
  }

  if (categoryFilesToDelete.length === 0) {
    console.log(`  No files to delete (${files.length} total files).`);
  } else {
    console.log(`  Files to delete: ${categoryFilesToDelete.length}`);

    categoryFilesToDelete.forEach(file => {
      console.log(`    - ${file.name} (${formatSize(file.size)}) - ${file.mtime.toISOString().split('T')[0]}`);
      filesToDelete.push(file);
    });
  }

  console.log('');
});

if (filesToDelete.length === 0) {
  console.log('No files to delete.');
  process.exit(0);
}

// Confirm deletion
if (!dryRun && !force) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`Delete ${filesToDelete.length} files (${formatSize(filesToDelete.reduce((sum, f) => sum + f.size, 0))} total)? (y/N): `, (answer) => {
    rl.close();
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      performDeletion(filesToDelete);
    } else {
      console.log('Operation cancelled.');
    }
  });
} else {
  performDeletion(filesToDelete);
}

function performDeletion(files) {
  console.log(`\n${dryRun ? 'Would delete' : 'Deleting'} ${files.length} files...\n`);

  files.forEach(file => {
    try {
      if (!dryRun) {
        fs.unlinkSync(file.path);
      }
      totalDeleted++;
      totalSizeFreed += file.size;
      console.log(`${dryRun ? 'Would delete' : 'Deleted'}: ${file.path}`);
    } catch (error) {
      console.error(`Error deleting ${file.path}:`, error.message);
    }
  });

  console.log(`\n${dryRun ? 'Would have deleted' : 'Deleted'} ${totalDeleted} files, freeing ${formatSize(totalSizeFreed)}.`);

  // Show remaining disk space info
  try {
    const stats = fs.statvfs ? fs.statvfs(logDir) : null;
    if (stats) {
      console.log(`Available disk space: ${formatSize(stats.f_bavail * stats.f_frsize)}`);
    }
  } catch (error) {
    // statvfs not available on Windows, ignore
  }
}