/**
 * License Pricing Data
 *
 * Estimated monthly per-user pricing for common Microsoft 365 and Azure SKUs.
 * Used for cost analysis in licensing discovery and reports.
 *
 * Note: These are estimated retail prices (USD) and may vary by region,
 * volume licensing agreements, or promotional pricing. Always verify
 * actual costs with your Microsoft licensing agreement.
 *
 * Last Updated: 2025-12-30
 * Source: Microsoft 365 pricing pages and common retail rates
 */

export interface LicensePriceInfo {
  /** Monthly price per user in USD */
  pricePerMonth: number;
  /** Human-readable product name */
  displayName: string;
  /** Product category */
  category: 'M365' | 'Office365' | 'EntraID' | 'EMS' | 'Exchange' | 'SharePoint' | 'Teams' | 'Power' | 'Intune' | 'Azure' | 'Other';
}

/**
 * SKU Part Number to pricing mapping
 * Keys are the SkuPartNumber values returned by Microsoft Graph API
 */
export const LICENSE_PRICING: Record<string, LicensePriceInfo> = {
  // ============================================
  // Microsoft 365 Suites
  // ============================================

  // Microsoft 365 E5
  'SPE_E5': { pricePerMonth: 57.00, displayName: 'Microsoft 365 E5', category: 'M365' },
  'ENTERPRISEPREMIUM': { pricePerMonth: 57.00, displayName: 'Microsoft 365 E5', category: 'M365' },
  'MICROSOFT_365_E5': { pricePerMonth: 57.00, displayName: 'Microsoft 365 E5', category: 'M365' },

  // Microsoft 365 E3
  'SPE_E3': { pricePerMonth: 36.00, displayName: 'Microsoft 365 E3', category: 'M365' },
  'ENTERPRISEPACK': { pricePerMonth: 36.00, displayName: 'Microsoft 365 E3', category: 'M365' },
  'MICROSOFT_365_E3': { pricePerMonth: 36.00, displayName: 'Microsoft 365 E3', category: 'M365' },

  // Microsoft 365 E1
  'STANDARDPACK': { pricePerMonth: 10.00, displayName: 'Microsoft 365 E1', category: 'M365' },
  'MICROSOFT_365_E1': { pricePerMonth: 10.00, displayName: 'Microsoft 365 E1', category: 'M365' },

  // Microsoft 365 F1/F3
  'SPE_F1': { pricePerMonth: 4.00, displayName: 'Microsoft 365 F1', category: 'M365' },
  'M365_F1': { pricePerMonth: 4.00, displayName: 'Microsoft 365 F1', category: 'M365' },
  'SPE_F3': { pricePerMonth: 8.00, displayName: 'Microsoft 365 F3', category: 'M365' },
  'M365_F3': { pricePerMonth: 8.00, displayName: 'Microsoft 365 F3', category: 'M365' },

  // Microsoft 365 Business
  'SMB_BUSINESS_PREMIUM': { pricePerMonth: 22.00, displayName: 'Microsoft 365 Business Premium', category: 'M365' },
  'O365_BUSINESS_PREMIUM': { pricePerMonth: 22.00, displayName: 'Microsoft 365 Business Premium', category: 'M365' },
  'SMB_BUSINESS_ESSENTIALS': { pricePerMonth: 6.00, displayName: 'Microsoft 365 Business Basic', category: 'M365' },
  'O365_BUSINESS_ESSENTIALS': { pricePerMonth: 6.00, displayName: 'Microsoft 365 Business Basic', category: 'M365' },
  'SMB_BUSINESS': { pricePerMonth: 12.50, displayName: 'Microsoft 365 Apps for Business', category: 'M365' },
  'O365_BUSINESS': { pricePerMonth: 12.50, displayName: 'Microsoft 365 Apps for Business', category: 'M365' },
  'SPB': { pricePerMonth: 12.50, displayName: 'Microsoft 365 Business Standard', category: 'M365' },

  // ============================================
  // Office 365 Plans
  // ============================================

  'ENTERPRISEWITHSCAL': { pricePerMonth: 23.00, displayName: 'Office 365 E4', category: 'Office365' },
  'OFFICESUBSCRIPTION': { pricePerMonth: 12.00, displayName: 'Microsoft 365 Apps for Enterprise', category: 'Office365' },
  'DEVELOPERPACK': { pricePerMonth: 25.00, displayName: 'Office 365 E3 Developer', category: 'Office365' },

  // ============================================
  // Entra ID (Azure AD)
  // ============================================

  'AAD_PREMIUM': { pricePerMonth: 6.00, displayName: 'Microsoft Entra ID P1', category: 'EntraID' },
  'AAD_PREMIUM_P1': { pricePerMonth: 6.00, displayName: 'Microsoft Entra ID P1', category: 'EntraID' },
  'AAD_PREMIUM_P2': { pricePerMonth: 9.00, displayName: 'Microsoft Entra ID P2', category: 'EntraID' },
  'AAD_BASIC': { pricePerMonth: 1.00, displayName: 'Microsoft Entra ID Basic', category: 'EntraID' },

  // ============================================
  // Enterprise Mobility + Security
  // ============================================

  'EMS': { pricePerMonth: 10.60, displayName: 'Enterprise Mobility + Security E3', category: 'EMS' },
  'EMSPREMIUM': { pricePerMonth: 16.40, displayName: 'Enterprise Mobility + Security E5', category: 'EMS' },
  'EMS_E3': { pricePerMonth: 10.60, displayName: 'Enterprise Mobility + Security E3', category: 'EMS' },
  'EMS_E5': { pricePerMonth: 16.40, displayName: 'Enterprise Mobility + Security E5', category: 'EMS' },

  // ============================================
  // Exchange Online
  // ============================================

  'EXCHANGESTANDARD': { pricePerMonth: 4.00, displayName: 'Exchange Online Plan 1', category: 'Exchange' },
  'EXCHANGE_L_STANDARD': { pricePerMonth: 4.00, displayName: 'Exchange Online Plan 1', category: 'Exchange' },
  'EXCHANGEENTERPRISE': { pricePerMonth: 8.00, displayName: 'Exchange Online Plan 2', category: 'Exchange' },
  'EXCHANGE_S_ENTERPRISE': { pricePerMonth: 8.00, displayName: 'Exchange Online Plan 2', category: 'Exchange' },
  'EXCHANGEARCHIVE': { pricePerMonth: 3.00, displayName: 'Exchange Online Archiving', category: 'Exchange' },
  'EXCHANGEDESKLESS': { pricePerMonth: 2.00, displayName: 'Exchange Online Kiosk', category: 'Exchange' },
  'EXCHANGE_S_DESKLESS': { pricePerMonth: 2.00, displayName: 'Exchange Online Kiosk', category: 'Exchange' },
  'EXCHANGEESSENTIALS': { pricePerMonth: 4.00, displayName: 'Exchange Online Essentials', category: 'Exchange' },
  'ATP_ENTERPRISE': { pricePerMonth: 2.00, displayName: 'Microsoft Defender for Office 365 P1', category: 'Exchange' },
  'THREAT_INTELLIGENCE': { pricePerMonth: 5.00, displayName: 'Microsoft Defender for Office 365 P2', category: 'Exchange' },

  // ============================================
  // SharePoint Online
  // ============================================

  'SHAREPOINTSTANDARD': { pricePerMonth: 5.00, displayName: 'SharePoint Online Plan 1', category: 'SharePoint' },
  'SHAREPOINTENTERPRISE': { pricePerMonth: 10.00, displayName: 'SharePoint Online Plan 2', category: 'SharePoint' },

  // ============================================
  // Microsoft Teams
  // ============================================

  'TEAMS_EXPLORATORY': { pricePerMonth: 0.00, displayName: 'Microsoft Teams Exploratory', category: 'Teams' },
  'TEAMS_FREE': { pricePerMonth: 0.00, displayName: 'Microsoft Teams Free', category: 'Teams' },
  'TEAMS_ESSENTIALS': { pricePerMonth: 4.00, displayName: 'Microsoft Teams Essentials', category: 'Teams' },
  'TEAMS_PREMIUM': { pricePerMonth: 10.00, displayName: 'Microsoft Teams Premium', category: 'Teams' },
  'MCOSTANDARD': { pricePerMonth: 2.00, displayName: 'Skype for Business Online Plan 2', category: 'Teams' },

  // ============================================
  // Power Platform
  // ============================================

  'POWER_BI_STANDARD': { pricePerMonth: 0.00, displayName: 'Power BI (Free)', category: 'Power' },
  'POWER_BI_PRO': { pricePerMonth: 10.00, displayName: 'Power BI Pro', category: 'Power' },
  'PBI_PREMIUM_PER_USER': { pricePerMonth: 20.00, displayName: 'Power BI Premium Per User', category: 'Power' },
  'POWERAUTOMATE_ATTENDEDRPA': { pricePerMonth: 15.00, displayName: 'Power Automate per User', category: 'Power' },
  'FLOW_FREE': { pricePerMonth: 0.00, displayName: 'Power Automate Free', category: 'Power' },
  'POWERAPPS_VIRAL': { pricePerMonth: 0.00, displayName: 'Power Apps Plan 1', category: 'Power' },
  'POWERAPPS_PER_USER': { pricePerMonth: 20.00, displayName: 'Power Apps per User Plan', category: 'Power' },

  // ============================================
  // Intune / Endpoint Management
  // ============================================

  'INTUNE_A': { pricePerMonth: 8.00, displayName: 'Microsoft Intune Plan 1', category: 'Intune' },
  'INTUNE_P2': { pricePerMonth: 4.00, displayName: 'Microsoft Intune Plan 2', category: 'Intune' },
  'WIN_DEF_ATP': { pricePerMonth: 5.20, displayName: 'Microsoft Defender for Endpoint P1', category: 'Intune' },
  'MDATP_XPLAT': { pricePerMonth: 5.20, displayName: 'Microsoft Defender for Endpoint P2', category: 'Intune' },

  // ============================================
  // Azure Services
  // ============================================

  'RIGHTSMANAGEMENT': { pricePerMonth: 2.00, displayName: 'Azure Information Protection P1', category: 'Azure' },
  'RIGHTSMANAGEMENT_ADHOC': { pricePerMonth: 2.00, displayName: 'Azure Rights Management', category: 'Azure' },
  'ATA': { pricePerMonth: 5.50, displayName: 'Microsoft Defender for Identity', category: 'Azure' },
  'MCAS': { pricePerMonth: 3.50, displayName: 'Microsoft Defender for Cloud Apps', category: 'Azure' },

  // ============================================
  // Project & Visio
  // ============================================

  'PROJECTPREMIUM': { pricePerMonth: 55.00, displayName: 'Project Plan 5', category: 'Other' },
  'PROJECTPROFESSIONAL': { pricePerMonth: 30.00, displayName: 'Project Plan 3', category: 'Other' },
  'PROJECT_P1': { pricePerMonth: 10.00, displayName: 'Project Plan 1', category: 'Other' },
  'VISIOCLIENT': { pricePerMonth: 15.00, displayName: 'Visio Plan 2', category: 'Other' },
  'VISIO_PLAN1_DEPT': { pricePerMonth: 5.00, displayName: 'Visio Plan 1', category: 'Other' },

  // ============================================
  // Other/Misc
  // ============================================

  'STREAM': { pricePerMonth: 0.00, displayName: 'Microsoft Stream', category: 'Other' },
  'FORMS_PRO': { pricePerMonth: 0.00, displayName: 'Microsoft Forms Pro', category: 'Other' },
  'WINDOWS_STORE': { pricePerMonth: 0.00, displayName: 'Windows Store for Business', category: 'Other' },
  'WIN10_PRO_ENT_SUB': { pricePerMonth: 7.00, displayName: 'Windows 10/11 Enterprise E3', category: 'Other' },
  'WIN10_VDA_E3': { pricePerMonth: 4.00, displayName: 'Windows 10/11 Enterprise E3 VDA', category: 'Other' },
  'WIN10_VDA_E5': { pricePerMonth: 11.00, displayName: 'Windows 10/11 Enterprise E5', category: 'Other' },
};

/**
 * Get pricing for a SKU
 * @param skuPartNumber The SKU part number from Microsoft Graph
 * @returns Price info or null if not found
 */
export function getLicensePrice(skuPartNumber: string): LicensePriceInfo | null {
  const upperSku = skuPartNumber?.toUpperCase();
  return LICENSE_PRICING[upperSku] || LICENSE_PRICING[skuPartNumber] || null;
}

/**
 * Calculate estimated monthly cost for a license
 * @param skuPartNumber The SKU part number
 * @param quantity Number of licenses
 * @returns Estimated monthly cost in USD
 */
export function calculateLicenseCost(skuPartNumber: string, quantity: number): number {
  const priceInfo = getLicensePrice(skuPartNumber);
  if (!priceInfo) {
    return 0; // Unknown SKU - can't estimate cost
  }
  return priceInfo.pricePerMonth * quantity;
}

/**
 * Calculate total estimated monthly cost for multiple licenses
 * @param licenses Array of {skuPartNumber, quantity} objects
 * @returns Total estimated monthly cost in USD
 */
export function calculateTotalLicenseCost(
  licenses: Array<{ skuPartNumber: string; quantity: number }>
): number {
  return licenses.reduce((total, license) => {
    return total + calculateLicenseCost(license.skuPartNumber, license.quantity);
  }, 0);
}

/**
 * Get display name for a SKU
 * @param skuPartNumber The SKU part number
 * @returns Human-readable name or the SKU itself if not found
 */
export function getLicenseDisplayName(skuPartNumber: string): string {
  const priceInfo = getLicensePrice(skuPartNumber);
  return priceInfo?.displayName || skuPartNumber;
}

/**
 * Get all known SKUs by category
 * @param category The category to filter by
 * @returns Array of SKU part numbers in that category
 */
export function getSkusByCategory(category: LicensePriceInfo['category']): string[] {
  return Object.entries(LICENSE_PRICING)
    .filter(([_, info]) => info.category === category)
    .map(([sku]) => sku);
}

/**
 * Check if a SKU is known (has pricing data)
 * @param skuPartNumber The SKU part number
 * @returns true if pricing data exists
 */
export function isKnownSku(skuPartNumber: string): boolean {
  return getLicensePrice(skuPartNumber) !== null;
}

export default LICENSE_PRICING;
