/**
 * Connection Testing Service (Main Process)
 *
 * Provides connection testing and validation for source and target profiles.
 * Implements T-000 environment detection pattern from GUI/MainViewModel.cs
 *
 * Pattern from GUI/Services/ConnectionTestService.cs
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';

export interface ConnectionTestResult {
  success: boolean;
  serviceType: string;
  available: boolean;
  responseTime?: number;
  version?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface EnvironmentTestResult {
  testId: string;
  profileName: string;
  timestamp: string;
  overallSuccess: boolean;
  tests: ConnectionTestResult[];
  capabilities: string[];
  recommendations: string[];
}

/**
 * Connection Testing Service
 * Tests connectivity to various services (AD, Exchange, Azure AD, SharePoint, etc.)
 */
export class ConnectionTestingService extends EventEmitter {
  private activeTests: Map<string, boolean> = new Map();

  /**
   * Test connection to an Active Directory domain
   */
  async testActiveDirectory(domainController: string, credential?: { username: string; password: string }): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      console.log(`[ConnectionTest] Testing Active Directory: ${domainController}`);

      const script = `
        param($DomainController)

        try {
          $startTime = Get-Date

          # Test 1: DNS Resolution
          $resolved = Resolve-DnsName -Name $DomainController -ErrorAction Stop

          # Test 2: LDAP Port (389)
          $tcpClient = New-Object System.Net.Sockets.TcpClient
          $connectTask = $tcpClient.ConnectAsync($DomainController, 389)
          $timeout = [System.Threading.Tasks.Task]::Delay(5000)
          $completed = [System.Threading.Tasks.Task]::WaitAny(@($connectTask, $timeout))

          if ($completed -eq 0 -and $tcpClient.Connected) {
            $tcpClient.Close()

            # Test 3: Get Domain Info
            $domain = Get-ADDomain -Server $DomainController -ErrorAction Stop

            $responseTime = ((Get-Date) - $startTime).TotalMilliseconds

            $result = @{
              Success = $true
              Available = $true
              ResponseTime = $responseTime
              Version = $domain.DomainMode
              Details = @{
                DomainName = $domain.DNSRoot
                NetBiosName = $domain.NetBIOSName
                ForestName = $domain.Forest
                DomainControllers = @($domain.ReplicaDirectoryServers)
              }
            }

            Write-Output (ConvertTo-Json $result -Depth 10 -Compress)
          } else {
            throw "Connection timeout or failed"
          }
        } catch {
          $result = @{
            Success = $false
            Available = $false
            Error = $_.Exception.Message
          }
          Write-Output (ConvertTo-Json $result -Compress)
        }
      `;

      const result = await this.executePowerShellScript(script, { DomainController: domainController });

      return {
        serviceType: 'ActiveDirectory',
        ...result,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        success: false,
        serviceType: 'ActiveDirectory',
        available: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Test connection to Exchange Server
   */
  async testExchangeServer(serverUrl: string, credential?: { username: string; password: string }): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      console.log(`[ConnectionTest] Testing Exchange Server: ${serverUrl}`);

      const script = `
        param($ServerUrl)

        try {
          $startTime = Get-Date

          # Test connection to Exchange Web Services
          $uri = New-Object Uri($ServerUrl)
          $tcpClient = New-Object System.Net.Sockets.TcpClient
          $connectTask = $tcpClient.ConnectAsync($uri.Host, $uri.Port)
          $timeout = [System.Threading.Tasks.Task]::Delay(5000)
          $completed = [System.Threading.Tasks.Task]::WaitAny(@($connectTask, $timeout))

          if ($completed -eq 0 -and $tcpClient.Connected) {
            $tcpClient.Close()

            $responseTime = ((Get-Date) - $startTime).TotalMilliseconds

            $result = @{
              Success = $true
              Available = $true
              ResponseTime = $responseTime
              Details = @{
                ServerUrl = $ServerUrl
                Host = $uri.Host
                Port = $uri.Port
              }
            }

            Write-Output (ConvertTo-Json $result -Compress)
          } else {
            throw "Connection timeout or failed"
          }
        } catch {
          $result = @{
            Success = $false
            Available = $false
            Error = $_.Exception.Message
          }
          Write-Output (ConvertTo-Json $result -Compress)
        }
      `;

      const result = await this.executePowerShellScript(script, { ServerUrl: serverUrl });

      return {
        serviceType: 'Exchange',
        ...result,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        success: false,
        serviceType: 'Exchange',
        available: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Test connection to Azure AD (Microsoft Graph)
   */
  async testAzureAD(tenantId: string, clientId: string, clientSecret: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      console.log(`[ConnectionTest] Testing Azure AD: ${tenantId}`);

      const script = `
        param($TenantId, $ClientId, $ClientSecret)

        try {
          $startTime = Get-Date

          # Get access token
          $body = @{
            grant_type    = 'client_credentials'
            client_id     = $ClientId
            client_secret = $ClientSecret
            scope         = 'https://graph.microsoft.com/.default'
          }

          $tokenUrl = "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token"
          $tokenResponse = Invoke-RestMethod -Method Post -Uri $tokenUrl -Body $body -ContentType 'application/x-www-form-urlencoded'

          # Test Graph API
          $headers = @{
            Authorization = "Bearer $($tokenResponse.access_token)"
          }

          $orgResponse = Invoke-RestMethod -Method Get -Uri 'https://graph.microsoft.com/v1.0/organization' -Headers $headers

          $responseTime = ((Get-Date) - $startTime).TotalMilliseconds

          $result = @{
            Success = $true
            Available = $true
            ResponseTime = $responseTime
            Details = @{
              TenantId = $orgResponse.value[0].id
              DisplayName = $orgResponse.value[0].displayName
              TenantType = $orgResponse.value[0].tenantType
              VerifiedDomains = @($orgResponse.value[0].verifiedDomains.name)
            }
          }

          Write-Output (ConvertTo-Json $result -Depth 10 -Compress)
        } catch {
          $result = @{
            Success = $false
            Available = $false
            Error = $_.Exception.Message
          }
          Write-Output (ConvertTo-Json $result -Compress)
        }
      `;

      const result = await this.executePowerShellScript(script, {
        TenantId: tenantId,
        ClientId: clientId,
        ClientSecret: clientSecret
      });

      return {
        serviceType: 'AzureAD',
        ...result,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        success: false,
        serviceType: 'AzureAD',
        available: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Test comprehensive environment (T-000 pattern)
   * Tests all available services and generates capability matrix
   */
  async testEnvironment(config: {
    profileName: string;
    domainController?: string;
    exchangeServer?: string;
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    credential?: { username: string; password: string };
  }): Promise<EnvironmentTestResult> {
    const testId = `test-${Date.now()}`;
    this.activeTests.set(testId, true);

    try {
      console.log(`[ConnectionTest] Starting environment test: ${testId}`);
      this.emit('test:started', { testId, profileName: config.profileName });

      const tests: ConnectionTestResult[] = [];
      const capabilities: string[] = [];

      // Test Active Directory
      if (config.domainController) {
        this.emit('test:progress', { testId, service: 'ActiveDirectory', status: 'testing' });
        const adTest = await this.testActiveDirectory(config.domainController, config.credential);
        tests.push(adTest);

        if (adTest.success) {
          capabilities.push('ActiveDirectory');
          capabilities.push('UserDiscovery');
          capabilities.push('GroupDiscovery');
          capabilities.push('ComputerDiscovery');
        }
      }

      // Test Exchange
      if (config.exchangeServer) {
        this.emit('test:progress', { testId, service: 'Exchange', status: 'testing' });
        const exchangeTest = await this.testExchangeServer(config.exchangeServer, config.credential);
        tests.push(exchangeTest);

        if (exchangeTest.success) {
          capabilities.push('Exchange');
          capabilities.push('MailboxDiscovery');
        }
      }

      // Test Azure AD
      if (config.tenantId && config.clientId && config.clientSecret) {
        this.emit('test:progress', { testId, service: 'AzureAD', status: 'testing' });
        const azureTest = await this.testAzureAD(config.tenantId, config.clientId, config.clientSecret);
        tests.push(azureTest);

        if (azureTest.success) {
          capabilities.push('AzureAD');
          capabilities.push('CloudUserDiscovery');
          capabilities.push('AzureResourceDiscovery');
        }
      }

      // Generate recommendations
      const recommendations: string[] = [];
      const failedTests = tests.filter(t => !t.success);

      if (failedTests.length > 0) {
        recommendations.push(`${failedTests.length} service(s) failed connectivity tests. Review credentials and network configuration.`);
      }

      if (capabilities.includes('ActiveDirectory') && !capabilities.includes('Exchange')) {
        recommendations.push('Consider adding Exchange Server for mailbox discovery.');
      }

      if (capabilities.includes('ActiveDirectory') && !capabilities.includes('AzureAD')) {
        recommendations.push('Consider adding Azure AD for hybrid environment discovery.');
      }

      const result: EnvironmentTestResult = {
        testId,
        profileName: config.profileName,
        timestamp: new Date().toISOString(),
        overallSuccess: tests.every(t => t.success),
        tests,
        capabilities,
        recommendations
      };

      this.emit('test:completed', result);
      this.activeTests.delete(testId);

      return result;
    } catch (error: any) {
      this.emit('test:failed', { testId, error: error.message });
      this.activeTests.delete(testId);
      throw error;
    }
  }

  /**
   * Execute PowerShell script and parse JSON result
   */
  private async executePowerShellScript(script: string, params: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      // Build parameter arguments
      const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script];

      // Add parameters
      Object.entries(params).forEach(([key, value]) => {
        args.push('-' + key);
        args.push(String(value));
      });

      const child = spawn('powershell.exe', args, {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          try {
            const result = JSON.parse(stdout.trim());
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse PowerShell output: ${stdout}`));
          }
        } else {
          reject(new Error(stderr || `PowerShell exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Cancel active test
   */
  async cancelTest(testId: string): Promise<boolean> {
    if (this.activeTests.has(testId)) {
      this.activeTests.delete(testId);
      this.emit('test:cancelled', { testId });
      return true;
    }
    return false;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      activeTests: this.activeTests.size,
      testIds: Array.from(this.activeTests.keys())
    };
  }
}

// Singleton instance
let connectionTestingService: ConnectionTestingService | null = null;

export function getConnectionTestingService(): ConnectionTestingService {
  if (!connectionTestingService) {
    connectionTestingService = new ConnectionTestingService();
  }
  return connectionTestingService;
}

export default ConnectionTestingService;


