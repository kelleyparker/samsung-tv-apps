param(
    [string]$Tv = '192.168.1.221:26101',
    [string]$Profile = ''
)
$ErrorActionPreference = 'Stop'
$tizen = 'C:\tizen-studio\tools\ide\bin\tizen.bat'
$sdb   = 'C:\tizen-studio\tools\sdb.exe'
$root  = $PSScriptRoot
$out   = Join-Path $root '.buildResult'

if (-not $Profile) {
    if ($Tv -match '192\.168\.1\.88') {
        $Profile = 'LivingRoomOnly'
    } else {
        $Profile = 'SamsungAllTVs'
    }
}

& $sdb connect $Tv | Out-Host
& $tizen build-web -- $root | Select-Object -Last 2 | Out-Host
& $tizen package -t wgt -s $Profile -- $out | Select-Object -Last 1 | Out-Host
# tizen names the wgt after <name>; the apostrophe breaks install, so rename it.
Get-ChildItem "$out\*.wgt" | Where-Object Name -ne 'stephani37.wgt' | Move-Item -Destination "$out\stephani37.wgt" -Force
& $sdb -s $Tv shell 0 kill Stph37Bday | Out-Null
& $tizen install -n stephani37.wgt -s $Tv -- $out | Select-Object -Last 2 | Out-Host
& $tizen run -p Stph37Bday.BabyGirl37 -s $Tv | Select-Object -Last 1 | Out-Host
