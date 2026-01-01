import { LicensingHubState, LicensingAlert } from '../../../../shared/types/licensing';

/**
 * Generates alerts based on licensing state
 */
export function generateAlerts(state: LicensingHubState, now: Date = new Date()): LicensingAlert[] {
  const alerts: LicensingAlert[] = [];
  const nowIso = now.toISOString();

  // Agreement expired alerts
  for (const agreement of state.agreements) {
    if (agreement.endDate) {
      const endDate = new Date(agreement.endDate);
      if (endDate < now) {
        alerts.push({
          alertId: `agreement-expired-${agreement.agreementId}`,
          severity: 'critical',
          category: 'agreement_expired',
          title: `Agreement "${agreement.name}" has expired`,
          detail: `The agreement expired on ${endDate.toLocaleDateString()}. Immediate action required.`,
          related: {
            agreementId: agreement.agreementId,
            vendorId: agreement.vendorId
          },
          createdAt: nowIso,
          evidence: agreement.evidence
        });
      } else if (agreement.renewalDate) {
        const renewalDate = new Date(agreement.renewalDate);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (renewalDate <= thirtyDaysFromNow) {
          alerts.push({
            alertId: `agreement-renewal-${agreement.agreementId}`,
            severity: 'warning',
            category: 'agreement_renewal_due',
            title: `Agreement "${agreement.name}" renewal due soon`,
            detail: `Renewal date: ${renewalDate.toLocaleDateString()}. Plan renewal process.`,
            related: {
              agreementId: agreement.agreementId,
              vendorId: agreement.vendorId
            },
            createdAt: nowIso,
            evidence: agreement.evidence
          });
        }
      }
    }
  }

  // Under-licensed alerts (based on effective positions)
  for (const position of state.effectivePositions) {
    if (position.status === 'under' && position.confidence !== 'low') {
      const product = state.products.find(p => p.productId === position.productId);
      alerts.push({
        alertId: `under-licensed-${position.productId}-${position.metric}`,
        severity: 'critical',
        category: 'under_licensed',
        title: `Under-licensed: ${product?.name || position.productId}`,
        detail: `Entitled: ${position.entitled}, Consumed: ${position.consumed} (${Math.abs(position.delta)} shortfall). Immediate licensing action required.`,
        related: {
          productId: position.productId
        },
        createdAt: nowIso,
        evidence: product?.evidence || []
      });
    }
  }

  // Over-licensed alerts
  for (const position of state.effectivePositions) {
    if (position.status === 'over' && position.confidence !== 'low') {
      const product = state.products.find(p => p.productId === position.productId);
      alerts.push({
        alertId: `over-licensed-${position.productId}-${position.metric}`,
        severity: 'info',
        category: 'over_licensed',
        title: `Over-licensed: ${product?.name || position.productId}`,
        detail: `Entitled: ${position.entitled}, Consumed: ${position.consumed} (${position.delta} unused). Opportunity to optimize licensing costs.`,
        related: {
          productId: position.productId
        },
        createdAt: nowIso,
        evidence: product?.evidence || []
      });
    }
  }

  // Unused entitlements (entitlements with no consumption/assignments)
  for (const entitlement of state.entitlements) {
    if (!entitlement.isActive) continue;

    const hasConsumption = state.consumptions.some(c =>
      c.productId === entitlement.productId && c.metric === entitlement.metric
    );
    const hasAssignments = state.assignments.some(a =>
      a.productId === entitlement.productId
    );

    if (!hasConsumption && !hasAssignments) {
      const product = state.products.find(p => p.productId === entitlement.productId);
      const agreement = state.agreements.find(a => a.agreementId === entitlement.agreementId);

      alerts.push({
        alertId: `unused-entitlement-${entitlement.entitlementId}`,
        severity: 'warning',
        category: 'unused_entitlement',
        title: `Unused entitlement: ${product?.name || entitlement.productId}`,
        detail: `${entitlement.quantity} ${entitlement.metric} licenses purchased but not assigned or consumed.`,
        related: {
          productId: entitlement.productId,
          entitlementId: entitlement.entitlementId,
          agreementId: entitlement.agreementId
        },
        createdAt: nowIso,
        evidence: entitlement.evidence
      });
    }
  }

  // Discovery gap alerts
  const hasUsers = state.canonicalUsers.length > 0;
  const hasProducts = state.products.length > 0;
  const hasEntitlements = state.entitlements.length > 0;

  if (!hasUsers) {
    alerts.push({
      alertId: 'discovery-gap-users',
      severity: 'warning',
      category: 'discovery_gap',
      title: 'No user data discovered',
      detail: 'No canonical users found. Run Entra ID or Active Directory discovery to populate user licensing data.',
      createdAt: nowIso,
      evidence: []
    });
  }

  if (!hasProducts) {
    alerts.push({
      alertId: 'discovery-gap-products',
      severity: 'warning',
      category: 'discovery_gap',
      title: 'No product data discovered',
      detail: 'No licensing products found. Ensure licensing discovery modules have been run.',
      createdAt: nowIso,
      evidence: []
    });
  }

  if (!hasEntitlements) {
    alerts.push({
      alertId: 'discovery-gap-entitlements',
      severity: 'warning',
      category: 'discovery_gap',
      title: 'No entitlement data found',
      detail: 'No license entitlements configured. Add agreements and entitlements manually or import from SAM tools.',
      createdAt: nowIso,
      evidence: []
    });
  }

  // Sort alerts by severity (critical first, then warning, then info)
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}