/**
 * AWS Cloud Infrastructure Discovery Types
 */

export type AWSDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';
export type AWSResourceType = 'ec2' | 's3' | 'rds' | 'lambda' | 'vpc' | 'iam' | 'elb' | 'cloudfront' | 'route53';
export type EC2InstanceState = 'pending' | 'running' | 'stopping' | 'stopped' | 'shutting-down' | 'terminated';
export type S3BucketACL = 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
export type RDSEngineType = 'mysql' | 'postgres' | 'mariadb' | 'oracle' | 'sqlserver' | 'aurora-mysql' | 'aurora-postgres';

export interface AWSDiscoveryConfig {
  id: string;
  name: string;
  awsRegions: string[];
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  resourceTypes: AWSResourceType[];
  includeTagDetails: boolean;
  includeCostEstimates: boolean;
  includeSecurityAnalysis: boolean;
  timeout: number;
  schedule?: {
    enabled: boolean;
    cronExpression: string;
    nextRun?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AWSDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: AWSDiscoveryStatus;
  regions: string[];
  ec2Instances: EC2Instance[];
  s3Buckets: S3Bucket[];
  rdsInstances: RDSInstance[];
  lambdaFunctions: LambdaFunction[];
  vpcs: VPC[];
  iamResources: IAMResources;
  loadBalancers: LoadBalancer[];
  totalResourcesFound: number;
  estimatedMonthlyCost?: number;
  securityFindings?: SecurityFinding[];
  errors: AWSDiscoveryError[];
  warnings: string[];
}

export interface EC2Instance {
  instanceId: string;
  instanceType: string;
  state: EC2InstanceState;
  region: string;
  availabilityZone: string;
  privateDnsName: string;
  publicDnsName?: string;
  privateIpAddress: string;
  publicIpAddress?: string;
  vpcId: string;
  subnetId: string;
  securityGroups: SecurityGroup[];
  keyName?: string;
  imageId: string;
  platform?: string;
  architecture: string;
  launchTime: Date;
  tags: Record<string, string>;
  monitoring: boolean;
  ebsOptimized: boolean;
  rootDeviceType: string;
  virtualizationType: string;
  cpuCores: number;
  memory: number;
  storage: StorageInfo[];
  estimatedMonthlyCost?: number;
}

export interface StorageInfo {
  deviceName: string;
  volumeId: string;
  volumeType: string;
  size: number;
  iops?: number;
  throughput?: number;
  encrypted: boolean;
  deleteOnTermination: boolean;
}

export interface SecurityGroup {
  groupId: string;
  groupName: string;
  description: string;
  vpcId: string;
  ingressRules: SecurityGroupRule[];
  egressRules: SecurityGroupRule[];
  tags: Record<string, string>;
}

export interface SecurityGroupRule {
  ipProtocol: string;
  fromPort?: number;
  toPort?: number;
  cidrIpv4?: string;
  cidrIpv6?: string;
  referencedGroupId?: string;
  description?: string;
}

export interface S3Bucket {
  name: string;
  region: string;
  creationDate: Date;
  owner: string;
  acl: S3BucketACL;
  versioning: boolean;
  encryption: {
    enabled: boolean;
    algorithm?: string;
    kmsKeyId?: string;
  };
  publicAccess: {
    blockPublicAcls: boolean;
    ignorePublicAcls: boolean;
    blockPublicPolicy: boolean;
    restrictPublicBuckets: boolean;
  };
  logging: {
    enabled: boolean;
    targetBucket?: string;
    targetPrefix?: string;
  };
  lifecycle: boolean;
  replication: boolean;
  objectCount?: number;
  totalSize?: number;
  tags: Record<string, string>;
  estimatedMonthlyCost?: number;
  securityRisks?: string[];
}

export interface RDSInstance {
  instanceIdentifier: string;
  instanceClass: string;
  engine: RDSEngineType;
  engineVersion: string;
  status: string;
  region: string;
  availabilityZone: string;
  multiAZ: boolean;
  endpoint: string;
  port: number;
  masterUsername: string;
  databaseName?: string;
  allocatedStorage: number;
  storageType: string;
  storageEncrypted: boolean;
  kmsKeyId?: string;
  vpcId: string;
  subnetGroup: string;
  securityGroups: SecurityGroup[];
  backupRetentionPeriod: number;
  preferredBackupWindow?: string;
  preferredMaintenanceWindow?: string;
  publiclyAccessible: boolean;
  performanceInsights: boolean;
  createdTime: Date;
  tags: Record<string, string>;
  estimatedMonthlyCost?: number;
}

export interface LambdaFunction {
  functionName: string;
  functionArn: string;
  runtime: string;
  handler: string;
  codeSize: number;
  description?: string;
  timeout: number;
  memorySize: number;
  lastModified: Date;
  codeSha256: string;
  version: string;
  vpcConfig?: {
    vpcId: string;
    subnetIds: string[];
    securityGroupIds: string[];
  };
  environment?: {
    variables: Record<string, string>;
  };
  role: string;
  layers?: string[];
  tags: Record<string, string>;
  state?: string;
  stateReason?: string;
  invocationsLast30Days?: number;
  estimatedMonthlyCost?: number;
}

export interface VPC {
  vpcId: string;
  cidrBlock: string;
  cidrBlockAssociations: string[];
  state: string;
  region: string;
  isDefault: boolean;
  dhcpOptionsId: string;
  instanceTenancy: string;
  subnets: Subnet[];
  routeTables: RouteTable[];
  internetGateways: InternetGateway[];
  natGateways: NatGateway[];
  vpcEndpoints: VPCEndpoint[];
  tags: Record<string, string>;
}

export interface Subnet {
  subnetId: string;
  vpcId: string;
  cidrBlock: string;
  availabilityZone: string;
  availableIpAddressCount: number;
  mapPublicIpOnLaunch: boolean;
  defaultForAz: boolean;
  state: string;
  tags: Record<string, string>;
}

export interface RouteTable {
  routeTableId: string;
  vpcId: string;
  routes: Route[];
  associations: RouteTableAssociation[];
  tags: Record<string, string>;
}

export interface Route {
  destinationCidrBlock?: string;
  gatewayId?: string;
  natGatewayId?: string;
  vpcPeeringConnectionId?: string;
  state: string;
}

export interface RouteTableAssociation {
  associationId: string;
  subnetId?: string;
  main: boolean;
}

export interface InternetGateway {
  internetGatewayId: string;
  attachments: { vpcId: string; state: string; }[];
  tags: Record<string, string>;
}

export interface NatGateway {
  natGatewayId: string;
  vpcId: string;
  subnetId: string;
  state: string;
  natGatewayAddresses: { publicIp: string; privateIp: string; }[];
  tags: Record<string, string>;
}

export interface VPCEndpoint {
  vpcEndpointId: string;
  vpcId: string;
  serviceName: string;
  state: string;
  routeTableIds: string[];
  subnetIds: string[];
  tags: Record<string, string>;
}

export interface IAMResources {
  users: IAMUser[];
  groups: IAMGroup[];
  roles: IAMRole[];
  policies: IAMPolicy[];
}

export interface IAMUser {
  userName: string;
  userId: string;
  arn: string;
  createDate: Date;
  passwordLastUsed?: Date;
  mfaEnabled: boolean;
  accessKeys: AccessKey[];
  groups: string[];
  attachedPolicies: string[];
  tags: Record<string, string>;
}

export interface AccessKey {
  accessKeyId: string;
  status: 'Active' | 'Inactive';
  createDate: Date;
  lastUsedDate?: Date;
  lastUsedRegion?: string;
}

export interface IAMGroup {
  groupName: string;
  groupId: string;
  arn: string;
  createDate: Date;
  attachedPolicies: string[];
  inlinePolicies: string[];
}

export interface IAMRole {
  roleName: string;
  roleId: string;
  arn: string;
  createDate: Date;
  assumeRolePolicyDocument: string;
  maxSessionDuration: number;
  attachedPolicies: string[];
  inlinePolicies: string[];
  tags: Record<string, string>;
}

export interface IAMPolicy {
  policyName: string;
  policyId: string;
  arn: string;
  defaultVersionId: string;
  attachmentCount: number;
  isAttachable: boolean;
  createDate: Date;
  updateDate: Date;
  description?: string;
}

export interface LoadBalancer {
  loadBalancerName: string;
  loadBalancerArn: string;
  dnsName: string;
  scheme: 'internet-facing' | 'internal';
  type: 'application' | 'network' | 'gateway';
  state: string;
  vpcId: string;
  availabilityZones: string[];
  securityGroups: string[];
  ipAddressType: string;
  createdTime: Date;
  tags: Record<string, string>;
}

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  resourceType: AWSResourceType;
  resourceId: string;
  title: string;
  description: string;
  recommendation: string;
  compliance?: string[];
}

export interface AWSDiscoveryError {
  timestamp: Date;
  region: string;
  resourceType: AWSResourceType;
  message: string;
  code?: string;
}

export interface AWSDiscoveryStats {
  totalResources: number;
  resourcesByType: Record<AWSResourceType, number>;
  resourcesByRegion: Record<string, number>;
  estimatedMonthlyCost: number;
  securityRiskCount: number;
  topCostResources: { type: AWSResourceType; id: string; cost: number; }[];
}

export interface AWSFilterState {
  searchText: string;
  selectedRegions: string[];
  selectedResourceTypes: AWSResourceType[];
  selectedStates: string[];
  showOnlySecurityRisks: boolean;
  costRange?: { min: number; max: number; };
}


