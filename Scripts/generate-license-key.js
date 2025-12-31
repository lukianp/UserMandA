#!/usr/bin/env node

/**
 * License Key Generator
 * Generates license keys for Enterprise Discovery Suite
 *
 * Usage:
 *   node scripts/generate-license-key.js --customer-id 001 --type enterprise --days 365
 *
 * Format: XXXX-XXXX-XXXX-XXXX-XXXX
 * Part 0: Customer ID (base36)
 * Part 1: License Type (TR=Trial, ST=Standard, EN=Enterprise)
 * Part 2: Expiry Date (base36 timestamp)
 * Part 3: Feature Flags (base36 bitmap)
 * Part 4: Checksum (SHA256 hash, first 4 chars)
 */

const crypto = require('crypto');

// Feature bit flags
const FEATURES = {
  'discovery': 1 << 0,
  'migration': 1 << 1,
  'analytics': 1 << 2,
  'reporting': 1 << 3,
  'api-access': 1 << 4,
  'priority-support': 1 << 5,
};

// License types
const LICENSE_TYPES = {
  'trial': {
    code: 'TR',
    features: ['discovery'],
    defaultDays: 30,
  },
  'standard': {
    code: 'ST',
    features: ['discovery', 'migration', 'reporting'],
    defaultDays: 365,
  },
  'enterprise': {
    code: 'EN',
    features: ['discovery', 'migration', 'analytics', 'reporting', 'api-access', 'priority-support'],
    defaultDays: 365,
  },
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    customerId: null,
    type: 'trial',
    days: null,
    features: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--customer-id':
      case '-c':
        options.customerId = args[++i];
        break;
      case '--type':
      case '-t':
        options.type = args[++i];
        break;
      case '--days':
      case '-d':
        options.days = parseInt(args[++i], 10);
        break;
      case '--features':
      case '-f':
        options.features = args[++i].split(',');
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  // Validate
  if (!options.customerId) {
    console.error('Error: --customer-id is required');
    showHelp();
    process.exit(1);
  }

  if (!LICENSE_TYPES[options.type]) {
    console.error(`Error: Invalid license type "${options.type}". Must be: trial, standard, or enterprise`);
    process.exit(1);
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
License Key Generator for Enterprise Discovery Suite

Usage:
  node scripts/generate-license-key.js [options]

Options:
  -c, --customer-id <id>      Customer ID (required, e.g., "001", "002")
  -t, --type <type>           License type: trial, standard, enterprise (default: trial)
  -d, --days <days>           Days until expiration (default: type-specific)
  -f, --features <features>   Comma-separated features (default: type-specific)
  -h, --help                  Show this help message

Features:
  discovery           Discovery modules
  migration           Migration tools
  analytics           Advanced analytics
  reporting           Reporting & export
  api-access          API access
  priority-support    Priority support

Examples:
  # Generate trial license for customer 001 (30 days)
  node scripts/generate-license-key.js --customer-id 001 --type trial

  # Generate enterprise license for customer 002 (365 days)
  node scripts/generate-license-key.js --customer-id 002 --type enterprise

  # Generate standard license with custom expiration
  node scripts/generate-license-key.js --customer-id 003 --type standard --days 180

  # Generate custom license with specific features
  node scripts/generate-license-key.js --customer-id 004 --type standard --features discovery,migration,analytics
`);
}

/**
 * Encode feature flags as bitmap
 */
function encodeFeatures(features) {
  let flags = 0;
  for (const feature of features) {
    if (FEATURES[feature]) {
      flags |= FEATURES[feature];
    } else {
      console.warn(`Warning: Unknown feature "${feature}"`);
    }
  }
  return flags;
}

/**
 * Generate license key
 */
function generateLicenseKey(customerId, type, days, features) {
  const licenseType = LICENSE_TYPES[type];
  const daysToExpiry = days || licenseType.defaultDays;
  const featureList = features || licenseType.features;

  // Part 0: Customer ID (convert to base36)
  const customerIdNum = parseInt(customerId, 10);
  if (isNaN(customerIdNum)) {
    throw new Error('Customer ID must be numeric');
  }
  const part0 = customerIdNum.toString(36).toUpperCase().padStart(4, '0');

  // Part 1: License Type + padding
  const part1 = (licenseType.code + '00').substring(0, 4);

  // Part 2: Expiry Date (timestamp in seconds, base36)
  const expiryTimestamp = Math.floor((Date.now() + daysToExpiry * 24 * 60 * 60 * 1000) / 1000);
  const part2 = expiryTimestamp.toString(36).toUpperCase().padStart(4, '0').substring(0, 4);

  // Part 3: Feature Flags (bitmap, base36)
  const featureFlags = encodeFeatures(featureList);
  const part3 = featureFlags.toString(36).toUpperCase().padStart(4, '0').substring(0, 4);

  // Assemble key without checksum
  const keyWithoutChecksum = `${part0}-${part1}-${part2}-${part3}`;

  // Part 4: Checksum (SHA256 of the key so far)
  const hash = crypto.createHash('sha256').update(keyWithoutChecksum).digest('hex');
  const part4 = hash.substring(0, 4).toUpperCase();

  // Final key
  const licenseKey = `${keyWithoutChecksum}-${part4}`;

  return {
    licenseKey,
    metadata: {
      customerId,
      type,
      expiryDate: new Date(expiryTimestamp * 1000).toISOString(),
      daysToExpiry,
      features: featureList,
    },
  };
}

/**
 * Main
 */
function main() {
  try {
    const options = parseArgs();

    console.log('\n==============================================');
    console.log('  LICENSE KEY GENERATOR');
    console.log('  Enterprise Discovery Suite v2.0');
    console.log('==============================================\n');

    const result = generateLicenseKey(
      options.customerId,
      options.type,
      options.days,
      options.features
    );

    console.log('Generated License Key:\n');
    console.log(`  ${result.licenseKey}\n`);
    console.log('Metadata:');
    console.log(`  Customer ID:      customer-${options.customerId}`);
    console.log(`  License Type:     ${options.type}`);
    console.log(`  Expires:          ${result.metadata.expiryDate}`);
    console.log(`  Days to Expiry:   ${result.metadata.daysToExpiry}`);
    console.log(`  Features:         ${result.metadata.features.join(', ')}`);
    console.log('\n==============================================\n');

    // Also output JSON for CI/CD
    if (process.env.OUTPUT_JSON) {
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateLicenseKey, encodeFeatures };
