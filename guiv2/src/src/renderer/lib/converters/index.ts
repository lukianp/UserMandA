/**
 * Converter Utilities
 *
 * TypeScript equivalents of WPF Value Converters
 * All converters are pure functions that transform data for UI display
 */

import { format, formatDistance, formatRelative, parseISO } from 'date-fns';

// ==================== Visibility Converters ====================

/**
 * Convert boolean to CSS visibility
 * WPF: BooleanToVisibilityConverter
 */
export const booleanToVisibility = (value: boolean): 'visible' | 'hidden' => {
  return value ? 'visible' : 'hidden';
};

/**
 * Convert boolean to CSS display property
 */
export const booleanToDisplay = (value: boolean): 'block' | 'none' => {
  return value ? 'block' : 'none';
};

/**
 * Inverse boolean to visibility
 * WPF: InverseBooleanToVisibilityConverter
 */
export const inverseBooleanToVisibility = (value: boolean): 'visible' | 'hidden' => {
  return value ? 'hidden' : 'visible';
};

/**
 * Null/undefined to visibility
 * WPF: NullToVisibilityConverter
 */
export const nullToVisibility = (value: any): 'visible' | 'hidden' => {
  return value === null || value === undefined ? 'hidden' : 'visible';
};

/**
 * Number to visibility (hide if zero)
 * WPF: NumberToVisibilityConverter
 */
export const numberToVisibility = (value: number): 'visible' | 'hidden' => {
  return value > 0 ? 'visible' : 'hidden';
};

/**
 * Zero to visibility (show only if zero)
 * WPF: ZeroToVisibilityConverter
 */
export const zeroToVisibility = (value: number): 'visible' | 'hidden' => {
  return value === 0 ? 'visible' : 'hidden';
};

/**
 * String to visibility (hide if empty)
 * WPF: StringToVisibilityConverter
 */
export const stringToVisibility = (value: string): 'visible' | 'hidden' => {
  return value && value.trim().length > 0 ? 'visible' : 'hidden';
};

/**
 * Empty string to visibility
 * WPF: EmptyStringToVisibilityConverter
 */
export const emptyStringToVisibility = (value: string): 'visible' | 'hidden' => {
  return !value || value.trim().length === 0 ? 'visible' : 'hidden';
};

/**
 * Count/Array length to visibility
 * WPF: CountToVisibilityConverter
 */
export const countToVisibility = (value: any[] | number): 'visible' | 'hidden' => {
  const count = Array.isArray(value) ? value.length : value;
  return count > 0 ? 'visible' : 'hidden';
};

// ==================== Boolean Converters ====================

/**
 * Inverse boolean
 * WPF: InverseBooleanConverter
 */
export const inverseBoolean = (value: boolean): boolean => {
  return !value;
};

// ==================== Size & Format Converters ====================

/**
 * Convert bytes to human-readable size
 * WPF: ByteSizeConverter
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Convert number to percentage
 * WPF: PercentageConverter
 */
export const toPercentage = (value: number, total: number, decimals = 1): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Array length converter
 * WPF: ArrayLengthConverter
 */
export const arrayLength = (value: any[]): number => {
  return Array.isArray(value) ? value.length : 0;
};

// ==================== Date & Time Converters ====================

/**
 * Format date/time to string
 * WPF: DateTimeConverter
 */
export const formatDateTime = (date: Date | string, formatString = 'PPpp'): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  try {
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return String(date);
  }
};

/**
 * Format relative date (e.g., "2 hours ago")
 * WPF: RelativeDateConverter
 */
export const formatRelativeDate = (date: Date | string): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  try {
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return String(date);
  }
};

/**
 * Format timespan/duration
 * WPF: TimeSpanConverter, DurationConverter
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// ==================== String Converters ====================

/**
 * Truncate string with ellipsis
 * WPF: TruncateConverter
 */
export const truncate = (value: string, maxLength: number, suffix = '...'): string => {
  if (!value || value.length <= maxLength) return value;
  return value.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Convert to uppercase
 * WPF: UpperCaseConverter
 */
export const toUpperCase = (value: string): string => {
  return value ? value.toUpperCase() : '';
};

/**
 * Convert to lowercase
 * WPF: LowerCaseConverter
 */
export const toLowerCase = (value: string): string => {
  return value ? value.toLowerCase() : '';
};

/**
 * Convert to title case
 * WPF: TitleCaseConverter
 */
export const toTitleCase = (value: string): string => {
  if (!value) return '';
  return value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

/**
 * Pluralize word based on count
 * WPF: PluralizeConverter
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Humanize string (convert camelCase/snake_case to readable)
 * WPF: HumanizeConverter
 */
export const humanize = (value: string): string => {
  if (!value) return '';

  return value
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};

// ==================== Enum & Type Converters ====================

/**
 * Convert enum to string
 * WPF: EnumToStringConverter
 */
export const enumToString = (value: any): string => {
  return String(value);
};

// ==================== Color & Status Converters ====================

/**
 * Convert boolean to color
 * WPF: BooleanToColorConverter
 */
export const booleanToColor = (value: boolean, trueColor = 'green', falseColor = 'red'): string => {
  return value ? trueColor : falseColor;
};

/**
 * Convert status to color
 * WPF: StatusToColorConverter
 */
export const statusToColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    // Execution statuses
    'completed': '#10b981', // green-500
    'success': '#10b981',
    'running': '#3b82f6', // blue-500
    'in_progress': '#3b82f6',
    'pending': '#f59e0b', // amber-500
    'waiting': '#f59e0b',
    'failed': '#ef4444', // red-500
    'error': '#ef4444',
    'cancelled': '#6b7280', // gray-500
    'paused': '#8b5cf6', // violet-500

    // Connection statuses
    'connected': '#10b981',
    'connecting': '#3b82f6',
    'disconnected': '#6b7280',

    // Migration statuses
    'planned': '#f59e0b',
    'ready': '#10b981',
    'executing': '#3b82f6',
    'validated': '#10b981',
    'mapped': '#3b82f6',
    'migrated': '#10b981',
  };

  return colorMap[status.toLowerCase()] || '#6b7280'; // default gray
};

/**
 * Convert priority to color
 * WPF: PriorityToColorConverter
 */
export const priorityToColor = (priority: string | number): string => {
  const priorityNum = typeof priority === 'string' ? parseInt(priority, 10) : priority;

  if (priorityNum <= 1 || priority === 'low') return '#10b981'; // green
  if (priorityNum <= 2 || priority === 'medium') return '#f59e0b'; // amber
  if (priorityNum <= 3 || priority === 'high') return '#f97316'; // orange
  return '#ef4444'; // red (critical)
};

/**
 * Environment type to color
 * WPF: EnvironmentTypeToColorConverter
 */
export const environmentTypeToColor = (envType: string): string => {
  const colorMap: Record<string, string> = {
    'production': '#ef4444', // red
    'staging': '#f59e0b', // amber
    'development': '#10b981', // green
    'test': '#3b82f6', // blue
    'qa': '#8b5cf6', // violet
  };

  return colorMap[envType.toLowerCase()] || '#6b7280';
};

/**
 * Theme to color
 * WPF: ThemeToColorConverter
 */
export const themeToColor = (theme: string): string => {
  const colorMap: Record<string, string> = {
    'light': '#ffffff',
    'dark': '#1f2937',
    'highcontrast': '#000000',
    'colorblind': '#f3f4f6',
  };

  return colorMap[theme.toLowerCase()] || '#ffffff';
};

/**
 * Health status to color
 * WPF: HealthStatusConverter
 */
export const healthStatusToColor = (health: string): string => {
  const healthMap: Record<string, string> = {
    'healthy': '#10b981',
    'degraded': '#f59e0b',
    'unhealthy': '#ef4444',
    'unknown': '#6b7280',
  };

  return healthMap[health.toLowerCase()] || '#6b7280';
};

/**
 * Severity level to color
 * WPF: SeverityLevelConverter
 */
export const severityToColor = (severity: string): string => {
  const severityMap: Record<string, string> = {
    'critical': '#dc2626', // red-600
    'error': '#ef4444', // red-500
    'warning': '#f59e0b', // amber-500
    'info': '#3b82f6', // blue-500
    'debug': '#6b7280', // gray-500
    'verbose': '#9ca3af', // gray-400
  };

  return severityMap[severity.toLowerCase()] || '#6b7280';
};

/**
 * Connection status to color
 * WPF: ConnectionStatusConverter
 */
export const connectionStatusToColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'connected': '#10b981',
    'connecting': '#3b82f6',
    'disconnected': '#6b7280',
    'error': '#ef4444',
    'timeout': '#f59e0b',
  };

  return statusMap[status.toLowerCase()] || '#6b7280';
};

/**
 * Migration status to color
 * WPF: MigrationStatusConverter
 */
export const migrationStatusToColor = (status: string): string => {
  return statusToColor(status); // Reuse status converter
};

/**
 * Progress bar color based on percentage
 * WPF: ProgressBarConverter
 */
export const progressToColor = (percentage: number): string => {
  if (percentage < 33) return '#ef4444'; // red
  if (percentage < 66) return '#f59e0b'; // amber
  return '#10b981'; // green
};

// ==================== Icon Converters ====================

/**
 * Type to icon name
 * WPF: TypeToIconConverter
 */
export const typeToIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'user': 'User',
    'group': 'Users',
    'computer': 'Monitor',
    'server': 'Server',
    'database': 'Database',
    'file': 'File',
    'folder': 'Folder',
    'email': 'Mail',
    'calendar': 'Calendar',
    'contact': 'UserCircle',
    'task': 'CheckSquare',
    'document': 'FileText',
    'image': 'Image',
    'video': 'Video',
    'audio': 'Music',
    'network': 'Wifi',
    'cloud': 'Cloud',
    'security': 'Shield',
    'settings': 'Settings',
    'warning': 'AlertTriangle',
    'error': 'AlertCircle',
    'info': 'Info',
    'success': 'CheckCircle',
  };

  return iconMap[type.toLowerCase()] || 'Circle';
};

/**
 * Environment type to icon
 * WPF: EnvironmentTypeToIconConverter
 */
export const environmentTypeToIcon = (envType: string): string => {
  const iconMap: Record<string, string> = {
    'azure': 'Cloud',
    'office365': 'Mail',
    'active-directory': 'Network',
    'exchange': 'Mail',
    'sharepoint': 'FolderOpen',
    'teams': 'MessageSquare',
    'aws': 'Cloud',
    'google-workspace': 'Mail',
    'on-premises': 'Server',
    'hybrid': 'GitMerge',
  };

  return iconMap[envType.toLowerCase()] || 'Server';
};

// ==================== Data Format Converters ====================

/**
 * Format currency
 * WPF: CurrencyConverter
 */
export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format phone number
 * WPF: PhoneNumberConverter
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Format as +X (XXX) XXX-XXXX for international
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // Return as-is if format doesn't match
};

/**
 * Format URL
 * WPF: UrlConverter
 */
export const formatUrl = (url: string): string => {
  if (!url) return '';

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
};

/**
 * Format email
 * WPF: EmailConverter
 */
export const formatEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

// ==================== Export All ====================

export default {
  // Visibility
  booleanToVisibility,
  booleanToDisplay,
  inverseBooleanToVisibility,
  nullToVisibility,
  numberToVisibility,
  zeroToVisibility,
  stringToVisibility,
  emptyStringToVisibility,
  countToVisibility,

  // Boolean
  inverseBoolean,

  // Size & Format
  formatBytes,
  toPercentage,
  arrayLength,

  // Date & Time
  formatDateTime,
  formatRelativeDate,
  formatDuration,

  // String
  truncate,
  toUpperCase,
  toLowerCase,
  toTitleCase,
  pluralize,
  humanize,

  // Enum & Type
  enumToString,

  // Color & Status
  booleanToColor,
  statusToColor,
  priorityToColor,
  environmentTypeToColor,
  themeToColor,
  healthStatusToColor,
  severityToColor,
  connectionStatusToColor,
  migrationStatusToColor,
  progressToColor,

  // Icon
  typeToIcon,
  environmentTypeToIcon,

  // Data Format
  formatCurrency,
  formatPhoneNumber,
  formatUrl,
  formatEmail,
};
