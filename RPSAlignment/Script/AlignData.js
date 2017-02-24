
function SelNbPoints(NbPoints)
{
	var idxPt = 0;	
	var tblPt = new Array();
	while (idxPt < NbPoints)
	{
		print( "Select point number: " + (idxPt+1) );
		
		var clickedResult = SPoint.FromClick();
		switch (clickedResult.ErrorCode)
		{
		case 0:
			idxPt++;
			tblPt.push(clickedResult.Point);
			break;
		case 1: // continue (click is not valid)
			break;
		case 2: // an escape key has been pressed
			throw new Error( 'The user has aborted the script.' );
			break;
		default:
			throw new Error( 'FromClick(): Unknown error.' );
			break;
		}
	}
	return tblPt;
}

function RPS(MeasuredCloud, CADObject, demo, AskAlignPoint)
{
	function CAD_Dir()
	{
		SetViewDir(goodLeftDirection, goodLeftUp);
		ZoomOn([CADObject]);
	}
	function Cloud_Dir(ScriptDir)
	{
		SetViewDir(ScriptDir);
		ZoomOn([MeasuredCloud]);
	}
	function HighlightFace(FaceName, Direction)
	{
		var FaceToHighLight = CADFromName(FaceName); // the CAD polyhedron
		FaceToHighLight.Translate(Direction); // move the face to see it
		FaceToHighLight.SetVisibility(true);
		var previousColors = FaceToHighLight.GetColors();
		FaceToHighLight.SetColors(1, 0, 0);
		Sleep(LONG_TIME);
		FaceToHighLight.SetColors(previousColors.Red, previousColors.Green, previousColors.Blue);
		FaceToHighLight.SetVisibility(false);
	}
	
	
	var targetPts = new Array();
	var sourcePts = new Array();
	var constraints = new Array();
	
	
	//======================================================================================================================
	// Z axis
	//======================================================================================================================
	// Get point from the CAD object
	print("Select 3 points on the Flat Top View");
	
	if (demo)
	{		
		CAD_Dir();
		HighlightFace("RPSTopFace", SVector.New(0, 0, 0.1));
	}
	constraints.push([false, false, true]);
	targetPts.push(SPoint.New(30, -30, 100));
	constraints.push([false, false, true]);
	targetPts.push(SPoint.New(60, -100, 100));
	constraints.push([false, false, true]);
	targetPts.push(SPoint.New(150, -70, 100));
	
	// Get point from the measure
	Cloud_Dir(AXIS_Z);
	var selPts;
	if (AskAlignPoint == true)
		selPts = SelNbPoints(3);
	else
	{
		print("Pre-compute selection: Point 1");
		print("Pre-compute selection: Point 2");
		print("Pre-compute selection: Point 3");
		selPts = new Array(SPoint.New(519.865762,89.102664,166.243676), SPoint.New(592.022977,71.780039,167.050163), SPoint.New(626.881957,156.085970,167.435868));
	}
	sourcePts.push(selPts[0]);
	sourcePts.push(selPts[1]);
	sourcePts.push(selPts[2]);
	
	//======================================================================================================================
	// Y axis
	//======================================================================================================================
	// Get point from the CAD object
	print("Select 2 points on the Flat Right View");
	if (demo)
	{
		CAD_Dir();
		HighlightFace("RPSRightFace", SVector.New(0, -0.1, 0));
	}
	constraints.push([false, true, false]);
	targetPts.push(SPoint.New(20, -120, 80));
	constraints.push([false, true, false]);
	targetPts.push(SPoint.New(200, -120, 80));
	
	// Get point from the measure
	Cloud_Dir(AXIS_REVERSE_Y);
	var selPts;
	if (AskAlignPoint == true)
		selPts = SelNbPoints(2);
	else
	{
		print("Pre-compute selection: Point 1");
		print("Pre-compute selection: Point 2");
		selPts = new Array(SPoint.New(576.413936,22.912988,149.135835), SPoint.New(690.425212,160.533471,142.900065));
	}
	sourcePts.push(selPts[0]);
	sourcePts.push(selPts[1]);
	
	//======================================================================================================================
	// X axis
	//======================================================================================================================
	// Get point from the CAD object
	print("Select 1 points on the Flat Front View");
	if (demo)
	{
		CAD_Dir();
		HighlightFace("RPSFrontFace", SVector.New(0.1, 0, 0));
	}
	constraints.push([true, false, false]);
	targetPts.push(SPoint.New(240, -90, 30));
	
	// Get point from the measure
	Cloud_Dir(AXIS_X);
	var selPts;
	if (AskAlignPoint == true)
	{
		selPts = SelNbPoints(1);
		print("All points set => Compute!");
	}
	else
	{
		print("Pre-compute selection: Point 1");
		selPts = new Array(SPoint.New(696.792128,216.216692,95.313463));
	}
	sourcePts.push(selPts[0]);
	
	//======================================================================================================================
	// Compute RPS alignement
	//======================================================================================================================
	if (demo)
		CAD_Dir(); 
	// Create our RPS alignment matrix
	var rpsMatrix = SMatrix.New();
	// Compute our RPS alignment matrix
	var rpsResult = rpsMatrix.InitRPSAlignment(targetPts,sourcePts,constraints,[MeasuredCloud],1);
	// Check for computation's success
	if ( rpsResult.ErrorCode != 0 )
		throw new Error('RPS init matrix failed.');

	MeasuredCloud.ApplyTransformation( rpsMatrix ); // be carefull the cloud will be definitively modified
}

function BestFit(Poly, MeasuredCloud)
{
	//======================================================================================================================
	// Compute best fit
	//======================================================================================================================
	// Compute our bestFit alignment matrix
	var bestFitResult = SMatrix.BestFitCompute([Poly, MeasuredCloud]);
	// Check for computation's success
	if ( bestFitResult.ErrorCode != 0 )
		throw new Error('Best fit init matrix failed.');
		
	MeasuredCloud.ApplyTransformation( bestFitResult.MatrixTbl[1] ); // be carefull the cloud will be definitively modified
}


function CreateCircleBy3Pt(tblPts)
{
	
	var bestCirRes = pointOnCir.BestCircle(SCircle.INNER_CIRCLE );
	if(bestCirRes.ErrorCode!=0) 
		throw new Error('Problem when creating circle.');
	
	bestCirRes.Circle.AddToDoc();
	return bestCirRes.Circle;
}




