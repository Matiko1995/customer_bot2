param(
  [switch]$DryRun
)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$services = @(
  @{
    Name = 'tenant-identity'
    Command = 'npm run service:tenant-identity'
    Env = @{}
  },
  @{
    Name = 'knowledge-indexing'
    Command = 'npm run service:knowledge-indexing'
    Env = @{}
  },
  @{
    Name = 'agent-runtime'
    Command = 'npm run service:agent-runtime'
    Env = @{}
  },
  @{
    Name = 'embed-delivery'
    Command = 'npm run service:embed-delivery'
    Env = @{}
  },
  @{
    Name = 'app'
    Command = 'npm run app:dev'
    Env = @{
      TENANT_IDENTITY_SERVICE_URL = 'http://127.0.0.1:3301'
      KNOWLEDGE_INDEXING_SERVICE_URL = 'http://127.0.0.1:3302'
      AGENT_RUNTIME_SERVICE_URL = 'http://127.0.0.1:3303'
      EMBED_DELIVERY_SERVICE_URL = 'http://127.0.0.1:3304'
    }
  }
)

if ($DryRun) {
  foreach ($service in $services) {
    Write-Output "[$($service.Name)] $($service.Command)"
  }
  return
}

foreach ($service in $services) {
  $envLines = @()
  foreach ($pair in $service.Env.GetEnumerator()) {
    $envLines += "`$env:$($pair.Key)='$($pair.Value)'"
  }

  $commandLines = @(
    "Set-Location '$root'"
  ) + $envLines + @(
    $service.Command
  )

  $command = ($commandLines -join '; ')

  Start-Process -FilePath 'powershell' -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command', $command
  )
}

Write-Output 'Local stack launch commands have been started.'
Write-Output 'App: http://127.0.0.1:3203/'
Write-Output 'Admin: http://127.0.0.1:3203/admin/login'
Write-Output 'Services: 3301/3302/3303/3304'
