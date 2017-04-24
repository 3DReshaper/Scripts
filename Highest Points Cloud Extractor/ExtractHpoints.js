// Nuage Extractor 
// Select the cloud first
print (" Select your cloud ");
var tblSelCloud = SCloud.FromSel();
if (tblSelCloud.length == 0)
	throw new Error("You must select the cloud before launching the script");
var selCloud = tblSelCloud[0];
// Recuperer la bondingbox
var bbCloudRes = selCloud.GetBoundingBox();
if (bbCloudRes.ErrorCode != 0)
	throw new Error("Impossible to have the bounding box");
var lowerPt = bbCloudRes.LowPoint;
var upperPt = bbCloudRes.UpPoint;
var length = upperPt.GetX() - lowerPt.GetX();
var width = upperPt.GetY() - lowerPt.GetY();
var height = upperPt.GetZ() - lowerPt.GetZ();
// Create cylinder at the bondingbox corner
var center = SPoint.New(lowerPt.GetX(), lowerPt.GetY(), lowerPt.GetZ());
var direction = SVector.New( 0, 0, 1 );
// You can change the value of the radius , if the value is small ,you will get more point inside your cloud result but the script will take more time to calculate points
//-------------
var radius = 2;
//-------------
var cyl_length = height;
var cyl = SCylinder.New(center,direction,radius,cyl_length );
var step = radius;
var nbIterX = Math.ceil(length/step);
var nbIterY = Math.ceil(width/step);
newcloud = SCloud.New();
// Boucle : on y of the boundingbox 
for( var ii = 0; ii < nbIterY; ii++)
{	// Boucle : On x of the boundingbox 
	for( var jj = 0; jj < nbIterX; jj++)
	{	cyltmp = SCylinder.New(cyl);
		cyltmp.Translate(SVector.New(step*jj, step*ii, 0));
		//cyltmp.AddToDoc();
		// Extract Cloud inside the cylinder
		resSep = selCloud.SeparateFeature(cyltmp,0, SCloud.FILL_IN_ONLY);
		if(resSep.InCloud.GetNumber()<20)
			continue;
		// resSep.InCloud.AddToDoc();
		// Extract Cloud Highest Points
		resHigh = resSep.InCloud.GetHighestPoint (direction);
		if (resHigh.ErrorCode!=0)
			continue;
		//resHigh.Point.AddToDoc();
		newcloud.AddPoint(resHigh.Point);	}
	print(ii/nbIterY + '\n');}
newcloud.AddToDoc();
//Hide the entry cloud
selCloud.SetVisibility(false);
	