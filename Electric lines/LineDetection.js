// ------------------------ HOW TO USE IT --------------------------------------------
// 1. Adjust the sampling step of the polyline to extract from the cloud
// 	The sampling step must be big enough to include line curvature and to have anough points in the cloud in a step size
// 	The sampling step must be small enough to have good accuracy and to avoid merging several lines
//    Typically for electric lines or catenary detection a good value is between 0.5 and 2m
// 2. Click a point on a line to extract (seed point) to launch computation


var SHOW_ALL = false; // show all geometric elements used for computation
// ATTENTION: displaying al these elements may lead to high memory usage and slower computation  

/// @brief 
/// compute the max distance between points of a cloud and a line
/// @ return
/// the distance
function MaxDistance(	_iCloud, // [in] the cloud
						_iLine	// [in] the line
						)
{
	var dist=0;
	var it = _iCloud.GetIterator();
	while(it.IsValid())
	{
		d = _iLine.Distance(it.GetPt());
		if(d>dist)
			dist=d;
		it.GetNext();
	}
	return dist;
}

/// @brief
/// Extract the 1st segment of the line using points included in a shere around _iExtractPt
/// @return
/// Array.ErrorCode: a number, 0 if OK, positive number otherwise
/// Array.Point0: the first point a the extracted segment
/// Array.Point1: the last point a the extracted segment
/// Array.Dist: the maximum distance betwenn points in the sphere and the computed segment
function InitLine(
			_iInitialCloud 		// [in] the cloud to extract the line
			, _iExtractPt 		// [in] the initial seed, the point clicked by the user (must be on the line) 
			, _iSphereRadius 	// [in] the sphere radius defining area in the cloud where we will extract the segment
			)
{
	// Extract part of the cloud
	var sphere = SSphere.New(_iExtractPt, _iSphereRadius);
	if(SHOW_ALL==true)
		sphere.AddToDoc();

	var result = _iInitialCloud.SeparateFeature(sphere, 0);
	if (result.ErrorCode != 0)
		return {
			"ErrorCode": 1
			, "Point0": 0
			, "Point1": 0
			, "Dist": 0
			};
	
	// the cloud outside the sphere is cleared to save RAM
	result.OutCloud.Clear(); 
	var cloudSphere = result.InCloud; // the cloud inside the sphere

	// compute a best line with points inside the sphere
	result = cloudSphere.BestLine();
	if (result.ErrorCode != 0)
		return {
			"ErrorCode": 2
			, "Point0": 0
			, "Point1": 0
			, "Dist": 0
			};
		
	var line = result.Line;
	var firstPt = line.GetFirstPoint();
	var lastPt = line.GetLastPoint();
	var dist = MaxDistance(cloudSphere,line);

	return {
		"ErrorCode": 0
		, "Point0": firstPt
		, "Point1": lastPt
		, "Dist": dist
		};
}

/// @brief
/// Search a segment of line in a cone
/// @return
/// Array.ErrorCode: a number, 0 if OK, positive number otherwise
/// Array.Point0: the first point a the extracted segment
/// Array.Point1: the last point a the extracted segment
/// Array.Dist: the maximum distance betwenn points in the cone and the computed segment
function NextLine(	_iCloud, 	// [in] the cloud to extract the line
					_iPoint, 		// [in] cone center
					_iDirection,	// [in] cone direction
					_iRadius, 	// [in] cone small radius
					_iLength	// [in] cone lenght
					)
{
	// Create a cone with the direction of the last line
	var cone = SCone.New(
		_iPoint
		, _iDirection
		, _iRadius
		, _iRadius*2
		, _iLength
		);
	if(SHOW_ALL==true)
		cone.AddToDoc();
	
	// Separate the cloud with this cone to work only on the stack part
	var result = _iCloud.SeparateFeature(cone,0);
		
	// the cloud outside the cone is cleared to save RAM
	result.OutCloud.Clear();
	var cloudTrack = result.InCloud;
	
	// check if the number of point is usable
	if (cloudTrack.GetNumber() < 5)
	{
		return {
			"ErrorCode": 1
			, "Point": 0
			, "Point": 0
			, "Dist": 0
			};
	}

	// compute a best line with points inside the cone
	result = cloudTrack.BestLine();
	
	if (result.ErrorCode != 0)
		return {
			"ErrorCode": 2
			, "Point": 0
			, "Point": 0
			, "Dist": 0
			};
		
	var line = result.Line;
	var firstPt = line.GetFirstPoint();
	var lastPt = line.GetLastPoint();

	// check if we still search in the right direction
	var dir = SVector.New(firstPt, lastPt);
	dir.SetNormed();
	var scalarProduct = SVector.Dot(dir, _iDirection);
	if(scalarProduct < 0)
	{// if wrong direction, revert
		firstPt = line.GetLastPoint();
		lastPt = line.GetFirstPoint();
	}
	
	var dist = MaxDistance(cloudTrack,line);

	return {
		"ErrorCode": 0
		, "Point0": firstPt
		, "Point1": lastPt
		, "Dist": dist
		};
}

function main()
{
	// Get the cloud
	var result = SCloud.FromSel();	
	if (result.length!=1)
		throw new Error( "Please select (only) 1 cloud before launching the script" );
	var cloudToTreat = result[0];

	//Enter the sampling step
	var theDialog = SDialog.New('Radials');
	theDialog.AddLine("1. Adjust the sampling step of the multiline ", false);
	theDialog.AddLine("2. Click OK ", false);
	theDialog.AddLine("3. Click a seed point on the cloud in the scene ", false);
	theDialog.AddLine("Sampling step: ", true);
	var result = theDialog.Execute();
	if (result.ErrorCode == 0)
	{ // result == 0 means the user click on the "OK" button
    		SAMPLING_STEP = result.InputTbl[0]; // InputTbl contains all the content of the input box
		if(SAMPLING_STEP<=0)
			throw new Error( "Bad value" );
	}
	else
		throw new Error( "Operation canceled" );

	// Select the seed point
	print( "---> Please click a point on a line to extract..." );
	result = SPoint.FromClick();	
	if (result.ErrorCode != 0)
		throw new Error( "No point selected." );
	var selectedPt = result.Point;
	print("Computation started...");

	// create the final line
	var trackLine = SMultiline.New();

	// usefull to indicate progression
	var bb = cloudToTreat.GetBoundingBox();
	var length = bb.LowPoint.Distance(bb.UpPoint);
	var step = length/SAMPLING_STEP/10;
	
	// init detection
	result = InitLine(cloudToTreat, selectedPt, SAMPLING_STEP*0.5);
	// save for 2nd loop to search on the other side
	var result_ini=result;

	var inc=1; // for progress indication
	while(result.ErrorCode==0)
	{// search on one side
		var pt = result.Point0;
		pt = pt.Add(result.Point1);
		pt = pt.Mult(0.5);
		trackLine.InsertLast(pt);

		if(trackLine.GetNumber()>inc*step && inc<10)
		{// progress...
			print("Computation in progress... (" + inc*10 + "% done)");
			inc++;
		}

		var dir = SVector.New(result.Point0, result.Point1);
		dir.SetNormed();

		result = NextLine(cloudToTreat,result.Point1,dir,result.Dist,SAMPLING_STEP);
	}

	result.ErrorCode = result_ini.ErrorCode;
	result.Point0 = result_ini.Point1;	// revert points to search on the other side
	result.Point1 = result_ini.Point0;
	result.Dist = result_ini.Dist;

	while(result.ErrorCode==0)
	{// search on the otther side
		var pt = result.Point0;
		pt = pt.Add(result.Point1);
		pt = pt.Mult(0.5);
		trackLine.InsertFirst(pt);

		if(trackLine.GetNumber()>inc*step && inc<10)
		{// progress...
			print("Computation in progress... (" + inc*10 + "% done)");
			inc++;
		}

		var dir = SVector.New(result.Point0, result.Point1);
		dir.SetNormed();

		result = NextLine(cloudToTreat,result.Point1,dir,result.Dist,SAMPLING_STEP);
	}

	trackLine.AddToDoc();
	print("Computation finished !");
}

main(); // call of the main function

