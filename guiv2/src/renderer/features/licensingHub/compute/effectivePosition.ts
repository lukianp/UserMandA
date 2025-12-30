import { LicensingHubState, EffectiveLicensePosition, LicenseMetricUnit } from '../../../../shared/types/licensing';

/**
 * Computes effective license positions for all products
 * Rules v1 (simple):
 * - entitled = sum(entitlements.quantity) by productId+metric where isActive
 * - consumed = latest consumption quantity by productId+metric OR derived from assignments count if no consumption exists
 * - status: under if delta < 0, over if delta > 0, balanced if delta == 0, unknown if missing both
 * - confidence: high if both entitlement and consumption exist, medium if entitlement + assignments-derived consumption, low otherwise
 */
export function computeEffectivePositions(state: LicensingHubState): EffectiveLicensePosition[] {
  const positions: EffectiveLicensePosition[] = [];
  const now = new Date().toISOString();

  // Group entitlements by product and metric
  const entitlementsByProduct = new Map<string, Map<LicenseMetricUnit, number>>();
  for (const entitlement of state.entitlements) {
    if (!entitlement.isActive) continue;

    const productEntitlements = entitlementsByProduct.get(entitlement.productId) || new Map<LicenseMetricUnit, number>();
    const currentQuantity = productEntitlements.get(entitlement.metric) || 0;
    productEntitlements.set(entitlement.metric, currentQuantity + entitlement.quantity);
    entitlementsByProduct.set(entitlement.productId, productEntitlements);
  }

  // Group consumptions by product and metric (latest by measuredAt)
  const consumptionsByProduct = new Map<string, Map<LicenseMetricUnit, number>>();
  for (const consumption of state.consumptions) {
    const productConsumptions = consumptionsByProduct.get(consumption.productId) || new Map<LicenseMetricUnit, number>();
    const currentQuantity = productConsumptions.get(consumption.metric) || 0;
    productConsumptions.set(consumption.metric, currentQuantity + consumption.quantity);
    consumptionsByProduct.set(consumption.productId, productConsumptions);
  }

  // Count assignments by product (as fallback consumption)
  const assignmentsByProduct = new Map<string, number>();
  for (const assignment of state.assignments) {
    const count = assignmentsByProduct.get(assignment.productId) || 0;
    assignmentsByProduct.set(assignment.productId, count + 1);
  }

  // Get all unique product IDs
  const allProductIds = new Set([
    ...Array.from(entitlementsByProduct.keys()),
    ...Array.from(consumptionsByProduct.keys()),
    ...Array.from(assignmentsByProduct.keys())
  ]);

  for (const productId of allProductIds) {
    const productEntitlements = entitlementsByProduct.get(productId) || new Map<LicenseMetricUnit, number>();
    const productConsumptions = consumptionsByProduct.get(productId) || new Map<LicenseMetricUnit, number>();
    const assignmentCount = assignmentsByProduct.get(productId) || 0;

    // Get all metrics used for this product
    const allMetrics = new Set([
      ...Array.from(productEntitlements.keys()),
      ...Array.from(productConsumptions.keys())
    ]);

    for (const metric of allMetrics) {
      const entitled = productEntitlements.get(metric) || 0;
      const consumed = productConsumptions.get(metric) ||
                      (assignmentCount > 0 ? assignmentCount : 0); // Fallback to assignments

      const delta = entitled - consumed;

      let status: EffectiveLicensePosition['status'];
      if (entitled === 0 && consumed === 0) {
        status = 'unknown';
      } else if (delta < 0) {
        status = 'under';
      } else if (delta > 0) {
        status = 'over';
      } else {
        status = 'balanced';
      }

      // Determine confidence
      let confidence: EffectiveLicensePosition['confidence'];
      const hasEntitlements = entitled > 0;
      const hasConsumption = productConsumptions.has(metric);
      const hasAssignments = assignmentCount > 0;

      if (hasEntitlements && hasConsumption) {
        confidence = 'high';
      } else if (hasEntitlements && (hasConsumption || hasAssignments)) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }

      positions.push({
        productId,
        metric,
        entitled,
        consumed,
        delta,
        status,
        confidence,
        lastComputedAt: now,
        notes: confidence === 'low' ? 'Limited data available for accurate calculation' : undefined
      });
    }
  }

  return positions;
}