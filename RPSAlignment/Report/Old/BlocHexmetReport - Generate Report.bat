@echo off
%~d0
cd %~dp0

rem Copy template files: css, logo, etc.
xcopy /Y /Q "HtmlResources\*.*" "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\BlocHexmetReport_files\"

rem Generate the HTML file from the template
call "C:\Program Files\3DReshaperMeteor17.0_x64\Tools\fmpp_lib\fmpp.bat" "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\_TemplateReport.html" -o "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\BlocHexmetReport.html" -E "UTF-8" -D "{doc: xml('C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script/../report/DataFile.xml')}"
if not %errorlevel% == 0 goto end

rem Generate the HTML file from the template
call "C:\Program Files\3DReshaperMeteor17.0_x64\Tools\fmpp_lib\fmpp.bat" "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\_TemplateHeaderReport.html" -o "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\BlocHexmetReport-header.html" -E "UTF-8" -D "{doc: xml('C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script/../report/DataFile.xml')}"
if not %errorlevel% == 0 goto end

rem Generate the HTML file from the template
call "C:\Program Files\3DReshaperMeteor17.0_x64\Tools\fmpp_lib\fmpp.bat" "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\_TemplateFooterReport.html" -o "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\BlocHexmetReport-footer.html" -E "UTF-8" -D "{doc: xml('C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script/../report/DataFile.xml')}"
if not %errorlevel% == 0 goto end

rem Generate the Pdf file from the HTML file
"C:\Program Files\3DReshaperMeteor17.0_x64\Tools\wkhtmltopdf\wkhtmltopdf.exe" "file:///C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script/../report/BlocHexmetReport.html" "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\BlocHexmetReport.pdf" --header-html "file:///C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script/../report/BlocHexmetReport-header.html" --margin-top 20 --footer-html "file:///C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script/../report/BlocHexmetReport-footer.html" --margin-bottom 10
if not %errorlevel% == 0 goto end

rem Display the Pdf file
call "C:/Users/Public/Documents/3DReshaperMeteor 2017 (x64)/Samples/Script\..\report\BlocHexmetReport.pdf"
:end
