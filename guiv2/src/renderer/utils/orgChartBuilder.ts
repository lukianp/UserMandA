/**
 * Organizational Chart Builder
 * Parses Active Directory user data to build hierarchical org chart structure
 * Based on Manager field (DN references)
 */

export interface OrgChartNode {
  // User identity
  samAccountName: string;
  displayName: string;
  email: string;
  distinguishedName: string;

  // Organizational data
  title: string;
  department: string;
  office: string;
  company: string;

  // Hierarchy
  managerDN: string | null;
  directReports: OrgChartNode[];
  level: number; // Depth in org tree (0 = top executives)

  // Status
  isPrivileged: boolean;
  isDisabled: boolean;
  isServiceAccount: boolean;

  // Metrics
  spanOfControl: number; // Number of direct reports
  totalSubordinates: number; // Total people under this manager (all levels)
}

export interface OrgChartStats {
  totalNodes: number;
  topLevelManagers: number; // Users with no manager
  maxDepth: number;
  averageSpanOfControl: number;
  largestTeam: { manager: string; count: number };
  orphanedUsers: number; // Users whose manager DN doesn't exist
  serviceAccountsInChart: number;
}

/**
 * Build organizational chart from Active Directory user data
 */
export function buildOrgChart(users: any[]): {
  roots: OrgChartNode[];
  nodeMap: Map<string, OrgChartNode>;
  stats: OrgChartStats;
} {
  const nodeMap = new Map<string, OrgChartNode>();

  // Phase 1: Create nodes for all users
  users.forEach(user => {
    const node: OrgChartNode = {
      samAccountName: user.SamAccountName || '',
      displayName: user.DisplayName || user.SamAccountName || 'Unknown',
      email: user.EmailAddress || user.UserPrincipalName || '',
      distinguishedName: user.DistinguishedName || '',
      title: user.Title || 'No Title',
      department: user.Department || 'No Department',
      office: user.Office || '',
      company: user.Company || '',
      managerDN: user.Manager || null,
      directReports: [],
      level: 0,
      isPrivileged: parseBool(user.IsPrivileged),
      isDisabled: parseBool(user.IsDisabled),
      isServiceAccount: user.SamAccountName?.toLowerCase().includes('svc-') ||
                       user.SamAccountName?.toLowerCase().includes('service') ||
                       user.Title?.toLowerCase().includes('service') || false,
      spanOfControl: 0,
      totalSubordinates: 0,
    };

    nodeMap.set(node.distinguishedName, node);
  });

  // Phase 2: Build parent-child relationships
  const roots: OrgChartNode[] = [];
  const orphanedNodes: OrgChartNode[] = [];

  nodeMap.forEach(node => {
    if (!node.managerDN || node.managerDN.trim() === '') {
      // No manager = top-level executive
      roots.push(node);
    } else {
      const manager = nodeMap.get(node.managerDN);
      if (manager) {
        manager.directReports.push(node);
        manager.spanOfControl = manager.directReports.length;
      } else {
        // Manager DN doesn't exist (left company, external, etc.)
        orphanedNodes.push(node);
        roots.push(node); // Treat as root for now
      }
    }
  });

  // Phase 3: Calculate levels (depth from root)
  function calculateLevels(node: OrgChartNode, level: number) {
    node.level = level;
    node.directReports.forEach(report => calculateLevels(report, level + 1));
  }

  roots.forEach(root => calculateLevels(root, 0));

  // Phase 4: Calculate total subordinates (recursive count)
  function calculateTotalSubordinates(node: OrgChartNode): number {
    if (node.directReports.length === 0) {
      node.totalSubordinates = 0;
      return 0;
    }

    let total = node.directReports.length; // Direct reports
    node.directReports.forEach(report => {
      total += calculateTotalSubordinates(report); // Plus all their subordinates
    });

    node.totalSubordinates = total;
    return total;
  }

  roots.forEach(root => calculateTotalSubordinates(root));

  // Phase 5: Calculate statistics
  let maxDepth = 0;
  let totalSpan = 0;
  let managersCount = 0;
  let largestTeam = { manager: '', count: 0 };
  let serviceAccountsInChart = 0;

  nodeMap.forEach(node => {
    if (node.level > maxDepth) maxDepth = node.level;

    if (node.directReports.length > 0) {
      managersCount++;
      totalSpan += node.spanOfControl;

      if (node.spanOfControl > largestTeam.count) {
        largestTeam = {
          manager: node.displayName,
          count: node.spanOfControl,
        };
      }
    }

    if (node.isServiceAccount) {
      serviceAccountsInChart++;
    }
  });

  const stats: OrgChartStats = {
    totalNodes: nodeMap.size,
    topLevelManagers: roots.length,
    maxDepth: maxDepth,
    averageSpanOfControl: managersCount > 0 ? totalSpan / managersCount : 0,
    largestTeam,
    orphanedUsers: orphanedNodes.length,
    serviceAccountsInChart,
  };

  return { roots, nodeMap, stats };
}

/**
 * Search org chart for users matching query
 */
export function searchOrgChart(
  nodeMap: Map<string, OrgChartNode>,
  query: string
): OrgChartNode[] {
  const lowerQuery = query.toLowerCase();
  const results: OrgChartNode[] = [];

  nodeMap.forEach(node => {
    if (
      node.displayName.toLowerCase().includes(lowerQuery) ||
      node.samAccountName.toLowerCase().includes(lowerQuery) ||
      node.email.toLowerCase().includes(lowerQuery) ||
      node.title.toLowerCase().includes(lowerQuery) ||
      node.department.toLowerCase().includes(lowerQuery)
    ) {
      results.push(node);
    }
  });

  return results;
}

/**
 * Get path from root to specific user (breadcrumb trail)
 */
export function getPathToUser(
  nodeMap: Map<string, OrgChartNode>,
  userDN: string
): OrgChartNode[] {
  const path: OrgChartNode[] = [];
  let current = nodeMap.get(userDN);

  while (current) {
    path.unshift(current); // Add to beginning
    if (current.managerDN) {
      current = nodeMap.get(current.managerDN);
    } else {
      break;
    }
  }

  return path;
}

/**
 * Get all users in a specific department
 */
export function getUsersByDepartment(
  nodeMap: Map<string, OrgChartNode>
): Map<string, OrgChartNode[]> {
  const departmentMap = new Map<string, OrgChartNode[]>();

  nodeMap.forEach(node => {
    const dept = node.department || 'No Department';
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, []);
    }
    departmentMap.get(dept)!.push(node);
  });

  return departmentMap;
}

/**
 * Flatten org chart to array (for export/grid view)
 */
export function flattenOrgChart(roots: OrgChartNode[]): OrgChartNode[] {
  const flattened: OrgChartNode[] = [];

  function traverse(node: OrgChartNode) {
    flattened.push(node);
    node.directReports.forEach(report => traverse(report));
  }

  roots.forEach(root => traverse(root));

  return flattened;
}

/**
 * Helper: Parse boolean from string or boolean
 */
function parseBool(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}
