# M&A Discovery Suite - Microservices API Gateway
# Centralized API gateway with routing, authentication, rate limiting, and monitoring

function Initialize-APIGateway {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [ValidateSet("Kong", "Ambassador", "Istio", "Nginx", "Traefik")]
        [string]$GatewayProvider = "Kong",
        
        [Parameter(Mandatory = $false)]
        [string]$GatewayNamespace = "api-gateway",
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableRateLimiting,
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableAuthentication,
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableCaching,
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableLogging,
        
        [Parameter(Mandatory = $false)]
        [string]$ConfigPath = ".\Config\APIGateway\Configuration.json",
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\APIGateway.log"
    )
    
    Begin {
        Write-Host "🌐 M&A Discovery Suite - API Gateway Architecture" -ForegroundColor Cyan
        Write-Host "===================================================" -ForegroundColor Cyan
        
        # Initialize API Gateway session
        $global:APIGatewaySession = @{
            Provider = $GatewayProvider
            Namespace = $GatewayNamespace
            StartTime = Get-Date
            Routes = @{}
            Services = @{}
            Plugins = @{}
            Policies = @{}
            Authentication = @{}
            RateLimits = @{}
        }
        
        Write-Log "Initializing API Gateway with provider: $GatewayProvider" $LogFile
    }
    
    Process {
        try {
            # Load API Gateway configuration
            Write-Host "📋 Loading API Gateway configuration..." -ForegroundColor Yellow
            $gatewayConfig = Initialize-APIGatewayConfiguration -ConfigPath $ConfigPath
            
            # Validate prerequisites
            Write-Host "🔍 Validating API Gateway prerequisites..." -ForegroundColor Yellow
            Test-APIGatewayPrerequisites -Provider $GatewayProvider
            
            # Deploy API Gateway infrastructure
            Write-Host "⚙️ Deploying API Gateway infrastructure..." -ForegroundColor Green
            Deploy-APIGatewayInfrastructure -Provider $GatewayProvider -Config $gatewayConfig
            
            # Configure service routing
            Write-Host "🛣️ Configuring service routing..." -ForegroundColor Yellow
            Initialize-ServiceRouting -Config $gatewayConfig
            
            # Setup authentication if enabled
            if ($EnableAuthentication) {
                Write-Host "🔐 Setting up authentication..." -ForegroundColor Yellow
                Initialize-GatewayAuthentication -Config $gatewayConfig
            }
            
            # Configure rate limiting if enabled
            if ($EnableRateLimiting) {
                Write-Host "⚡ Configuring rate limiting..." -ForegroundColor Yellow
                Initialize-RateLimiting -Config $gatewayConfig
            }
            
            # Setup caching if enabled
            if ($EnableCaching) {
                Write-Host "💾 Setting up response caching..." -ForegroundColor Yellow
                Initialize-ResponseCaching -Config $gatewayConfig
            }
            
            # Configure logging and monitoring
            if ($EnableLogging) {
                Write-Host "📊 Configuring logging and monitoring..." -ForegroundColor Yellow
                Initialize-GatewayMonitoring -Config $gatewayConfig
            }
            
            # Generate API documentation
            Write-Host "📚 Generating API documentation..." -ForegroundColor Yellow
            Generate-APIDocumentation -Config $gatewayConfig
            
            # Export gateway configurations
            Write-Host "📄 Exporting gateway configurations..." -ForegroundColor Yellow
            Export-GatewayConfigurations -Config $gatewayConfig
            
            Write-Host "✅ API Gateway architecture initialized successfully!" -ForegroundColor Green
            
        } catch {
            Write-Error "API Gateway initialization failed: $($_.Exception.Message)"
            Write-Log "CRITICAL ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Initialize-APIGatewayConfiguration {
    param([string]$ConfigPath)
    
    if (!(Test-Path $ConfigPath)) {
        # Create default API Gateway configuration
        $defaultConfig = @{
            Gateway = @{
                Provider = "Kong"
                Version = "3.4"
                Namespace = "api-gateway"
                LoadBalancer = @{
                    Type = "LoadBalancer"
                    Ports = @(
                        @{ Port = 80; TargetPort = 8000; Name = "http" }
                        @{ Port = 443; TargetPort = 8443; Name = "https" }
                        @{ Port = 8001; TargetPort = 8001; Name = "admin" }
                    )
                }
                Database = @{
                    Type = "PostgreSQL"
                    Host = "postgres-service"
                    Port = 5432
                    Database = "kong"
                    Username = "kong"
                    PasswordSecret = "kong-postgres-password"
                }
                Resources = @{
                    Requests = @{ CPU = "500m"; Memory = "512Mi" }
                    Limits = @{ CPU = "2000m"; Memory = "2Gi" }
                }
                Replicas = 3
                AutoScaling = @{
                    Enabled = $true
                    MinReplicas = 2
                    MaxReplicas = 10
                    TargetCPUUtilization = 70
                }
            }
            
            Services = @{
                "discovery-api" = @{
                    Name = "discovery-api"
                    Host = "discovery-api-service.mandadiscovery.svc.cluster.local"
                    Port = 8080
                    Protocol = "HTTP"
                    Path = "/"
                    ConnectTimeout = 60000
                    WriteTimeout = 60000
                    ReadTimeout = 60000
                    Retries = 5
                    Tags = @("discovery", "api", "v1")
                }
                
                "discovery-worker" = @{
                    Name = "discovery-worker"
                    Host = "discovery-worker-service.mandadiscovery.svc.cluster.local"
                    Port = 8080
                    Protocol = "HTTP"
                    Path = "/"
                    ConnectTimeout = 30000
                    WriteTimeout = 30000
                    ReadTimeout = 30000
                    Retries = 3
                    Tags = @("discovery", "worker", "internal")
                }
                
                "reporting-service" = @{
                    Name = "reporting-service"
                    Host = "reporting-service.mandadiscovery.svc.cluster.local"
                    Port = 8081
                    Protocol = "HTTP"
                    Path = "/"
                    ConnectTimeout = 120000
                    WriteTimeout = 120000
                    ReadTimeout = 120000
                    Retries = 3
                    Tags = @("reporting", "api", "v1")
                }
                
                "compliance-engine" = @{
                    Name = "compliance-engine"
                    Host = "compliance-engine.mandadiscovery.svc.cluster.local"
                    Port = 8082
                    Protocol = "HTTP"
                    Path = "/"
                    ConnectTimeout = 90000
                    WriteTimeout = 90000
                    ReadTimeout = 90000
                    Retries = 3
                    Tags = @("compliance", "api", "v1")
                }
                
                "threat-detection" = @{
                    Name = "threat-detection"
                    Host = "threat-detection.mandadiscovery.svc.cluster.local"
                    Port = 8083
                    Protocol = "HTTP"
                    Path = "/"
                    ConnectTimeout = 60000
                    WriteTimeout = 60000
                    ReadTimeout = 60000
                    Retries = 5
                    Tags = @("security", "threat-detection", "v1")
                }
            }
            
            Routes = @{
                "discovery-api-routes" = @{
                    Name = "discovery-api-routes"
                    Service = "discovery-api"
                    Hosts = @("api.mandadiscovery.com")
                    Paths = @("/api/v1/discovery")
                    Methods = @("GET", "POST", "PUT", "DELETE")
                    StripPath = $false
                    PreserveHost = $true
                    Tags = @("discovery", "public")
                }
                
                "reporting-routes" = @{
                    Name = "reporting-routes"
                    Service = "reporting-service"
                    Hosts = @("api.mandadiscovery.com")
                    Paths = @("/api/v1/reports")
                    Methods = @("GET", "POST")
                    StripPath = $false
                    PreserveHost = $true
                    Tags = @("reporting", "public")
                }
                
                "compliance-routes" = @{
                    Name = "compliance-routes"
                    Service = "compliance-engine"
                    Hosts = @("api.mandadiscovery.com")
                    Paths = @("/api/v1/compliance")
                    Methods = @("GET", "POST")
                    StripPath = $false
                    PreserveHost = $true
                    Tags = @("compliance", "public")
                }
                
                "threat-detection-routes" = @{
                    Name = "threat-detection-routes"
                    Service = "threat-detection"
                    Hosts = @("api.mandadiscovery.com")
                    Paths = @("/api/v1/security")
                    Methods = @("GET", "POST")
                    StripPath = $false
                    PreserveHost = $true
                    Tags = @("security", "public")
                }
                
                "internal-worker-routes" = @{
                    Name = "internal-worker-routes"
                    Service = "discovery-worker"
                    Hosts = @("internal.mandadiscovery.com")
                    Paths = @("/api/internal/worker")
                    Methods = @("GET", "POST")
                    StripPath = $false
                    PreserveHost = $true
                    Tags = @("internal", "worker")
                }
            }
            
            Authentication = @{
                JWT = @{
                    Enabled = $true
                    Issuer = "https://mandadiscovery.auth0.com/"
                    Algorithm = "RS256"
                    SecretKey = "jwt-secret"
                    ClaimsToVerify = @("exp", "iss", "aud")
                    MaximumExpiration = 3600
                }
                
                KeyAuth = @{
                    Enabled = $true
                    KeyNames = @("apikey", "x-api-key")
                    KeyInBody = $false
                    KeyInQuery = $true
                    KeyInHeader = $true
                    HideCredentials = $true
                }
                
                BasicAuth = @{
                    Enabled = $false
                    HideCredentials = $true
                }
                
                OAuth2 = @{
                    Enabled = $false
                    Scopes = @("read", "write", "admin")
                    MandatoryScope = $true
                    TokenExpiration = 7200
                }
            }
            
            RateLimiting = @{
                Global = @{
                    Enabled = $true
                    RequestsPerSecond = 100
                    RequestsPerMinute = 1000
                    RequestsPerHour = 10000
                    RequestsPerDay = 100000
                    LimitBy = "ip"
                    Policy = "local"
                    FaultTolerant = $true
                    HideClientHeaders = $false
                }
                
                PerService = @{
                    "discovery-api" = @{
                        RequestsPerSecond = 50
                        RequestsPerMinute = 500
                        RequestsPerHour = 5000
                    }
                    
                    "reporting-service" = @{
                        RequestsPerSecond = 20
                        RequestsPerMinute = 200
                        RequestsPerHour = 2000
                    }
                    
                    "compliance-engine" = @{
                        RequestsPerSecond = 30
                        RequestsPerMinute = 300
                        RequestsPerHour = 3000
                    }
                }
                
                PerConsumer = @{
                    "premium-tier" = @{
                        RequestsPerSecond = 200
                        RequestsPerMinute = 2000
                        RequestsPerHour = 20000
                    }
                    
                    "standard-tier" = @{
                        RequestsPerSecond = 50
                        RequestsPerMinute = 500
                        RequestsPerHour = 5000
                    }
                    
                    "basic-tier" = @{
                        RequestsPerSecond = 10
                        RequestsPerMinute = 100
                        RequestsPerHour = 1000
                    }
                }
            }
            
            Caching = @{
                Enabled = $true
                Strategy = "memory"
                TTL = 300
                CacheControl = $true
                VaryByHeaders = @("Authorization", "Accept-Language")
                VaryByQueryParams = @("page", "limit", "sort")
                StorageBackend = "redis"
                RedisHost = "redis-service.mandadiscovery.svc.cluster.local"
                RedisPort = 6379
                RedisTimeout = 2000
            }
            
            Plugins = @{
                "cors" = @{
                    Enabled = $true
                    Origins = @("https://app.mandadiscovery.com", "https://admin.mandadiscovery.com")
                    Methods = @("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    Headers = @("Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "X-Auth-Token", "Authorization")
                    ExposedHeaders = @("X-Auth-Token", "X-Request-ID")
                    Credentials = $true
                    MaxAge = 3600
                }
                
                "request-size-limiting" = @{
                    Enabled = $true
                    AllowedPayloadSize = 10
                    SizeUnit = "megabytes"
                    RequireLengthHeader = $false
                }
                
                "response-transformer" = @{
                    Enabled = $true
                    RemoveHeaders = @("Server", "X-Powered-By")
                    AddHeaders = @{
                        "X-Frame-Options" = "DENY"
                        "X-Content-Type-Options" = "nosniff"
                        "X-XSS-Protection" = "1; mode=block"
                        "Strict-Transport-Security" = "max-age=31536000; includeSubDomains"
                    }
                }
                
                "prometheus" = @{
                    Enabled = $true
                    PerConsumer = $true
                    StatusCodeMetrics = $true
                    LatencyMetrics = $true
                    BandwidthMetrics = $true
                    UpstreamHealthMetrics = $true
                }
                
                "file-log" = @{
                    Enabled = $true
                    Path = "/tmp/access.log"
                    Reopen = $true
                }
                
                "http-log" = @{
                    Enabled = $true
                    HttpEndpoint = "http://logstash.monitoring.svc.cluster.local:5000"
                    Method = "POST"
                    Timeout = 10000
                    Keepalive = 60000
                }
            }
            
            Monitoring = @{
                Prometheus = @{
                    Enabled = $true
                    Port = 9542
                    Path = "/metrics"
                }
                
                HealthChecks = @{
                    Enabled = $true
                    Interval = 30
                    Timeout = 10
                    Retries = 3
                    SuccessThreshold = 1
                    FailureThreshold = 3
                }
                
                Logging = @{
                    Level = "info"
                    Format = "json"
                    Destination = "stdout"
                    RequestLogging = $true
                    ResponseLogging = $true
                }
            }
            
            Security = @{
                TLS = @{
                    Enabled = $true
                    CertificateSecret = "mandadiscovery-tls"
                    MinVersion = "1.2"
                    CipherSuites = @(
                        "TLS_AES_256_GCM_SHA384",
                        "TLS_CHACHA20_POLY1305_SHA256",
                        "TLS_AES_128_GCM_SHA256",
                        "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
                    )
                }
                
                IPRestriction = @{
                    Enabled = $false
                    Allow = @("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16")
                    Deny = @()
                }
                
                BotDetection = @{
                    Enabled = $true
                    Allow = @("googlebot", "bingbot", "slurp")
                    Deny = @("bot", "crawler", "spider")
                }
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

function Test-APIGatewayPrerequisites {
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
        "Kong" {
            try {
                $helmVersion = helm version --short 2>$null
                if ($helmVersion) {
                    Write-Host "   ✅ Helm detected: $helmVersion" -ForegroundColor Green
                } else {
                    $prerequisites += "Helm not found - required for Kong deployment"
                }
            } catch {
                $prerequisites += "Helm not found - required for Kong deployment"
            }
        }
    }
    
    if ($prerequisites.Count -gt 0) {
        Write-Warning "Prerequisites to address:"
        $prerequisites | ForEach-Object { Write-Warning "   - $_" }
    }
}

function Deploy-APIGatewayInfrastructure {
    param([string]$Provider, [object]$Config)
    
    $gatewayDir = ".\Deploy\APIGateway"
    if (!(Test-Path $gatewayDir)) {
        New-Item -Path $gatewayDir -ItemType Directory -Force | Out-Null
    }
    
    switch ($Provider) {
        "Kong" {
            Deploy-KongGateway -Config $Config -OutputPath $gatewayDir
        }
        "Ambassador" {
            Deploy-AmbassadorGateway -Config $Config -OutputPath $gatewayDir
        }
        "Nginx" {
            Deploy-NginxGateway -Config $Config -OutputPath $gatewayDir
        }
        "Traefik" {
            Deploy-TraefikGateway -Config $Config -OutputPath $gatewayDir
        }
    }
}

function Deploy-KongGateway {
    param([object]$Config, [string]$OutputPath)
    
    # Generate Kong namespace
    $namespace = @"
apiVersion: v1
kind: Namespace
metadata:
  name: $($Config.Gateway.Namespace)
  labels:
    name: $($Config.Gateway.Namespace)
"@
    
    $namespace | Out-File -FilePath (Join-Path $OutputPath "namespace.yaml") -Encoding UTF8
    
    # Generate PostgreSQL for Kong
    $postgres = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: $($Config.Gateway.Namespace)
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:13
        env:
        - name: POSTGRES_USER
          value: $($Config.Gateway.Database.Username)
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: kong-postgres-password
              key: password
        - name: POSTGRES_DB
          value: $($Config.Gateway.Database.Database)
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: $($Config.Gateway.Namespace)
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: $($Config.Gateway.Namespace)
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
apiVersion: v1
kind: Secret
metadata:
  name: kong-postgres-password
  namespace: $($Config.Gateway.Namespace)
type: Opaque
data:
  password: cG9zdGdyZXNwYXNzd29yZA==  # base64 encoded "postgrespassword"
"@
    
    $postgres | Out-File -FilePath (Join-Path $OutputPath "postgres.yaml") -Encoding UTF8
    
    # Generate Kong deployment
    $kong = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
  namespace: $($Config.Gateway.Namespace)
  labels:
    app: kong
spec:
  replicas: $($Config.Gateway.Replicas)
  selector:
    matchLabels:
      app: kong
  template:
    metadata:
      labels:
        app: kong
    spec:
      containers:
      - name: kong
        image: kong:$($Config.Gateway.Version)
        env:
        - name: KONG_DATABASE
          value: "postgres"
        - name: KONG_PG_HOST
          value: $($Config.Gateway.Database.Host)
        - name: KONG_PG_PORT
          value: "$($Config.Gateway.Database.Port)"
        - name: KONG_PG_USER
          value: $($Config.Gateway.Database.Username)
        - name: KONG_PG_PASSWORD
          valueFrom:
            secretKeyRef:
              name: $($Config.Gateway.Database.PasswordSecret)
              key: password
        - name: KONG_PG_DATABASE
          value: $($Config.Gateway.Database.Database)
        - name: KONG_PROXY_ACCESS_LOG
          value: "/dev/stdout"
        - name: KONG_ADMIN_ACCESS_LOG
          value: "/dev/stdout"
        - name: KONG_PROXY_ERROR_LOG
          value: "/dev/stderr"
        - name: KONG_ADMIN_ERROR_LOG
          value: "/dev/stderr"
        - name: KONG_ADMIN_LISTEN
          value: "0.0.0.0:8001"
        - name: KONG_PLUGINS
          value: "bundled,prometheus,rate-limiting,key-auth,jwt,cors,request-size-limiting,response-transformer,file-log,http-log"
        ports:
        - containerPort: 8000
          name: proxy
        - containerPort: 8443
          name: proxy-ssl
        - containerPort: 8001
          name: admin
        resources:
          requests:
            cpu: $($Config.Gateway.Resources.Requests.CPU)
            memory: $($Config.Gateway.Resources.Requests.Memory)
          limits:
            cpu: $($Config.Gateway.Resources.Limits.CPU)
            memory: $($Config.Gateway.Resources.Limits.Memory)
        livenessProbe:
          httpGet:
            path: /status
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /status/ready
            port: 8001
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: kong-proxy
  namespace: $($Config.Gateway.Namespace)
  labels:
    app: kong
spec:
  type: $($Config.Gateway.LoadBalancer.Type)
  selector:
    app: kong
  ports:
"@
    
    foreach ($port in $Config.Gateway.LoadBalancer.Ports) {
        $kong += @"

  - port: $($port.Port)
    targetPort: $($port.TargetPort)
    name: $($port.Name)
"@
    }
    
    $kong += @"

---
apiVersion: v1
kind: Service
metadata:
  name: kong-admin
  namespace: $($Config.Gateway.Namespace)
  labels:
    app: kong
spec:
  type: ClusterIP
  selector:
    app: kong
  ports:
  - port: 8001
    targetPort: 8001
    name: admin
"@
    
    $kong | Out-File -FilePath (Join-Path $OutputPath "kong.yaml") -Encoding UTF8
    
    # Generate Kong migration job
    $migration = @"
apiVersion: batch/v1
kind: Job
metadata:
  name: kong-migrations
  namespace: $($Config.Gateway.Namespace)
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: kong-migrations
        image: kong:$($Config.Gateway.Version)
        env:
        - name: KONG_DATABASE
          value: "postgres"
        - name: KONG_PG_HOST
          value: $($Config.Gateway.Database.Host)
        - name: KONG_PG_PORT
          value: "$($Config.Gateway.Database.Port)"
        - name: KONG_PG_USER
          value: $($Config.Gateway.Database.Username)
        - name: KONG_PG_PASSWORD
          valueFrom:
            secretKeyRef:
              name: $($Config.Gateway.Database.PasswordSecret)
              key: password
        - name: KONG_PG_DATABASE
          value: $($Config.Gateway.Database.Database)
        command: ["kong", "migrations", "bootstrap"]
"@
    
    $migration | Out-File -FilePath (Join-Path $OutputPath "kong-migrations.yaml") -Encoding UTF8
    
    # Generate HPA if auto-scaling is enabled
    if ($Config.Gateway.AutoScaling.Enabled) {
        $hpa = @"
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: kong-hpa
  namespace: $($Config.Gateway.Namespace)
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: kong
  minReplicas: $($Config.Gateway.AutoScaling.MinReplicas)
  maxReplicas: $($Config.Gateway.AutoScaling.MaxReplicas)
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: $($Config.Gateway.AutoScaling.TargetCPUUtilization)
"@
        
        $hpa | Out-File -FilePath (Join-Path $OutputPath "kong-hpa.yaml") -Encoding UTF8
    }
    
    Write-Host "   🐳 Kong Gateway manifests generated" -ForegroundColor Green
}

function Initialize-ServiceRouting {
    param([object]$Config)
    
    $routingDir = ".\Deploy\APIGateway\Routing"
    if (!(Test-Path $routingDir)) {
        New-Item -Path $routingDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate Kong services and routes configuration
    Generate-KongServices -Config $Config -OutputPath $routingDir
    Generate-KongRoutes -Config $Config -OutputPath $routingDir
    
    Write-Host "   🛣️ Service routing configured" -ForegroundColor Green
}

function Generate-KongServices {
    param([object]$Config, [string]$OutputPath)
    
    $services = @"
# Kong Services Configuration for M&A Discovery Suite
# Apply with: kubectl apply -f kong-services.yaml

"@
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        
        $services += @"
---
apiVersion: configuration.konghq.com/v1
kind: KongService
metadata:
  name: $($service.Name)
  namespace: $($Config.Gateway.Namespace)
  labels:
    app: kong
spec:
  name: $($service.Name)
  host: $($service.Host)
  port: $($service.Port)
  protocol: $($service.Protocol.ToLower())
  path: $($service.Path)
  connect_timeout: $($service.ConnectTimeout)
  write_timeout: $($service.WriteTimeout)
  read_timeout: $($service.ReadTimeout)
  retries: $($service.Retries)
  tags:
"@
        
        foreach ($tag in $service.Tags) {
            $services += @"

  - $tag
"@
        }
    }
    
    $services | Out-File -FilePath (Join-Path $OutputPath "kong-services.yaml") -Encoding UTF8
}

function Generate-KongRoutes {
    param([object]$Config, [string]$OutputPath)
    
    $routes = @"
# Kong Routes Configuration for M&A Discovery Suite
# Apply with: kubectl apply -f kong-routes.yaml

"@
    
    foreach ($routeName in $Config.Routes.PSObject.Properties.Name) {
        $route = $Config.Routes.$routeName
        
        $routes += @"
---
apiVersion: configuration.konghq.com/v1
kind: KongRoute
metadata:
  name: $($route.Name)
  namespace: $($Config.Gateway.Namespace)
  labels:
    app: kong
spec:
  name: $($route.Name)
  service: $($route.Service)
  hosts:
"@
        
        foreach ($host in $route.Hosts) {
            $routes += @"

  - $host
"@
        }
        
        $routes += @"

  paths:
"@
        
        foreach ($path in $route.Paths) {
            $routes += @"

  - $path
"@
        }
        
        $routes += @"

  methods:
"@
        
        foreach ($method in $route.Methods) {
            $routes += @"

  - $method
"@
        }
        
        $routes += @"

  strip_path: $($route.StripPath.ToString().ToLower())
  preserve_host: $($route.PreserveHost.ToString().ToLower())
  tags:
"@
        
        foreach ($tag in $route.Tags) {
            $routes += @"

  - $tag
"@
        }
    }
    
    $routes | Out-File -FilePath (Join-Path $OutputPath "kong-routes.yaml") -Encoding UTF8
}

function Initialize-GatewayAuthentication {
    param([object]$Config)
    
    $authDir = ".\Deploy\APIGateway\Authentication"
    if (!(Test-Path $authDir)) {
        New-Item -Path $authDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate authentication plugins
    Generate-AuthenticationPlugins -Config $Config -OutputPath $authDir
    
    # Generate consumers and credentials
    Generate-ConsumersAndCredentials -Config $Config -OutputPath $authDir
    
    Write-Host "   🔐 Authentication configured" -ForegroundColor Green
}

function Generate-AuthenticationPlugins {
    param([object]$Config, [string]$OutputPath)
    
    $authPlugins = @"
# Kong Authentication Plugins for M&A Discovery Suite
"@
    
    # JWT Plugin
    if ($Config.Authentication.JWT.Enabled) {
        $authPlugins += @"

---
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: jwt-auth
  namespace: $($Config.Gateway.Namespace)
spec:
  plugin: jwt
  config:
    uri_param_names:
    - jwt
    cookie_names:
    - jwt
    key_claim_name: iss
    secret_is_base64: false
    claims_to_verify:
"@
        
        foreach ($claim in $Config.Authentication.JWT.ClaimsToVerify) {
            $authPlugins += @"

    - $claim
"@
        }
        
        $authPlugins += @"

    maximum_expiration: $($Config.Authentication.JWT.MaximumExpiration)
    algorithm: $($Config.Authentication.JWT.Algorithm)
"@
    }
    
    # Key Auth Plugin
    if ($Config.Authentication.KeyAuth.Enabled) {
        $authPlugins += @"

---
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: key-auth
  namespace: $($Config.Gateway.Namespace)
spec:
  plugin: key-auth
  config:
    key_names:
"@
        
        foreach ($keyName in $Config.Authentication.KeyAuth.KeyNames) {
            $authPlugins += @"

    - $keyName
"@
        }
        
        $authPlugins += @"

    key_in_body: $($Config.Authentication.KeyAuth.KeyInBody.ToString().ToLower())
    key_in_query: $($Config.Authentication.KeyAuth.KeyInQuery.ToString().ToLower())
    key_in_header: $($Config.Authentication.KeyAuth.KeyInHeader.ToString().ToLower())
    hide_credentials: $($Config.Authentication.KeyAuth.HideCredentials.ToString().ToLower())
"@
    }
    
    $authPlugins | Out-File -FilePath (Join-Path $OutputPath "auth-plugins.yaml") -Encoding UTF8
}

function Initialize-RateLimiting {
    param([object]$Config)
    
    $rateLimitDir = ".\Deploy\APIGateway\RateLimiting"
    if (!(Test-Path $rateLimitDir)) {
        New-Item -Path $rateLimitDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate rate limiting plugins
    Generate-RateLimitingPlugins -Config $Config -OutputPath $rateLimitDir
    
    Write-Host "   ⚡ Rate limiting configured" -ForegroundColor Green
}

function Generate-RateLimitingPlugins {
    param([object]$Config, [string]$OutputPath)
    
    $rateLimitPlugins = @"
# Kong Rate Limiting Plugins for M&A Discovery Suite

# Global Rate Limiting
apiVersion: configuration.konghq.com/v1
kind: KongClusterPlugin
metadata:
  name: global-rate-limiting
  namespace: $($Config.Gateway.Namespace)
  labels:
    global: "true"
spec:
  plugin: rate-limiting
  config:
    second: $($Config.RateLimiting.Global.RequestsPerSecond)
    minute: $($Config.RateLimiting.Global.RequestsPerMinute)
    hour: $($Config.RateLimiting.Global.RequestsPerHour)
    day: $($Config.RateLimiting.Global.RequestsPerDay)
    limit_by: $($Config.RateLimiting.Global.LimitBy)
    policy: $($Config.RateLimiting.Global.Policy)
    fault_tolerant: $($Config.RateLimiting.Global.FaultTolerant.ToString().ToLower())
    hide_client_headers: $($Config.RateLimiting.Global.HideClientHeaders.ToString().ToLower())
"@
    
    # Per-service rate limiting
    foreach ($serviceName in $Config.RateLimiting.PerService.PSObject.Properties.Name) {
        $serviceRateLimit = $Config.RateLimiting.PerService.$serviceName
        
        $rateLimitPlugins += @"

---
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: $serviceName-rate-limiting
  namespace: $($Config.Gateway.Namespace)
spec:
  plugin: rate-limiting
  config:
    second: $($serviceRateLimit.RequestsPerSecond)
    minute: $($serviceRateLimit.RequestsPerMinute)
    hour: $($serviceRateLimit.RequestsPerHour)
    limit_by: ip
    policy: local
    fault_tolerant: true
"@
    }
    
    $rateLimitPlugins | Out-File -FilePath (Join-Path $OutputPath "rate-limiting-plugins.yaml") -Encoding UTF8
}

function Initialize-ResponseCaching {
    param([object]$Config)
    
    $cachingDir = ".\Deploy\APIGateway\Caching"
    if (!(Test-Path $cachingDir)) {
        New-Item -Path $cachingDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate caching plugins
    Generate-CachingPlugins -Config $Config -OutputPath $cachingDir
    
    Write-Host "   💾 Response caching configured" -ForegroundColor Green
}

function Generate-CachingPlugins {
    param([object]$Config, [string]$OutputPath)
    
    if ($Config.Caching.Enabled) {
        $cachingPlugin = @"
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: proxy-cache
  namespace: $($Config.Gateway.Namespace)
spec:
  plugin: proxy-cache
  config:
    response_code:
    - 200
    - 301
    - 404
    request_method:
    - GET
    - HEAD
    content_type:
    - text/plain
    - application/json
    - text/json
    cache_ttl: $($Config.Caching.TTL)
    cache_control: $($Config.Caching.CacheControl.ToString().ToLower())
    strategy: $($Config.Caching.Strategy)
    vary_headers:
"@
        
        foreach ($header in $Config.Caching.VaryByHeaders) {
            $cachingPlugin += @"

    - $header
"@
        }
        
        $cachingPlugin += @"

    vary_query_params:
"@
        
        foreach ($param in $Config.Caching.VaryByQueryParams) {
            $cachingPlugin += @"

    - $param
"@
        }
        
        if ($Config.Caching.StorageBackend -eq "redis") {
            $cachingPlugin += @"

    storage_backend: $($Config.Caching.StorageBackend)
    redis:
      host: $($Config.Caching.RedisHost)
      port: $($Config.Caching.RedisPort)
      timeout: $($Config.Caching.RedisTimeout)
"@
        }
        
        $cachingPlugin | Out-File -FilePath (Join-Path $OutputPath "caching-plugin.yaml") -Encoding UTF8
    }
}

function Initialize-GatewayMonitoring {
    param([object]$Config)
    
    $monitoringDir = ".\Deploy\APIGateway\Monitoring"
    if (!(Test-Path $monitoringDir)) {
        New-Item -Path $monitoringDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate monitoring plugins
    Generate-MonitoringPlugins -Config $Config -OutputPath $monitoringDir
    
    # Generate ServiceMonitor for Prometheus
    Generate-ServiceMonitor -Config $Config -OutputPath $monitoringDir
    
    Write-Host "   📊 Gateway monitoring configured" -ForegroundColor Green
}

function Generate-MonitoringPlugins {
    param([object]$Config, [string]$OutputPath)
    
    $monitoringPlugins = @"
# Kong Monitoring Plugins for M&A Discovery Suite

# Prometheus Plugin
apiVersion: configuration.konghq.com/v1
kind: KongClusterPlugin
metadata:
  name: prometheus
  namespace: $($Config.Gateway.Namespace)
  labels:
    global: "true"
spec:
  plugin: prometheus
  config:
    per_consumer: $($Config.Plugins.prometheus.PerConsumer.ToString().ToLower())
    status_code_metrics: $($Config.Plugins.prometheus.StatusCodeMetrics.ToString().ToLower())
    latency_metrics: $($Config.Plugins.prometheus.LatencyMetrics.ToString().ToLower())
    bandwidth_metrics: $($Config.Plugins.prometheus.BandwidthMetrics.ToString().ToLower())
    upstream_health_metrics: $($Config.Plugins.prometheus.UpstreamHealthMetrics.ToString().ToLower())
---
# HTTP Log Plugin
apiVersion: configuration.konghq.com/v1
kind: KongClusterPlugin
metadata:
  name: http-log
  namespace: $($Config.Gateway.Namespace)
  labels:
    global: "true"
spec:
  plugin: http-log
  config:
    http_endpoint: $($Config.Plugins."http-log".HttpEndpoint)
    method: $($Config.Plugins."http-log".Method)
    timeout: $($Config.Plugins."http-log".Timeout)
    keepalive: $($Config.Plugins."http-log".Keepalive)
"@
    
    $monitoringPlugins | Out-File -FilePath (Join-Path $OutputPath "monitoring-plugins.yaml") -Encoding UTF8
}

function Generate-APIDocumentation {
    param([object]$Config)
    
    $docsDir = ".\Deploy\APIGateway\Documentation"
    if (!(Test-Path $docsDir)) {
        New-Item -Path $docsDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate OpenAPI specification
    Generate-OpenAPISpec -Config $Config -OutputPath $docsDir
    
    # Generate Postman collection
    Generate-PostmanCollection -Config $Config -OutputPath $docsDir
    
    Write-Host "   📚 API documentation generated" -ForegroundColor Green
}

function Generate-OpenAPISpec {
    param([object]$Config, [string]$OutputPath)
    
    $openApiSpec = @"
openapi: 3.0.3
info:
  title: M&A Discovery Suite API
  description: |
    Enterprise-grade API for merger and acquisition discovery operations.
    
    ## Authentication
    This API uses JWT tokens for authentication. Include the token in the Authorization header:
    ```
    Authorization: Bearer <your-jwt-token>
    ```
    
    ## Rate Limiting
    - Global: $($Config.RateLimiting.Global.RequestsPerSecond) requests/second
    - Per service limits apply
    
    ## Caching
    - GET requests are cached for $($Config.Caching.TTL) seconds
    - Cache varies by Authorization header and query parameters
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@mandadiscovery.com
  license:
    name: Proprietary
servers:
  - url: https://api.mandadiscovery.com
    description: Production server
  - url: https://api-staging.mandadiscovery.com
    description: Staging server

paths:
  /api/v1/discovery:
    get:
      summary: List discovery operations
      tags:
        - Discovery
      security:
        - JWTAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: List of discovery operations
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      `$ref: '#/components/schemas/DiscoveryOperation'
                  meta:
                    `$ref: '#/components/schemas/PaginationMeta'
        '401':
          `$ref: '#/components/responses/Unauthorized'
        '429':
          `$ref: '#/components/responses/RateLimited'
    
    post:
      summary: Create discovery operation
      tags:
        - Discovery
      security:
        - JWTAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              `$ref: '#/components/schemas/CreateDiscoveryRequest'
      responses:
        '201':
          description: Discovery operation created
          content:
            application/json:
              schema:
                `$ref: '#/components/schemas/DiscoveryOperation'
        '400':
          `$ref: '#/components/responses/BadRequest'
        '401':
          `$ref: '#/components/responses/Unauthorized'
        '429':
          `$ref: '#/components/responses/RateLimited'

  /api/v1/reports:
    get:
      summary: List reports
      tags:
        - Reports
      security:
        - JWTAuth: []
      responses:
        '200':
          description: List of reports
          content:
            application/json:
              schema:
                type: array
                items:
                  `$ref: '#/components/schemas/Report'

  /api/v1/compliance:
    get:
      summary: Get compliance assessments
      tags:
        - Compliance
      security:
        - JWTAuth: []
      responses:
        '200':
          description: Compliance assessment results
          content:
            application/json:
              schema:
                `$ref: '#/components/schemas/ComplianceAssessment'

  /api/v1/security:
    get:
      summary: Get security analysis
      tags:
        - Security
      security:
        - JWTAuth: []
      responses:
        '200':
          description: Security analysis results
          content:
            application/json:
              schema:
                `$ref: '#/components/schemas/SecurityAnalysis'

components:
  securitySchemes:
    JWTAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    DiscoveryOperation:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        status:
          type: string
          enum: [pending, running, completed, failed]
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
    
    CreateDiscoveryRequest:
      type: object
      required:
        - name
        - company_profile
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 255
        company_profile:
          type: string
        modules:
          type: array
          items:
            type: string
    
    Report:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        type:
          type: string
        created_at:
          type: string
          format: date-time
    
    ComplianceAssessment:
      type: object
      properties:
        framework:
          type: string
        score:
          type: number
          minimum: 0
          maximum: 100
        risk_level:
          type: string
          enum: [low, medium, high, critical]
    
    SecurityAnalysis:
      type: object
      properties:
        threats_detected:
          type: integer
        risk_score:
          type: number
        last_scan:
          type: string
          format: date-time
    
    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        pages:
          type: integer
    
    Error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
  
  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            `$ref: '#/components/schemas/Error'
    
    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            `$ref: '#/components/schemas/Error'
    
    RateLimited:
      description: Rate limit exceeded
      content:
        application/json:
          schema:
            `$ref: '#/components/schemas/Error'
      headers:
        X-RateLimit-Limit:
          description: The number of allowed requests in the current period
          schema:
            type: integer
        X-RateLimit-Remaining:
          description: The number of remaining requests in the current period
          schema:
            type: integer
        X-RateLimit-Reset:
          description: The time at which the current rate limit window resets
          schema:
            type: integer
"@
    
    $openApiSpec | Out-File -FilePath (Join-Path $OutputPath "openapi.yaml") -Encoding UTF8
}

function Export-GatewayConfigurations {
    param([object]$Config)
    
    $exportDir = ".\Deploy\APIGateway\Export"
    if (!(Test-Path $exportDir)) {
        New-Item -Path $exportDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate deployment script
    $deployScript = @"
#!/bin/bash
# M&A Discovery Suite - API Gateway Deployment Script

set -e

echo "🌐 Deploying M&A Discovery Suite API Gateway..."

# Create namespace
echo "🏷️ Creating API Gateway namespace..."
kubectl apply -f namespace.yaml

# Deploy PostgreSQL
echo "🐘 Deploying PostgreSQL..."
kubectl apply -f postgres.yaml

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $($Config.Gateway.Namespace) --timeout=300s

# Run Kong migrations
echo "📦 Running Kong migrations..."
kubectl apply -f kong-migrations.yaml
kubectl wait --for=condition=complete job/kong-migrations -n $($Config.Gateway.Namespace) --timeout=300s

# Deploy Kong
echo "🐳 Deploying Kong..."
kubectl apply -f kong.yaml

# Wait for Kong to be ready
echo "⏳ Waiting for Kong to be ready..."
kubectl wait --for=condition=available deployment/kong -n $($Config.Gateway.Namespace) --timeout=300s

# Deploy HPA if enabled
if [ -f "kong-hpa.yaml" ]; then
    echo "📈 Deploying Kong HPA..."
    kubectl apply -f kong-hpa.yaml
fi

# Configure routing
echo "🛣️ Configuring service routing..."
kubectl apply -f Routing/

# Configure authentication
echo "🔐 Configuring authentication..."
kubectl apply -f Authentication/

# Configure rate limiting
echo "⚡ Configuring rate limiting..."
kubectl apply -f RateLimiting/

# Configure caching
echo "💾 Configuring caching..."
kubectl apply -f Caching/

# Configure monitoring
echo "📊 Configuring monitoring..."
kubectl apply -f Monitoring/

echo "✅ API Gateway deployment completed successfully!"
echo "🌐 Gateway URL: http://<EXTERNAL-IP>"
echo "🔧 Admin API: http://<EXTERNAL-IP>:8001"
echo "📊 Metrics: http://<EXTERNAL-IP>:9542/metrics"
"@
    
    $deployScript | Out-File -FilePath (Join-Path $exportDir "deploy.sh") -Encoding UTF8
    
    # Generate PowerShell deployment script
    $deployPowerShell = @"
# M&A Discovery Suite - API Gateway Deployment Script (PowerShell)

Write-Host "🌐 Deploying M&A Discovery Suite API Gateway..." -ForegroundColor Cyan

try {
    # Create namespace
    Write-Host "🏷️ Creating API Gateway namespace..." -ForegroundColor Yellow
    kubectl apply -f namespace.yaml
    
    # Deploy PostgreSQL
    Write-Host "🐘 Deploying PostgreSQL..." -ForegroundColor Yellow
    kubectl apply -f postgres.yaml
    
    # Wait for PostgreSQL to be ready
    Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod -l app=postgres -n $($Config.Gateway.Namespace) --timeout=300s
    
    # Run Kong migrations
    Write-Host "📦 Running Kong migrations..." -ForegroundColor Yellow
    kubectl apply -f kong-migrations.yaml
    kubectl wait --for=condition=complete job/kong-migrations -n $($Config.Gateway.Namespace) --timeout=300s
    
    # Deploy Kong
    Write-Host "🐳 Deploying Kong..." -ForegroundColor Yellow
    kubectl apply -f kong.yaml
    
    # Wait for Kong to be ready
    Write-Host "⏳ Waiting for Kong to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=available deployment/kong -n $($Config.Gateway.Namespace) --timeout=300s
    
    # Deploy HPA if enabled
    if (Test-Path "kong-hpa.yaml") {
        Write-Host "📈 Deploying Kong HPA..." -ForegroundColor Yellow
        kubectl apply -f kong-hpa.yaml
    }
    
    # Configure routing
    Write-Host "🛣️ Configuring service routing..." -ForegroundColor Yellow
    kubectl apply -f Routing/
    
    # Configure authentication
    Write-Host "🔐 Configuring authentication..." -ForegroundColor Yellow
    kubectl apply -f Authentication/
    
    # Configure rate limiting
    Write-Host "⚡ Configuring rate limiting..." -ForegroundColor Yellow
    kubectl apply -f RateLimiting/
    
    # Configure caching
    Write-Host "💾 Configuring caching..." -ForegroundColor Yellow
    kubectl apply -f Caching/
    
    # Configure monitoring
    Write-Host "📊 Configuring monitoring..." -ForegroundColor Yellow
    kubectl apply -f Monitoring/
    
    Write-Host "✅ API Gateway deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Gateway URL: http://<EXTERNAL-IP>" -ForegroundColor Cyan
    Write-Host "🔧 Admin API: http://<EXTERNAL-IP>:8001" -ForegroundColor Cyan
    Write-Host "📊 Metrics: http://<EXTERNAL-IP>:9542/metrics" -ForegroundColor Cyan
    
} catch {
    Write-Error "API Gateway deployment failed: $($_.Exception.Message)"
    exit 1
}
"@
    
    $deployPowerShell | Out-File -FilePath (Join-Path $exportDir "deploy.ps1") -Encoding UTF8
    
    Write-Host "   📄 Gateway configurations exported to: $exportDir" -ForegroundColor Green
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
Export-ModuleMember -Function Initialize-APIGateway

Write-Host "✅ Microservices API Gateway module loaded successfully" -ForegroundColor Green