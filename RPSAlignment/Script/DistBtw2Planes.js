
/// @brief
/// To extract part of the cloud inside the multiline, Tolerance will define the thickness to extract
/// @return the cloud extrated named "Extract_" + Multi.GetName()
function ExtractCloudWithMulti(Cloud, Multi, Tolerance, Direction, IsInside/*true: inside, false: outside*/, demo)
{	
	if (demo)
	{
		Cloud.SetVisibility(false); // enable the cloud
	}
	// compute normal
	var Normal = Direction;
	Normal.SetNormed();
	Normal = Normal.Mult(Tolerance);
	
	// compute right and left points
	var centroid = Multi.GetCentroidLinear();
	var rightPt = SPoint.New(centroid);		rightPt.Translate(Normal); // right pt
	var OppositeNormal = SVector.New(Normal);
	OppositeNormal.Opposite();
	var leftPt = SPoint.New(centroid);		leftPt.Translate(OppositeNormal); // left pt
	
	// compute right and left multiline (only for demo)
	if (demo)
	{
		// right multi
		var multiCopyRight = SMultiline.New(Multi);
		multiCopyRight.Translate(Normal);
		multiCopyRight.AddToDoc();
		Sleep(SHORT_TIME);
		
		// left multi
		var multiCopyLeft = SMultiline.New(Multi);
		multiCopyLeft.Translate(OppositeNormal);
		multiCopyLeft.AddToDoc();
		Sleep(SHORT_TIME);
	}
	
	//------------------------------------------------------------------------------------------------------------------
	// separate the cloud with 2 multilines
	//------------------------------------------------------------------------------------------------------------------
	var cleanResult = Cloud.Separate (Multi, Normal, rightPt, leftPt); 

	if (cleanResult.ErrorCode != 0)
		throw new Error('Impossible to clean the cloud.');
	
	var cleanCloud;
	if(IsInside)
	{
		cleanResult.OutCloud.Clear(); // clear the unused cloud
		cleanCloud = cleanResult.InCloud; // our new cloud
	}
	else
	{
		cleanResult.InCloud.Clear(); // clear the unused cloud
		cleanCloud = cleanResult.OutCloud; // our new cloud
	}
	
	cleanCloud.SetName("Extract_" + Multi.GetName());
	cleanCloud.AddToDoc();

	if (demo)
	{
		Sleep(LONG_TIME);
		multiCopyRight.SetVisibility(false);
		multiCopyLeft.SetVisibility(false);
	}
	
	return cleanCloud;
}

function GetUpperPt(Cloud)
{
	var it = Cloud.GetIterator();
	var Pt;
	var DEVIATION_MAX = 100; // !!! deviation maximal because default deviation is really high 
	var MaximalDev = 1e-25;
	var IsValid = false;
	if (it.IsValid())
	{
		var currentDeviation;
		do{
			currentDeviation = it.GetDeviation();
			if (currentDeviation < DEVIATION_MAX 
				&& currentDeviation > MaximalDev)
			{
				MaximalDev = currentDeviation;
				Pt = SPoint.New(it.GetPt());
				IsValid = true;
			}
		}
		while(it.GetNext())
	}
	if (IsValid == true)
	{
		var label = SLabel.New(4, 1);
		label.AttachToPoint( Pt );
		label.SetLineType([SLabel.XX, SLabel.YY, SLabel.ZZ, SLabel.Distance]) ;
		label.SetColType([SLabel.Measure]) ;
		label.SetCol(0, [ Pt.GetX(), Pt.GetY(), Pt.GetZ(), MaximalDev ]);
		label.AddToDoc();
		return Pt;
	}
}

function CreateArrowWithLabel(Point1, Point2)
{
	var distance = Point1.Distance(Point2); // compute distance between the two points
	var middlePt = Point1.Add(Point2).Div(2); // compute middle point
	
	// create a label on the middle point with the distance between the two points
	var label = SLabel.New(1, 1);
	label.AttachToPoint( middlePt );
	label.SetLineType([SLabel.Distance]) ;
	label.SetColType([SLabel.Measure]) ;
	label.SetCol(0, [ distance ]);
	label.SetComment("Maximal distance");
	label.AddToDoc();
	
	// create a multiline between the two points
	var multiDistance = SMultiline.New();
	multiDistance.InsertLast (Point1);
	multiDistance.InsertLast (Point2);
	multiDistance.AddArrows (false);
	multiDistance.AddToDoc();
	return {
		"Distance":distance
		}
}

function DistanceBtw2faces(demo)
{
	var Tolerance = 0.5;
	var Normal = SVector.New(1, 0, 0);
	//==================================================================================================================
	//==================================================================================================================
	// Right face clean cloud (remove external points)
	//==================================================================================================================	
	//==================================================================================================================
	var RightMulti = GetMulti_FromName("RightMulti");
	if (demo)
	{
		SViewSet.FromName("RightFace 1")[0].SetVisibility(true);
		RightMulti.SetVisibility(true);
		Sleep(LONG_TIME);
		ZoomOn([RightMulti]);
	}
	var RightcleanCloud = ExtractCloudWithMulti(MeasuredCloud, RightMulti, Tolerance, Normal, true/*true: inside, false: outside*/, demo);

	//==================================================================================================================
	// Inspection of the right face
	//==================================================================================================================
	var RightFacePoly = GetPoly_CADFromName("RightFace"); // the CAD polyhedron
	RightFacePoly.AddToDoc(); // necessary to revert normal
	RightFacePoly.Invert();
	if (demo)
		Sleep(LONG_TIME);
	RightFacePoly.RemoveFromDoc();
	
	var compareResult = RightFacePoly.Compare(RightcleanCloud, Tolerance/*DistMax*/, 2/*Mapping object: Measure cloud*/);
	if (compareResult.ErrorCode != 0)
		throw new Error( 'Comparison error.' );

	var RightCloud = compareResult.Cloud;
	RightCloud.SetName("RightCloud");
	RightcleanCloud.RemoveFromDoc(); // remove the previous cloud
	RightCloud.AddToDoc(); // add the inspected cloud
		

	//==================================================================================================================
	//==================================================================================================================
	// Left face clean cloud (remove external points)
	//==================================================================================================================
	//==================================================================================================================
	var LeftMulti = GetMulti_FromName("LeftMulti");
	if (demo)
	{
		SViewSet.FromName("LeftFace 1")[0].SetVisibility(true);
		LeftMulti.SetVisibility(true);
		Sleep(LONG_TIME);
		ZoomOn([LeftMulti]);
	}
	var LeftCleanCloud = ExtractCloudWithMulti(MeasuredCloud, LeftMulti, Tolerance, Normal, true/*true: inside, false: outside*/, demo);

	//==============================================================================================================
	// Inspection of the left face
	//==============================================================================================================
	var LeftFacePoly = GetPoly_CADFromName("LeftFace"); // the CAD polyhedron
	LeftFacePoly.AddToDoc(); // necessary to revert normal
	LeftFacePoly.Invert();
	if (demo)
		Sleep(LONG_TIME);
	LeftFacePoly.RemoveFromDoc();
	
	compareResult = LeftFacePoly.Compare(LeftCleanCloud, Tolerance/*DistMax*/, 2/*Mapping object: Measure cloud*/);
	if (compareResult.ErrorCode != 0)
		throw new Error( 'Comparison error.' );

	var LeftCloud = compareResult.Cloud;
	LeftCloud.SetName("LeftCloud");
	LeftCleanCloud.RemoveFromDoc(); // remove the previous cloud
	LeftCloud.AddToDoc();
	
	//==================================================================================================================
	//==================================================================================================================
	// Create a multiline between this two lines
	//==================================================================================================================
	//==================================================================================================================

	var RightPt = GetUpperPt(RightCloud);	
	if (demo)
		Sleep(SHORT_TIME);
	
	var LeftPt = GetUpperPt(LeftCloud);	
	if (demo)
		Sleep(SHORT_TIME);
		

	var centroidRight = RightMulti.GetCentroidLinear();
	centroidRight.SetX(RightPt.GetX());
	var centroidLeft = LeftMulti.GetCentroidLinear();
	centroidLeft.SetX(LeftPt.GetX());
	var distance = CreateArrowWithLabel(centroidRight, centroidLeft)
	if (demo)
		Sleep(SHORT_TIME);

	//==================================================================================================================
	// Display result
	//==================================================================================================================
		SetViewDir(AXIS_REVERSE_Y);
		ZoomOn([RightCloud, LeftCloud]);
	if (demo)
		Sleep(LONG_TIME);
	
	//==================================================================================================================
	//==================================================================================================================
	// write xml data
	//==================================================================================================================
	//==================================================================================================================
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
	if (xmlWriter)
	{
		var ImageName = "PlanesDistance.png";
		var ImagePath = generatedFilePath + ImageName;
		CreateScriptPicture(ImagePath);		
		
		xmlWriter.WriteStartElement("elm");
			xmlWriter.WriteAttribute("type", "plane");
			xmlWriter.WriteAttribute("name", "Planes-Inspection");
			
			WriteImage(xmlWriter, ImageName);
			
			RightPt.SetName("Point right face");
			LeftPt.SetName("Point left face");
			WriteMultiplePoints(xmlWriter, [RightPt, LeftPt]);
			
		// close tag Circle 
		xmlWriter.WriteEndElement();
	}
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
}



