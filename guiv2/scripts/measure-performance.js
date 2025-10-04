#!/usr/bin/env node

/**
 * Performance Measurement Script
 *
 * Measures and reports on bundle sizes, compression ratios, and optimization metrics
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get file size with gzip compression
 */
function getGzipSize(filePath) {
  const content = fs.readFileSync(filePath);
  const compressed = zlib.gzipSync(content, { level: 9 });
  return compressed.length;
}

/**
 * Get file size with brotli compression
 */
function getBrotliSize(filePath) {
  const content = fs.readFileSync(filePath);
  const compressed = zlib.brotliCompressSync(content, {
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    },
  });
  return compressed.length;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath, basePath) {
  const stats = fs.statSync(filePath);
  const rawSize = stats.size;
  const gzipSize = getGzipSize(filePath);
  const brotliSize = getBrotliSize(filePath);
  const relativePath = path.relative(basePath, filePath);

  return {
    path: relativePath,
    rawSize,
    gzipSize,
    brotliSize,
    gzipRatio: ((1 - gzipSize / rawSize) * 100).toFixed(2),
    brotliRatio: ((1 - brotliSize / rawSize) * 100).toFixed(2),
  };
}

/**
 * Get all files recursively
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Main analysis function
 */
function analyzeBundle() {
  console.log(`${colors.bright}${colors.cyan}Bundle Performance Analysis${colors.reset}\n`);

  const webpackDir = path.join(__dirname, '..', '.webpack');

  if (!fs.existsSync(webpackDir)) {
    console.log(`${colors.red}Error: .webpack directory not found. Run 'npm run build:prod' first.${colors.reset}`);
    process.exit(1);
  }

  // Analyze renderer bundle
  const rendererDir = path.join(webpackDir, 'renderer', 'main_window');
  const mainDir = path.join(webpackDir, 'main');

  console.log(`${colors.bright}Renderer Bundle Analysis:${colors.reset}`);
  console.log('─'.repeat(120));
  console.log(
    `${'File'.padEnd(50)} | ${'Raw Size'.padEnd(12)} | ${'Gzip'.padEnd(12)} | ${'Brotli'.padEnd(12)} | ${'Gzip %'.padEnd(10)} | ${'Brotli %'.padEnd(10)}`
  );
  console.log('─'.repeat(120));

  let totalRawSize = 0;
  let totalGzipSize = 0;
  let totalBrotliSize = 0;

  // Analyze renderer files
  if (fs.existsSync(rendererDir)) {
    const rendererFiles = getAllFiles(rendererDir).filter(
      (f) => f.endsWith('.js') || f.endsWith('.css')
    );

    rendererFiles.forEach((file) => {
      const analysis = analyzeFile(file, rendererDir);
      totalRawSize += analysis.rawSize;
      totalGzipSize += analysis.gzipSize;
      totalBrotliSize += analysis.brotliSize;

      // Color code by size
      let color = colors.green;
      if (analysis.gzipSize > 500 * 1024) color = colors.red;
      else if (analysis.gzipSize > 200 * 1024) color = colors.yellow;

      console.log(
        `${color}${analysis.path.padEnd(50)}${colors.reset} | ${formatBytes(analysis.rawSize).padEnd(12)} | ${formatBytes(analysis.gzipSize).padEnd(12)} | ${formatBytes(analysis.brotliSize).padEnd(12)} | ${(analysis.gzipRatio + '%').padEnd(10)} | ${(analysis.brotliRatio + '%').padEnd(10)}`
      );
    });
  }

  console.log('─'.repeat(120));
  console.log(`${colors.bright}Total Renderer:${colors.reset}`.padEnd(52) +
    `${formatBytes(totalRawSize).padEnd(12)} | ${formatBytes(totalGzipSize).padEnd(12)} | ${formatBytes(totalBrotliSize).padEnd(12)}`);
  console.log('─'.repeat(120));

  // Analyze main process
  console.log(`\n${colors.bright}Main Process Bundle Analysis:${colors.reset}`);
  console.log('─'.repeat(120));

  let mainTotalRaw = 0;
  let mainTotalGzip = 0;
  let mainTotalBrotli = 0;

  if (fs.existsSync(mainDir)) {
    const mainFiles = getAllFiles(mainDir).filter((f) => f.endsWith('.js'));

    mainFiles.forEach((file) => {
      const analysis = analyzeFile(file, mainDir);
      mainTotalRaw += analysis.rawSize;
      mainTotalGzip += analysis.gzipSize;
      mainTotalBrotli += analysis.brotliSize;

      let color = colors.green;
      if (analysis.rawSize > 1024 * 1024) color = colors.red;
      else if (analysis.rawSize > 500 * 1024) color = colors.yellow;

      console.log(
        `${color}${analysis.path.padEnd(50)}${colors.reset} | ${formatBytes(analysis.rawSize).padEnd(12)} | ${formatBytes(analysis.gzipSize).padEnd(12)} | ${formatBytes(analysis.brotliSize).padEnd(12)} | ${(analysis.gzipRatio + '%').padEnd(10)} | ${(analysis.brotliRatio + '%').padEnd(10)}`
      );
    });
  }

  console.log('─'.repeat(120));
  console.log(`${colors.bright}Total Main:${colors.reset}`.padEnd(52) +
    `${formatBytes(mainTotalRaw).padEnd(12)} | ${formatBytes(mainTotalGzip).padEnd(12)} | ${formatBytes(mainTotalBrotli).padEnd(12)}`);
  console.log('─'.repeat(120));

  // Summary
  console.log(`\n${colors.bright}${colors.cyan}Summary:${colors.reset}`);
  console.log(`Total Application Size (Raw):    ${formatBytes(totalRawSize + mainTotalRaw)}`);
  console.log(`Total Application Size (Gzip):   ${formatBytes(totalGzipSize + mainTotalGzip)}`);
  console.log(`Total Application Size (Brotli): ${formatBytes(totalBrotliSize + mainTotalBrotli)}`);

  const totalGzipRatio = ((1 - (totalGzipSize + mainTotalGzip) / (totalRawSize + mainTotalRaw)) * 100).toFixed(2);
  const totalBrotliRatio = ((1 - (totalBrotliSize + mainTotalBrotli) / (totalRawSize + mainTotalRaw)) * 100).toFixed(2);

  console.log(`Overall Gzip Compression:        ${totalGzipRatio}%`);
  console.log(`Overall Brotli Compression:      ${totalBrotliRatio}%`);

  // Check against targets
  console.log(`\n${colors.bright}${colors.cyan}Target Metrics:${colors.reset}`);

  const targets = {
    initialBundle: 5 * 1024 * 1024, // 5MB
    totalBundle: 15 * 1024 * 1024, // 15MB
  };

  const initialBundleGzip = totalGzipSize;
  const totalBundleGzip = totalGzipSize + mainTotalGzip;

  console.log(`Initial Bundle (Gzip):  ${formatBytes(initialBundleGzip)} / ${formatBytes(targets.initialBundle)} ${initialBundleGzip < targets.initialBundle ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
  console.log(`Total Bundle (Gzip):    ${formatBytes(totalBundleGzip)} / ${formatBytes(targets.totalBundle)} ${totalBundleGzip < targets.totalBundle ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    renderer: {
      rawSize: totalRawSize,
      gzipSize: totalGzipSize,
      brotliSize: totalBrotliSize,
    },
    main: {
      rawSize: mainTotalRaw,
      gzipSize: mainTotalGzip,
      brotliSize: mainTotalBrotli,
    },
    total: {
      rawSize: totalRawSize + mainTotalRaw,
      gzipSize: totalGzipSize + mainTotalGzip,
      brotliSize: totalBrotliSize + mainTotalBrotli,
    },
    targets,
    passed: initialBundleGzip < targets.initialBundle && totalBundleGzip < targets.totalBundle,
  };

  const reportPath = path.join(webpackDir, 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n${colors.cyan}Report saved to: ${reportPath}${colors.reset}`);

  // Exit with error code if targets not met
  if (!report.passed) {
    console.log(`\n${colors.red}${colors.bright}Bundle size targets not met!${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bright}All bundle size targets met!${colors.reset}`);
  }
}

// Run analysis
try {
  analyzeBundle();
} catch (error) {
  console.error(`${colors.red}Error analyzing bundle:${colors.reset}`, error);
  process.exit(1);
}
