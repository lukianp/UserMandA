/**
 * Domain Discovered View
 *
 * Displays discovered Active Directory domain data:
 * - Domain controllers
 * - Domain trusts
 * - Forest topology
 * - Sites and subnets
 *
 * @module domain
 * @category infrastructure
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Domain discovered data view component
 */
export const DomainDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Domain"
      csvPath="DomainDiscovery.csv"
      title="Domain"
      description="Active Directory domain topology, domain controllers, trusts, and sites"
      enableSearch={true}
      enableExport={true}
      data-cy="domain-discovered-view"
    />
  );
};

export default DomainDiscoveredView;


