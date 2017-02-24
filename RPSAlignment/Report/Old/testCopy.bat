@echo off
%~d0
cd %~dp0

rem Copy template files: css, logo, etc.
xcopy /Y /Q "HtmlResources\*.*" "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\BlocHexmetReport_files\"

pause