// =======================================================================
// =========================== DESCRIPTION ===============================
// This script will show you how to make an alignment of a mechanical part 
// using the RPS method. 
// The script requests to click points on the scene (3 for the first plane, 
// 2 for the second plane, 1 for the last one). 
// For each series of points, the script shows a red plane in the model. 
// The  user has to define the corresponding points on the scanned data. 
// Once the user selects 6 points, the alignment is computed. A best fit is then applied. 
// 
// Once the part is well aligned, the script does :
// - a comparison between 2 planes
// - an extraction of 2 concentric cylinders
// - an extraction of a circle concentric to the cylinders
// - an inspection of the face with a free form
// - create some lables with distance and point coordinates
// - create a pdf report and open it
// =======================================================================

var NB_LOOP = 1;
var idxLoop = 0;
while(idxLoop < NB_LOOP)
{
idxLoop++;
print("currentLoop: " + idxLoop);

// To enable part of the script
var IsDistBtwFacesEnable = false; // <===================================================== compute distance between two planes
var IsCylinderEnable = true; // <========================================================= compute cylinder coaxiality
var IsCircleEnable = true; // <=========================================================== compute circle center position
var IsWaveFaceEnable = true; // <========================================================= inspection of the wave face
var IsCreateReport = true; // <========================================================= creating the report

var AskCloudFile = false; // <============================================================ if we ask a cloud to the user
var AskAlignPoint = true; // <=========================================================== if we ask point click to the user

var samplePath = CurrentScriptPath() + '\\'; // <=========================== global path to change
print("samplePath="+samplePath);
var reportDirectory = samplePath + "report\\";
var scriptDirectory = samplePath + "Script\\";

// data for the report
var userName = "MyUserName"; // <================================================================ name of the user in the report
var d = new Date();
var time = d.toLocaleTimeString();
var date = d.toLocaleDateString();

var resourceDir = "HtmlResources";
var templateHtmlFileName = reportDirectory + "_TemplateReport.html";
var templateFooterHtmlFileName = reportDirectory + "_TemplateFooterReport.html";
var templateHeaderHtmlFileName = reportDirectory + "_TemplateHeaderReport.html";
var outputPdfReport = reportDirectory + "BlocHexmetReport.pdf";
var generatedFilePath = reportDirectory + "BlocHexmetReport_resources/";
var xmlFile = reportDirectory + "DataFile.xml";

mkdir(generatedFilePath);
copydircontent(reportDirectory+resourceDir,generatedFilePath);

// element to make visibility of the script 
var demo = true;
var LONG_TIME = 2000;
var SHORT_TIME = 1000;
var CADName = "H009357_revA";



if (demo)
{
	var goodLeftDirection = SVector.New(-0.31, 0.8, -0.49);
	var goodRightDirection = SVector.New(0.78, 0.57, -0.19);
	var goodLeftUp = SVector.New(-0.15, 0.42, 0.89);
	var goodRightUp = SVector.New(0.15, 0.10, 0.98);
}

Include(scriptDirectory + "LoadData.js");
Include(scriptDirectory + "AlignData.js");
Include(scriptDirectory + "GetData.js");
Include(scriptDirectory + "ConcentricCylinder.js");
Include(scriptDirectory + "DistBtw2Planes.js");
Include(scriptDirectory + "CreatePicture.js");
Include(scriptDirectory + "WriteXML.js");

//======================================================================================================================
//	Load Data (Cloud and CAD object) and multiple data to help to inspection
//======================================================================================================================
ZoomAll();
LoadRsh(samplePath + "RPSOnRef.rsh");

var result = SCloud.FromName("CloudToAlign");
if (result.length != 1)
	throw new Error("Not only one cloud named CloudToAlign");
var MeasuredCloud = result[0]
MeasuredCloud.SetVisibility(true);

//----------------------------------------------------------------------------------------------------------------------
// Discretize CAD object 
//----------------------------------------------------------------------------------------------------------------------
var CADPoly = GetPoly_CADFromName(CADName); // the CAD polyhedron
CADFromName(CADName).SetVisibility(false); // hide the CAD object
CADPoly.AddToDoc();
CADPoly.SetTransparency(80);
var CADPolyArr = new Array();
CADPolyArr.push(CADPoly);
ZoomOn( CADPolyArr );

//----------------------------------------------------------------------------------------------------------------------
// change the view
//----------------------------------------------------------------------------------------------------------------------
SetCameraMode (ORTHOGRAPHIC);
if (demo)Sleep(LONG_TIME); // time to see all the element

//======================================================================================================================
// Make an RPS alignment
//======================================================================================================================
RPS(MeasuredCloud, CADPoly, demo, AskAlignPoint);

ZoomAll();// zoom on all the objects after the first alignment
if (demo)
{
	SetViewDir(goodLeftDirection, goodLeftUp);
	Sleep(LONG_TIME);
}
//======================================================================================================================
// Make a Best Fit
//======================================================================================================================
BestFit(CADPoly, MeasuredCloud);
if (demo)
	Sleep(LONG_TIME);

//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
{
	//======================================================================================================================
	// Open file to create Report
	//======================================================================================================================
	// Open XML file to write
	var file = SFile.New( xmlFile );
	if ( !file.Open(SFile.WriteOnly) )
		throw new Error( 'Failed to write file: ' +  xmlFile );

	var xmlWriter = SXmlWriter.New();
	// set device (here file)to streamwriter
	xmlWriter.SetFile(file);
	// Writes a document start with the XML version number version.
	xmlWriter.WriteStartDocument();
	xmlWriter.WriteStartElement("blocHexmet");
	{
		xmlWriter.WriteStartElement("ReportInfo");
		xmlWriter.WriteAttribute("date", date);
		xmlWriter.WriteAttribute("time", time);
		xmlWriter.WriteAttribute("username", userName);
		xmlWriter.WriteAttribute("filename", generatedFilePath);
		// close tag ReportInfo 
		xmlWriter.WriteEndElement();
		xmlWriter.WriteStartElement("elms");
	}
}
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__

try
{

	//======================================================================================================================
	// Distance between two faces
	//======================================================================================================================
	// first result
	if (IsDistBtwFacesEnable == true)
	{
		DistanceBtw2faces(demo);
	}

	//======================================================================================================================
	// Concentric cylinder ?
	//======================================================================================================================
	if (IsCylinderEnable == true)
	{
		SViewSet.FromName("Cylinder 1")[0].SetVisibility(true);
		IsConcentricCylinder(demo);
	}

	//======================================================================================================================
	// Circle Inspection ?
	//======================================================================================================================
	if (IsCircleEnable == true)
	{
		SViewSet.FromName("Circle 1")[0].SetVisibility(true);

		var Tolerance = 1.5;
		var Circle = GetMulti_FromName("Circle");
		if (demo)
		{
			Circle.SetVisibility(true);
			MeasuredCloud.SetVisibility(true);
			ZoomOn([Circle]);
			Sleep(LONG_TIME);
		}
		CircleOut = CreateConcentricCircle(Circle, SVector.New(0, 1, 0), Tolerance, SMultiline.OTHER_SIDE);
		CircleOut.SetName("CircleOut")
		CircleOut.AddToDoc();
		if (demo)Sleep(LONG_TIME);
		Circle.SetVisibility(false);
		var extractedCloud = ExtractCloudWithMulti(MeasuredCloud, CircleOut, Tolerance, Tolerance, SVector.New(0, 1, 0), true/*true: inside, false: outside*/, demo);
		var bestCircle = extractedCloud.BestCircle(
			SCloud.INNER_CIRCLE // [in] Method method to measure the circle (best, inner, outer, circularity, max inscribed, min circumscribed)  
			);
		if (bestCircle.ErrorCode != 0)
			throw new Error('Impossible to create the Best circle.');
		if (demo)
		{
			Circle.SetVisibility(true);
			extractedCloud.SetVisibility(false);
			CircleOut.SetVisibility(false);
		}
		bestCircle.Circle.AddToDoc();
		var distance = CreateArrowWithLabel(bestCircle.Circle.GetCenter(), Circle.GetCentroidLinear());
		if (demo)
			Sleep(LONG_TIME);
	
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
		if (xmlWriter)
		{
			SetViewDir(AXIS_REVERSE_Y);
			ZoomOn([bestCircle.Circle, Circle]);
			Sleep(33); // time of the ZoomOn function
			
			var ImageName = "Circle.png";
			var ImagePath = generatedFilePath + ImageName;
			CreateScriptPicture(ImagePath);
			xmlWriter.WriteStartElement("elm");
				xmlWriter.WriteAttribute("type", "circle");
				xmlWriter.WriteAttribute("name", "Circle-Compare");
				
				WriteImage(xmlWriter, ImageName);
				
				var centerNominal = Circle.GetCentroidLinear();
				centerNominal.SetName("Nominal center");
				var centerMeasure = bestCircle.Circle.GetCenter();
				centerMeasure.SetName("Measured center");
				WriteMultiplePointsWithNormals(xmlWriter
					, [centerMeasure, centerNominal]
					, [bestCircle.Circle.GetNormal(), Circle.GetNormal().Vector]);
				
			// close tag Circle 
			xmlWriter.WriteEndElement();
		}
	}
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
	
	if (IsWaveFaceEnable == true)
	{
//======================================================================================================================
// Wave Surface inspection ?
//======================================================================================================================
		SViewSet.FromName("Wave 1")[0].SetVisibility(true);

		var WaveCadName = "WaveFace";
		if (demo)
		{
			var cadWave = CADFromName(WaveCadName);
			cadWave.SetVisibility(true);
			MeasuredCloud.SetVisibility(true);
			//SetViewDir(goodRightDirection, goodRightUp);
			ZoomOn([cadWave]);
			Sleep(LONG_TIME);
		}
		var Tolerance = 0.8;
		var WaveMultiOut = GetMulti_FromName("WaveMultiOut");
		var extractedCloud = ExtractCloudWithMulti(MeasuredCloud, WaveMultiOut, 30, 1, SVector.New(0, 1, 0), true/*true: inside, false: outside*/, demo);
		if (demo)
		{
			MeasuredCloud.SetVisibility(false);
		}


		var WavePoly = GetPoly_CADFromName(WaveCadName); // the CAD polyhedron
		var ResultCompare = WavePoly.Compare(extractedCloud, Tolerance, 2, true);
		if (ResultCompare.ErrorCode != 0)
			throw new Error('Impossible to make comparison of the wave face.');
			
		if (demo)
		{
			extractedCloud.SetVisibility(false);
			cadWave.SetVisibility(false);
		}
		ResultCompare.Cloud.SetName("Compare_WavePoly");
		ResultCompare.Cloud.AddToDoc();
			
		if (demo)
			Sleep(LONG_TIME);
		
		// disable all the labels
		var AllLabels = SLabel.All();
		for (var ii = 0; ii < AllLabels.length; ii++)
			AllLabels[ii].SetVisibility(false);
		// add new label
		var upperPt = GetUpperPt(ResultCompare.Cloud);
	
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
		if (xmlWriter)
		{
			SetViewDir(AXIS_Y);
			ZoomOn([WavePoly]);
			Sleep(33); // time of the ZoomOn function
			
			var ImageName = "WaveFace.png";
			var ImagePath = generatedFilePath + ImageName;
			CreateScriptPicture(ImagePath);
			
			xmlWriter.WriteStartElement("elm");
				xmlWriter.WriteAttribute("type", "surface");
				xmlWriter.WriteAttribute("name", "WaveFace-Inspection");
				
				WriteImage(xmlWriter, ImageName);
				
				upperPt.SetName("Maximal point");
				WriteMultiplePoints(xmlWriter, [upperPt]);
				
			// close tag Circle 
			xmlWriter.WriteEndElement();
		}
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
		for (var ii = 0; ii < AllLabels.length; ii++)
		{
			if( AllLabels[ii].GetName() == "Fit of  CloudToAlign")
				AllLabels[ii].SetVisibility(false);
			else
				AllLabels[ii].SetVisibility(true);
		}
			
	}//end_IsWaveFaceEnable
	
	SViewSet.FromName("LeftFace 1")[0].SetVisibility(true);
	ZoomAll();
}
catch(e)
{
	// close tag elms 
	xmlWriter.WriteEndElement();
	// close tag blocHexmet 
	xmlWriter.WriteEndElement();
	// end document
	xmlWriter.WriteEndDocument();
	file.Close();
	throw e;
}
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
{
	// close tag elms 
	xmlWriter.WriteEndElement();
	// close tag blocHexmet 
	xmlWriter.WriteEndElement();
	// end document
	xmlWriter.WriteEndDocument();
	file.Close();
}
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__


//======================================================================================================================
// Create Pdf Report ?
//======================================================================================================================
if(IsCreateReport == true)
{
	// @retval Array.ErrorCode The error code:\n
	// - 0	OK
	// - 1	An exception occurred !
	// - 2	Failed to generate pdf report. See 'Array.ErrorMsg' for error details.
	// @retval Array.ErrorMsg  A message which describe why the generation of the pdf report failed
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
			true // [in] If true:
			// - generate a batch file for the user that can be used to launch again the creation of the final pdf file
			// - keep the intermediate html file which have been used to generate the pdf file.
			);
	if(pdfRet.ErrorCode != 0)
	{
		print("Pdf Generation error:\n" + pdfRet.ErrorMsg);
	}
	else
	{
		// Open PDF file
		OpenUrl("file:///" + outputPdfReport);
	}
}

} // end_while(NB_LOOP)
