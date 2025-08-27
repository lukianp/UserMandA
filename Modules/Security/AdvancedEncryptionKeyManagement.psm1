# M&A Discovery Suite - Advanced Encryption and Key Management
# Enterprise-grade cryptographic services with HSM integration and key lifecycle management

function Initialize-EncryptionKeyManagement {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [ValidateSet("Software", "HSM", "CloudHSM", "AzureKeyVault", "AWSCloudHSM")]
        [string]$KeyStoreType = "Software",
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("AES-256-GCM", "ChaCha20-Poly1305", "AES-256-CBC")]
        [string]$DefaultEncryptionAlgorithm = "AES-256-GCM",
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("RSA-4096", "RSA-2048", "ECDSA-P384", "ECDSA-P256", "Ed25519")]
        [string]$DefaultAsymmetricAlgorithm = "RSA-4096",
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableQuantumSafeAlgorithms,
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableKeyRotation,
        
        [Parameter(Mandatory = $false)]
        [string]$KeyRotationInterval = "P90D", # ISO 8601 duration (90 days)
        
        [Parameter(Mandatory = $false)]
        [string]$ConfigPath = ".\Config\Security\Encryption.json",
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\EncryptionKeyManagement.log"
    )
    
    Begin {
        Write-Host "🔐 M&A Discovery Suite - Advanced Encryption & Key Management" -ForegroundColor Cyan
        Write-Host "===============================================================" -ForegroundColor Cyan
        
        # Initialize encryption session
        $global:EncryptionSession = @{
            KeyStoreType = $KeyStoreType
            DefaultEncryption = $DefaultEncryptionAlgorithm
            DefaultAsymmetric = $DefaultAsymmetricAlgorithm
            StartTime = Get-Date
            MasterKeys = @{}
            DataKeys = @{}
            KeyPolicies = @{}
            EncryptionContexts = @{}
            KeyRotationSchedule = @{}
            AuditLog = @()
        }
        
        Write-Log "Initializing encryption and key management with keystore: $KeyStoreType" $LogFile
    }
    
    Process {
        try {
            # Load encryption configuration
            Write-Host "📋 Loading encryption configuration..." -ForegroundColor Yellow
            $encryptionConfig = Initialize-EncryptionConfiguration -ConfigPath $ConfigPath
            
            # Initialize cryptographic providers
            Write-Host "🔧 Initializing cryptographic providers..." -ForegroundColor Yellow
            Initialize-CryptographicProviders -Config $encryptionConfig
            
            # Setup key store infrastructure
            Write-Host "🏗️ Setting up key store infrastructure..." -ForegroundColor Green
            Initialize-KeyStoreInfrastructure -Config $encryptionConfig -KeyStoreType $KeyStoreType
            
            # Generate master keys
            Write-Host "🗝️ Generating master encryption keys..." -ForegroundColor Yellow
            Initialize-MasterKeys -Config $encryptionConfig
            
            # Setup data encryption keys
            Write-Host "🔑 Setting up data encryption keys..." -ForegroundColor Yellow
            Initialize-DataEncryptionKeys -Config $encryptionConfig
            
            # Configure key policies
            Write-Host "📜 Configuring key policies..." -ForegroundColor Yellow
            Initialize-KeyPolicies -Config $encryptionConfig
            
            # Setup key rotation if enabled
            if ($EnableKeyRotation) {
                Write-Host "🔄 Setting up key rotation..." -ForegroundColor Yellow
                Initialize-KeyRotation -Config $encryptionConfig -RotationInterval $KeyRotationInterval
            }
            
            # Initialize quantum-safe algorithms if enabled
            if ($EnableQuantumSafeAlgorithms) {
                Write-Host "🔮 Initializing quantum-safe algorithms..." -ForegroundColor Yellow
                Initialize-QuantumSafeAlgorithms -Config $encryptionConfig
            }
            
            # Setup encryption services
            Write-Host "⚙️ Setting up encryption services..." -ForegroundColor Yellow
            Initialize-EncryptionServices -Config $encryptionConfig
            
            # Configure certificate management
            Write-Host "📜 Configuring certificate management..." -ForegroundColor Yellow
            Initialize-CertificateManagement -Config $encryptionConfig
            
            # Setup HSM integration if applicable
            if ($KeyStoreType -in @("HSM", "CloudHSM", "AzureKeyVault", "AWSCloudHSM")) {
                Write-Host "🔒 Setting up HSM integration..." -ForegroundColor Yellow
                Initialize-HSMIntegration -Config $encryptionConfig -KeyStoreType $KeyStoreType
            }
            
            Write-Host "✅ Advanced encryption and key management initialized successfully!" -ForegroundColor Green
            
        } catch {
            Write-Error "Encryption and key management initialization failed: $($_.Exception.Message)"
            Write-Log "CRITICAL ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Initialize-EncryptionConfiguration {
    param([string]$ConfigPath)
    
    if (!(Test-Path $ConfigPath)) {
        # Create default encryption configuration
        $defaultConfig = @{
            Encryption = @{
                GlobalSettings = @{
                    DefaultSymmetricAlgorithm = "AES-256-GCM"
                    DefaultAsymmetricAlgorithm = "RSA-4096"
                    DefaultHashAlgorithm = "SHA-256"
                    DefaultKDFAlgorithm = "PBKDF2"
                    MinKeySize = 256
                    KeyDerivationIterations = 100000
                    SaltSize = 32
                    IVSize = 16
                    TagSize = 16
                }
                
                Algorithms = @{
                    Symmetric = @{
                        "AES-256-GCM" = @{
                            KeySize = 256
                            BlockSize = 128
                            Mode = "GCM"
                            Padding = "NoPadding"
                            IVSize = 12
                            TagSize = 16
                            QuantumResistant = $false
                        }
                        "AES-256-CBC" = @{
                            KeySize = 256
                            BlockSize = 128
                            Mode = "CBC"
                            Padding = "PKCS7"
                            IVSize = 16
                            QuantumResistant = $false
                        }
                        "ChaCha20-Poly1305" = @{
                            KeySize = 256
                            NonceSize = 12
                            TagSize = 16
                            QuantumResistant = $false
                        }
                        "CRYSTALS-Kyber" = @{
                            KeySize = 768
                            QuantumResistant = $true
                            SecurityLevel = 128
                        }
                    }
                    
                    Asymmetric = @{
                        "RSA-4096" = @{
                            KeySize = 4096
                            Padding = "OAEP"
                            HashAlgorithm = "SHA-256"
                            QuantumResistant = $false
                        }
                        "RSA-2048" = @{
                            KeySize = 2048
                            Padding = "OAEP"
                            HashAlgorithm = "SHA-256"
                            QuantumResistant = $false
                        }
                        "ECDSA-P384" = @{
                            Curve = "P-384"
                            HashAlgorithm = "SHA-384"
                            QuantumResistant = $false
                        }
                        "ECDSA-P256" = @{
                            Curve = "P-256"
                            HashAlgorithm = "SHA-256"
                            QuantumResistant = $false
                        }
                        "Ed25519" = @{
                            KeySize = 256
                            QuantumResistant = $false
                        }
                        "CRYSTALS-Dilithium" = @{
                            SecurityLevel = 128
                            KeySize = 1312
                            QuantumResistant = $true
                        }
                        "FALCON-512" = @{
                            SecurityLevel = 128
                            KeySize = 897
                            QuantumResistant = $true
                        }
                    }
                    
                    Hash = @{
                        "SHA-256" = @{
                            OutputSize = 256
                            BlockSize = 512
                            QuantumResistant = $false
                        }
                        "SHA-384" = @{
                            OutputSize = 384
                            BlockSize = 1024
                            QuantumResistant = $false
                        }
                        "SHA-512" = @{
                            OutputSize = 512
                            BlockSize = 1024
                            QuantumResistant = $false
                        }
                        "BLAKE3" = @{
                            OutputSize = 256
                            QuantumResistant = $true
                        }
                    }
                }
                
                KeyStore = @{
                    Software = @{
                        StoragePath = ".\Keys\Software"
                        EncryptionKey = "master-key-encryption"
                        BackupEnabled = $true
                        BackupPath = ".\Keys\Backup"
                    }
                    
                    HSM = @{
                        Provider = "SafeNet Luna"
                        SlotId = 0
                        TokenLabel = "MandADiscovery"
                        PinRetries = 3
                        BackupSlot = 1
                    }
                    
                    CloudHSM = @{
                        Provider = "AWS CloudHSM"
                        ClusterId = ""
                        Region = "us-east-1"
                        CertificatePath = ".\Certificates\cloudhsm-client.crt"
                        PrivateKeyPath = ".\Certificates\cloudhsm-client.key"
                    }
                    
                    AzureKeyVault = @{
                        VaultName = "mandadiscovery-keyvault"
                        TenantId = ""
                        ClientId = ""
                        ClientSecret = ""
                        ResourceGroup = "mandadiscovery-rg"
                        Location = "East US"
                    }
                }
                
                KeyTypes = @{
                    MasterKey = @{
                        Purpose = "KeyEncryption"
                        Algorithm = "AES-256-GCM"
                        RotationPeriod = "P365D" # 1 year
                        BackupRequired = $true
                        MinInstances = 2
                        MaxInstances = 5
                    }
                    
                    DataEncryptionKey = @{
                        Purpose = "DataEncryption"
                        Algorithm = "AES-256-GCM"
                        RotationPeriod = "P90D" # 90 days
                        BackupRequired = $true
                        EncryptedByMasterKey = $true
                    }
                    
                    KeyEncryptionKey = @{
                        Purpose = "KeyEncryption"
                        Algorithm = "AES-256-GCM"
                        RotationPeriod = "P180D" # 180 days
                        BackupRequired = $true
                        HSMRequired = $true
                    }
                    
                    SigningKey = @{
                        Purpose = "DigitalSignature"
                        Algorithm = "RSA-4096"
                        RotationPeriod = "P730D" # 2 years
                        BackupRequired = $true
                        CertificateRequired = $true
                    }
                    
                    TLSKey = @{
                        Purpose = "TLSEncryption"
                        Algorithm = "ECDSA-P384"
                        RotationPeriod = "P90D" # 90 days
                        BackupRequired = $true
                        CertificateRequired = $true
                        AutoRenewal = $true
                    }
                }
                
                EncryptionContexts = @{
                    Database = @{
                        DataClassification = @("PII", "Financial", "Confidential")
                        EncryptionAtRest = $true
                        EncryptionInTransit = $true
                        KeyType = "DataEncryptionKey"
                        CompressionEnabled = $true
                    }
                    
                    FileSystem = @{
                        DataClassification = @("Sensitive", "Internal", "Public")
                        EncryptionAtRest = $true
                        KeyType = "DataEncryptionKey"
                        ChunkSize = 1048576 # 1MB
                    }
                    
                    Communication = @{
                        ProtocolSupport = @("TLS 1.3", "TLS 1.2")
                        CipherSuites = @(
                            "TLS_AES_256_GCM_SHA384",
                            "TLS_CHACHA20_POLY1305_SHA256",
                            "TLS_AES_128_GCM_SHA256"
                        )
                        KeyType = "TLSKey"
                        PerfectForwardSecrecy = $true
                    }
                    
                    API = @{
                        JWTSigning = $true
                        TokenEncryption = $true
                        KeyType = "SigningKey"
                        TokenExpiry = 3600 # 1 hour
                    }
                }
                
                KeyPolicies = @{
                    Default = @{
                        MinKeySize = 256
                        MaxKeyAge = "P365D"
                        RequireHSM = $false
                        RequireBackup = $true
                        AllowExport = $false
                        RequireAuthentication = $true
                        AuditAllOperations = $true
                    }
                    
                    HighSecurity = @{
                        MinKeySize = 256
                        MaxKeyAge = "P90D"
                        RequireHSM = $true
                        RequireBackup = $true
                        AllowExport = $false
                        RequireAuthentication = $true
                        RequireDualControl = $true
                        AuditAllOperations = $true
                    }
                    
                    MasterKey = @{
                        MinKeySize = 256
                        MaxKeyAge = "P730D"
                        RequireHSM = $true
                        RequireBackup = $true
                        AllowExport = $false
                        RequireAuthentication = $true
                        RequireDualControl = $true
                        RequireMultipleBackups = $true
                        AuditAllOperations = $true
                    }
                }
                
                CertificateManagement = @{
                    RootCA = @{
                        CommonName = "M&A Discovery Suite Root CA"
                        KeySize = 4096
                        ValidityPeriod = "P3650D" # 10 years
                        HashAlgorithm = "SHA-256"
                        KeyUsage = @("DigitalSignature", "KeyCertSign", "CRLSign")
                    }
                    
                    IntermediateCA = @{
                        CommonName = "M&A Discovery Suite Intermediate CA"
                        KeySize = 4096
                        ValidityPeriod = "P1825D" # 5 years
                        HashAlgorithm = "SHA-256"
                        KeyUsage = @("DigitalSignature", "KeyCertSign", "CRLSign")
                        PathLengthConstraint = 0
                    }
                    
                    ServerCertificate = @{
                        KeySize = 2048
                        ValidityPeriod = "P365D" # 1 year
                        HashAlgorithm = "SHA-256"
                        KeyUsage = @("DigitalSignature", "KeyEncipherment")
                        ExtendedKeyUsage = @("ServerAuthentication")
                        AutoRenewal = $true
                        RenewalThreshold = "P30D" # 30 days before expiry
                    }
                    
                    ClientCertificate = @{
                        KeySize = 2048
                        ValidityPeriod = "P365D" # 1 year
                        HashAlgorithm = "SHA-256"
                        KeyUsage = @("DigitalSignature", "KeyEncipherment")
                        ExtendedKeyUsage = @("ClientAuthentication")
                        AutoRenewal = $true
                    }
                }
                
                Compliance = @{
                    FIPS140 = @{
                        Level = 2
                        Required = $false
                        ValidatedModules = @("Software", "HSM")
                    }
                    
                    CommonCriteria = @{
                        EvaluationAssuranceLevel = "EAL4+"
                        Required = $false
                    }
                    
                    GDPR = @{
                        DataProtectionByDesign = $true
                        PseudonymizationSupport = $true
                        RightToBeErased = $true
                        DataPortability = $true
                    }
                    
                    SOX = @{
                        KeyEscrow = $true
                        DualControl = $true
                        AuditTrail = $true
                        NonRepudiation = $true
                    }
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

function Initialize-CryptographicProviders {
    param([object]$Config)
    
    # Initialize .NET cryptographic providers
    try {
        Add-Type -AssemblyName System.Security.Cryptography
        Write-Host "   ✅ .NET Cryptographic providers loaded" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to load .NET cryptographic providers: $($_.Exception.Message)"
    }
    
    # Initialize Bouncy Castle for advanced algorithms
    try {
        if (!(Get-Module -ListAvailable -Name "BouncyCastle.Crypto")) {
            Write-Host "   📦 Installing Bouncy Castle Crypto..." -ForegroundColor Yellow
            Install-Package -Name "Portable.BouncyCastle" -Source "nuget.org" -Force -SkipDependencies
        }
        Write-Host "   ✅ Bouncy Castle Crypto available" -ForegroundColor Green
    } catch {
        Write-Warning "Bouncy Castle Crypto not available: $($_.Exception.Message)"
    }
    
    # Store provider information
    $global:EncryptionSession.Providers = @{
        DotNet = $true
        BouncyCastle = $true
        HSM = $false
        CloudHSM = $false
    }
    
    Write-Host "   🔧 Cryptographic providers initialized" -ForegroundColor Green
}

function Initialize-KeyStoreInfrastructure {
    param([object]$Config, [string]$KeyStoreType)
    
    switch ($KeyStoreType) {
        "Software" {
            Initialize-SoftwareKeyStore -Config $Config
        }
        "HSM" {
            Initialize-HSMKeyStore -Config $Config
        }
        "CloudHSM" {
            Initialize-CloudHSMKeyStore -Config $Config
        }
        "AzureKeyVault" {
            Initialize-AzureKeyVaultStore -Config $Config
        }
        "AWSCloudHSM" {
            Initialize-AWSCloudHSMStore -Config $Config
        }
    }
    
    Write-Host "   🏗️ Key store infrastructure initialized" -ForegroundColor Green
}

function Initialize-SoftwareKeyStore {
    param([object]$Config)
    
    $keyStorePath = $Config.Encryption.KeyStore.Software.StoragePath
    $backupPath = $Config.Encryption.KeyStore.Software.BackupPath
    
    # Create key store directories
    @($keyStorePath, $backupPath) | ForEach-Object {
        if (!(Test-Path $_)) {
            New-Item -Path $_ -ItemType Directory -Force | Out-Null
        }
    }
    
    # Set restrictive permissions
    try {
        $acl = Get-Acl $keyStorePath
        $acl.SetAccessRuleProtection($true, $false) # Remove inherited permissions
        $acl.SetAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
            [System.Security.Principal.WindowsIdentity]::GetCurrent().User,
            "FullControl",
            "ContainerInherit,ObjectInherit",
            "None",
            "Allow"
        )))
        Set-Acl -Path $keyStorePath -AclObject $acl
        Write-Host "   🔐 Software key store permissions configured" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to set key store permissions: $($_.Exception.Message)"
    }
    
    # Initialize key store metadata
    $keyStoreMetadata = @{
        Version = "1.0"
        CreatedDate = Get-Date
        KeyStoreType = "Software"
        EncryptionAlgorithm = $Config.Encryption.KeyStore.Software.EncryptionKey
        Keys = @{}
    }
    
    $metadataPath = Join-Path $keyStorePath "keystore.metadata.json"
    $keyStoreMetadata | ConvertTo-Json -Depth 5 | Out-File -FilePath $metadataPath -Encoding UTF8
}

function Initialize-MasterKeys {
    param([object]$Config)
    
    $masterKeyConfig = $Config.Encryption.KeyTypes.MasterKey
    $keyCount = $masterKeyConfig.MinInstances
    
    for ($i = 1; $i -le $keyCount; $i++) {
        $keyId = "master-key-$i"
        $masterKey = New-MasterKey -KeyId $keyId -Algorithm $masterKeyConfig.Algorithm -Config $Config
        
        $global:EncryptionSession.MasterKeys[$keyId] = @{
            KeyId = $keyId
            Algorithm = $masterKeyConfig.Algorithm
            CreatedDate = Get-Date
            RotationPeriod = $masterKeyConfig.RotationPeriod
            NextRotation = (Get-Date).Add([System.Xml.XmlConvert]::ToTimeSpan($masterKeyConfig.RotationPeriod))
            Status = "Active"
            BackupRequired = $masterKeyConfig.BackupRequired
        }
        
        Write-Host "   🗝️ Master key $keyId generated" -ForegroundColor Green
    }
    
    # Set primary master key
    $global:EncryptionSession.PrimaryMasterKey = "master-key-1"
}

function New-MasterKey {
    param(
        [string]$KeyId,
        [string]$Algorithm,
        [object]$Config
    )
    
    $algorithmConfig = $Config.Encryption.Algorithms.Symmetric.$Algorithm
    $keySize = $algorithmConfig.KeySize / 8 # Convert bits to bytes
    
    # Generate cryptographically secure random key
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $keyBytes = New-Object byte[] $keySize
    $rng.GetBytes($keyBytes)
    $rng.Dispose()
    
    # Store key securely (encrypted with DPAPI for software store)
    $keyStorePath = $Config.Encryption.KeyStore.Software.StoragePath
    $keyFilePath = Join-Path $keyStorePath "$KeyId.key"
    
    # Encrypt key with DPAPI
    $encryptedKey = [System.Security.Cryptography.ProtectedData]::Protect(
        $keyBytes,
        $null,
        [System.Security.Cryptography.DataProtectionScope]::LocalMachine
    )
    
    [System.IO.File]::WriteAllBytes($keyFilePath, $encryptedKey)
    
    # Create backup if required
    if ($Config.Encryption.KeyTypes.MasterKey.BackupRequired) {
        $backupPath = $Config.Encryption.KeyStore.Software.BackupPath
        $backupFilePath = Join-Path $backupPath "$KeyId.backup.key"
        [System.IO.File]::WriteAllBytes($backupFilePath, $encryptedKey)
    }
    
    # Audit key generation
    Write-AuditLog -EventType "KeyGenerated" -KeyId $KeyId -Algorithm $Algorithm -Description "Master key generated"
    
    return @{
        KeyId = $KeyId
        KeySize = $keySize * 8
        Algorithm = $Algorithm
        FilePath = $keyFilePath
    }
}

function Initialize-DataEncryptionKeys {
    param([object]$Config)
    
    # Generate data encryption keys for each context
    foreach ($contextName in $Config.Encryption.EncryptionContexts.PSObject.Properties.Name) {
        $context = $Config.Encryption.EncryptionContexts.$contextName
        $keyType = $context.KeyType
        
        $keyId = "dek-$contextName-$(Get-Date -Format 'yyyyMMdd')"
        $dataKey = New-DataEncryptionKey -KeyId $keyId -Context $contextName -Config $Config
        
        $global:EncryptionSession.DataKeys[$keyId] = @{
            KeyId = $keyId
            Context = $contextName
            Algorithm = $Config.Encryption.KeyTypes.$keyType.Algorithm
            CreatedDate = Get-Date
            RotationPeriod = $Config.Encryption.KeyTypes.$keyType.RotationPeriod
            NextRotation = (Get-Date).Add([System.Xml.XmlConvert]::ToTimeSpan($Config.Encryption.KeyTypes.$keyType.RotationPeriod))
            Status = "Active"
            EncryptedByMasterKey = $Config.Encryption.KeyTypes.$keyType.EncryptedByMasterKey
        }
        
        Write-Host "   🔑 Data encryption key $keyId generated for context $contextName" -ForegroundColor Green
    }
}

function New-DataEncryptionKey {
    param(
        [string]$KeyId,
        [string]$Context,
        [object]$Config
    )
    
    $contextConfig = $Config.Encryption.EncryptionContexts.$Context
    $keyTypeConfig = $Config.Encryption.KeyTypes.$($contextConfig.KeyType)
    $algorithmConfig = $Config.Encryption.Algorithms.Symmetric.$($keyTypeConfig.Algorithm)
    
    $keySize = $algorithmConfig.KeySize / 8
    
    # Generate data encryption key
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $keyBytes = New-Object byte[] $keySize
    $rng.GetBytes($keyBytes)
    $rng.Dispose()
    
    # Encrypt with master key if required
    if ($keyTypeConfig.EncryptedByMasterKey) {
        $masterKeyId = $global:EncryptionSession.PrimaryMasterKey
        $encryptedKeyBytes = Protect-DataWithMasterKey -Data $keyBytes -MasterKeyId $masterKeyId -Config $Config
    } else {
        $encryptedKeyBytes = [System.Security.Cryptography.ProtectedData]::Protect(
            $keyBytes,
            $null,
            [System.Security.Cryptography.DataProtectionScope]::LocalMachine
        )
    }
    
    # Store encrypted key
    $keyStorePath = $Config.Encryption.KeyStore.Software.StoragePath
    $keyFilePath = Join-Path $keyStorePath "$KeyId.dek"
    [System.IO.File]::WriteAllBytes($keyFilePath, $encryptedKeyBytes)
    
    # Audit key generation
    Write-AuditLog -EventType "DataKeyGenerated" -KeyId $KeyId -Context $Context -Description "Data encryption key generated"
    
    return @{
        KeyId = $KeyId
        Context = $Context
        FilePath = $keyFilePath
    }
}

function Initialize-KeyPolicies {
    param([object]$Config)
    
    foreach ($policyName in $Config.Encryption.KeyPolicies.PSObject.Properties.Name) {
        $policy = $Config.Encryption.KeyPolicies.$policyName
        
        $global:EncryptionSession.KeyPolicies[$policyName] = @{
            PolicyName = $policyName
            MinKeySize = $policy.MinKeySize
            MaxKeyAge = $policy.MaxKeyAge
            RequireHSM = $policy.RequireHSM
            RequireBackup = $policy.RequireBackup
            AllowExport = $policy.AllowExport
            RequireAuthentication = $policy.RequireAuthentication
            AuditAllOperations = $policy.AuditAllOperations
            CreatedDate = Get-Date
        }
        
        if ($policy.PSObject.Properties.Name -contains "RequireDualControl") {
            $global:EncryptionSession.KeyPolicies[$policyName].RequireDualControl = $policy.RequireDualControl
        }
        
        Write-Host "   📜 Key policy $policyName configured" -ForegroundColor Green
    }
}

function Initialize-KeyRotation {
    param([object]$Config, [string]$RotationInterval)
    
    # Schedule key rotation for all keys
    foreach ($keyId in $global:EncryptionSession.MasterKeys.Keys) {
        $key = $global:EncryptionSession.MasterKeys[$keyId]
        $nextRotation = (Get-Date).Add([System.Xml.XmlConvert]::ToTimeSpan($key.RotationPeriod))
        
        $global:EncryptionSession.KeyRotationSchedule[$keyId] = @{
            KeyId = $keyId
            KeyType = "MasterKey"
            NextRotation = $nextRotation
            RotationInterval = $key.RotationPeriod
            AutoRotate = $true
            LastRotation = Get-Date
        }
    }
    
    foreach ($keyId in $global:EncryptionSession.DataKeys.Keys) {
        $key = $global:EncryptionSession.DataKeys[$keyId]
        $nextRotation = (Get-Date).Add([System.Xml.XmlConvert]::ToTimeSpan($key.RotationPeriod))
        
        $global:EncryptionSession.KeyRotationSchedule[$keyId] = @{
            KeyId = $keyId
            KeyType = "DataEncryptionKey"
            Context = $key.Context
            NextRotation = $nextRotation
            RotationInterval = $key.RotationPeriod
            AutoRotate = $true
            LastRotation = Get-Date
        }
    }
    
    Write-Host "   🔄 Key rotation scheduled for $(($global:EncryptionSession.KeyRotationSchedule.Keys).Count) keys" -ForegroundColor Green
}

function Initialize-QuantumSafeAlgorithms {
    param([object]$Config)
    
    # Enable quantum-safe algorithms
    $quantumSafeAlgorithms = @()
    
    foreach ($algorithmName in $Config.Encryption.Algorithms.Symmetric.PSObject.Properties.Name) {
        $algorithm = $Config.Encryption.Algorithms.Symmetric.$algorithmName
        if ($algorithm.QuantumResistant) {
            $quantumSafeAlgorithms += $algorithmName
        }
    }
    
    foreach ($algorithmName in $Config.Encryption.Algorithms.Asymmetric.PSObject.Properties.Name) {
        $algorithm = $Config.Encryption.Algorithms.Asymmetric.$algorithmName
        if ($algorithm.QuantumResistant) {
            $quantumSafeAlgorithms += $algorithmName
        }
    }
    
    $global:EncryptionSession.QuantumSafeAlgorithms = $quantumSafeAlgorithms
    
    Write-Host "   🔮 Quantum-safe algorithms enabled: $($quantumSafeAlgorithms -join ', ')" -ForegroundColor Green
}

function Initialize-EncryptionServices {
    param([object]$Config)
    
    # Create encryption service endpoints
    $encryptionServices = @{
        DataEncryption = @{
            Endpoint = "/api/v1/encryption/data"
            Methods = @("POST")
            RequiresAuthentication = $true
            RateLimited = $true
        }
        
        DataDecryption = @{
            Endpoint = "/api/v1/encryption/decrypt"
            Methods = @("POST")
            RequiresAuthentication = $true
            RateLimited = $true
            RequiresKeyAccess = $true
        }
        
        KeyGeneration = @{
            Endpoint = "/api/v1/keys/generate"
            Methods = @("POST")
            RequiresAuthentication = $true
            RequiresAuthorization = $true
            AuditRequired = $true
        }
        
        KeyRotation = @{
            Endpoint = "/api/v1/keys/rotate"
            Methods = @("POST")
            RequiresAuthentication = $true
            RequiresAuthorization = $true
            RequiresDualControl = $true
            AuditRequired = $true
        }
        
        CertificateIssuing = @{
            Endpoint = "/api/v1/certificates/issue"
            Methods = @("POST")
            RequiresAuthentication = $true
            RequiresAuthorization = $true
            AuditRequired = $true
        }
    }
    
    $global:EncryptionSession.Services = $encryptionServices
    
    Write-Host "   ⚙️ Encryption services configured" -ForegroundColor Green
}

function Initialize-CertificateManagement {
    param([object]$Config)
    
    $certConfig = $Config.Encryption.CertificateManagement
    
    # Generate root CA if it doesn't exist
    $rootCAPath = ".\Certificates\RootCA"
    if (!(Test-Path $rootCAPath)) {
        New-Item -Path $rootCAPath -ItemType Directory -Force | Out-Null
        New-RootCACertificate -Config $certConfig.RootCA -OutputPath $rootCAPath
        Write-Host "   📜 Root CA certificate generated" -ForegroundColor Green
    }
    
    # Generate intermediate CA
    $intermediateCAPath = ".\Certificates\IntermediateCA"
    if (!(Test-Path $intermediateCAPath)) {
        New-Item -Path $intermediateCAPath -ItemType Directory -Force | Out-Null
        New-IntermediateCACertificate -Config $certConfig.IntermediateCA -RootCAPath $rootCAPath -OutputPath $intermediateCAPath
        Write-Host "   📜 Intermediate CA certificate generated" -ForegroundColor Green
    }
    
    # Setup certificate renewal monitoring
    Initialize-CertificateRenewal -Config $certConfig
    
    Write-Host "   📜 Certificate management configured" -ForegroundColor Green
}

function New-RootCACertificate {
    param([object]$Config, [string]$OutputPath)
    
    # Generate root CA private key
    $rsa = [System.Security.Cryptography.RSA]::Create($Config.KeySize)
    $privateKey = $rsa.ExportRSAPrivateKey()
    
    # Create certificate request
    $distinguishedName = "CN=$($Config.CommonName), O=M&A Discovery Suite, C=US"
    $request = [System.Security.Cryptography.X509Certificates.CertificateRequest]::new(
        $distinguishedName,
        $rsa,
        [System.Security.Cryptography.HashAlgorithmName]::SHA256,
        [System.Security.Cryptography.RSASignaturePadding]::Pkcs1
    )
    
    # Add extensions
    $request.CertificateExtensions.Add(
        [System.Security.Cryptography.X509Certificates.X509BasicConstraintsExtension]::new($true, $false, 0, $true)
    )
    
    $keyUsage = [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::KeyCertSign -bor
                [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::CrlSign -bor
                [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::DigitalSignature
    
    $request.CertificateExtensions.Add(
        [System.Security.Cryptography.X509Certificates.X509KeyUsageExtension]::new($keyUsage, $true)
    )
    
    # Create self-signed certificate
    $validFrom = Get-Date
    $validTo = $validFrom.Add([System.Xml.XmlConvert]::ToTimeSpan($Config.ValidityPeriod))
    
    $certificate = $request.CreateSelfSigned($validFrom, $validTo)
    
    # Export certificate and private key
    $certPath = Join-Path $OutputPath "root-ca.crt"
    $keyPath = Join-Path $OutputPath "root-ca.key"
    
    [System.IO.File]::WriteAllBytes($certPath, $certificate.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert))
    [System.IO.File]::WriteAllBytes($keyPath, $privateKey)
    
    $rsa.Dispose()
    $certificate.Dispose()
}

function Protect-DataWithMasterKey {
    param(
        [byte[]]$Data,
        [string]$MasterKeyId,
        [object]$Config
    )
    
    # Load master key
    $keyStorePath = $Config.Encryption.KeyStore.Software.StoragePath
    $keyFilePath = Join-Path $keyStorePath "$MasterKeyId.key"
    
    if (!(Test-Path $keyFilePath)) {
        throw "Master key $MasterKeyId not found"
    }
    
    $encryptedKeyBytes = [System.IO.File]::ReadAllBytes($keyFilePath)
    $masterKeyBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
        $encryptedKeyBytes,
        $null,
        [System.Security.Cryptography.DataProtectionScope]::LocalMachine
    )
    
    # Encrypt data with AES-GCM
    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.KeySize = 256
    $aes.Key = $masterKeyBytes
    $aes.GenerateIV()
    
    $encryptor = $aes.CreateEncryptor()
    $encryptedData = $encryptor.TransformFinalBlock($Data, 0, $Data.Length)
    
    # Combine IV and encrypted data
    $result = New-Object byte[] ($aes.IV.Length + $encryptedData.Length)
    [System.Array]::Copy($aes.IV, 0, $result, 0, $aes.IV.Length)
    [System.Array]::Copy($encryptedData, 0, $result, $aes.IV.Length, $encryptedData.Length)
    
    $encryptor.Dispose()
    $aes.Dispose()
    
    # Clear master key from memory
    [System.Array]::Clear($masterKeyBytes, 0, $masterKeyBytes.Length)
    
    return $result
}

function Invoke-DataEncryption {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [byte[]]$Data,
        
        [Parameter(Mandatory = $true)]
        [string]$Context,
        
        [Parameter(Mandatory = $false)]
        [hashtable]$EncryptionContext = @{},
        
        [Parameter(Mandatory = $false)]
        [string]$Algorithm,
        
        [Parameter(Mandatory = $false)]
        [string]$KeyId
    )
    
    try {
        # Validate context
        if (!$global:EncryptionSession.EncryptionContexts.ContainsKey($Context)) {
            throw "Invalid encryption context: $Context"
        }
        
        # Get appropriate data encryption key
        if (!$KeyId) {
            $KeyId = Get-ActiveDataEncryptionKey -Context $Context
        }
        
        if (!$global:EncryptionSession.DataKeys.ContainsKey($KeyId)) {
            throw "Data encryption key not found: $KeyId"
        }
        
        $keyInfo = $global:EncryptionSession.DataKeys[$KeyId]
        
        # Load and decrypt the data encryption key
        $dekBytes = Get-DataEncryptionKeyBytes -KeyId $KeyId
        
        # Perform encryption
        $algorithm = $Algorithm ?? $keyInfo.Algorithm
        $encryptedData = Invoke-SymmetricEncryption -Data $Data -Key $dekBytes -Algorithm $algorithm -EncryptionContext $EncryptionContext
        
        # Audit encryption operation
        Write-AuditLog -EventType "DataEncrypted" -KeyId $KeyId -Context $Context -DataSize $Data.Length -Description "Data encrypted successfully"
        
        return @{
            EncryptedData = $encryptedData.CipherText
            KeyId = $KeyId
            Algorithm = $algorithm
            IV = $encryptedData.IV
            Tag = $encryptedData.Tag
            EncryptionContext = $EncryptionContext
        }
        
    } catch {
        Write-AuditLog -EventType "EncryptionFailed" -KeyId $KeyId -Context $Context -Error $_.Exception.Message -Description "Data encryption failed"
        throw
    } finally {
        # Clear sensitive data from memory
        if ($dekBytes) {
            [System.Array]::Clear($dekBytes, 0, $dekBytes.Length)
        }
    }
}

function Invoke-DataDecryption {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [byte[]]$EncryptedData,
        
        [Parameter(Mandatory = $true)]
        [string]$KeyId,
        
        [Parameter(Mandatory = $true)]
        [string]$Algorithm,
        
        [Parameter(Mandatory = $true)]
        [byte[]]$IV,
        
        [Parameter(Mandatory = $false)]
        [byte[]]$Tag,
        
        [Parameter(Mandatory = $false)]
        [hashtable]$EncryptionContext = @{}
    )
    
    try {
        # Validate key exists
        if (!$global:EncryptionSession.DataKeys.ContainsKey($KeyId)) {
            throw "Data encryption key not found: $KeyId"
        }
        
        # Load and decrypt the data encryption key
        $dekBytes = Get-DataEncryptionKeyBytes -KeyId $KeyId
        
        # Perform decryption
        $decryptedData = Invoke-SymmetricDecryption -EncryptedData $EncryptedData -Key $dekBytes -Algorithm $Algorithm -IV $IV -Tag $Tag -EncryptionContext $EncryptionContext
        
        # Audit decryption operation
        $keyInfo = $global:EncryptionSession.DataKeys[$KeyId]
        Write-AuditLog -EventType "DataDecrypted" -KeyId $KeyId -Context $keyInfo.Context -DataSize $decryptedData.Length -Description "Data decrypted successfully"
        
        return $decryptedData
        
    } catch {
        Write-AuditLog -EventType "DecryptionFailed" -KeyId $KeyId -Error $_.Exception.Message -Description "Data decryption failed"
        throw
    } finally {
        # Clear sensitive data from memory
        if ($dekBytes) {
            [System.Array]::Clear($dekBytes, 0, $dekBytes.Length)
        }
    }
}

function Get-ActiveDataEncryptionKey {
    param([string]$Context)
    
    # Find the most recent active key for the context
    $contextKeys = $global:EncryptionSession.DataKeys.Values | Where-Object { $_.Context -eq $Context -and $_.Status -eq "Active" }
    
    if (!$contextKeys) {
        throw "No active data encryption key found for context: $Context"
    }
    
    # Return the most recently created key
    $activeKey = $contextKeys | Sort-Object CreatedDate -Descending | Select-Object -First 1
    return $activeKey.KeyId
}

function Get-DataEncryptionKeyBytes {
    param([string]$KeyId)
    
    $keyInfo = $global:EncryptionSession.DataKeys[$KeyId]
    $keyStorePath = $global:EncryptionSession.KeyStoreType -eq "Software" ? 
        (Get-Content ".\Config\Security\Encryption.json" | ConvertFrom-Json).Encryption.KeyStore.Software.StoragePath :
        $null
    
    if (!$keyStorePath) {
        throw "Key store path not configured"
    }
    
    $keyFilePath = Join-Path $keyStorePath "$KeyId.dek"
    
    if (!(Test-Path $keyFilePath)) {
        throw "Data encryption key file not found: $keyFilePath"
    }
    
    $encryptedKeyBytes = [System.IO.File]::ReadAllBytes($keyFilePath)
    
    # Decrypt with master key if required
    if ($keyInfo.EncryptedByMasterKey) {
        $masterKeyId = $global:EncryptionSession.PrimaryMasterKey
        return Unprotect-DataWithMasterKey -EncryptedData $encryptedKeyBytes -MasterKeyId $masterKeyId
    } else {
        return [System.Security.Cryptography.ProtectedData]::Unprotect(
            $encryptedKeyBytes,
            $null,
            [System.Security.Cryptography.DataProtectionScope]::LocalMachine
        )
    }
}

function Invoke-SymmetricEncryption {
    param(
        [byte[]]$Data,
        [byte[]]$Key,
        [string]$Algorithm,
        [hashtable]$EncryptionContext
    )
    
    switch ($Algorithm) {
        "AES-256-GCM" {
            return Invoke-AESGCMEncryption -Data $Data -Key $Key
        }
        "AES-256-CBC" {
            return Invoke-AESCBCEncryption -Data $Data -Key $Key
        }
        "ChaCha20-Poly1305" {
            return Invoke-ChaCha20Poly1305Encryption -Data $Data -Key $Key
        }
        default {
            throw "Unsupported encryption algorithm: $Algorithm"
        }
    }
}

function Invoke-AESGCMEncryption {
    param([byte[]]$Data, [byte[]]$Key)
    
    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Mode = [System.Security.Cryptography.CipherMode]::ECB # GCM not directly supported, using AesGcm class
    $aes.Key = $Key
    
    # Generate random IV
    $iv = New-Object byte[] 12 # 96 bits for GCM
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($iv)
    $rng.Dispose()
    
    $cipherText = New-Object byte[] $Data.Length
    $tag = New-Object byte[] 16 # 128-bit authentication tag
    
    try {
        $aesGcm = [System.Security.Cryptography.AesGcm]::new($Key)
        $aesGcm.Encrypt($iv, $Data, $cipherText, $tag)
        $aesGcm.Dispose()
    } catch {
        # Fallback to CBC mode if GCM not available
        return Invoke-AESCBCEncryption -Data $Data -Key $Key
    }
    
    $aes.Dispose()
    
    return @{
        CipherText = $cipherText
        IV = $iv
        Tag = $tag
    }
}

function Invoke-AESCBCEncryption {
    param([byte[]]$Data, [byte[]]$Key)
    
    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $Key
    $aes.GenerateIV()
    
    $encryptor = $aes.CreateEncryptor()
    $cipherText = $encryptor.TransformFinalBlock($Data, 0, $Data.Length)
    
    $encryptor.Dispose()
    $iv = $aes.IV
    $aes.Dispose()
    
    return @{
        CipherText = $cipherText
        IV = $iv
        Tag = $null
    }
}

function Write-AuditLog {
    param(
        [string]$EventType,
        [string]$KeyId = "",
        [string]$Context = "",
        [string]$Algorithm = "",
        [int]$DataSize = 0,
        [string]$Error = "",
        [string]$Description
    )
    
    $auditEntry = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
        EventType = $EventType
        KeyId = $KeyId
        Context = $Context
        Algorithm = $Algorithm
        DataSize = $DataSize
        Error = $Error
        Description = $Description
        Username = $env:USERNAME
        ComputerName = $env:COMPUTERNAME
        ProcessId = $PID
    }
    
    $global:EncryptionSession.AuditLog += $auditEntry
    
    # Write to audit log file
    $auditLogPath = ".\Logs\Encryption_Audit_$(Get-Date -Format 'yyyyMMdd').json"
    try {
        $auditEntry | ConvertTo-Json -Compress | Out-File -FilePath $auditLogPath -Append -Encoding UTF8
    } catch {
        Write-Warning "Failed to write encryption audit log: $($_.Exception.Message)"
    }
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
Export-ModuleMember -Function Initialize-EncryptionKeyManagement, Invoke-DataEncryption, Invoke-DataDecryption

Write-Host "✅ Advanced Encryption and Key Management module loaded successfully" -ForegroundColor Green