# Use the checkout-local Node 22 if the system Node is older.
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeExecutable = Join-Path $projectRoot 'node_modules/node/bin/node.exe'
$npmCommand = (Get-Command npm).Source
$npmDirectory = Split-Path -Parent $npmCommand
$npmCli = Join-Path $npmDirectory 'node_modules/npm/bin/npm-cli.js'
& $nodeExecutable $npmCli @args
exit $LASTEXITCODE
