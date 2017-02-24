@echo off
%~d0
cd %~dp0

rem Generate the HTML file from the template
call "G:\Compil\2017\exe\Release_x64\Tools\fmpp_lib\fmpp.bat" "I:/Sources/Github_Scripts/RPSAlignment\report\_TemplateReport.html" -o "I:/Sources/Github_Scripts/RPSAlignment\report\BlocHexmetReport.html" -E "UTF-8" -D "{doc: xml('I:/Sources/Github_Scripts/RPSAlignment/report/DataFile.xml')}"
if not %errorlevel% == 0 goto end

rem Generate the HTML file from the template
call "G:\Compil\2017\exe\Release_x64\Tools\fmpp_lib\fmpp.bat" "I:/Sources/Github_Scripts/RPSAlignment\report\_TemplateHeaderReport.html" -o "I:/Sources/Github_Scripts/RPSAlignment\report\BlocHexmetReport-header.html" -E "UTF-8" -D "{doc: xml('I:/Sources/Github_Scripts/RPSAlignment/report/DataFile.xml')}"
if not %errorlevel% == 0 goto end

rem Generate the HTML file from the template
call "G:\Compil\2017\exe\Release_x64\Tools\fmpp_lib\fmpp.bat" "I:/Sources/Github_Scripts/RPSAlignment\report\_TemplateFooterReport.html" -o "I:/Sources/Github_Scripts/RPSAlignment\report\BlocHexmetReport-footer.html" -E "UTF-8" -D "{doc: xml('I:/Sources/Github_Scripts/RPSAlignment/report/DataFile.xml')}"
if not %errorlevel% == 0 goto end

rem Generate the Pdf file from the HTML file
"G:\Compil\2017\exe\Release_x64\Tools\wkhtmltopdf\wkhtmltopdf.exe" "file:///I:/Sources/Github_Scripts/RPSAlignment/report/BlocHexmetReport.html" "I:/Sources/Github_Scripts/RPSAlignment\report\BlocHexmetReport.pdf" --header-html "file:///I:/Sources/Github_Scripts/RPSAlignment/report/BlocHexmetReport-header.html" --margin-top 20 --footer-html "file:///I:/Sources/Github_Scripts/RPSAlignment/report/BlocHexmetReport-footer.html" --margin-bottom 10
if not %errorlevel% == 0 goto end

rem Display the Pdf file
call "I:/Sources/Github_Scripts/RPSAlignment\report\BlocHexmetReport.pdf"
:end
