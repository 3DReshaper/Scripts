
function CreateScriptPicture(PathName)
{
	var picError = CreatePicture(
		PathName, // [in] image file name 
		1000, // [in] number of pixels height. If <0, this number is adjusted to insure the picture is no too
		// large for photo editor
		1000, // [in] number of pixels width. If <0, this number is adjusted to insure the picture is no too
		// large for photo editor
		1, // [in] Should we fit the 3D view on image size ?
		// 0	No, same proportion as on screen
		// 1	Yes, adjust to fit the image
		1, // [in] Background type
		// 0	Same background as on screen
		// 1	Always white.
		0, // [in] Text height coef multiplication factor
		// 0	Same as on screen
		// <1	Smaller.
		// >1	Greater
		2 // [in] image format
		// 0	Bitmap
		// 1	Jpeg
		// 2	Png
	).ErrorCode;

	if (picError != 0)
		throw new Error('An error occured in the create picture function.');
}

function WriteImage(xmlWriter, imageName)
{
	xmlWriter.WriteStartElement("image");
	xmlWriter.WriteAttribute("name", imageName);
	// close tag Image 
	xmlWriter.WriteEndElement();
}

function WriteMultiplePoints(xmlWriter, points)
{
	xmlWriter.WriteStartElement("points");
	for (var ii = 0; ii < points.length; ii++)
	{
		WritePoint(xmlWriter, points[ii]);
	}
	// close tag points 
	xmlWriter.WriteEndElement();
}

function WriteMultiplePointsWithNormals(xmlWriter, points, normals)
{
	if (points.length != normals.length)
		throw new Error( 'number of normal is different of the points number.' );
		
	xmlWriter.WriteStartElement("points");
	for (var ii = 0; ii < points.length; ii++)
	{
		WritePoint(xmlWriter, points[ii]);
		WriteNormal(xmlWriter, normals[ii]);
	}
	// close tag points 
	xmlWriter.WriteEndElement();
}

function WritePoint(xmlWriter, point)
{
	// create tag point
	xmlWriter.WriteStartElement("point");
	xmlWriter.WriteAttribute("name", point.GetName());
	xmlWriter.WriteAttribute("x_coord", point.GetX());
	xmlWriter.WriteAttribute("y_coord", point.GetY());
	xmlWriter.WriteAttribute("z_coord", point.GetZ());
	// close tag point 
	xmlWriter.WriteEndElement();
}

function WriteNormal(xmlWriter, normal)
{
	// create tag point
	xmlWriter.WriteStartElement("normal");
	xmlWriter.WriteAttribute("x_norm", normal.GetX());
	xmlWriter.WriteAttribute("y_norm", normal.GetY());
	xmlWriter.WriteAttribute("z_norm", normal.GetZ());
	// close tag normal 
	xmlWriter.WriteEndElement();
}
	
// Write the xml file
function WriteXmlFile(iXmlFileName)
{
	// Open XML file to write
	var file = SFile.New( iXmlFileName );
	if ( !file.Open(SFile.WriteOnly) )
		throw new Error( 'Failed to write file.' );

	var xmlWriter = SXmlWriter.New();
	// set device (here file)to streamwriter
	xmlWriter.SetFile(file);
	// Writes a document start with the XML version number version.
	xmlWriter.WriteStartDocument();
	// Writes a start element with name,
	// Subsequent calls to writeAttribute() will add attributes to this element.
	// here we creating a tag <persons>
	xmlWriter.WriteStartElement("persons");

	// create tag person
	xmlWriter.WriteStartElement("person");
	xmlWriter.WriteAttribute("attribute", "1.54");
	// close tag person 
	xmlWriter.WriteEndElement();

	// end tag persons
	xmlWriter.WriteEndElement();
	// end document
	xmlWriter.WriteEndDocument();
	file.Close();
}