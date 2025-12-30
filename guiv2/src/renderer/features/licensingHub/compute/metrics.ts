import { LicensingHubState } from '../../../../shared/types/licensing';

export interface DashboardMetrics {
  // Computer inventory per month (bar chart data)
  inventoriedComputersPerMonth: Array<{
    month: string;
    count: number;
  }>;

  // Computer inventory status (donut chart data)
  inventoryStatus: Array<{
    category: string;
    count: number;
    color: string;
  }>;

  // Most used applications (donut chart data)
  mostUsedApplications: Array<{
    product: string;
    usage: number;
    color: string;
  }>;

  // Alert summary
  alertSummary: {
    critical: number;
    warning: number;
    info: number;
  };

  // Effective position summary
  effectivePositionSummary: {
    over: number;
    under: number;
    balanced: number;
    unknown: number;
  };
}

/**
 * Computes dashboard metrics for the licensing hub overview
 */
export function dashboardMetrics(state: LicensingHubState): DashboardMetrics {
  const now = new Date();

  // Computer inventory per month (from device lastSeen dates)
  const monthlyCounts = new Map<string, number>();
  for (const device of state.canonicalDevices) {
    if (device.lastSeen) {
      const date = new Date(device.lastSeen);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);
    }
  }

  // Convert to sorted array for bar chart
  const inventoriedComputersPerMonth = Array.from(monthlyCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months

  // Inventory status (based on lastSeen relative to now)
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;
  const thirtyDays = 30 * oneDay;

  let todayCount = 0;
  let lastWeekCount = 0;
  let lastMonthCount = 0;
  let olderCount = 0;

  for (const device of state.canonicalDevices) {
    if (!device.lastSeen) {
      olderCount++;
      continue;
    }

    const lastSeen = new Date(device.lastSeen);
    const daysSinceSeen = (now.getTime() - lastSeen.getTime()) / oneDay;

    if (daysSinceSeen <= 1) {
      todayCount++;
    } else if (daysSinceSeen <= 7) {
      lastWeekCount++;
    } else if (daysSinceSeen <= 30) {
      lastMonthCount++;
    } else {
      olderCount++;
    }
  }

  const inventoryStatus = [
    { category: 'Today/Yesterday', count: todayCount, color: '#10b981' },
    { category: 'Last Week', count: lastWeekCount, color: '#3b82f6' },
    { category: 'Last Month', count: lastMonthCount, color: '#f59e0b' },
    { category: 'Older', count: olderCount, color: '#ef4444' }
  ];

  // Most used applications (from consumptions or assignments)
  const productUsage = new Map<string, number>();

  // Add consumption data
  for (const consumption of state.consumptions) {
    const current = productUsage.get(consumption.productId) || 0;
    productUsage.set(consumption.productId, current + consumption.quantity);
  }

  // Fallback to assignment counts if no consumption
  if (productUsage.size === 0) {
    for (const assignment of state.assignments) {
      const current = productUsage.get(assignment.productId) || 0;
      productUsage.set(assignment.productId, current + 1);
    }
  }

  // Get product names and create top 5
  const productUsageArray = Array.from(productUsage.entries())
    .map(([productId, usage]) => {
      const product = state.products.find(p => p.productId === productId);
      return {
        product: product?.name || productId,
        usage
      };
    })
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 5);

  // Color palette for donut chart
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const mostUsedApplications = productUsageArray.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));

  // Alert summary
  const alerts = state.alerts;
  const alertSummary = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length
  };

  // Effective position summary
  const positions = state.effectivePositions;
  const effectivePositionSummary = {
    over: positions.filter(p => p.status === 'over').length,
    under: positions.filter(p => p.status === 'under').length,
    balanced: positions.filter(p => p.status === 'balanced').length,
    unknown: positions.filter(p => p.status === 'unknown').length
  };

  return {
    inventoriedComputersPerMonth,
    inventoryStatus,
    mostUsedApplications,
    alertSummary,
    effectivePositionSummary
  };
}