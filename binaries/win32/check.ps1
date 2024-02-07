$chrometest = Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe'

if($chrometest -eq $true){
   Write-Host "Google Chrome is installed"
}else{
   Write-Host "Google Chrome is not installed"
}