/**
 * AWS Discovered View
 *
 * Displays AWS discovery results from CSV export
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';

import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';
import { AwsDiscoveryData } from '../../types/discoveryData';

const AWS_COLUMNS: ColDef<AwsDiscoveryData>[] = [
  { field: 'Name', headerName: 'Resource Name', sortable: true, filter: true, pinned: 'left', width: 200 },
  { field: 'ResourceType', headerName: 'Type', sortable: true, filter: true, width: 120 },
  { field: 'AccountId', headerName: 'Account ID', sortable: true, filter: true, width: 150 },
  { field: 'Region', headerName: 'Region', sortable: true, filter: true, width: 120 },
  { field: 'Arn', headerName: 'ARN', sortable: true, filter: true, width: 300 },
  { field: 'State', headerName: 'State', sortable: true, filter: true, width: 100 },
  { field: 'InstanceType', headerName: 'Instance Type', sortable: true, filter: true, width: 130 },
  { field: 'VpcId', headerName: 'VPC ID', sortable: true, filter: true, width: 150 },
  { field: 'SubnetId', headerName: 'Subnet ID', sortable: true, filter: true, width: 150 },
  { field: 'Tags', headerName: 'Tags', sortable: true, filter: true, width: 200 },
];

export const AWSDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewTemplate<AwsDiscoveryData>
      moduleName="AWS"
      csvPath="aws/results.csv"
      columns={AWS_COLUMNS}
      title="AWS Resources"
      description="Discovered data of AWS resources including EC2, S3, RDS, and other services"
      data-cy="aws-discovered-view"
    />
  );
};

export default AWSDiscoveredView;
