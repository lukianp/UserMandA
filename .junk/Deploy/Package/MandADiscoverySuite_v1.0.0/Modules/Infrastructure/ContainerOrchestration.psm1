# M&A Discovery Suite - Containerized Microservices Architecture
# Docker and Kubernetes orchestration for scalable enterprise deployment

function Initialize-ContainerInfrastructure {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [ValidateSet("Docker", "Kubernetes", "Both")]
        [string]$Platform = "Both",
        
        [Parameter(Mandatory = $false)]
        [string]$ConfigPath = ".\Config\Container\Infrastructure.json",
        
        [Parameter(Mandatory = $false)]
        [string]$DeploymentEnvironment = "Production",
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableServiceMesh,
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableAutoScaling,
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\ContainerOrchestration.log"
    )
    
    Begin {
        Write-Host "🐳 M&A Discovery Suite - Container Orchestration Engine" -ForegroundColor Cyan
        Write-Host "==========================================================" -ForegroundColor Cyan
        
        # Initialize container session
        $global:ContainerSession = @{
            Platform = $Platform
            Environment = $DeploymentEnvironment
            StartTime = Get-Date
            Services = @{}
            Networks = @{}
            Volumes = @{}
            ConfigMaps = @{}
            Secrets = @{}
            DeploymentStatus = @{}
        }
        
        Write-Log "Initializing container infrastructure for platform: $Platform" $LogFile
    }
    
    Process {
        try {
            # Load container configuration
            Write-Host "📋 Loading container configuration..." -ForegroundColor Yellow
            $containerConfig = Initialize-ContainerConfiguration -ConfigPath $ConfigPath
            
            # Validate container prerequisites
            Write-Host "🔍 Validating container prerequisites..." -ForegroundColor Yellow
            Test-ContainerPrerequisites -Platform $Platform
            
            # Generate Docker configurations
            if ($Platform -eq "Docker" -or $Platform -eq "Both") {
                Write-Host "🐳 Generating Docker configurations..." -ForegroundColor Green
                New-DockerConfigurations -Config $containerConfig
            }
            
            # Generate Kubernetes configurations
            if ($Platform -eq "Kubernetes" -or $Platform -eq "Both") {
                Write-Host "☸️ Generating Kubernetes configurations..." -ForegroundColor Green
                New-KubernetesConfigurations -Config $containerConfig -EnableServiceMesh:$EnableServiceMesh
            }
            
            # Setup container networking
            Write-Host "🌐 Setting up container networking..." -ForegroundColor Yellow
            Initialize-ContainerNetworking -Config $containerConfig
            
            # Configure persistent storage
            Write-Host "💾 Configuring persistent storage..." -ForegroundColor Yellow
            Initialize-PersistentStorage -Config $containerConfig
            
            # Setup monitoring and logging
            Write-Host "📊 Setting up monitoring and logging..." -ForegroundColor Yellow
            Initialize-ContainerMonitoring -Config $containerConfig
            
            # Configure auto-scaling if enabled
            if ($EnableAutoScaling) {
                Write-Host "📈 Configuring auto-scaling..." -ForegroundColor Yellow
                Initialize-AutoScaling -Config $containerConfig
            }
            
            Write-Host "✅ Container infrastructure initialized successfully!" -ForegroundColor Green
            
        } catch {
            Write-Error "Container infrastructure initialization failed: $($_.Exception.Message)"
            Write-Log "CRITICAL ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Initialize-ContainerConfiguration {
    param([string]$ConfigPath)
    
    if (!(Test-Path $ConfigPath)) {
        # Create default container configuration
        $defaultConfig = @{
            Services = @{
                "discovery-api" = @{
                    Image = "mandadiscovery/api"
                    Tag = "latest"
                    Port = 8080
                    Replicas = 3
                    Resources = @{
                        Requests = @{ CPU = "100m"; Memory = "256Mi" }
                        Limits = @{ CPU = "500m"; Memory = "512Mi" }
                    }
                    Environment = @{
                        "ASPNETCORE_ENVIRONMENT" = "Production"
                        "ConnectionStrings__DefaultConnection" = "Server=db;Database=MandADiscovery;Trusted_Connection=true;"
                    }
                    HealthCheck = @{
                        Path = "/health"
                        IntervalSeconds = 30
                        TimeoutSeconds = 10
                    }
                    Dependencies = @("database", "redis")
                }
                
                "discovery-worker" = @{
                    Image = "mandadiscovery/worker"
                    Tag = "latest"
                    Replicas = 5
                    Resources = @{
                        Requests = @{ CPU = "200m"; Memory = "512Mi" }
                        Limits = @{ CPU = "1000m"; Memory = "1Gi" }
                    }
                    Environment = @{
                        "WORKER_THREADS" = "10"
                        "BATCH_SIZE" = "100"
                    }
                    Dependencies = @("database", "redis", "discovery-api")
                }
                
                "database" = @{
                    Image = "mcr.microsoft.com/mssql/server"
                    Tag = "2022-latest"
                    Port = 1433
                    Replicas = 1
                    Resources = @{
                        Requests = @{ CPU = "500m"; Memory = "2Gi" }
                        Limits = @{ CPU = "2000m"; Memory = "4Gi" }
                    }
                    PersistentVolume = @{
                        Size = "100Gi"
                        StorageClass = "fast-ssd"
                    }
                    Environment = @{
                        "ACCEPT_EULA" = "Y"
                        "SA_PASSWORD" = "SecretReference:db-password"
                    }
                }
                
                "redis" = @{
                    Image = "redis"
                    Tag = "7-alpine"
                    Port = 6379
                    Replicas = 1
                    Resources = @{
                        Requests = @{ CPU = "100m"; Memory = "128Mi" }
                        Limits = @{ CPU = "200m"; Memory = "256Mi" }
                    }
                    PersistentVolume = @{
                        Size = "10Gi"
                        StorageClass = "standard"
                    }
                }
                
                "reporting-service" = @{
                    Image = "mandadiscovery/reporting"
                    Tag = "latest"
                    Port = 8081
                    Replicas = 2
                    Resources = @{
                        Requests = @{ CPU = "200m"; Memory = "512Mi" }
                        Limits = @{ CPU = "1000m"; Memory = "1Gi" }
                    }
                    Dependencies = @("database")
                }
                
                "compliance-engine" = @{
                    Image = "mandadiscovery/compliance"
                    Tag = "latest"
                    Port = 8082
                    Replicas = 2
                    Resources = @{
                        Requests = @{ CPU = "300m"; Memory = "768Mi" }
                        Limits = @{ CPU = "1500m"; Memory = "1.5Gi" }
                    }
                    Dependencies = @("database", "discovery-api")
                }
                
                "threat-detection" = @{
                    Image = "mandadiscovery/threat-detection"
                    Tag = "latest"
                    Port = 8083
                    Replicas = 3
                    Resources = @{
                        Requests = @{ CPU = "400m"; Memory = "1Gi" }
                        Limits = @{ CPU = "2000m"; Memory = "2Gi" }
                    }
                    Dependencies = @("database", "redis")
                }
                
                "web-ui" = @{
                    Image = "mandadiscovery/web-ui"
                    Tag = "latest"
                    Port = 80
                    Replicas = 2
                    Resources = @{
                        Requests = @{ CPU = "50m"; Memory = "128Mi" }
                        Limits = @{ CPU = "200m"; Memory = "256Mi" }
                    }
                    Dependencies = @("discovery-api", "reporting-service")
                }
                
                "nginx-proxy" = @{
                    Image = "nginx"
                    Tag = "alpine"
                    Port = 443
                    Replicas = 2
                    Resources = @{
                        Requests = @{ CPU = "100m"; Memory = "128Mi" }
                        Limits = @{ CPU = "300m"; Memory = "256Mi" }
                    }
                    ConfigMap = "nginx-config"
                    Dependencies = @("web-ui", "discovery-api")
                }
            }
            
            Networking = @{
                ServiceMeshEnabled = $false
                IngressController = "nginx"
                LoadBalancerType = "external"
                NetworkPolicies = $true
                TLSTermination = "edge"
            }
            
            Storage = @{
                DefaultStorageClass = "standard"
                BackupEnabled = $true
                BackupSchedule = "0 2 * * *"
                RetentionPolicy = "30d"
            }
            
            Monitoring = @{
                PrometheusEnabled = $true
                GrafanaEnabled = $true
                AlertManagerEnabled = $true
                LoggingStack = "ELK"
            }
            
            AutoScaling = @{
                Enabled = $true
                MinReplicas = 1
                MaxReplicas = 10
                TargetCPUUtilization = 70
                TargetMemoryUtilization = 80
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

function Test-ContainerPrerequisites {
    param([string]$Platform)
    
    $prerequisites = @()
    
    if ($Platform -eq "Docker" -or $Platform -eq "Both") {
        # Check Docker installation
        try {
            $dockerVersion = docker --version
            Write-Host "   ✅ Docker detected: $dockerVersion" -ForegroundColor Green
        } catch {
            $prerequisites += "Docker Engine not installed or not accessible"
        }
        
        # Check Docker Compose
        try {
            $composeVersion = docker-compose --version
            Write-Host "   ✅ Docker Compose detected: $composeVersion" -ForegroundColor Green
        } catch {
            $prerequisites += "Docker Compose not installed or not accessible"
        }
    }
    
    if ($Platform -eq "Kubernetes" -or $Platform -eq "Both") {
        # Check kubectl
        try {
            $kubectlVersion = kubectl version --client --short
            Write-Host "   ✅ kubectl detected: $kubectlVersion" -ForegroundColor Green
        } catch {
            $prerequisites += "kubectl not installed or not accessible"
        }
        
        # Check cluster connectivity
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
    }
    
    if ($prerequisites.Count -gt 0) {
        Write-Warning "Prerequisites missing:"
        $prerequisites | ForEach-Object { Write-Warning "   - $_" }
        throw "Container prerequisites not met"
    }
}

function New-DockerConfigurations {
    param([object]$Config)
    
    $dockerDir = ".\Deploy\Docker"
    if (!(Test-Path $dockerDir)) {
        New-Item -Path $dockerDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate docker-compose.yml
    $dockerCompose = Generate-DockerComposeFile -Config $Config
    $dockerCompose | Out-File -FilePath (Join-Path $dockerDir "docker-compose.yml") -Encoding UTF8
    
    # Generate individual Dockerfiles for custom services
    Generate-DockerFiles -Config $Config -OutputPath $dockerDir
    
    # Generate environment files
    Generate-DockerEnvironmentFiles -Config $Config -OutputPath $dockerDir
    
    Write-Host "   📄 Docker configurations generated in: $dockerDir" -ForegroundColor Green
}

function Generate-DockerComposeFile {
    param([object]$Config)
    
    $compose = @"
version: '3.8'

services:
"@
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        
        $compose += @"

  $serviceName`:
    image: $($service.Image):$($service.Tag)
    container_name: mandadiscovery_$serviceName
"@
        
        if ($service.Port) {
            $compose += @"

    ports:
      - "$($service.Port):$($service.Port)"
"@
        }
        
        if ($service.Environment) {
            $compose += @"

    environment:
"@
            foreach ($envVar in $service.Environment.PSObject.Properties) {
                $compose += @"

      - $($envVar.Name)=$($envVar.Value)
"@
            }
        }
        
        if ($service.PersistentVolume) {
            $volumeName = "$serviceName-data"
            $compose += @"

    volumes:
      - $volumeName`:/data
"@
        }
        
        if ($service.Dependencies) {
            $compose += @"

    depends_on:
"@
            foreach ($dep in $service.Dependencies) {
                $compose += @"

      - $dep
"@
            }
        }
        
        if ($service.HealthCheck) {
            $compose += @"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:$($service.Port)$($service.HealthCheck.Path)"]
      interval: $($service.HealthCheck.IntervalSeconds)s
      timeout: $($service.HealthCheck.TimeoutSeconds)s
      retries: 3
"@
        }
        
        $compose += @"

    restart: unless-stopped
    networks:
      - mandadiscovery-network
"@
    }
    
    # Add volumes section
    $compose += @"

volumes:
"@
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        if ($service.PersistentVolume) {
            $compose += @"

  $serviceName-data:
    driver: local
"@
        }
    }
    
    # Add networks section
    $compose += @"

networks:
  mandadiscovery-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
"@
    
    return $compose
}

function Generate-DockerFiles {
    param([object]$Config, [string]$OutputPath)
    
    # Generate Dockerfile for API service
    $apiDockerfile = @"
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["API/MandADiscovery.API.csproj", "API/"]
COPY ["Core/MandADiscovery.Core.csproj", "Core/"]
RUN dotnet restore "API/MandADiscovery.API.csproj"
COPY . .
WORKDIR "/src/API"
RUN dotnet build "MandADiscovery.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MandADiscovery.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MandADiscovery.API.dll"]
"@
    
    $apiDockerfile | Out-File -FilePath (Join-Path $OutputPath "Dockerfile.api") -Encoding UTF8
    
    # Generate Dockerfile for Worker service
    $workerDockerfile = @"
FROM mcr.microsoft.com/dotnet/runtime:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Worker/MandADiscovery.Worker.csproj", "Worker/"]
COPY ["Core/MandADiscovery.Core.csproj", "Core/"]
RUN dotnet restore "Worker/MandADiscovery.Worker.csproj"
COPY . .
WORKDIR "/src/Worker"
RUN dotnet build "MandADiscovery.Worker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MandADiscovery.Worker.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MandADiscovery.Worker.dll"]
"@
    
    $workerDockerfile | Out-File -FilePath (Join-Path $OutputPath "Dockerfile.worker") -Encoding UTF8
    
    # Generate Dockerfile for Web UI
    $webDockerfile = @"
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"@
    
    $webDockerfile | Out-File -FilePath (Join-Path $OutputPath "Dockerfile.web") -Encoding UTF8
}

function Generate-DockerEnvironmentFiles {
    param([object]$Config, [string]$OutputPath)
    
    # Generate .env file for docker-compose
    $envContent = @"
# M&A Discovery Suite Environment Configuration
COMPOSE_PROJECT_NAME=mandadiscovery
COMPOSE_FILE=docker-compose.yml

# Database Configuration
DB_PASSWORD=SecurePassword123!
DB_USER=sa
DB_NAME=MandADiscovery

# Redis Configuration
REDIS_PASSWORD=RedisPassword123!

# API Configuration
API_PORT=8080
JWT_SECRET=YourJWTSecretKeyHere
ENCRYPTION_KEY=YourEncryptionKeyHere

# Logging
LOG_LEVEL=Information
SERILOG_MINIMUM_LEVEL=Information

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
"@
    
    $envContent | Out-File -FilePath (Join-Path $OutputPath ".env") -Encoding UTF8
}

function New-KubernetesConfigurations {
    param([object]$Config, [switch]$EnableServiceMesh)
    
    $k8sDir = ".\Deploy\Kubernetes"
    if (!(Test-Path $k8sDir)) {
        New-Item -Path $k8sDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate namespace
    Generate-KubernetesNamespace -OutputPath $k8sDir
    
    # Generate ConfigMaps
    Generate-KubernetesConfigMaps -Config $Config -OutputPath $k8sDir
    
    # Generate Secrets
    Generate-KubernetesSecrets -Config $Config -OutputPath $k8sDir
    
    # Generate Services
    Generate-KubernetesServices -Config $Config -OutputPath $k8sDir
    
    # Generate Deployments
    Generate-KubernetesDeployments -Config $Config -OutputPath $k8sDir
    
    # Generate PersistentVolumes
    Generate-KubernetesPersistentVolumes -Config $Config -OutputPath $k8sDir
    
    # Generate Ingress
    Generate-KubernetesIngress -Config $Config -OutputPath $k8sDir
    
    # Generate HPA (Horizontal Pod Autoscaler)
    Generate-KubernetesHPA -Config $Config -OutputPath $k8sDir
    
    # Generate NetworkPolicies
    Generate-KubernetesNetworkPolicies -Config $Config -OutputPath $k8sDir
    
    if ($EnableServiceMesh) {
        Generate-ServiceMeshConfigurations -Config $Config -OutputPath $k8sDir
    }
    
    Write-Host "   📄 Kubernetes configurations generated in: $k8sDir" -ForegroundColor Green
}

function Generate-KubernetesNamespace {
    param([string]$OutputPath)
    
    $namespace = @"
apiVersion: v1
kind: Namespace
metadata:
  name: mandadiscovery
  labels:
    name: mandadiscovery
    environment: production
    app.kubernetes.io/name: mandadiscovery
    app.kubernetes.io/instance: production
    app.kubernetes.io/version: "1.0"
    app.kubernetes.io/component: namespace
    app.kubernetes.io/part-of: mandadiscovery-suite
    app.kubernetes.io/managed-by: powershell
"@
    
    $namespace | Out-File -FilePath (Join-Path $OutputPath "namespace.yaml") -Encoding UTF8
}

function Generate-KubernetesServices {
    param([object]$Config, [string]$OutputPath)
    
    $services = @"
# M&A Discovery Suite - Kubernetes Services
"@
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        
        if ($service.Port) {
            $services += @"

---
apiVersion: v1
kind: Service
metadata:
  name: $serviceName-service
  namespace: mandadiscovery
  labels:
    app: $serviceName
    component: service
spec:
  selector:
    app: $serviceName
  ports:
    - port: $($service.Port)
      targetPort: $($service.Port)
      protocol: TCP
      name: http
  type: ClusterIP
"@
        }
    }
    
    $services | Out-File -FilePath (Join-Path $OutputPath "services.yaml") -Encoding UTF8
}

function Generate-KubernetesDeployments {
    param([object]$Config, [string]$OutputPath)
    
    $deployments = @"
# M&A Discovery Suite - Kubernetes Deployments
"@
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        
        $deployments += @"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $serviceName-deployment
  namespace: mandadiscovery
  labels:
    app: $serviceName
    component: deployment
spec:
  replicas: $($service.Replicas)
  selector:
    matchLabels:
      app: $serviceName
  template:
    metadata:
      labels:
        app: $serviceName
        version: v1
    spec:
      containers:
      - name: $serviceName
        image: $($service.Image):$($service.Tag)
        imagePullPolicy: Always
"@
        
        if ($service.Port) {
            $deployments += @"

        ports:
        - containerPort: $($service.Port)
          name: http
"@
        }
        
        if ($service.Environment) {
            $deployments += @"

        env:
"@
            foreach ($envVar in $service.Environment.PSObject.Properties) {
                if ($envVar.Value -match "SecretReference:") {
                    $secretName = $envVar.Value -replace "SecretReference:", ""
                    $deployments += @"

        - name: $($envVar.Name)
          valueFrom:
            secretKeyRef:
              name: mandadiscovery-secrets
              key: $secretName
"@
                } else {
                    $deployments += @"

        - name: $($envVar.Name)
          value: "$($envVar.Value)"
"@
                }
            }
        }
        
        $deployments += @"

        resources:
          requests:
            cpu: $($service.Resources.Requests.CPU)
            memory: $($service.Resources.Requests.Memory)
          limits:
            cpu: $($service.Resources.Limits.CPU)
            memory: $($service.Resources.Limits.Memory)
"@
        
        if ($service.HealthCheck) {
            $deployments += @"

        livenessProbe:
          httpGet:
            path: $($service.HealthCheck.Path)
            port: $($service.Port)
          initialDelaySeconds: 30
          periodSeconds: $($service.HealthCheck.IntervalSeconds)
          timeoutSeconds: $($service.HealthCheck.TimeoutSeconds)
        readinessProbe:
          httpGet:
            path: $($service.HealthCheck.Path)
            port: $($service.Port)
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: $($service.HealthCheck.TimeoutSeconds)
"@
        }
        
        if ($service.PersistentVolume) {
            $deployments += @"

        volumeMounts:
        - name: $serviceName-storage
          mountPath: /data
      volumes:
      - name: $serviceName-storage
        persistentVolumeClaim:
          claimName: $serviceName-pvc
"@
        }
    }
    
    $deployments | Out-File -FilePath (Join-Path $OutputPath "deployments.yaml") -Encoding UTF8
}

function Generate-KubernetesSecrets {
    param([object]$Config, [string]$OutputPath)
    
    $secrets = @"
apiVersion: v1
kind: Secret
metadata:
  name: mandadiscovery-secrets
  namespace: mandadiscovery
type: Opaque
data:
  db-password: U2VjdXJlUGFzc3dvcmQxMjMh  # Base64 encoded
  redis-password: UmVkaXNQYXNzd29yZDEyMyE=  # Base64 encoded
  jwt-secret: WW91ckpXVFNlY3JldEtleUhlcmU=  # Base64 encoded
  encryption-key: WW91ckVuY3J5cHRpb25LZXlIZXJl  # Base64 encoded
"@
    
    $secrets | Out-File -FilePath (Join-Path $OutputPath "secrets.yaml") -Encoding UTF8
}

function Generate-KubernetesConfigMaps {
    param([object]$Config, [string]$OutputPath)
    
    $configMaps = @"
apiVersion: v1
kind: ConfigMap
metadata:
  name: mandadiscovery-config
  namespace: mandadiscovery
data:
  appsettings.json: |
    {
      "Logging": {
        "LogLevel": {
          "Default": "Information",
          "Microsoft.AspNetCore": "Warning"
        }
      },
      "AllowedHosts": "*",
      "ConnectionStrings": {
        "DefaultConnection": "Server=database-service;Database=MandADiscovery;Trusted_Connection=true;"
      },
      "Redis": {
        "ConnectionString": "redis-service:6379"
      },
      "Features": {
        "EnableAutoScaling": true,
        "EnableMetrics": true,
        "EnableTracing": true
      }
    }
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
  namespace: mandadiscovery
data:
  nginx.conf: |
    events {
        worker_connections 1024;
    }
    http {
        upstream api {
            server discovery-api-service:8080;
        }
        upstream web {
            server web-ui-service:80;
        }
        server {
            listen 80;
            location /api/ {
                proxy_pass http://api/;
                proxy_set_header Host `$host;
                proxy_set_header X-Real-IP `$remote_addr;
            }
            location / {
                proxy_pass http://web/;
                proxy_set_header Host `$host;
                proxy_set_header X-Real-IP `$remote_addr;
            }
        }
    }
"@
    
    $configMaps | Out-File -FilePath (Join-Path $OutputPath "configmaps.yaml") -Encoding UTF8
}

function Generate-KubernetesPersistentVolumes {
    param([object]$Config, [string]$OutputPath)
    
    $pvs = @"
# M&A Discovery Suite - Persistent Volume Claims
"@
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        if ($service.PersistentVolume) {
            $pvs += @"

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: $serviceName-pvc
  namespace: mandadiscovery
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: $($service.PersistentVolume.StorageClass)
  resources:
    requests:
      storage: $($service.PersistentVolume.Size)
"@
        }
    }
    
    $pvs | Out-File -FilePath (Join-Path $OutputPath "persistent-volumes.yaml") -Encoding UTF8
}

function Generate-KubernetesIngress {
    param([object]$Config, [string]$OutputPath)
    
    $ingress = @"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mandadiscovery-ingress
  namespace: mandadiscovery
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - mandadiscovery.example.com
    secretName: mandadiscovery-tls
  rules:
  - host: mandadiscovery.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: discovery-api-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-ui-service
            port:
              number: 80
"@
    
    $ingress | Out-File -FilePath (Join-Path $OutputPath "ingress.yaml") -Encoding UTF8
}

function Generate-KubernetesHPA {
    param([object]$Config, [string]$OutputPath)
    
    $hpa = @"
# M&A Discovery Suite - Horizontal Pod Autoscalers
"@
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        if ($service.Replicas -gt 1) {
            $hpa += @"

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: $serviceName-hpa
  namespace: mandadiscovery
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: $serviceName-deployment
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
"@
        }
    }
    
    $hpa | Out-File -FilePath (Join-Path $OutputPath "hpa.yaml") -Encoding UTF8
}

function Generate-KubernetesNetworkPolicies {
    param([object]$Config, [string]$OutputPath)
    
    $networkPolicies = @"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mandadiscovery-network-policy
  namespace: mandadiscovery
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: mandadiscovery
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: mandadiscovery
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 443
"@
    
    $networkPolicies | Out-File -FilePath (Join-Path $OutputPath "network-policies.yaml") -Encoding UTF8
}

function Initialize-ContainerNetworking {
    param([object]$Config)
    
    # Configure container networking based on platform
    $global:ContainerSession.Networks = @{
        "mandadiscovery-network" = @{
            Driver = "bridge"
            Subnet = "172.20.0.0/16"
            Gateway = "172.20.0.1"
            Internal = $false
        }
        "database-network" = @{
            Driver = "bridge"
            Subnet = "172.21.0.0/16" 
            Gateway = "172.21.0.1"
            Internal = $true
        }
    }
    
    Write-Host "   🌐 Container networking configured" -ForegroundColor Green
}

function Initialize-PersistentStorage {
    param([object]$Config)
    
    # Configure persistent storage volumes
    $global:ContainerSession.Volumes = @{}
    
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        if ($service.PersistentVolume) {
            $global:ContainerSession.Volumes["$serviceName-data"] = @{
                Size = $service.PersistentVolume.Size
                StorageClass = $service.PersistentVolume.StorageClass
                BackupEnabled = $true
            }
        }
    }
    
    Write-Host "   💾 Persistent storage configured" -ForegroundColor Green
}

function Initialize-ContainerMonitoring {
    param([object]$Config)
    
    # Setup Prometheus monitoring
    $monitoringDir = ".\Deploy\Monitoring"
    if (!(Test-Path $monitoringDir)) {
        New-Item -Path $monitoringDir -ItemType Directory -Force | Out-Null
    }
    
    # Generate Prometheus configuration
    $prometheusConfig = @"
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'mandadiscovery-api'
    static_configs:
      - targets: ['discovery-api-service:8080']
    metrics_path: '/metrics'
    
  - job_name: 'mandadiscovery-worker'
    static_configs:
      - targets: ['discovery-worker-service:8080']
    metrics_path: '/metrics'
"@
    
    $prometheusConfig | Out-File -FilePath (Join-Path $monitoringDir "prometheus.yml") -Encoding UTF8
    
    Write-Host "   📊 Container monitoring configured" -ForegroundColor Green
}

function Initialize-AutoScaling {
    param([object]$Config)
    
    # Configure auto-scaling policies
    foreach ($serviceName in $Config.Services.PSObject.Properties.Name) {
        $service = $Config.Services.$serviceName
        if ($service.Replicas -and $service.Replicas -gt 1) {
            $global:ContainerSession.Services[$serviceName] = @{
                AutoScaling = @{
                    Enabled = $true
                    MinReplicas = 1
                    MaxReplicas = ($service.Replicas * 3)
                    TargetCPU = 70
                    TargetMemory = 80
                    ScaleUpCooldown = "5m"
                    ScaleDownCooldown = "10m"
                }
            }
        }
    }
    
    Write-Host "   📈 Auto-scaling configured" -ForegroundColor Green
}

function Deploy-ContainerServices {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet("Docker", "Kubernetes")]
        [string]$Platform,
        
        [Parameter(Mandatory = $false)]
        [string]$Environment = "Production",
        
        [Parameter(Mandatory = $false)]
        [switch]$DryRun,
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\ContainerDeployment.log"
    )
    
    Write-Host "🚀 Deploying M&A Discovery Suite containers..." -ForegroundColor Cyan
    
    try {
        switch ($Platform) {
            "Docker" {
                Deploy-DockerServices -Environment $Environment -DryRun:$DryRun
            }
            "Kubernetes" {
                Deploy-KubernetesServices -Environment $Environment -DryRun:$DryRun
            }
        }
        
        Write-Host "✅ Container deployment completed successfully!" -ForegroundColor Green
        
    } catch {
        Write-Error "Container deployment failed: $($_.Exception.Message)"
        Write-Log "DEPLOYMENT ERROR: $($_.Exception.Message)" $LogFile
    }
}

function Deploy-DockerServices {
    param([string]$Environment, [switch]$DryRun)
    
    $dockerDir = ".\Deploy\Docker"
    
    if ($DryRun) {
        Write-Host "   🔍 DRY RUN - Docker deployment simulation" -ForegroundColor Yellow
        Write-Host "   📄 Would execute: docker-compose -f $dockerDir\docker-compose.yml up -d" -ForegroundColor Gray
        return
    }
    
    Push-Location $dockerDir
    try {
        # Pull latest images
        Write-Host "   📥 Pulling Docker images..." -ForegroundColor Yellow
        docker-compose pull
        
        # Deploy services
        Write-Host "   🚀 Starting Docker services..." -ForegroundColor Yellow
        docker-compose up -d
        
        # Verify deployment
        Write-Host "   ✅ Verifying Docker deployment..." -ForegroundColor Yellow
        $runningContainers = docker-compose ps --services --filter "status=running"
        Write-Host "   📊 Running containers: $($runningContainers.Count)" -ForegroundColor Green
        
    } finally {
        Pop-Location
    }
}

function Deploy-KubernetesServices {
    param([string]$Environment, [switch]$DryRun)
    
    $k8sDir = ".\Deploy\Kubernetes"
    
    if ($DryRun) {
        Write-Host "   🔍 DRY RUN - Kubernetes deployment simulation" -ForegroundColor Yellow
        Write-Host "   📄 Would execute: kubectl apply -f $k8sDir" -ForegroundColor Gray
        return
    }
    
    # Apply Kubernetes manifests
    Write-Host "   📥 Applying Kubernetes manifests..." -ForegroundColor Yellow
    kubectl apply -f "$k8sDir\"
    
    # Wait for deployments to be ready
    Write-Host "   ⏳ Waiting for deployments to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=available --timeout=300s deployment --all -n mandadiscovery
    
    # Verify deployment
    Write-Host "   ✅ Verifying Kubernetes deployment..." -ForegroundColor Yellow
    $pods = kubectl get pods -n mandadiscovery --no-headers
    $runningPods = $pods | Where-Object { $_ -match "Running" }
    Write-Host "   📊 Running pods: $($runningPods.Count)" -ForegroundColor Green
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
Export-ModuleMember -Function Initialize-ContainerInfrastructure, Deploy-ContainerServices

Write-Host "✅ Container Orchestration module loaded successfully" -ForegroundColor Green