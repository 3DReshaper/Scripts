

function CreateConcentricCircle(Multi, NormalVector, Tolerance, side)
{
	var Result = Multi.Offset(
		NormalVector // [in] Direction The offset is computed in the plane normal to this vector. This means that each 
		// point of the SMultiline is moved in a direction normal to this vector. 
		// If 0, the plane is assumed to be the best plane of the current SMultiline.  
		, Tolerance // [in] DistOffset The offset distance  
		, side // [in] GoodSide To know which offset side is ? OTHER_SIDE: The side where SidePt is not. SAME_SIDE: The side where SidePt is.  
		, Multi.GetCentroidLinear() // [in] SidePt a point to know the side of the offset.  
		);
	if (Result.ErrorCode)
		throw new Error( 'Offset impossible.' );
	return Result.Multi;
}

/// @brief
function ExtractCloudInsideTwoMulti(Cloud, Multi1, Multi2, Tolerance, Normal)
{
	Multi1.SetVisibility(true);
	Multi2.SetVisibility(true);
	
	var TopMultiOut = CreateConcentricCircle(Multi1, Normal, Tolerance, SMultiline.OTHER_SIDE);
	TopMultiOut.AddToDoc();
	var DownMultiOut = CreateConcentricCircle(Multi2, Normal, Tolerance, SMultiline.OTHER_SIDE);
	DownMultiOut.AddToDoc();
	var cleanResult = Cloud.Separate (
								TopMultiOut
								, Normal
								, DownMultiOut.GetCentroidLinear()
								, TopMultiOut.GetCentroidLinear()
								); // separate the cloud with 2 multilines

	if (cleanResult.ErrorCode != 0)
		throw new Error('Impossible to clean the cloud.');

	cleanResult.OutCloud.Clear();
	var cloudToKeep = cleanResult.InCloud; // our new cloud
	
	var TopMultiIn = CreateConcentricCircle(Multi1, Normal, Tolerance, SMultiline.SAME_SIDE);
	TopMultiIn.AddToDoc();
	var DownMultiIn = CreateConcentricCircle(Multi2, Normal, Tolerance, SMultiline.SAME_SIDE);
	DownMultiIn.AddToDoc();
	var cleanResult = cloudToKeep.Separate (
								TopMultiIn
								, Normal
								, DownMultiIn.GetCentroidLinear()
								, TopMultiIn.GetCentroidLinear()
								); // separate the cloud with 2 multilines

	if (cleanResult.ErrorCode == 2 || cleanResult.ErrorCode == 3)
		throw new Error('Impossible to clean the cloud.');

	if (cleanResult.ErrorCode == 0)
	{
		cleanResult.InCloud.Clear();
		cloudToKeep = cleanResult.OutCloud; // our new cloud
	}
	cloudToKeep.AddToDoc();
	
	return cloudToKeep;
}

function IsConcentricCylinder(demo)
{
	var Tolerance = 1;
	var Normal = SVector.New(0, 0, 1);

	//==================================================================================================================
	// big cylinder
	//==================================================================================================================
	var TopMulti = GetMulti_FromName("BigHole1");
	var DownMulti = GetMulti_FromName("BigHole2");
	if (demo)
	{
		TopMulti.SetVisibility(true);
		DownMulti.SetVisibility(true);
		MeasuredCloud.SetVisibility(false);
		SViewSet.FromName("Cylinder 1")[0].SetVisibility(true);
		ZoomOn([TopMulti, DownMulti]);
		Sleep(LONG_TIME);
	}
	var bigCloudExtracted = ExtractCloudInsideTwoMulti(MeasuredCloud, TopMulti, DownMulti, Tolerance, Normal, demo);
	var bestBigCylinderResult = bigCloudExtracted.BestCylinder(
		0 // [in] NbPointElim The number of points to eliminate. The worst points are eliminated. This number should not be greater than the total number of points -4  
		, SCylinder.BCY_INIT_CENTER|SCylinder.BCY_INIT_DIRECTION // [in] Force Bit mask to know which parameter(s) is forced or initialized (initializing the computation provides a more rapid computation.
		//  BCY_FORCE_RADIUS (Force & BCY_FORCE_RADIUS) Radius is forced
		//  BCY_INIT_RADIUS (Force & BCY_INIT_RADIUS) Radius is initialized (near from its good value)
		//  BCY_FORCE_CENTER (Force & BCY_FORCE_CENTER) Center is forced (an axis passing through Center should be found)
		//  BCY_INIT_CENTER (Force & BCY_INIT_CENTER) Center is initialized (near from its good position)
		//  BCY_FORCE_DIRECTION (Force & BCY_FORCE_DIRECTION) Direction is forced (DirectionVector exactly)
		//  BCY_INIT_DIRECTION (Force & BCY_INIT_DIRECTION) Direction is approximately (DirectionVector nearly)  
		, TopMulti.GetCentroidLinear()// [in] Center First point of the center line.  
		, TopMulti.GetNormal().Vector// [in] DirectionVector Normed Normal vector of the plane.  
		);
	if (bestBigCylinderResult.ErrorCode)
		throw new Error('Impossible to compute best big cylinder.');
		
	var BigCylinder = bestBigCylinderResult.Cylinder
	BigCylinder.AddToDoc();

	if (demo)
	{
		TopMulti.SetVisibility(false);
		DownMulti.SetVisibility(false);
	}
	//==================================================================================================================
	// small cylinder
	//==================================================================================================================
	var TopMulti = GetMulti_FromName("SmallHole1");
	var DownMulti = GetMulti_FromName("SmallHole2");
	if (demo)
	{
		SViewSet.FromName("Cylinder 1")[0].SetVisibility(true);
		TopMulti.SetVisibility(true);
		DownMulti.SetVisibility(true);
		Sleep(LONG_TIME);
		MeasuredCloud.SetVisibility(false);
	}
	var smallCloudExtracted = ExtractCloudInsideTwoMulti(MeasuredCloud, TopMulti, DownMulti, Tolerance, Normal, demo);
	var bestSmallCylinderResult = smallCloudExtracted.BestCylinder(
		0 // [in] NbPointElim The number of points to eliminate. The worst points are eliminated. This number should not be greater than the total number of points -4  
		, SCylinder.BCY_INIT_CENTER|SCylinder.BCY_INIT_DIRECTION // [in] Force Bit mask to know which parameter(s) is forced or initialized (initializing the computation provides a more rapid computation.
		//  BCY_FORCE_RADIUS (Force & BCY_FORCE_RADIUS) Radius is forced
		//  BCY_INIT_RADIUS (Force & BCY_INIT_RADIUS) Radius is initialized (near from its good value)
		//  BCY_FORCE_CENTER (Force & BCY_FORCE_CENTER) Center is forced (an axis passing through Center should be found)
		//  BCY_INIT_CENTER (Force & BCY_INIT_CENTER) Center is initialized (near from its good position)
		//  BCY_FORCE_DIRECTION (Force & BCY_FORCE_DIRECTION) Direction is forced (DirectionVector exactly)
		//  BCY_INIT_DIRECTION (Force & BCY_INIT_DIRECTION) Direction is approximately (DirectionVector nearly)  
		, TopMulti.GetCentroidLinear()// [in] Center First point of the center line.  
		, TopMulti.GetNormal().Vector// [in] DirectionVector Normed Normal vector of the plane.  
		);
	if (bestSmallCylinderResult.ErrorCode)
		throw new Error('Impossible to compute best small cylinder.');

	var SmallCylinder = bestSmallCylinderResult.Cylinder
	SmallCylinder.AddToDoc();
	if (demo)
	{
		SViewSet.FromName("Cylinder 1")[0].SetVisibility(true);
		Sleep(LONG_TIME);
		bigCloudExtracted.SetVisibility(false);
		smallCloudExtracted.SetVisibility(false);
	}
	//==================================================================================================================
	// small cylinder
	//==================================================================================================================
	var vectorBig = BigCylinder.GetNormal();
	var vectorSmall = SmallCylinder.GetNormal();
	var angle = SVector.Angle(vectorBig, vectorSmall);
	
	{
		if (demo)
		{
			bigCloudExtracted.SetVisibility(false);
			smallCloudExtracted.SetVisibility(false);
			CADPoly.SetVisibility(false);
			SmallCylinder.SetTransparency(100);
			BigCylinder.SetTransparency(100);
			SetViewDir(AXIS_REVERSE_Y);
			ZoomOn([SmallCylinder, BigCylinder]);
			Sleep(LONG_TIME);
		}
	
		// Create Plane to project on it
		var pt = SmallCylinder.GetBaseCenter()
		var VctTranslate = SVector.New(pt, SPoint.New(pt.GetX(), pt.GetY(), 0));
		pt.Translate(VctTranslate);
		var planeToProject = SPlane.New(pt, SVector.New(0, 0, 1), SVector.New(1, 0, 0), 150, 150);
		
		// project point on plane
		var ptBase = SmallCylinder.GetBaseCenter();
		var ptTop = SmallCylinder.GetTopCenter();
		if (ptTop.GetZ() < ptBase.GetZ())
		{
			var ptInter = ptBase;
			ptBase = ptTop;
			ptTop = ptInter;
		}
		var ptCopy = SPoint.New(ptTop);
		var VctTranslate = SVector.New(ptBase, ptTop);
		VctTranslate.SetNormed();
		VctTranslate = VctTranslate.Mult(-ptBase.GetZ());
		ptCopy.Translate(VctTranslate);
			
		// create nominal multiline
		var Nominal = SMultiline.New();
		Nominal.InsertLast(ptBase);
		Nominal.InsertLast(ptCopy);
		Nominal.SetColors(0, 0, 1);
		Nominal.AddToDoc();
		
		// create measured multiline
		var Measured = SMultiline.New();
		Measured.InsertLast(BigCylinder.GetBaseCenter());
		Measured.InsertLast(BigCylinder.GetTopCenter());
		Measured.SetColors(1, 0, 0);
		Measured.AddToDoc();
		
		var resultProj = Nominal.Proj3D(BigCylinder.GetBaseCenter());
		if (resultProj.ErrorCode != 0)
			throw new Error( 'Impossible to project Base center on the normal.' );
		var ptProjBase = resultProj.Point;
			
		var resultProj = Nominal.Proj3D(BigCylinder.GetTopCenter());
		if (resultProj.ErrorCode != 0)
			throw new Error( 'Impossible to project Top center on the normal.' );
		var ptProjTop = resultProj.Point;
		if (demo)
		{
			ZoomOn([SmallCylinder]);
			Sleep(SHORT_TIME);
		}
			
		var distance1 = CreateArrowWithLabel(BigCylinder.GetBaseCenter(), ptProjBase).Distance;
		var distance2 = CreateArrowWithLabel(BigCylinder.GetTopCenter(), ptProjTop).Distance;
		if (demo)
		{
			ZoomOn([SmallCylinder]);
		}
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
		if (xmlWriter)
		{
			var ImageName = "Cylinder.png";
			var ImagePath = generatedFilePath + ImageName;
			CreateScriptPicture(ImagePath);
			
			xmlWriter.WriteStartElement("elm");
				xmlWriter.WriteAttribute("type", "cylinder");
				xmlWriter.WriteAttribute("name", "Cylinder-Coaxiality");
				
				WriteImage(xmlWriter, ImageName);
				
				xmlWriter.WriteStartElement("distance");
				xmlWriter.WriteAttribute("minimal", parseFloat(Math.min(distance1, distance2)));
				xmlWriter.WriteAttribute("maximal", parseFloat(Math.max(distance1, distance2)));
				xmlWriter.WriteEndElement();
				
			// close tag Circle 
			xmlWriter.WriteEndElement();
		}
//__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__--__
		if (demo)
		{
			Sleep(LONG_TIME);
			CADPoly.SetVisibility(true);
			ZoomOn([CADPoly]);
			Sleep(SHORT_TIME);
		}
	}
}


