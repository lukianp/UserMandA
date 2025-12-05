# M&A Discovery Suite - Service Mesh Architecture
# Istio-based service mesh implementation for advanced traffic management and security

function Initialize-ServiceMesh {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [ValidateSet("Istio", "Linkerd", "Consul Connect")]
        [string]$ServiceMeshProvider = "Istio",
        
        [Parameter(Mandatory = $false)]
        [string]$MeshNamespace = "istio-system",
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableMTLS,
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableObservability,
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableCanaryDeployments,
        
        [Parameter(Mandatory = $false)]
        [string]$ConfigPath = ".\Config\ServiceMesh\Configuration.json",
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\ServiceMesh.log"
    )
    
    Begin {
        Write-Host "🕸️ M&A Discovery Suite - Service Mesh Architecture" -ForegroundColor Cyan
        Write-Host "===================================================" -ForegroundColor Cyan
        
        # Initialize service mesh session
        $global:ServiceMeshSession = @{
            Provider = $ServiceMeshProvider
            Namespace = $MeshNamespace
            StartTime = Get-Date
            Services = @{}
            VirtualServices = @{}
            DestinationRules = @{}
            Gateways = @{}
            Policies = @{}
            Certificates = @{}
        }
        
        Write-Log "Initializing service mesh with provider: $ServiceMeshProvider" $LogFile
    }
    
    Process {
        try {
            # Load service mesh configuration
            Write-Host "📋 Loading service mesh configuration..." -ForegroundColor Yellow
            $meshConfig = Initialize-ServiceMeshConfiguration -ConfigPath $ConfigPath
            
            # Validate prerequisites
            Write-Host "🔍 Validating service mesh prerequisites..." -ForegroundColor Yellow
            Test-ServiceMeshPrerequisites -Provider $ServiceMeshProvider
            
            # Install service mesh control plane
            Write-Host "⚙️ Installing service mesh control plane..." -ForegroundColor Green
            Install-ServiceMeshControlPlane -Provider $ServiceMeshProvider -Config $meshConfig
            
            # Configure traffic management
            Write-Host "🚦 Configuring traffic management..." -ForegroundColor Yellow
            Initialize-TrafficManagement -Config $meshConfig
            
            # Setup security policies
            Write-Host "🔒 Setting up security policies..." -ForegroundColor Yellow
            Initialize-SecurityPolicies -Config $meshConfig -EnableMTLS:$EnableMTLS
            
            # Configure observability
            if ($EnableObservability) {
                Write-Host "📊 Configuring observability stack..." -ForegroundColor Yellow
                Initialize-ObservabilityStack -Config $meshConfig
            }
            
            # Setup canary deployment capabilities
            if ($EnableCanaryDeployments) {
                Write-Host "🐦 Setting up canary deployment capabilities..." -ForegroundColor Yellow
                Initialize-CanaryDeployments -Config $meshConfig
            }
            
            # Generate service mesh manifests
            Write-Host "📄 Generating service mesh manifests..." -ForegroundColor Yellow
            Export-ServiceMeshManifests -Config $meshConfig
            
            Write-Host "✅ Service mesh architecture initialized successfully!" -ForegroundColor Green
            
        } catch {
            Write-Error "Service mesh initialization failed: $($_.Exception.Message)"
            Write-Log "CRITICAL ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Initialize-ServiceMeshConfiguration {
    param([string]$ConfigPath)
    
    if (!(Test-Path $ConfigPath)) {
        # Create default service mesh configuration
        $defaultConfig = @{
            ServiceMesh = @{
                Provider = "Istio"
                Version = "1.18.0"
                Profile = "default"
                Namespace = "istio-system"
                IngressGateway = @{
                    Enabled = $true
                    LoadBalancerType = "LoadBalancer"
                    Ports = @(
                        @{ Port = 80; TargetPort = 8080; Name = "http" }
                        @{ Port = 443; TargetPort = 8443; Name = "https" }
                    )
                }
                EgressGateway = @{
                    Enabled = $false
                }
            }
            
            Services = @{
                "discovery-api" = @{
                    Port = 8080
                    Protocol = "HTTP"
                    TrafficPolicy = @{
                        LoadBalancer = "ROUND_ROBIN"
                        ConnectionPool = @{
                            TCP = @{ MaxConnections = 100 }
                            HTTP = @{
                                HTTP1MaxPendingRequests = 64
                                HTTP2MaxRequests = 100
                                MaxRequestsPerConnection = 2
                                MaxRetries = 3
                            }
                        }
                        OutlierDetection = @{
                            ConsecutiveGatewayErrors = 5
                            Interval = "30s"
                            BaseEjectionTime = "30s"
                            MaxEjectionPercent = 50
                        }
                    }
                    Retry = @{
                        Attempts = 3
                        PerTryTimeout = "2s"
                        RetryOn = "gateway-error,connect-failure,refused-stream"
                    }
                    Timeout = "10s"
                    CircuitBreaker = @{
                        MaxConnections = 100
                        MaxPendingRequests = 50
                        MaxRequests = 200
                        MaxRetries = 10
                    }
                }
                
                "discovery-worker" = @{
                    Port = 8080
                    Protocol = "HTTP"
                    TrafficPolicy = @{
                        LoadBalancer = "LEAST_CONN"
                        ConnectionPool = @{
                            TCP = @{ MaxConnections = 50 }
                            HTTP = @{
                                HTTP1MaxPendingRequests = 32
                                HTTP2MaxRequests = 50
                                MaxRequestsPerConnection = 1
                            }
                        }
                    }
                    Timeout = "30s"
                }
                
                "database" = @{
                    Port = 1433
                    Protocol = "TCP"
                    TrafficPolicy = @{
                        LoadBalancer = "ROUND_ROBIN"
                        ConnectionPool = @{
                            TCP = @{
                                MaxConnections = 20
                                ConnectTimeout = "10s"
                                TcpKeepalive = @{
                                    Time = "7200s"
                                    Interval = "75s"
                                }
                            }
                        }
                    }
                }
                
                "redis" = @{
                    Port = 6379
                    Protocol = "TCP"
                    TrafficPolicy = @{
                        LoadBalancer = "CONSISTENT_HASH"
                        ConnectionPool = @{
                            TCP = @{ MaxConnections = 50 }
                        }
                    }
                }
            }
            
            Security = @{
                MTLS = @{
                    Mode = "STRICT"
                    MinProtocolVersion = "TLSV1_2"
                }
                AuthorizationPolicies = @{
                    DefaultDeny = $true
                    ServiceToService = $true
                    ExternalAccess = @{
                        AllowedSources = @("0.0.0.0/0")
                        RequireJWT = $true
                        JWTIssuer = "https://mandadiscovery.auth0.com/"
                    }
                }
                NetworkPolicies = @{
                    DenyAllDefault = $true
                    AllowSameNamespace = $true
                    AllowCrossTenant = $false
                }
            }
            
            TrafficManagement = @{
                VirtualServices = @{
                    "api-routing" = @{
                        Hosts = @("api.mandadiscovery.com")
                        Gateways = @("mandadiscovery-gateway")
                        Routes = @(
                            @{
                                Match = @{ Uri = @{ Prefix = "/api/v1/" } }
                                Destination = @{ Host = "discovery-api-service"; Port = 8080 }
                                Weight = 100
                            }
                            @{
                                Match = @{ Uri = @{ Prefix = "/api/v2/" } }
                                Destination = @{ Host = "discovery-api-v2-service"; Port = 8080 }
                                Weight = 0
                            }
                        )
                        Fault = @{
                            Delay = @{
                                Percentage = @{ Value = 0.1 }
                                FixedDelay = "5s"
                            }
                            Abort = @{
                                Percentage = @{ Value = 0.01 }
                                HttpStatus = 503
                            }
                        }
                    }
                }
                
                DestinationRules = @{
                    "api-destination" = @{
                        Host = "discovery-api-service"
                        Subsets = @(
                            @{
                                Name = "v1"
                                Labels = @{ version = "v1" }
                            }
                            @{
                                Name = "v2"
                                Labels = @{ version = "v2" }
                            }
                        )
                    }
                }
            }
            
            Observability = @{
                Tracing = @{
                    Provider = "Jaeger"
                    SamplingRate = 1.0
                    ZipkinAddress = "jaeger-collector.istio-system:14268"
                }
                Metrics = @{
                    Provider = "Prometheus"
                    EnableDefaultMetrics = $true
                    CustomMetrics = @(
                        "request_total", "request_duration", "request_size"
                    )
                }
                Logging = @{
                    AccessLogFormat = "JSON"
                    AccessLogFile = "/dev/stdout"
                    EnableAccessLog = $true
                }
            }
            
            CanaryDeployments = @{
                Enabled = $true
                Strategy = "TrafficSplitting"
                MetricsProvider = "Prometheus"
                SuccessRate = 99.0
                LatencyP99 = "500ms"
                CheckInterval = "1m"
                ThresholdChecks = 5
            }
        }
        
        # Ensure directory exists
        $configDir = Split-Path $ConfigPath -Parent
        if (!(Test-Path $configDir)) {
            New-Item -Path $configDir -ItemType Directory -Force | Out-Null
        }
        
        $defaultConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $ConfigPath -Encoding UTF8
        return $defaultConfig
    } else {
        return Get-Content $ConfigPath | ConvertFrom-Json
    }
}

function Test-ServiceMeshPrerequisites {
    param([string]$Provider)
    
    $prerequisites = @()
    
    # Check kubectl
    try {
        $kubectlVersion = kubectl version --client --short 2>$null
        Write-Host "   ✅ kubectl detected: $kubectlVersion" -ForegroundColor Green
    } catch {
        $prerequisites += "kubectl not installed or not accessible"
    }
    
    # Check Kubernetes cluster connectivity
    try {
        $clusterInfo = kubectl cluster-info --request-timeout=5s 2>$null
        if ($clusterInfo) {
            Write-Host "   ✅ Kubernetes cluster accessible" -ForegroundColor Green
        } else {
            $prerequisites += "Kubernetes cluster not accessible"
        }
    } catch {
        $prerequisites += "Kubernetes cluster connectivity issues"
    }
    
    # Provider-specific checks
    switch ($Provider) {
        "Istio" {
            try {
                $istioctl = istioctl version --short 2>$null
                if ($istioctl) {
                    Write-Host "   ✅ istioctl detected: $istioctl" -ForegroundColor Green
                } else {
                    $prerequisites += "istioctl not found - will install"
                }
            } catch {
                $prerequisites += "istioctl not found - will install"
            }
        }
        "Linkerd" {
            try {
                $linkerd = linkerd version --client 2>$null
                if ($linkerd) {
                    Write-Host "   ✅ linkerd CLI detected" -ForegroundColor Green
                } else {
                    $prerequisites += "linkerd CLI not found - will install"
                }
            } catch {
                $prerequisites += "linkerd CLI not found - will install"
            }
        }
    }
    
    if ($prerequisites.Count -gt 0) {
        Write-Warning "Prerequisites to address:"
        $prerequisites | ForEach-Object { Write-Warning "   - $_" }
    }
}

function Install-ServiceMeshControlPlane {
    param([string]$Provider, [object]$Config)
    
    $meshDir = ".\Deploy\ServiceMesh"
    if (!(Test-Path $meshDir)) {
        New-Item -Path $meshDir -ItemType Directory -Force | Out-Null
    }
    
    switch ($Provider) {
        "Istio" {
            Install-IstioControlPlane -Config $Config -OutputPath $meshDir
        }
        "Linkerd" {
            Install-LinkerdControlPlane -Config $Config -OutputPath $meshDir
        }
        "Consul Connect" {
            Install-ConsulConnectControlPlane -Config $Config -OutputPath $meshDir
        }
    }
}

function Install-IstioControlPlane {
    param([object]$Config, [string]$OutputPath)
    
    # Generate Istio installation manifest
    $istioInstall = @"
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: mandadiscovery-control-plane
  namespace: istio-system
spec:
  values:
    global:
      meshID: mandadiscovery-mesh
      multiCluster:
        clusterName: mandadiscovery-cluster
      network: mandadiscovery-network
  components:
    pilot:
      k8s:
        env:
          - name: PILOT_TRACE_SAMPLING
            value: "1.0"
          - name: PILOT_ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION
            value: true
        resources:
          requests:
            cpu: 500m
            memory: 2048Mi
          limits:
            cpu: 1000m
            memory: 4096Mi
    ingressGateways:
    - name: istio-ingressgateway
      enabled: $($Config.ServiceMesh.IngressGateway.Enabled.ToString().ToLower())
      k8s:
        service:
          type: $($Config.ServiceMesh.IngressGateway.LoadBalancerType)
          ports:
"@
    
    foreach ($port in $Config.ServiceMesh.IngressGateway.Ports) {
        $istioInstall += @"

          - port: $($port.Port)
            targetPort: $($port.TargetPort)
            name: $($port.Name)
"@
    }
    
    $istioInstall += @"

        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 2000m
            memory: 1024Mi
        hpaSpec:
          maxReplicas: 5
          minReplicas: 2
          scaleTargetRef:
            apiVersion: apps/v1
            kind: Deployment
            name: istio-ingressgateway
          targetCPUUtilizationPercentage: 80
    egressGateways:
    - name: istio-egressgateway
      enabled: $($Config.ServiceMesh.EgressGateway.Enabled.ToString().ToLower())
  meshConfig:
    accessLogFile: /dev/stdout
    accessLogFormat: |
      {
        "timestamp": "%START_TIME%",
        "method": "%REQ(:METHOD)%",
        "url": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
        "protocol": "%PROTOCOL%",
        "response_code": "%RESPONSE_CODE%",
        "response_flags": "%RESPONSE_FLAGS%",
        "bytes_received": "%BYTES_RECEIVED%",
        "bytes_sent": "%BYTES_SENT%",
        "duration": "%DURATION%",
        "upstream_service_time": "%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%",
        "x_forwarded_for": "%REQ(X-FORWARDED-FOR)%",
        "user_agent": "%REQ(USER-AGENT)%",
        "request_id": "%REQ(X-REQUEST-ID)%",
        "authority": "%REQ(:AUTHORITY)%",
        "upstream_host": "%UPSTREAM_HOST%",
        "upstream_cluster": "%UPSTREAM_CLUSTER%",
        "upstream_local_address": "%UPSTREAM_LOCAL_ADDRESS%",
        "downstream_local_address": "%DOWNSTREAM_LOCAL_ADDRESS%",
        "downstream_remote_address": "%DOWNSTREAM_REMOTE_ADDRESS%",
        "requested_server_name": "%REQUESTED_SERVER_NAME%",
        "route_name": "%ROUTE_NAME%"
      }
    tracing:
      zipkin:
        address: $($Config.Observability.Tracing.ZipkinAddress)
      sampling: $($Config.Observability.Tracing.SamplingRate)
    defaultConfig:
      proxyStatsMatcher:
        inclusionRegexps:
        - ".*circuit_breakers.*"
        - ".*upstream_rq_retry.*"
        - ".*upstream_rq_pending.*"
        - ".*_cx_.*"
"@
    
    $istioInstall | Out-File -FilePath (Join-Path $OutputPath "istio-control-plane.yaml") -Encoding UTF8
    
    Write-Host "   ⚙️ Istio control plane manifest generated" -ForegroundColor Green
}

function Initialize-TrafficManagement {
    param([object]$Config)
    
    $trafficDir = ".\Deploy\ServiceMesh\Traffic"
    if (!(Test-Path $trafficDir)) {
        New-Item -Path $trafficDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate Gateway
    Generate-ServiceMeshGateway -Config $Config -OutputPath $trafficDir
    
    # Generate Virtual Services
    Generate-VirtualServices -Config $Config -OutputPath $trafficDir
    
    # Generate Destination Rules
    Generate-DestinationRules -Config $Config -OutputPath $trafficDir
    
    Write-Host "   🚦 Traffic management configured" -ForegroundColor Green
}

function Generate-ServiceMeshGateway {
    param([object]$Config, [string]$OutputPath)
    
    $gateway = @"
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: mandadiscovery-gateway
  namespace: mandadiscovery
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "api.mandadiscovery.com"
    - "app.mandadiscovery.com"
    tls:
      httpsRedirect: true
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: mandadiscovery-tls-secret
    hosts:
    - "api.mandadiscovery.com"
    - "app.mandadiscovery.com"
"@
    
    $gateway | Out-File -FilePath (Join-Path $OutputPath "gateway.yaml") -Encoding UTF8
}

function Generate-VirtualServices {
    param([object]$Config, [string]$OutputPath)
    
    $virtualServices = @"
# M&A Discovery Suite - Virtual Services
"@
    
    foreach ($vsName in $Config.TrafficManagement.VirtualServices.PSObject.Properties.Name) {
        $vs = $Config.TrafficManagement.VirtualServices.$vsName
        
        $virtualServices += @"

---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: $vsName
  namespace: mandadiscovery
spec:
  hosts:
"@
        
        foreach ($host in $vs.Hosts) {
            $virtualServices += @"

  - "$host"
"@
        }
        
        $virtualServices += @"

  gateways:
"@
        
        foreach ($gateway in $vs.Gateways) {
            $virtualServices += @"

  - $gateway
"@
        }
        
        $virtualServices += @"

  http:
"@
        
        foreach ($route in $vs.Routes) {
            $virtualServices += @"

  - match:
    - uri:
        prefix: "$($route.Match.Uri.Prefix)"
    route:
    - destination:
        host: $($route.Destination.Host)
        port:
          number: $($route.Destination.Port)
      weight: $($route.Weight)
"@
            
            if ($vs.Fault) {
                $virtualServices += @"

    fault:
      delay:
        percentage:
          value: $($vs.Fault.Delay.Percentage.Value)
        fixedDelay: $($vs.Fault.Delay.FixedDelay)
      abort:
        percentage:
          value: $($vs.Fault.Abort.Percentage.Value)
        httpStatus: $($vs.Fault.Abort.HttpStatus)
"@
            }
        }
        
        if ($Config.Services.$($vs.Routes[0].Destination.Host -replace '-service', '').Retry) {
            $retry = $Config.Services.$($vs.Routes[0].Destination.Host -replace '-service', '').Retry
            $virtualServices += @"

    retries:
      attempts: $($retry.Attempts)
      perTryTimeout: $($retry.PerTryTimeout)
      retryOn: $($retry.RetryOn)
"@
        }
        
        if ($Config.Services.$($vs.Routes[0].Destination.Host -replace '-service', '').Timeout) {
            $timeout = $Config.Services.$($vs.Routes[0].Destination.Host -replace '-service', '').Timeout
            $virtualServices += @"

    timeout: $timeout
"@
        }
    }
    
    $virtualServices | Out-File -FilePath (Join-Path $OutputPath "virtual-services.yaml") -Encoding UTF8
}

function Generate-DestinationRules {
    param([object]$Config, [string]$OutputPath)
    
    $destinationRules = @"
# M&A Discovery Suite - Destination Rules
"@
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        
        $destinationRules += @"

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: $serviceName-destination
  namespace: mandadiscovery
spec:
  host: $serviceName-service
  trafficPolicy:
    loadBalancer:
      simple: $($service.TrafficPolicy.LoadBalancer)
"@
        
        if ($service.TrafficPolicy.ConnectionPool) {
            $destinationRules += @"

    connectionPool:
"@
            
            if ($service.TrafficPolicy.ConnectionPool.TCP) {
                $tcp = $service.TrafficPolicy.ConnectionPool.TCP
                $destinationRules += @"

      tcp:
        maxConnections: $($tcp.MaxConnections)
"@
                
                if ($tcp.ConnectTimeout) {
                    $destinationRules += @"

        connectTimeout: $($tcp.ConnectTimeout)
"@
                }
                
                if ($tcp.TcpKeepalive) {
                    $destinationRules += @"

        tcpKeepalive:
          time: $($tcp.TcpKeepalive.Time)
          interval: $($tcp.TcpKeepalive.Interval)
"@
                }
            }
            
            if ($service.TrafficPolicy.ConnectionPool.HTTP) {
                $http = $service.TrafficPolicy.ConnectionPool.HTTP
                $destinationRules += @"

      http:
        http1MaxPendingRequests: $($http.HTTP1MaxPendingRequests)
        http2MaxRequests: $($http.HTTP2MaxRequests)
        maxRequestsPerConnection: $($http.MaxRequestsPerConnection)
        maxRetries: $($http.MaxRetries)
"@
            }
        }
        
        if ($service.TrafficPolicy.OutlierDetection) {
            $outlier = $service.TrafficPolicy.OutlierDetection
            $destinationRules += @"

    outlierDetection:
      consecutiveGatewayErrors: $($outlier.ConsecutiveGatewayErrors)
      interval: $($outlier.Interval)
      baseEjectionTime: $($outlier.BaseEjectionTime)
      maxEjectionPercent: $($outlier.MaxEjectionPercent)
"@
        }
        
        if ($service.CircuitBreaker) {
            $cb = $service.CircuitBreaker
            $destinationRules += @"

    connectionPool:
      tcp:
        maxConnections: $($cb.MaxConnections)
      http:
        http1MaxPendingRequests: $($cb.MaxPendingRequests)
        http2MaxRequests: $($cb.MaxRequests)
        maxRetries: $($cb.MaxRetries)
"@
        }
    }
    
    # Add destination rules for versioned services (canary deployments)
    foreach ($drName in $Config.TrafficManagement.DestinationRules.PSObject.Properties.Name) {
        $dr = $Config.TrafficManagement.DestinationRules.$drName
        
        $destinationRules += @"

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: $drName
  namespace: mandadiscovery
spec:
  host: $($dr.Host)
  subsets:
"@
        
        foreach ($subset in $dr.Subsets) {
            $destinationRules += @"

  - name: $($subset.Name)
    labels:
"@
            
            foreach ($label in $subset.Labels.PSObject.Properties) {
                $destinationRules += @"

      $($label.Name): $($label.Value)
"@
            }
        }
    }
    
    $destinationRules | Out-File -FilePath (Join-Path $OutputPath "destination-rules.yaml") -Encoding UTF8
}

function Initialize-SecurityPolicies {
    param([object]$Config, [switch]$EnableMTLS)
    
    $securityDir = ".\Deploy\ServiceMesh\Security"
    if (!(Test-Path $securityDir)) {
        New-Item -Path $securityDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate PeerAuthentication for mTLS
    if ($EnableMTLS) {
        Generate-PeerAuthentication -Config $Config -OutputPath $securityDir
    }
    
    # Generate AuthorizationPolicies
    Generate-AuthorizationPolicies -Config $Config -OutputPath $securityDir
    
    # Generate NetworkPolicies
    Generate-ServiceMeshNetworkPolicies -Config $Config -OutputPath $securityDir
    
    Write-Host "   🔒 Security policies configured" -ForegroundColor Green
}

function Generate-PeerAuthentication {
    param([object]$Config, [string]$OutputPath)
    
    $peerAuth = @"
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: mandadiscovery-mtls
  namespace: mandadiscovery
spec:
  mtls:
    mode: $($Config.Security.MTLS.Mode)
---
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: mandadiscovery-mtls-global
  namespace: istio-system
spec:
  mtls:
    mode: $($Config.Security.MTLS.Mode)
"@
    
    $peerAuth | Out-File -FilePath (Join-Path $OutputPath "peer-authentication.yaml") -Encoding UTF8
}

function Generate-AuthorizationPolicies {
    param([object]$Config, [string]$OutputPath)
    
    $authzPolicies = @"
# Default deny all policy
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: mandadiscovery
spec: {}
---
# Allow ingress gateway to API services
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-ingress-to-api
  namespace: mandadiscovery
spec:
  selector:
    matchLabels:
      app: discovery-api
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account"]
  - to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
---
# Allow API to access database
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-api-to-database
  namespace: mandadiscovery
spec:
  selector:
    matchLabels:
      app: database
  rules:
  - from:
    - source:
        principals:
        - "cluster.local/ns/mandadiscovery/sa/discovery-api"
        - "cluster.local/ns/mandadiscovery/sa/discovery-worker"
        - "cluster.local/ns/mandadiscovery/sa/reporting-service"
        - "cluster.local/ns/mandadiscovery/sa/compliance-engine"
        - "cluster.local/ns/mandadiscovery/sa/threat-detection"
---
# Allow services to access Redis
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-services-to-redis
  namespace: mandadiscovery
spec:
  selector:
    matchLabels:
      app: redis
  rules:
  - from:
    - source:
        principals:
        - "cluster.local/ns/mandadiscovery/sa/discovery-api"
        - "cluster.local/ns/mandadiscovery/sa/discovery-worker"
        - "cluster.local/ns/mandadiscovery/sa/threat-detection"
---
# Allow worker to access API
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-worker-to-api
  namespace: mandadiscovery
spec:
  selector:
    matchLabels:
      app: discovery-api
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/mandadiscovery/sa/discovery-worker"]
    to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/api/internal/*"]
"@
    
    $authzPolicies | Out-File -FilePath (Join-Path $OutputPath "authorization-policies.yaml") -Encoding UTF8
}

function Initialize-ObservabilityStack {
    param([object]$Config)
    
    $observabilityDir = ".\Deploy\ServiceMesh\Observability"
    if (!(Test-Path $observabilityDir)) {
        New-Item -Path $observabilityDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate Jaeger configuration
    Generate-JaegerConfiguration -Config $Config -OutputPath $observabilityDir
    
    # Generate Prometheus configuration for service mesh
    Generate-ServiceMeshPrometheusConfig -Config $Config -OutputPath $observabilityDir
    
    # Generate Grafana dashboards
    Generate-ServiceMeshGrafanaDashboards -Config $Config -OutputPath $observabilityDir
    
    # Generate Telemetry v2 configuration
    Generate-TelemetryConfiguration -Config $Config -OutputPath $observabilityDir
    
    Write-Host "   📊 Observability stack configured" -ForegroundColor Green
}

function Generate-TelemetryConfiguration {
    param([object]$Config, [string]$OutputPath)
    
    $telemetry = @"
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: mandadiscovery-metrics
  namespace: mandadiscovery
spec:
  metrics:
  - providers:
    - name: prometheus
  - overrides:
    - match:
        metric: ALL_METRICS
      tagOverrides:
        source_app:
          value: "%{SOURCE_APP}"
        destination_service_name:
          value: "%{DESTINATION_SERVICE_NAME}"
        request_protocol:
          value: "%{REQUEST_PROTOCOL}"
---
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: mandadiscovery-tracing
  namespace: mandadiscovery
spec:
  tracing:
  - providers:
    - name: jaeger
  - customTags:
      user_id:
        header:
          name: "x-user-id"
      request_id:
        header:
          name: "x-request-id"
      tenant_id:
        header:
          name: "x-tenant-id"
---
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: mandadiscovery-access-logging
  namespace: mandadiscovery
spec:
  accessLogging:
  - providers:
    - name: otel
  - format: |
      {
        "timestamp": "%START_TIME%",
        "method": "%REQ(:METHOD)%",
        "url": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
        "protocol": "%PROTOCOL%",
        "response_code": "%RESPONSE_CODE%",
        "response_flags": "%RESPONSE_FLAGS%",
        "bytes_received": "%BYTES_RECEIVED%",
        "bytes_sent": "%BYTES_SENT%",
        "duration": "%DURATION%",
        "upstream_service_time": "%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%",
        "x_forwarded_for": "%REQ(X-FORWARDED-FOR)%",
        "user_agent": "%REQ(USER-AGENT)%",
        "request_id": "%REQ(X-REQUEST-ID)%",
        "authority": "%REQ(:AUTHORITY)%",
        "upstream_host": "%UPSTREAM_HOST%",
        "upstream_cluster": "%UPSTREAM_CLUSTER%",
        "route_name": "%ROUTE_NAME%",
        "source_app": "%{SOURCE_APP}%",
        "destination_app": "%{DESTINATION_APP}%"
      }
"@
    
    $telemetry | Out-File -FilePath (Join-Path $OutputPath "telemetry.yaml") -Encoding UTF8
}

function Initialize-CanaryDeployments {
    param([object]$Config)
    
    $canaryDir = ".\Deploy\ServiceMesh\Canary"
    if (!(Test-Path $canaryDir)) {
        New-Item -Path $canaryDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate Flagger configuration for automated canary deployments
    Generate-FlaggerConfiguration -Config $Config -OutputPath $canaryDir
    
    # Generate canary analysis templates
    Generate-CanaryAnalysisTemplates -Config $Config -OutputPath $canaryDir
    
    Write-Host "   🐦 Canary deployment capabilities configured" -ForegroundColor Green
}

function Generate-FlaggerConfiguration {
    param([object]$Config, [string]$OutputPath)
    
    $flagger = @"
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: discovery-api-canary
  namespace: mandadiscovery
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: discovery-api-deployment
  progressDeadlineSeconds: 60
  service:
    port: 8080
    targetPort: 8080
    gateways:
    - mandadiscovery-gateway
    hosts:
    - api.mandadiscovery.com
    trafficPolicy:
      tls:
        mode: DISABLE
  analysis:
    interval: $($Config.CanaryDeployments.CheckInterval)
    threshold: $($Config.CanaryDeployments.ThresholdChecks)
    maxWeight: 50
    stepWeight: 10
    metrics:
    - name: request-success-rate
      thresholdRange:
        min: $($Config.CanaryDeployments.SuccessRate)
      interval: 1m
    - name: request-duration
      thresholdRange:
        max: $($Config.CanaryDeployments.LatencyP99)
      interval: 30s
    webhooks:
    - name: acceptance-test
      type: pre-rollout
      url: http://flagger-loadtester.test/
      timeout: 30s
      metadata:
        type: bash
        cmd: "curl -sd 'test' http://discovery-api-canary:8080/api/health | grep ok"
    - name: load-test
      url: http://flagger-loadtester.test/
      timeout: 5s
      metadata:
        cmd: "hey -z 1m -q 10 -c 2 http://discovery-api-canary:8080/api/health"
"@
    
    $flagger | Out-File -FilePath (Join-Path $OutputPath "flagger-canary.yaml") -Encoding UTF8
}

function Export-ServiceMeshManifests {
    param([object]$Config)
    
    $manifestsDir = ".\Deploy\ServiceMesh\Manifests"
    if (!(Test-Path $manifestsDir)) {
        New-Item -Path $manifestsDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate deployment script
    $deployScript = @"
#!/bin/bash
# M&A Discovery Suite - Service Mesh Deployment Script

set -e

echo "🕸️ Deploying M&A Discovery Suite Service Mesh..."

# Install Istio control plane
echo "⚙️ Installing Istio control plane..."
kubectl apply -f istio-control-plane.yaml

# Wait for Istio to be ready
echo "⏳ Waiting for Istio control plane to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/istiod -n istio-system

# Label namespace for sidecar injection
echo "🏷️ Enabling sidecar injection..."
kubectl label namespace mandadiscovery istio-injection=enabled --overwrite

# Deploy traffic management
echo "🚦 Deploying traffic management..."
kubectl apply -f Traffic/

# Deploy security policies
echo "🔒 Deploying security policies..."
kubectl apply -f Security/

# Deploy observability stack
echo "📊 Deploying observability stack..."
kubectl apply -f Observability/

# Deploy canary configurations
echo "🐦 Deploying canary configurations..."
kubectl apply -f Canary/

echo "✅ Service mesh deployment completed successfully!"
echo "🌐 Access the application at: https://api.mandadiscovery.com"
echo "📊 Grafana dashboard: http://grafana.istio-system:3000"
echo "🔍 Jaeger tracing: http://jaeger.istio-system:16686"
"@
    
    $deployScript | Out-File -FilePath (Join-Path $manifestsDir "deploy.sh") -Encoding UTF8
    
    # Generate PowerShell deployment script
    $deployPowerShell = @"
# M&A Discovery Suite - Service Mesh Deployment Script (PowerShell)

Write-Host "🕸️ Deploying M&A Discovery Suite Service Mesh..." -ForegroundColor Cyan

try {
    # Install Istio control plane
    Write-Host "⚙️ Installing Istio control plane..." -ForegroundColor Yellow
    kubectl apply -f istio-control-plane.yaml
    
    # Wait for Istio to be ready
    Write-Host "⏳ Waiting for Istio control plane to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=available --timeout=300s deployment/istiod -n istio-system
    
    # Label namespace for sidecar injection
    Write-Host "🏷️ Enabling sidecar injection..." -ForegroundColor Yellow
    kubectl label namespace mandadiscovery istio-injection=enabled --overwrite
    
    # Deploy traffic management
    Write-Host "🚦 Deploying traffic management..." -ForegroundColor Yellow
    kubectl apply -f Traffic/
    
    # Deploy security policies
    Write-Host "🔒 Deploying security policies..." -ForegroundColor Yellow
    kubectl apply -f Security/
    
    # Deploy observability stack
    Write-Host "📊 Deploying observability stack..." -ForegroundColor Yellow
    kubectl apply -f Observability/
    
    # Deploy canary configurations
    Write-Host "🐦 Deploying canary configurations..." -ForegroundColor Yellow
    kubectl apply -f Canary/
    
    Write-Host "✅ Service mesh deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Access the application at: https://api.mandadiscovery.com" -ForegroundColor Cyan
    Write-Host "📊 Grafana dashboard: http://grafana.istio-system:3000" -ForegroundColor Cyan
    Write-Host "🔍 Jaeger tracing: http://jaeger.istio-system:16686" -ForegroundColor Cyan
    
} catch {
    Write-Error "Service mesh deployment failed: $($_.Exception.Message)"
    exit 1
}
"@
    
    $deployPowerShell | Out-File -FilePath (Join-Path $manifestsDir "deploy.ps1") -Encoding UTF8
    
    Write-Host "   📄 Service mesh manifests exported to: $manifestsDir" -ForegroundColor Green
}

function Write-Log {
    param([string]$Message, [string]$LogFile)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    
    try {
        $logEntry | Out-File -FilePath $LogFile -Append -Encoding UTF8
    } catch {
        Write-Warning "Could not write to log file: $($_.Exception.Message)"
    }
}

# Export module functions
Export-ModuleMember -Function Initialize-ServiceMesh

Write-Host "✅ Service Mesh Architecture module loaded successfully" -ForegroundColor Green