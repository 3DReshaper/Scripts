Include(CurrentScriptPath() + '\\' + "PDFFunctions.js");

// Checking that the file contains viewsets
if (SViewSet.All().length == 0)
{// No view sets available
	var myDialogerror = SDialog.New( 'Error' );
	
	myDialogerror.AddLine( 'This scripts requires to create view sets', false, { 'align':'center', 'size' : 8 } );
	var result = myDialogerror.Execute();
	throw new Error("Exit");
}

// data for the report
var myDialog = SDialog.New( 'Report variable');
myDialog.AddLine( 'User Name:', true, { 'align':'right' }, '');
myDialog.AddLine( 'Report Title:', true, { 'align':'right' } , 'Inspection report' );
// the Execute function display the dialog box, and launch a loop waiting when the dialog box is shutdown
var result = myDialog.Execute();
if ( result.ErrorCode != 0 ) // result == 0 means the user click on the "OK" button
	throw new Error("Exit");
	
// Retrieve output values
var values = result.InputTbl; // InputTbl contains all the content of the input box
var userName = values[0]; // use parseFloat to convert the string to a number
var reportTitle =  values[1]; 

var d = new Date();
var time = d.toLocaleTimeString();
var date = d.toLocaleDateString();

// Creating temporary folders
var samplePath = CurrentScriptPath() + '\\';
var reportDirectory = samplePath + '\\TemporaryReportFiles\\';
var scriptDirectory = samplePath;
var generatedFilePath = reportDirectory + "Report_resources/";
var xmlFile = reportDirectory + "DataFile.xml";

mkdir(reportDirectory);
mkdir(generatedFilePath);
copydircontent(samplePath+"HtmlResources",generatedFilePath);

// Creating the xml file and the images
{	//==================
	// Open XML file to write
	var file = SFile.New( xmlFile );
	if ( !file.Open(SFile.WriteOnly) )
		throw new Error( 'Failed to write file: ' +  xmlFile );

	var xmlWriter = SXmlWriter.New();
	// set device (here file)to streamwriter
	xmlWriter.SetFile(file);
	// Writes a document start with the XML version number version.
	xmlWriter.WriteStartDocument();
	xmlWriter.WriteStartElement("ReportData");
	{
		xmlWriter.WriteStartElement("ReportInfo");
		xmlWriter.WriteAttribute("date", date);
		xmlWriter.WriteAttribute("time", time);
		xmlWriter.WriteAttribute("username", userName);
		xmlWriter.WriteAttribute("reportTitle", reportTitle);
		xmlWriter.WriteAttribute("filename", generatedFilePath);
		// close tag ReportInfo 
		xmlWriter.WriteEndElement();
		xmlWriter.WriteStartElement("elms");
		{
			// looping on all viewsets
			allVS = SViewSet.All();
			for(idxVS=0; idxVS<allVS.length; idxVS++)
			{
				allVS[idxVS].SetVisibility(true);
				FlushDisplay();
				var ImageName = allVS[idxVS].GetName() + ".png";
				var ImagePath = generatedFilePath + ImageName;
				CreateScriptPicture(ImagePath);
				
				xmlWriter.WriteStartElement("elm");
					xmlWriter.WriteAttribute("type", "surface");
					xmlWriter.WriteAttribute("name", allVS[idxVS].GetName());
					
					WriteImage(xmlWriter, ImageName);
							
				xmlWriter.WriteEndElement(); // close tag
			}
		}
		xmlWriter.WriteEndElement();// close tag elms 
	}
	xmlWriter.WriteEndElement();// close tag ReportData 
	// end document
	xmlWriter.WriteEndDocument();
	file.Close();
}


var templateHtmlFileName = samplePath + "_TemplateReport.html";
var templateFooterHtmlFileName = samplePath + "_TemplateFooterReport.html";
var templateHeaderHtmlFileName = samplePath + "_TemplateHeaderReport.html";
var outputPdfReport = reportDirectory + "Report.pdf";
outputPdfReport = GetSaveFileName("Save report","PDF (*.pdf)",reportDirectory);

var pdfRet = CreatePdfReport(
		templateHtmlFileName, // [in] Template html file use as an input of freemarker
		outputPdfReport, // [in] Output pdf file create from the template using freemarker
		"", // [in] Name of the sub folder where are extra html file (.jpg, .css, .js).
		// If string is empty, not extra file will be copied.
		xmlFile, // [in] Can be empty. If not it's the Xml file that will be used to
		// generate the final html file from the template using freemarker.
		templateHeaderHtmlFileName, // [in] Template header html file use as an input of freemarker
		// and that will be used by wkhtmltopdf to add a header at the beginning of each page.
		// see http://madalgo.au.dk/~jakobt/wkhtmltoxdoc/wkhtmltopdf-0.9.9-doc.html for more help.
		templateFooterHtmlFileName, // [in] Template footer html file use as an input of freemarker
		// and that will be used by wkhtmltopdf to add a footer at the end of each page.
		false // [in] If true:
		// - generate a batch file for the user that can be used to launch again the creation of the final pdf file
		// - keep the intermediate html file which have been used to generate the pdf file.
		);
if(pdfRet.ErrorCode != 0)
{
	print("Pdf Generation error:\n" + pdfRet.ErrorMsg);
}
else
{
	OpenUrl("file:///" + outputPdfReport);// Open PDF file
}
